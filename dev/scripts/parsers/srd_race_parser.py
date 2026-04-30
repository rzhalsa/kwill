#!/usr/bin/env python3
"""
SRD Race Parser
Parse raw D&D races/species and convert to JSON
"""

import json
import re
from typing import Dict, Any, List
import sys


class SRDRaceParser:
    """Parser for D&D SRD races/species"""

    def __init__(self):
        self.races: List[Dict[str, Any]] = []

    def _normalize(self, text: str) -> str:
        """Normalize unicode quotes"""
        return (
            text
            .replace('\u2019', "'")   # right single quote
            .replace('\u2018', "'")   # left single quote
            .replace('\u201c', '"')   # left double quote
            .replace('\u201d', '"')   # right double quote
            .replace('\u2013', '-')   # en dash
            .replace('\u2014', '-')   # em dash
        )

    def parse_races(self, raw_text: str) -> Dict[str, Any]:
        """Parse races from raw text"""
        self.races = []
        raw_text = self._normalize(raw_text)

        lines = raw_text.split('\n')
        i = 0
        n = len(lines)

        while i < n:
            line = lines[i].strip()

            # Detect race name: capitalized line, followed by "Creature Type:"
            if line and line[0].isupper() and i + 1 < n and "Creature Type:" in lines[i + 1]:
                race_name = line
                i += 1

                # Basic fields
                creature_type = ""
                size = ""
                speed = ""
                traits: List[Dict[str, Any]] = []
                tables: List[Dict[str, Any]] = []

                # Parse static fields
                while i < n:
                    field_line = lines[i].strip()
                    if field_line.startswith("Creature Type:"):
                        creature_type = field_line.replace("Creature Type:", "").strip()
                    elif field_line.startswith("Size:"):
                        size = field_line.replace("Size:", "").strip()
                    elif field_line.startswith("Speed:"):
                        speed = field_line.replace("Speed:", "").strip()
                    elif field_line.startswith("As a ") or field_line.startswith("As an "):
                        # Start of traits section
                        i += 1
                        break
                    i += 1

                # Parse traits and tables until next race or EOF
                current_trait = None
                current_desc_lines: List[str] = []

                def flush_trait():
                    nonlocal current_trait, current_desc_lines, traits
                    if current_trait:
                        desc = " ".join(current_desc_lines).strip()
                        desc = re.sub(r'\s+', ' ', desc)
                        trait_obj = {
                            "name": current_trait,
                            "description": desc,
                        }
                        # Post-process for descriptive subraces
                        self._extract_descriptive_subraces(trait_obj)
                        traits.append(trait_obj)
                        current_trait = None
                        current_desc_lines = []

                while i < n:
                    l = lines[i].strip()

                    # Look ahead: new race?
                    if l and l[0].isupper() and i + 1 < n and "Creature Type:" in lines[i + 1]:
                        flush_trait()
                        break

                    # Known table names
                    if l in ("Draconic Ancestors", "Elven Lineages", "Fiendish Legacies"):
                        flush_trait()
                        table_name = l
                        i += 1
                        table_rows: List[List[str]] = []

                        # Collect table lines
                        while i < n:
                            tl = lines[i].strip()
                            # Stop at blank, new race, or obvious trait
                            if not tl:
                                break
                            if tl and tl[0].isupper() and i + 1 < n and "Creature Type:" in lines[i + 1]:
                                break
                            # Skip page footer lines
                            if "System Reference Document" in tl:
                                i += 1
                                continue
                            # Skip header row (first non-empty after table name)
                            if re.match(r'^(Dragon|Lineage|Legacy)\b', tl):
                                i += 1
                                continue

                            parts = tl.split()
                            if parts:
                                table_rows.append(parts)
                            i += 1

                        table_obj = {
                            "name": table_name,
                            "rows": table_rows
                        }
                        tables.append(table_obj)

                        # Also derive subraces from this table
                        self._attach_table_subraces_to_traits(table_obj, traits)

                        continue

                    # Trait name: "Something."
                    if l.endswith(".") and not l.startswith("As a ") and not l.startswith("As an "):
                        # Heuristic: treat as trait header if first word capitalized
                        first_word = l.split()[0]
                        if first_word[0].isupper():
                            flush_trait()
                            current_trait = l.rstrip(".")
                            i += 1
                            continue

                    # Otherwise, part of current trait description
                    if current_trait is not None and l:
                        current_desc_lines.append(l)

                    i += 1

                # Flush last trait
                flush_trait()

                race = {
                    "name": race_name,
                    "creature_type": creature_type,
                    "size": size,
                    "speed": speed,
                    "traits": traits,
                    "tables": tables
                }
                self.races.append(race)
            else:
                i += 1

        return {
            "Key": "races",
            "races": self.races
        }

    def _extract_descriptive_subraces(self, trait: Dict[str, Any]):
        """
        For traits that contain multiple capitalized sub-headers like
        'Forest Gnome. ... Rock Gnome. ...', extract them as subraces.
        """
        text = trait.get("description", "")
        # Find headers like "Forest Gnome." or "Cloud’s Jaunt (Cloud Giant)."
        pattern = r'([A-Z][A-Za-z\'’ ]+?)\.\s*'
        matches = list(re.finditer(pattern, text))
        if not matches:
            return

        subraces = []
        base_desc_end = matches[0].start()
        base_desc = text[:base_desc_end].strip()
        if base_desc:
            trait["description"] = base_desc
        else:
            trait["description"] = ""

        for idx, m in enumerate(matches):
            name = m.group(1).strip()
            start = m.end()
            end = matches[idx + 1].start() if idx + 1 < len(matches) else len(text)
            desc = text[start:end].strip()
            desc = re.sub(r'\s+', ' ', desc)
            subraces.append({
                "name": name,
                "description": desc
            })

        if subraces:
            trait["subraces"] = subraces

    def _attach_table_subraces_to_traits(self, table: Dict[str, Any], traits: List[Dict[str, Any]]):
        """
        From a table like Draconic Ancestors / Elven Lineages / Fiendish Legacies,
        derive subraces and attach them to the matching trait.
        """
        name = table["name"]
        rows = table["rows"]
        subraces: List[Dict[str, Any]] = []

        if name == "Draconic Ancestors":
            # Rows like: Black Acid Gold Fire
            for row in rows:
                if len(row) == 4:
                    subraces.append({"name": row[0], "values": [row[1]]})
                    subraces.append({"name": row[2], "values": [row[3]]})
        else:
            # Generic: first token is name, rest joined as one value string
            for row in rows:
                if len(row) >= 2:
                    subraces.append({
                        "name": row[0],
                        "values": [" ".join(row[1:])]
                    })

        if not subraces:
            return

        # Attach to the most relevant trait by name heuristic
        target_trait = None
        if "Ancestors" in name:
            for t in traits:
                if "Ancestry" in t["name"]:
                    target_trait = t
                    break
        elif "Lineages" in name:
            for t in traits:
                if "Lineage" in t["name"]:
                    target_trait = t
                    break
        elif "Legacies" in name:
            for t in traits:
                if "Legacy" in t["name"]:
                    target_trait = t
                    break

        if target_trait is not None:
            existing = target_trait.get("subraces", [])
            target_trait["subraces"] = existing + subraces

    def save_to_file(self, filepath: str, data: Dict[str, Any]):
        """Save data to JSON file"""
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        return filepath


def main():
    if len(sys.argv) > 1:
        filepath = sys.argv[1]
        print(f"Parsing {filepath}...")
        try:
            with open(filepath, 'r') as f:
                raw_text = f.read()
        except FileNotFoundError:
            print(f"Error: File {filepath} not found")
            return

        parser = SRDRaceParser()
        result = parser.parse_races(raw_text)

        output_file = filepath.replace('.txt', '_races.json').replace('.md', '_races.json')
        parser.save_to_file(output_file, result)
        print(f"✓ Parsed {len(result['races'])} races")
        print(f"✓ Saved to {output_file}")
    else:
        print("=" * 60)
        print("SRD Race Parser")
        print("=" * 60)
        print("\nPaste your raw D&D race content (Ctrl+Z then Enter when done):\n")

        lines = []
        try:
            while True:
                lines.append(input())
        except EOFError:
            pass

        raw_text = "\n".join(lines)

        if not raw_text.strip():
            print("No content provided.")
            return

        parser = SRDRaceParser()
        result = parser.parse_races(raw_text)
        parser.save_to_file("races.json", result)

        print("\n" + "=" * 60)
        print(f"✓ Parsed {len(result['races'])} races")
        print(f"✓ Saved to races.json")
        print("=" * 60)


if __name__ == "__main__":
    main()
