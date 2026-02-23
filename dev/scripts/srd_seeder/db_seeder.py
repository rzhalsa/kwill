"""
Kwill — MongoDB SRD Database Seeder
Seeds parsed SRD data into MongoDB. See USAGE.txt for setup instructions.
"""

import os
import json
import logging
import argparse
from pathlib import Path

from dotenv import load_dotenv

try:
    from pymongo import MongoClient, UpdateOne
    from pymongo.errors import BulkWriteError, ConnectionFailure
    PYMONGO_AVAILABLE = True
except ImportError:
    PYMONGO_AVAILABLE = False

load_dotenv()

# ─────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────

MONGO_URI   = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME     = os.getenv("MONGO_DB_NAME", "kwill")
PARSED_DIR  = Path(__file__).parent / "data" / "parsed"
BATCH_SIZE  = 100

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("db_seeder")

# All SRD data goes into single 'srdData' collection
# Each document has a 'Key' field indicating the type
SRD_COLLECTION = "srdData"

ENDPOINT_KEYS: dict[str, str] = {
    "spells":          "spells",
    "classes":         "classes",
    "races":           "races",
    "equipment":       "equipment",
    "features":        "features",
    "traits":          "traits",
    "conditions":      "conditions",
    "damage-types":    "damage_types",
    "magic-schools":   "magic_schools",
    "skills":          "skills",
    "proficiencies":   "proficiencies",
    "ability-scores":  "ability_scores",
    "languages":       "languages",
    "monsters":        "monsters",
}

# Indexes for single srdData collection
# Index on Key field for fast filtering by type
INDEXES: list = [
    [("Key", 1)],                          # Find all spells/classes/etc quickly
    [("Data.index", 1)],                   # Find by index within Data
]



# SEEDER

def ensure_indexes(db):
    """Create indexes on srdData collection"""
    coll = db[SRD_COLLECTION]
    for key_list in INDEXES:
        try:
            coll.create_index(key_list, background=True)
        except Exception as e:
            log.warning(f"  Index creation warning: {e}")


def upsert_collection(db, endpoint: str, documents: list[dict], dry_run: bool) -> dict:
    """Insert documents into srdData collection with Key field"""
    key = ENDPOINT_KEYS[endpoint]
    coll = db[SRD_COLLECTION]

    if dry_run:
        log.info(f"  [DRY RUN] Would upsert {len(documents)} docs with Key='{key}'")
        return {"upserted": 0, "modified": 0, "dry_run": True}

    # Ensure indexes exist (only needs to run once)
    ensure_indexes(db)

    total_upserted = 0
    total_modified = 0

    # Wrap each document with Key field
    wrapped_documents = [
        {
            "Key": key,
            "Data": doc
        }
        for doc in documents
    ]

    for batch_start in range(0, len(wrapped_documents), BATCH_SIZE):
        batch = wrapped_documents[batch_start : batch_start + BATCH_SIZE]

        operations = [
            UpdateOne(
                filter={"Key": doc["Key"], "Data.index": doc["Data"]["index"]},
                update={"$set": doc},
                upsert=True,
            )
            for doc in batch
        ]

        try:
            result = coll.bulk_write(operations, ordered=False)
            total_upserted += result.upserted_count
            total_modified += result.modified_count
        except BulkWriteError as bwe:
            log.error(f"  Bulk write error: {bwe.details}")

    return {"upserted": total_upserted, "modified": total_modified}


def run_seed(only: str | None = None, dry_run: bool = False):
    if not PYMONGO_AVAILABLE:
        log.error(
            "pymongo is not installed. Run:\n"
            "  pip install pymongo python-dotenv\n"
            "Then re-run the seeder."
        )
        return

    log.info(f"Connecting to MongoDB at: {MONGO_URI}")
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.admin.command("ping")
        log.info(f"  ✓ Connected — using database '{DB_NAME}'")
    except ConnectionFailure as e:
        log.error(
            f"Could not connect to MongoDB: {e}\n"
            f"  Check that MONGO_URI is set correctly in your .env file.\n"
            f"  Current value: {MONGO_URI}"
        )
        return

    db = client[DB_NAME]
    endpoints = [only] if only else list(ENDPOINT_KEYS.keys())
    summary = {}

    for endpoint in endpoints:
        if endpoint not in ENDPOINT_KEYS:
            log.warning(f"Unknown endpoint '{endpoint}' — skipping")
            continue

        parsed_file = PARSED_DIR / f"{endpoint}.json"
        if not parsed_file.exists():
            log.warning(
                f"  No parsed file found for '{endpoint}': {parsed_file}\n"
                f"  Run srd_fetcher.py first to generate parsed data."
            )
            continue

        with open(parsed_file) as f:
            documents = json.load(f)

        key = ENDPOINT_KEYS[endpoint]
        log.info(f"══ Seeding: {endpoint} → srdData (Key='{key}', {len(documents)} docs) ══")
        result = upsert_collection(db, endpoint, documents, dry_run)
        summary[endpoint] = result
        log.info(f"  ✓ upserted={result['upserted']}  modified={result['modified']}")

    print("\n" + "─" * 60)
    print(f"{'ENDPOINT':<22}  {'KEY':<22}  {'STATUS'}")
    print("─" * 60)
    for ep, s in summary.items():
        key = ENDPOINT_KEYS.get(ep, "?")
        if s.get("dry_run"):
            status = "DRY RUN"
        else:
            status = f"↑{s['upserted']} new  ~{s['modified']} updated"
        print(f"  {ep:<22}  {key:<22}  {status}")
    print("─" * 60 + "\n")

    client.close()
    log.info("Seeding complete. MongoDB connection closed.")



# CLI

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Kwill DB Seeder — populate MongoDB with parsed SRD data"
    )
    parser.add_argument(
        "--only", type=str, default=None, metavar="ENDPOINT",
        help="Seed a single endpoint (e.g. --only spells)"
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Print what would be seeded without writing to the database"
    )
    args = parser.parse_args()

    run_seed(only=args.only, dry_run=args.dry_run)