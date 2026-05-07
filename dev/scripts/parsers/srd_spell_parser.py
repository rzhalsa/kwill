#!/usr/bin/env python3
"""
SRD Spell Description Parser
Parse raw D&D spell descriptions and convert to JSON with complete schema
"""

import json
import re
from typing import Dict, Any, List
import sys

SPELL_SCHOOLS = [
    "Abjuration", "Conjuration", "Divination", "Enchantment",
    "Evocation", "Illusion", "Necromancy", "Transmutation"
]


class SRDSpellParser:
    """Parser for D&D SRD spell descriptions"""
    
    def __init__(self):
        self.spells: List[Dict[str, Any]] = []
    
    def _create_spell_object(self, name: str) -> Dict[str, Any]:
        """Create a new spell object with complete schema"""
        return {
            "name": name,
            "level": "",
            "prepared": False,
            "school": "",
            "action": "",
            "attacksave": "",
            "savetype": "",
            "damage": "",
            "damagetype": "",
            "range": "",
            "duration": "",
            "areashape": "",
            "areasize": "",
            "tooltip": "",
            "description": "",
            "formula": "",
            "formula_active": False,
            "showstats": True,
            "concentration": False,
            "material": False
        }

    def _is_valid_spell(self, spell: Dict[str, Any]) -> bool:
        """Return True if the spell appears to be parsed correctly."""
        
        if not spell.get("name") or len(spell["name"]) < 2:
            return False

        if not spell.get("level") or not re.match(r"^\d+$", spell["level"]):
            return False

        if spell.get("school") not in SPELL_SCHOOLS:
            return False

        if not spell.get("description") or len(spell["description"]) < 20:
            return False

        return True

    def _parse_level_line(self, spell: Dict[str, Any], line: str):
        """Parse level line: Level X School (Class, Class) or School Cantrip (Class, Class)"""
        if 'Cantrip' in line:
            spell["level"] = "0"
        else:
            level_match = re.search(r'Level\s+(\d+)', line, re.IGNORECASE)
            if level_match:
                spell["level"] = level_match.group(1)
        
        school_match = re.search(
            r'(Abjuration|Conjuration|Divination|Enchantment|Evocation|Illusion|Necromancy|Transmutation)',
            line
        )
        if school_match:
            spell["school"] = school_match.group(1)
    
    def parse_spells(self, raw_text: str) -> Dict[str, Any]:
        """Parse spells from raw text."""
        
        raw_text = raw_text.replace('\u2019', "'").replace('\u2018', "'")
        
        self.spells = []
        
        lines = raw_text.split('\n')
        current_spell = None
        i = 0
        
        while i < len(lines):
            line = lines[i].strip()
            i += 1
            
            if not line and not current_spell:
                continue
            
            # Detect spell name
            if (
                line 
                and ':' not in line 
                and not line.startswith('Level') 
                and not line.startswith('Cantrip') 
                and 'Cantrip' not in line
                and line[0].isupper()
                and len(line) < 100
            ):
                j = i
                while j < len(lines) and not lines[j].strip():
                    j += 1
                
                if j < len(lines):
                    next_line = lines[j].strip()
                    if (
                        any(next_line.startswith(field) for field in [
                            'Level', 'Casting Time:', 'Range:', 'Components:', 'Duration:', 'Cantrip'
                        ])
                        or re.match(
                            r'(Abjuration|Conjuration|Divination|Enchantment|Evocation|Illusion|Necromancy|Transmutation)\s+Cantrip',
                            next_line
                        )
                    ):
                        if current_spell:
                            self._finalize_spell(current_spell)
                        
                        current_spell = self._create_spell_object(line)
                        continue
            
            if current_spell:
                if (
                    line.startswith("Level")
                    or line.startswith("Cantrip")
                    or re.match(
                        r'(Abjuration|Conjuration|Divination|Enchantment|Evocation|Illusion|Necromancy|Transmutation)\s+Cantrip',
                        line
                    )
                ):
                    self._parse_level_line(current_spell, line)
                elif line.startswith("Casting Time:"):
                    current_spell["action"] = line.replace("Casting Time:", "").strip()
                elif line.startswith("Range:"):
                    current_spell["range"] = line.replace("Range:", "").strip()
                elif line.startswith("Components:"):
                    components = line.replace("Components:", "").strip()
                    if 'M' in components:
                        current_spell["material"] = True
                elif line.startswith("Duration:"):
                    duration = line.replace("Duration:", "").strip()
                    current_spell["duration"] = duration
                    if 'Concentration' in duration:
                        current_spell["concentration"] = True
                else:
                    if current_spell["description"]:
                        current_spell["description"] += " " + line
                    else:
                        current_spell["description"] = line
        
        if current_spell:
            self._finalize_spell(current_spell)
        
        return {"spells": self.spells}
    
    def _finalize_spell(self, spell: Dict[str, Any]):
        """Clean up and finalize a spell entry"""
        
        desc = spell["description"].strip()
        desc = re.sub(r'\s*\d+\s+System Reference Document\s+[\d.]+', '', desc)
        desc = re.sub(r'\s+', ' ', desc)
        spell["description"] = desc.strip()

        if self._is_valid_spell(spell):
            self.spells.append(spell)

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
            with open(filepath, 'r', encoding='utf-8') as f:
                raw_text = f.read()
        except FileNotFoundError:
            print(f"Error: File {filepath} not found")
            return
        
        parser = SRDSpellParser()
        spells_result = parser.parse_spells(raw_text)
        
        output_file = filepath.replace('.txt', '_spells.json').replace('.md', '_spells.json')
        parser.save_to_file(output_file, spells_result)
        print(f"✓ Parsed {len(spells_result['spells'])} valid spells")
        print(f"✓ Saved to {output_file}")
    
    else:
        print("=" * 60)
        print("SRD Spell Description Parser")
        print("=" * 60)
        print("\nPaste your raw D&D spell content below.")
        print("Press Ctrl+Z (Windows) or Ctrl+D (Linux/Mac) then Enter.\n")
        
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
        
        parser = SRDSpellParser()
        spells_result = parser.parse_spells(raw_text)
        
        parser.save_to_file("spells.json", spells_result)
        
        print("\n" + "=" * 60)
        print(f"✓ Parsed {len(spells_result['spells'])} valid spells")
        print("✓ Saved to spells.json")
        print("=" * 60)


if __name__ == "__main__":
    main()