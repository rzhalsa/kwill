from pymongo import MongoClient
import unittest

'''
validator_test.py

Essentially ValidatorTests.cs but refactored to Python in order to simplify the CI pipeline.

Utilizes Python's unittest module for a simple and robust unit testing API.
'''

# Validates hit die type is valid for D&D
# Valid hit dice: d4, d6, d8, d10, d12
def validate_hit_die(hit_die: int) -> bool:
    valid_dice = [4, 6, 8, 10, 12]
    return (hit_die and hit_die in valid_dice)

# Validates character level is 1-20
def validate_character_level(level: int) -> bool:
    return (level >= 1 and level <= 20)

# Validates spell level is 1-9
def validate_spell_level(level: int) -> bool:
    return (level >= 1 and level <= 9)

# Validates proficiency bonus matches character level
# Proficiency bonus = 2 + floor((level -1) // 4)
# Ranges: +2 (L1-4), +3 (L5-8), +4 (L9-12), +5 (L13-16), +6 (L17-20)
def validate_proficiency_bonus(bonus: int, level: int) -> bool:
    expected = 2 + ((level - 1) // 4)
    return bonus == expected

'''
Class containing all validator tests for the MongoDB database

Contains test functions to test:
    1. The Wizard class
    2. The Fireball spell
    3. If all found character classes have valid hit die
    4. If the listed proficiency bonuses are valid (this should prob be changed to use data from the db)
'''
class ValidatorTests(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Connect to MongoDB
        cls.client = MongoClient('mongodb://localhost:27017')
        cls.db = cls.client.get_database('kwill')
        cls.srd_data = cls.db.get_collection('srdData')

    @classmethod
    def tearDownClass(cls):
        # Clean up client connection to MongoDB
        cls.client.close()

    # Runs before every test
    def setUp(self):
        self.collection = self.db['srdData']

    # ===============================================
    # Test 1: Validate Real Wizard Class from DB
    # ===============================================
    def test_real_wizard_class(self):
        wizard = self.srd_data.find_one({
            "Key": "classes",
            "Data.index": "wizard"
        })

        if wizard:
            data = wizard["Data"]
            hit_die = data["hit_die"]
            self.assertTrue(validate_hit_die(hit_die))
        else:
            self.fail("Wizard class not found in database")

    # ===============================================
    # Test 2: Validate Real Fireball spell from DB
    # ===============================================
    def test_real_fireball_spell(self):
        fireball = self.srd_data.find_one({
            "Key": "spells",
            "Data.index": "fireball"
        })

        if fireball:
            data = fireball["Data"]
            level = data["level"]
            self.assertTrue(validate_spell_level(level))
        else:
            self.fail("Fireball spell not found in database")

    # ===============================================
    # Test 3: Validate All Classes Have Valid Hit Dice
    # ===============================================
    def test_validate_all_classes(self):
        all_classes = list(self.srd_data.find({"Key": "classes"}))

        for class_doc in all_classes:
            data = class_doc["Data"]
            hit_die = data["hit_die"]
            self.assertTrue(validate_hit_die(hit_die))
    
    # ===============================================
    # Test 4: Validate Proficiency Bonus Calculation
    # ===============================================
    def test_validate_prof_bonus(self):
        test_cases = [
            (1, 2),
            (5, 3),
            (9, 4),
            (13, 5),
            (17, 6)
        ]

        for level, bonus in test_cases:
            self.assertTrue(validate_proficiency_bonus(bonus, level))

if __name__ == "__main__":
    unittest.main()