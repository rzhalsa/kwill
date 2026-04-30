#!/usr/bin/env python3
"""
SRD Spell Description Parser
Parse raw D&D spell descriptions and convert to JSON with complete schema
"""

import json
import re
from typing import Dict, Any, List
import sys


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
    
    def _parse_level_line(self, spell: Dict[str, Any], line: str):
        """Parse level line: Level X School (Class, Class)"""
        # Extract level (e.g., "Level 3" -> "3")
        level_match = re.search(r'Level\s+(\d+|\w+)', line, re.IGNORECASE)
        if level_match:
            spell["level"] = level_match.group(1)
        elif 'Cantrip' in line:
            spell["level"] = "0"
        
        # Extract school (e.g., "Evocation", "Divination")
        school_match = re.search(r'(Abjuration|Conjuration|Divination|Enchantment|Evocation|Illusion|Necromancy|Transmutation)', line)
        if school_match:
            spell["school"] = school_match.group(1)
    
    def parse_spells(self, raw_text: str) -> Dict[str, Any]:
        """
        Parse spells from raw text.
        
        Normalize unicode apostrophes first
        """
        raw_text = (
    raw_text
    .replace('\u2019', "'")   # right single quote
    .replace('\u2018', "'")   # left single quote
    .replace('\u201c', '"')   # left double quote
    .replace('\u201d', '"')   # right double quote
)
        
        """
        Parse spells from raw text.
        
        Expected format:
        Spell Name
        Level X School (Class, Class)
        Casting Time: [time]
        Range: [range]
        Components: [components]
        Duration: [duration]
        [Description text...]
        """
        self.spells = []
        
        lines = raw_text.split('\n')
        current_spell = None
        i = 0
        
        while i < len(lines):
            line = lines[i].strip()
            i += 1
            
            # Skip empty lines when not in a spell
            if not line and not current_spell:
                continue
            
            # Check if this is a spell name:
            # - Capitalized word(s)
            # - No colons
            # - NOT starting with "Level" or "Cantrip"
            # - Followed by Level/Cantrip or spell details
            if line and ':' not in line and not line.startswith('Level') and not line.startswith('Cantrip'):
                if line[0].isupper() and len(line) < 100:
                    # Look ahead to see if next non-empty line has spell details
                    j = i
                    while j < len(lines) and not lines[j].strip():
                        j += 1
                    
                    if j < len(lines):
                        next_line = lines[j].strip()
                        # Check if it looks like spell metadata
                        if any(next_line.startswith(field) for field in ['Level', 'Casting Time:', 'Range:', 'Components:', 'Duration:', 'Cantrip']):
                            # Save previous spell
                            if current_spell:
                                self._finalize_spell(current_spell)
                            
                            # Start new spell with complete schema
                            current_spell = self._create_spell_object(line)
                            continue
            
            # Parse spell fields
            if current_spell:
                if line.startswith("Level") or line.startswith("Cantrip"):
                    self._parse_level_line(current_spell, line)
                elif line.startswith("Casting Time:"):
                    current_spell["action"] = line.replace("Casting Time:", "").strip()
                elif line.startswith("Range:"):
                    current_spell["range"] = line.replace("Range:", "").strip()
                elif line.startswith("Components:"):
                    components = line.replace("Components:", "").strip()
                    # Check for material component (M in components list)
                    if 'M' in components:
                        current_spell["material"] = True
                elif line.startswith("Duration:"):
                    duration = line.replace("Duration:", "").strip()
                    current_spell["duration"] = duration
                    # Check for Concentration
                    if 'Concentration' in duration:
                        current_spell["concentration"] = True
                elif line and not any(line.startswith(f) for f in ['Level', 'Casting Time:', 'Range:', 'Components:', 'Duration:', 'Cantrip']):
                    # This is description text
                    if current_spell["description"]:
                        current_spell["description"] += " " + line
                    else:
                        current_spell["description"] = line
        
        # Save last spell
        if current_spell:
            self._finalize_spell(current_spell)
        
        return {
            "Key": "spells",
            "spells": self.spells
            }
    
    def _finalize_spell(self, spell: Dict[str, Any]):
        """Clean up and finalize a spell entry"""
        # Clean description
        desc = spell["description"].strip()
        # Remove SRD footers
        desc = re.sub(r'\s*\d+\s+System Reference Document\s+[\d.]+', '', desc)
        # Normalize whitespace
        desc = re.sub(r'\s+', ' ', desc)
        spell["description"] = desc.strip()
        
        self.spells.append(spell)
    
    def save_to_file(self, filepath: str, data: Dict):
        """Save data to JSON file"""
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        return filepath


def main():
    if len(sys.argv) > 1:
        # File mode
        filepath = sys.argv[1]
        print(f"Parsing {filepath}...")
        try:
            with open(filepath, 'r') as f:
                raw_text = f.read()
        except FileNotFoundError:
            print(f"Error: File {filepath} not found")
            return
        
        parser = SRDSpellParser()
        spells_result = parser.parse_spells(raw_text)
        
        output_file = filepath.replace('.txt', '_spells.json').replace('.md', '_spells.json')
        parser.save_to_file(output_file, spells_result)
        print(f"✓ Parsed {len(spells_result['spells'])} spells")
        print(f"✓ Saved to {output_file}")
    else:
        # Interactive mode
        print("=" * 60)
        print("SRD Spell Description Parser")
        print("=" * 60)
        print("\nPaste your raw D&D spell content (Ctrl+Z then Enter when done):\n")
        
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
        print(f"✓ Parsed {len(spells_result['spells'])} spells")
        print(f"✓ Saved to spells.json")
        print("=" * 60)


if __name__ == "__main__":
    main()
