using System;
using MongoDB.Driver;
using MongoDB.Bson;
using Kwill.Validation;

namespace KwillDB
{
    class ValidatorTests
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Testing Validators with Real MongoDB Data\n");
            
            // Connect to MongoDB
            var client = new MongoClient("mongodb://localhost:27017");
            var db = client.GetDatabase("kwill");
            var srdData = db.GetCollection<BsonDocument>("srdData");
            
            int passed = 0;
            int failed = 0;
            
            // ═══════════════════════════════════════════════
            // Test 1: Validate Real Wizard Class from DB
           
            Console.WriteLine("TEST 1: Real Wizard Class from MongoDB");
            Console.WriteLine("───────────────────────────────────────");
            
            var wizard = srdData.Find(new BsonDocument { 
                { "Key", "classes" }, 
                { "Data.index", "wizard" } 
            }).FirstOrDefault();
            
            if (wizard != null)
            {
                var data = wizard["Data"].AsBsonDocument;
                int hitDie = data["hit_die"].AsInt32;
                
                Console.WriteLine($"  Wizard hit_die from DB: d{hitDie}");
                bool valid = CharacterValidators.ValidateHitDie($"d{hitDie}");
                Console.WriteLine($"  Valid? {valid} {(valid ? "✓ PASS" : "✗ FAIL")}");
                
                if (valid) passed++; else failed++;
            }
            
            // ═══════════════════════════════════════════════
            // Test 2: Validate Real Fireball Spell from DB
            // ═══════════════════════════════════════════════
            Console.WriteLine("\nTEST 2: Real Fireball Spell from MongoDB");
            Console.WriteLine("───────────────────────────────────────");
            
            var fireball = srdData.Find(new BsonDocument { 
                { "Key", "spells" }, 
                { "Data.index", "fireball" } 
            }).FirstOrDefault();
            
            if (fireball != null)
            {
                var data = fireball["Data"].AsBsonDocument;
                int level = data["level"].AsInt32;
                
                Console.WriteLine($"  Fireball level from DB: {level}");
                bool valid = CharacterValidators.ValidateCharacterLevel(level);
                Console.WriteLine($"  Valid spell level? {valid} {(valid ? "✓ PASS" : "✗ FAIL")}");
                
                if (valid) passed++; else failed++;
            }
            
            // ═══════════════════════════════════════════════
            // Test 3: Validate All Classes Have Valid Hit Dice
            // ═══════════════════════════════════════════════
            Console.WriteLine("\nTEST 3: All Classes Have Valid Hit Dice");
            Console.WriteLine("───────────────────────────────────────");
            
            var allClasses = srdData.Find(new BsonDocument { { "Key", "classes" } }).ToList();
            Console.WriteLine($"  Found {allClasses.Count} classes in database");
            
            foreach (var classDoc in allClasses)
            {
                var data = classDoc["Data"].AsBsonDocument;
                string name = data["name"].AsString;
                int hitDie = data["hit_die"].AsInt32;
                bool valid = CharacterValidators.ValidateHitDie($"d{hitDie}");
                
                string status = valid ? "✓" : "✗";
                Console.WriteLine($"  {status} {name}: d{hitDie}");
                
                if (valid) passed++; else failed++;
            }
            
            // ═══════════════════════════════════════════════
            // Test 4: Validate Proficiency Bonus Calculation
            // ═══════════════════════════════════════════════
            Console.WriteLine("\nTEST 4: Proficiency Bonus Validation");
            Console.WriteLine("───────────────────────────────────────");
            
            var testCases = new[] {
                (level: 1, bonus: 2),
                (level: 5, bonus: 3),
                (level: 9, bonus: 4),
                (level: 13, bonus: 5),
                (level: 17, bonus: 6)
            };
            
            foreach (var test in testCases)
            {
                bool valid = CharacterValidators.ValidateProficiencyBonus(test.bonus, test.level);
                string status = valid ? "✓" : "✗";
                Console.WriteLine($"  {status} Level {test.level} → +{test.bonus}");
                
                if (valid) passed++; else failed++;
            }
            
            // ═══════════════════════════════════════════════
            // Results
            // ═══════════════════════════════════════════════
            Console.WriteLine("\n═══════════════════════════════════════");
            Console.WriteLine($"  PASSED: {passed}");
            Console.WriteLine($"  FAILED: {failed}");
            Console.WriteLine($"  TOTAL:  {passed + failed}");
            Console.WriteLine("═══════════════════════════════════════\n");
            
            if (failed == 0)
            {
                Console.WriteLine("🎉 All tests passed! Validators work with real MongoDB data.");
            }
            else
            {
                Console.WriteLine($"⚠️  {failed} tests failed. Review output above.");
            }
        }
    }
}