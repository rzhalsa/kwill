#!/usr/bin/env python3
"""
SRD Background Parser
Parse raw D&D backgrounds and convert to JSON
"""

import json
import re
from typing import Dict, Any, List
import sys


class SRDBackgroundParser:
    """Parser for D&D SRD backgrounds"""
    
    def __init__(self):
        self.backgrounds: List[Dict[str, Any]] = []
    
    def parse_backgrounds(self, raw_text: str) -> Dict[str, Any]:
        """Parse backgrounds from raw text"""
        self.backgrounds = []
        
        # Normalize unicode apostrophes
        raw_text = (
    raw_text
    .replace('\u2019', "'")   # right single quote
    .replace('\u2018', "'")   # left single quote
    .replace('\u201c', '"')   # left double quote
    .replace('\u201d', '"')   # right double quote
)
        
        # Split by background name (capitalized line followed by "Ability Scores:")
        # Look for pattern: Name, then Ability Scores line
        lines = raw_text.split('\n')
        
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            # Look for background name (capitalized, followed by Ability Scores)
            if line and line[0].isupper() and i + 1 < len(lines):
                # Check if next non-empty line starts with "Ability Scores:"
                j = i + 1
                while j < len(lines) and not lines[j].strip():
                    j += 1
                
                if j < len(lines) and 'Ability Scores:' in lines[j]:
                    background_name = line
                    
                    # Parse the background fields
                    background = {"name": background_name}
                    k = j
                    
                    # Parse fields until next background or end
                    while k < len(lines):
                        field_line = lines[k].strip()
                        
                        # Check if this is a new background
                        if field_line and field_line[0].isupper() and 'Ability Scores:' not in field_line and k + 1 < len(lines):
                            next_line = lines[k + 1].strip()
                            if 'Ability Scores:' in next_line:
                                break
                        
                        # Parse known fields
                        if 'Ability Scores:' in field_line:
                            background['ability_scores'] = field_line.replace('Ability Scores:', '').strip()
                        elif 'Feat:' in field_line:
                            background['feat'] = field_line.replace('Feat:', '').strip()
                        elif 'Skill Proficiencies:' in field_line:
                            background['skill_proficiencies'] = field_line.replace('Skill Proficiencies:', '').strip()
                        elif 'Tool Proficiency:' in field_line:
                            background['tool_proficiency'] = field_line.replace('Tool Proficiency:', '').strip()
                        elif 'Equipment:' in field_line:
                            # Equipment can span multiple lines
                            equipment_lines = [field_line.replace('Equipment:', '').strip()]
                            k += 1
                            while k < len(lines):
                                next_field = lines[k].strip()
                                # Check if this is a new field or background
                                if next_field and any(x in next_field for x in ['Ability Scores:', 'Feat:', 'Skill Proficiencies:', 'Tool Proficiency:']):
                                    k -= 1
                                    break
                                if next_field and next_field[0].isupper() and k + 1 < len(lines) and 'Ability Scores:' in lines[k + 1]:
                                    k -= 1
                                    break
                                if next_field:
                                    equipment_lines.append(next_field)
                                k += 1
                            background['equipment'] = ' '.join(equipment_lines)
                        
                        k += 1
                    
                    self.backgrounds.append(background)
                    i = k
                else:
                    i += 1
            else:
                i += 1
        
        return {
            "Key": "backgrounds",
            "backgrounds": self.backgrounds
            }
    
    def save_to_file(self, filepath: str):
        """Save parsed backgrounds to JSON file"""
        result = {"Key": "backgrounds", "backgrounds": self.backgrounds}
        with open(filepath, 'w') as f:
            json.dump(result, f, indent=2)
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
        
        parser = SRDBackgroundParser()
        result = parser.parse_backgrounds(raw_text)
        
        output_file = filepath.replace('.txt', '.json').replace('.md', '.json')
        saved_file = parser.save_to_file(output_file)
        
        print(f"✓ Parsed {len(result['backgrounds'])} backgrounds")
        print(f"✓ Saved to {saved_file}")
    else:
        # Interactive mode
        print("=" * 60)
        print("SRD Background Parser")
        print("=" * 60)
        print("\nPaste your raw D&D backgrounds (Ctrl+Z then Enter when done):\n")
        
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
        
        parser = SRDBackgroundParser()
        result = parser.parse_backgrounds(raw_text)
        
        # Auto-save to backgrounds.json
        saved_file = parser.save_to_file("backgrounds.json")
        print("\n" + "=" * 60)
        print(f"✓ Parsed {len(result['backgrounds'])} backgrounds")
        print(f"✓ Saved to {saved_file}")
        print("=" * 60)


if __name__ == "__main__":
    main()
