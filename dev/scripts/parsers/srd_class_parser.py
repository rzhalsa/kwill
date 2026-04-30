#!/usr/bin/env python3
"""
SRD Character Parser
Parse raw D&D class features and convert to JSON
Also extracts spell lists if present
"""

import json
import re
from typing import Dict, Any, List
import sys


class SRDParser:
    """Parser for D&D SRD class features"""

    def __init__(self):
        self.features: List[Dict[str, Any]] = []
        self.spells: List[Dict[str, Any]] = []

    def parse_class_features(self, raw_text: str) -> Dict[str, Any]:
        """Parse class features from raw text"""
        self.features = []

        # Normalize unicode apostrophes
        raw_text = (
    raw_text
    .replace('\u2019', "'")   # right single quote
    .replace('\u2018', "'")   # left single quote
    .replace('\u201c', '"')   # left double quote
    .replace('\u201d', '"')   # right double quote
)

        # Find first Level marker
        first_level_match = re.search(r'Level\s+\d+:', raw_text, re.IGNORECASE)
        if not first_level_match:
            return {"features": [], "spells": []}

        # Start from first Level marker
        start_pos = first_level_match.start()
        text_to_parse = raw_text[start_pos:]

        # Stop before spell lists
        spell_list_match = re.search(r'\n[^\n]*Spell List', text_to_parse)
        if spell_list_match:
            text_to_parse = text_to_parse[:spell_list_match.start()]

        # Stop before subclass sections
        subclass_section_match = re.search(r'\n[A-Z][A-Za-z\s]+Subclass:\s+[A-Z]', text_to_parse)
        if subclass_section_match:
            text_to_parse = text_to_parse[:subclass_section_match.start()]

        # Extract features
        level_pattern = r'Level\s+(\d+):\s*(.+?)(?=Level\s+\d+:|$)'
        matches = re.finditer(level_pattern, text_to_parse, re.DOTALL | re.IGNORECASE)

        for match in matches:
            level = match.group(1)
            content = match.group(2).strip()

            lines = content.split('\n')
            feature_name = lines[0].strip()

            description_lines = lines[1:] if len(lines) > 1 else []
            description = '\n'.join(description_lines).strip()
            description = re.sub(r'\s+', ' ', description)
            description = re.sub(r'\s*\d+\s+System Reference Document\s+[\d.]+', '', description)
            description = description.strip()

            feature = {
                "name": feature_name,
                "level": level,
                "action": "",
                "uses_current": "",
                "uses_max": "",
                "restore": "",
                "tooltip": "",
                "description": description,
                "formula": "",
                "formula_active": False
            }

            self.features.append(feature)

        return {
        "Key": "classes",
        "features": self.features,
        "spells": self.parse_spell_list(raw_text)["spells"]
        }

    def parse_spell_list(self, raw_text: str) -> Dict[str, Any]:
        """Parse spell list from raw text"""
        self.spells = []

        spell_list_match = re.search(r'[^\n]*Spell List', raw_text)

        if not spell_list_match:
            spell_list_match = re.search(r'Level\s+\d+\s+.*?Spells', raw_text)

        if not spell_list_match:
            return {"spells": []}

        spell_section = raw_text[spell_list_match.start():]

        subclass_match = re.search(r'\n[A-Z][A-Za-z\s]+Subclass:', spell_section)
        if subclass_match:
            spell_section = spell_section[:subclass_match.start()]

        level_blocks = re.findall(r'(Level\s+\d+.*?)(?=Level\s+\d+|$)', spell_section, re.DOTALL)

        for block in level_blocks:
            lines = block.split('\n')
            spell_level = None

            for line in lines:
                line = line.strip()

                if spell_level is None:
                    level_match = re.match(r'Level\s+(\d+)', line)
                    if level_match:
                        spell_level = level_match.group(1)
                    continue

                if not line or 'Spell' in line or line == '—':
                    continue

                if 'System Reference' in line or 'SRD' in line:
                    continue

                parts = line.split()
                if len(parts) < 2:
                    continue

                special = ''
                while parts:
                    last = parts[-1]
                    if last == '—' or all(c in 'CRM,' for c in last.replace(',', '')):
                        special = parts.pop()
                    else:
                        break

                if not parts:
                    continue
                school = parts.pop()

                spell_name = ' '.join(parts)

                if spell_name and spell_level:
                    self.spells.append(spell_name)

        return {"spells": self.spells}

    def save_to_file(self, filepath: str, data: Dict):
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

        parser = SRDParser()

        features_result = parser.parse_class_features(raw_text)
        output_file = filepath.replace('.txt', '.json').replace('.md', '.json')
        parser.save_to_file(output_file, features_result)
        print(f"✓ Parsed {len(features_result['features'])} features and {len(features_result['spells'])} spells")
        print(f"✓ Saved to {output_file}")
    else:
        print("=" * 60)
        print("SRD Character Parser")
        print("=" * 60)
        print("\nPaste your raw D&D content (Ctrl+Z then Enter when done):\n")

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

        parser = SRDParser()

        features_result = parser.parse_class_features(raw_text)
        parser.save_to_file("features.json", features_result)

        print("\n" + "=" * 60)
        print(f"✓ Parsed {len(features_result['features'])} features and {len(features_result['spells'])} spells")
        print(f"✓ Saved to features.json")
        print("=" * 60)


if __name__ == "__main__":
    main()
