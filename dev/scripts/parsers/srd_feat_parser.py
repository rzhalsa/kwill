#!/usr/bin/env python3
"""
SRD Feat Parser
Parse raw D&D feats and convert to JSON
"""

import json
import re
from typing import Dict, Any, List
import sys


class SRDFeatParser:
    """Parser for D&D SRD feats"""
    
    def __init__(self):
        self.feats: List[Dict[str, Any]] = []
    
    def parse_feats(self, raw_text: str) -> Dict[str, Any]:
        """Parse feats from raw text"""
        self.feats = []
        
        # Normalize unicode apostrophes
        raw_text = (
    raw_text
    .replace('\u2019', "'")   # right single quote
    .replace('\u2018', "'")   # left single quote
    .replace('\u201c', '"')   # left double quote
    .replace('\u201d', '"')   # right double quote
)
        
        # Split by looking for feat name + type pattern
        # Feat name: line that starts with capital letter(s)
        # Feat type: next line containing "Feat"
        # Description: everything until next feat name
        lines = raw_text.split('\n')
        
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            # Look for a feat name (capitalized, not containing "Feat")
            if line and line[0].isupper() and 'Feat' not in line and i + 1 < len(lines):
                feat_name = line
                
                # Check if next non-empty line contains "Feat"
                j = i + 1
                while j < len(lines) and not lines[j].strip():
                    j += 1
                
                if j < len(lines) and 'Feat' in lines[j]:
                    feat_type = lines[j].strip()
                    
                    # Extract prerequisites if they exist
                    prereq_match = re.search(r'\(Prerequisite[s]?:\s*([^)]+)\)', feat_type)
                    prerequisites = prereq_match.group(1).strip() if prereq_match else ""
                    
                    # Clean feat type to remove prerequisites
                    clean_type = re.sub(r'\s*\(Prerequisite[s]?:[^)]*\)', '', feat_type).strip()
                    
                    # Get description (all lines until next feat)
                    description_lines = []
                    k = j + 1
                    while k < len(lines):
                        next_line = lines[k].strip()
                        
                        # Check if this is a new feat (capitalized + next line has "Feat")
                        if next_line and next_line[0].isupper() and 'Feat' not in next_line and k + 1 < len(lines):
                            if 'Feat' in lines[k + 1]:
                                break
                        
                        if next_line:
                            description_lines.append(next_line)
                        k += 1
                    
                    description = ' '.join(description_lines)
                    description = re.sub(r'\s+', ' ', description).strip()
                    
                    if description:
                        feat = {
                            "name": feat_name,
                            "type": clean_type,
                            "prerequisites": prerequisites,
                            "action": "",
                            "uses_current": "",
                            "uses_max": "",
                            "restore": "",
                            "tooltip": "",
                            "description": description,
                            "formula": "",
                            "formula_active": False
                        }
                        self.feats.append(feat)
                    
                    i = k
                else:
                    i += 1
            else:
                i += 1
        
        return {
            "Key": "features",
            "feats": self.feats
            }
    
    def save_to_file(self, filepath: str):
        """Save parsed feats to JSON file"""
        result = {"Key": "features", "feats": self.feats}
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
        
        parser = SRDFeatParser()
        result = parser.parse_feats(raw_text)
        
        output_file = filepath.replace('.txt', '.json').replace('.md', '.json')
        saved_file = parser.save_to_file(output_file)
        
        print(f"✓ Parsed {len(result['feats'])} feats")
        print(f"✓ Saved to {saved_file}")
    else:
        # Interactive mode
        print("=" * 60)
        print("SRD Feat Parser")
        print("=" * 60)
        print("\nPaste your raw D&D feats (Ctrl+Z then Enter when done):\n")
        
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
        
        parser = SRDFeatParser()
        result = parser.parse_feats(raw_text)
        
        # Auto-save to feats.json
        saved_file = parser.save_to_file("feats.json")
        print("\n" + "=" * 60)
        print(f"✓ Parsed {len(result['feats'])} feats")
        print(f"✓ Saved to {saved_file}")
        print("=" * 60)


if __name__ == "__main__":
    main()
