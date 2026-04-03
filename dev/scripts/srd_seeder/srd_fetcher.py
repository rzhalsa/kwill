"""
Kwill — D&D SRD Data Fetcher & Parser
Fetches SRD data from 5e-bits/5e-database GitHub repo and parses it for MongoDB.
"""

import io
import json
import logging
import zipfile
import argparse
from pathlib import Path

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# ─────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────

REPO_ZIP_URL  = "https://github.com/5e-bits/5e-database/archive/refs/heads/main.zip"
ZIP_SRD_PATH  = "5e-database-main/src/2014/"
RAW_DIR       = Path(__file__).parent / "data" / "raw"
PARSED_DIR    = Path(__file__).parent / "data" / "parsed"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("srd_fetcher")

FILE_MAP: dict[str, str] = {
    "ability-scores":  "5e-SRD-Ability-Scores.json",
    "classes":         "5e-SRD-Classes.json",
    "conditions":      "5e-SRD-Conditions.json",
    "damage-types":    "5e-SRD-Damage-Types.json",
    "equipment":       "5e-SRD-Equipment.json",
    "features":        "5e-SRD-Features.json",
    "languages":       "5e-SRD-Languages.json",
    "magic-schools":   "5e-SRD-Magic-Schools.json",
    "monsters":        "5e-SRD-Monsters.json",
    "proficiencies":   "5e-SRD-Proficiencies.json",
    "races":           "5e-SRD-Races.json",
    "skills":          "5e-SRD-Skills.json",
    "spells":          "5e-SRD-Spells.json",
    "traits":          "5e-SRD-Traits.json",
}


# DOWNLOADER

def make_session() -> requests.Session:
    session = requests.Session()
    retry = Retry(total=4, backoff_factor=1.5, status_forcelist=[429, 500, 502, 503, 504])
    session.mount("https://", HTTPAdapter(max_retries=retry))
    return session


def download_and_extract(session: requests.Session):
    log.info(f"Downloading 5e-database repo from GitHub...")
    log.info(f"  {REPO_ZIP_URL}")

    resp = session.get(REPO_ZIP_URL, timeout=60, stream=True)
    resp.raise_for_status()

    content = b""
    total = 0
    for chunk in resp.iter_content(chunk_size=65536):
        content += chunk
        total += len(chunk)
        if total % (512 * 1024) == 0:
            log.info(f"  Downloaded {total // 1024}KB...")

    log.info(f"  Download complete ({total // 1024}KB). Extracting SRD files...")

    RAW_DIR.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(io.BytesIO(content)) as zf:
        extracted = 0
        for key, filename in FILE_MAP.items():
            zip_path = ZIP_SRD_PATH + filename
            try:
                data = zf.read(zip_path)
                out_path = RAW_DIR / f"{key}.json"
                with open(out_path, "wb") as f:
                    f.write(data)
                extracted += 1
                log.info(f"  ✓ Extracted {filename} → {out_path.name}")
            except KeyError:
                log.warning(f"  ⚠ Not found in zip: {zip_path}")

    log.info(f"Extraction complete. {extracted}/{len(FILE_MAP)} files saved to {RAW_DIR}\n")


def load_raw(key: str) -> list[dict]:
    raw_path = RAW_DIR / f"{key}.json"
    if not raw_path.exists():
        raise FileNotFoundError(
            f"Raw file not found: {raw_path}\n"
            f"Run without --use-cache to download the data first."
        )
    with open(raw_path) as f:
        data = json.load(f)

    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        return data.get("results", list(data.values())[0] if data else [])
    return []


# SHARED HELPERS

def _ref(obj: dict | None) -> str | None:
    if not obj:
        return None
    return obj.get("index") or obj.get("name")


def _ref_list(items: list[dict] | None) -> list[str]:
    return [_ref(i) for i in (items or []) if _ref(i)]


def _desc(raw: list[str] | str | None) -> str:
    if not raw:
        return ""
    if isinstance(raw, list):
        return "\n\n".join(str(p) for p in raw)
    return str(raw)


# PARSERS

def parse_spell(raw: dict) -> dict:
    damage = raw.get("damage") or {}
    dc     = raw.get("dc") or {}
    area   = raw.get("area_of_effect") or {}

    return {
        "index":          raw["index"],
        "name":           raw["name"],
        "level":          raw.get("level", 0),
        "school":         _ref(raw.get("magic_school")),
        "casting_time":   raw.get("casting_time", ""),
        "range":          raw.get("range", ""),
        "duration":       raw.get("duration", ""),
        "concentration":  raw.get("concentration", False),
        "ritual":         raw.get("ritual", False),
        "components":     raw.get("components", []),
        "material":       raw.get("material", ""),
        "description":    _desc(raw.get("desc")),
        "higher_levels":  _desc(raw.get("higher_level")),
        "classes":        _ref_list(raw.get("classes", [])),
        "subclasses":     _ref_list(raw.get("subclasses", [])),
        "damage": {
            "damage_type":            _ref(damage.get("damage_type")),
            "damage_at_slot_level":   damage.get("damage_at_slot_level", {}),
            "damage_at_char_level":   damage.get("damage_at_character_level", {}),
        } if damage else None,
        "dc": {
            "dc_type":    _ref(dc.get("dc_type")),
            "dc_success": dc.get("success_type", "none"),
        } if dc else None,
        "area_of_effect": {
            "type": area.get("type"),
            "size": area.get("size"),
        } if area else None,
        "heal_at_slot_level": raw.get("heal_at_slot_level", {}),
    }


def parse_class(raw: dict) -> dict:
    sc = raw.get("spellcasting") or {}

    return {
        "index":    raw["index"],
        "name":     raw["name"],
        "hit_die":  raw.get("hit_die", 8),
        "proficiency_choices": [
            {
                "desc":   c.get("desc", ""),
                "choose": c.get("choose", 1),
                "from":   _ref_list(c.get("from", {}).get("options", [])),
            }
            for c in raw.get("proficiency_choices", [])
        ],
        "proficiencies":   _ref_list(raw.get("proficiencies", [])),
        "saving_throws":   _ref_list(raw.get("saving_throws", [])),
        "starting_equipment": [
            {
                "equipment": _ref(item.get("equipment")),
                "quantity":  item.get("quantity", 1),
            }
            for item in raw.get("starting_equipment", [])
        ],
        "subclasses":  _ref_list(raw.get("subclasses", [])),
        "spellcasting": {
            "level":                raw.get("level"),
            "spellcasting_ability": _ref(sc.get("spellcasting_ability")),
            "info": [
                {"name": s.get("name"), "desc": _desc(s.get("desc"))}
                for s in sc.get("info", [])
            ],
        } if sc else None,
        "multi_classing": raw.get("multi_classing"),
    }


def parse_race(raw: dict) -> dict:
    return {
        "index":    raw["index"],
        "name":     raw["name"],
        "speed":    raw.get("speed", 30),
        "ability_bonuses": [
            {
                "ability_score": _ref(b.get("ability_score")),
                "bonus":         b.get("bonus", 0),
            }
            for b in raw.get("ability_bonuses", [])
        ],
        "alignment":       raw.get("alignment", ""),
        "age":             raw.get("age", ""),
        "size":            raw.get("size", ""),
        "size_description": raw.get("size_description", ""),
        "starting_proficiencies": _ref_list(raw.get("starting_proficiencies", [])),
        "languages":       _ref_list(raw.get("languages", [])),
        "language_desc":   raw.get("language_desc", ""),
        "traits":          _ref_list(raw.get("traits", [])),
        "subraces":        _ref_list(raw.get("subraces", [])),
    }


def parse_equipment(raw: dict) -> dict:
    damage   = raw.get("damage") or {}
    two_hand = raw.get("two_handed_damage") or {}
    armor    = raw.get("armor_class") or {}
    cost     = raw.get("cost") or {}

    return {
        "index":              raw["index"],
        "name":               raw["name"],
        "equipment_category": _ref(raw.get("equipment_category")),
        "gear_category":      _ref(raw.get("gear_category")),
        "weapon_category":    raw.get("weapon_category"),
        "weapon_range":       raw.get("weapon_range"),
        "category_range":     raw.get("category_range"),
        "cost": {
            "quantity": cost.get("quantity", 0),
            "unit":     cost.get("unit", "gp"),
        },
        "weight":      raw.get("weight", 0),
        "description": _desc(raw.get("desc")),
        "damage": {
            "damage_dice": damage.get("damage_dice", ""),
            "damage_type": _ref(damage.get("damage_type")),
        } if damage else None,
        "two_handed_damage": {
            "damage_dice": two_hand.get("damage_dice", ""),
            "damage_type": _ref(two_hand.get("damage_type")),
        } if two_hand else None,
        "armor_class": {
            "base":      armor.get("base", 0),
            "dex_bonus": armor.get("dex_bonus", False),
            "max_bonus": armor.get("max_bonus"),
        } if armor else None,
        "str_minimum":         raw.get("str_minimum", 0),
        "stealth_disadvantage": raw.get("stealth_disadvantage", False),
        "properties":          _ref_list(raw.get("properties", [])),
        "range": {
            "normal": raw.get("range", {}).get("normal"),
            "long":   raw.get("range", {}).get("long"),
        } if raw.get("range") else None,
        "special": raw.get("special", []),
    }


def parse_feature(raw: dict) -> dict:
    return {
        "index":       raw["index"],
        "name":        raw["name"],
        "level":       raw.get("level", 1),
        "class":       _ref(raw.get("class")),
        "subclass":    _ref(raw.get("subclass")),
        "description": _desc(raw.get("desc")),
        "prerequisites": [
            {"type": p.get("type"), "level": p.get("level")}
            for p in raw.get("prerequisites", [])
        ],
        "feature_specific": raw.get("feature_specific"),
    }


def parse_trait(raw: dict) -> dict:
    return {
        "index":         raw["index"],
        "name":          raw["name"],
        "races":         _ref_list(raw.get("races", [])),
        "subraces":      _ref_list(raw.get("subraces", [])),
        "description":   _desc(raw.get("desc")),
        "proficiencies": _ref_list(raw.get("proficiencies", [])),
        "proficiency_choices": raw.get("proficiency_choices"),
        "trait_specific":     raw.get("trait_specific"),
    }


def parse_condition(raw: dict) -> dict:
    return {
        "index":       raw["index"],
        "name":        raw["name"],
        "description": _desc(raw.get("desc")),
    }


def parse_damage_type(raw: dict) -> dict:
    return {
        "index":       raw["index"],
        "name":        raw["name"],
        "description": _desc(raw.get("desc")),
    }


def parse_magic_school(raw: dict) -> dict:
    return {
        "index":       raw["index"],
        "name":        raw["name"],
        "description": _desc(raw.get("desc")),
    }


def parse_skill(raw: dict) -> dict:
    return {
        "index":         raw["index"],
        "name":          raw["name"],
        "ability_score": _ref(raw.get("ability_score")),
        "description":   _desc(raw.get("desc")),
    }


def parse_proficiency(raw: dict) -> dict:
    return {
        "index":  raw["index"],
        "name":   raw["name"],
        "type":   raw.get("type", ""),
        "classes": _ref_list(raw.get("classes", [])),
        "races":   _ref_list(raw.get("races", [])),
    }


def parse_ability_score(raw: dict) -> dict:
    return {
        "index":       raw["index"],
        "name":        raw["name"],
        "full_name":   raw.get("full_name", raw["name"]),
        "description": _desc(raw.get("desc")),
        "skills":      _ref_list(raw.get("skills", [])),
    }


def parse_language(raw: dict) -> dict:
    return {
        "index":             raw["index"],
        "name":              raw["name"],
        "type":              raw.get("type", ""),
        "script":            raw.get("script", ""),
        "typical_speakers":  raw.get("typical_speakers", []),
        "description":       _desc(raw.get("desc")),
    }


def parse_monster(raw: dict) -> dict:
    return {
        "index":           raw["index"],
        "name":            raw["name"],
        "size":            raw.get("size", ""),
        "type":            raw.get("type", ""),
        "subtype":         raw.get("subtype"),
        "alignment":       raw.get("alignment", ""),
        "armor_class":     raw.get("armor_class", []),
        "hit_points":      raw.get("hit_points", 0),
        "hit_dice":        raw.get("hit_dice", ""),
        "hit_points_roll": raw.get("hit_points_roll", ""),
        "speed":           raw.get("speed", {}),
        "strength":        raw.get("strength", 10),
        "dexterity":       raw.get("dexterity", 10),
        "constitution":    raw.get("constitution", 10),
        "intelligence":    raw.get("intelligence", 10),
        "wisdom":          raw.get("wisdom", 10),
        "charisma":        raw.get("charisma", 10),
        "proficiencies":   raw.get("proficiencies", []),
        "damage_vulnerabilities": raw.get("damage_vulnerabilities", []),
        "damage_resistances":     raw.get("damage_resistances", []),
        "damage_immunities":      raw.get("damage_immunities", []),
        "condition_immunities":   _ref_list(raw.get("condition_immunities", [])),
        "senses":           raw.get("senses", {}),
        "languages":        raw.get("languages", ""),
        "challenge_rating": raw.get("challenge_rating", 0),
        "xp":               raw.get("xp", 0),
        "special_abilities": raw.get("special_abilities", []),
        "actions":           raw.get("actions", []),
        "legendary_actions": raw.get("legendary_actions", []),
        "reactions":         raw.get("reactions", []),
    }



# PARSER DISPATCH

PARSERS = {
    "ability-scores": parse_ability_score,
    "classes":        parse_class,
    "conditions":     parse_condition,
    "damage-types":   parse_damage_type,
    "equipment":      parse_equipment,
    "features":       parse_feature,
    "languages":      parse_language,
    "magic-schools":  parse_magic_school,
    "monsters":       parse_monster,
    "proficiencies":  parse_proficiency,
    "races":          parse_race,
    "skills":         parse_skill,
    "spells":         parse_spell,
    "traits":         parse_trait,
}



# MAIN PIPELINE

def run(use_cache: bool = False, seed: bool = False, only: str | None = None):
    session   = make_session()
    endpoints = [only] if only else list(FILE_MAP.keys())

    if not use_cache:
        download_and_extract(session)
    else:
        log.info("Skipping download — using cached files in data/raw/")

    PARSED_DIR.mkdir(parents=True, exist_ok=True)
    summary = {}

    for key in endpoints:
        if key not in PARSERS:
            log.warning(f"No parser for '{key}' — skipping")
            continue

        log.info(f"Parsing: {key} ...")
        raw_items    = load_raw(key)
        parsed_items = []
        errors       = 0

        for item in raw_items:
            try:
                parsed_items.append(PARSERS[key](item))
            except Exception as e:
                errors += 1
                log.error(f"  Failed on '{item.get('index', '?')}': {e}")

        out_path = PARSED_DIR / f"{key}.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(parsed_items, f, indent=2, ensure_ascii=False)

        log.info(f"  ✓ {len(parsed_items)} documents ({errors} errors) → {out_path.name}")
        summary[key] = {"count": len(parsed_items), "errors": errors}

    print("\n" + "─" * 50)
    print(f"  {'COLLECTION':<22}  {'DOCS':>6}  {'ERRORS':>6}")
    print("─" * 50)
    for k, s in summary.items():
        icon = "✓" if s["errors"] == 0 else "⚠"
        print(f"  {icon} {k:<22}  {s['count']:>6}  {s['errors']:>6}")
    print("─" * 50)
    total = sum(s["count"] for s in summary.values())
    errs  = sum(s["errors"] for s in summary.values())
    print(f"  {'TOTAL':<22}  {total:>6}  {errs:>6}")
    print("─" * 50)
    print(f"\n  Parsed data → {PARSED_DIR.resolve()}\n")

    if seed:
        log.info("Handing off to db_seeder.py ...")
        from db_seeder import run_seed
        run_seed(only=only)



# CLI

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Kwill SRD Fetcher — download 5e-bits/5e-database and parse for MongoDB"
    )
    parser.add_argument(
        "--seed", action="store_true",
        help="Also seed parsed data into MongoDB after parsing (requires db_seeder.py)"
    )
    parser.add_argument(
        "--use-cache", action="store_true",
        help="Skip GitHub download, parse from existing data/raw/ files"
    )
    parser.add_argument(
        "--only", type=str, default=None, metavar="KEY",
        help=f"Process one collection only. Choices: {', '.join(FILE_MAP.keys())}"
    )
    args = parser.parse_args()
    run(use_cache=args.use_cache, seed=args.seed, only=args.only)