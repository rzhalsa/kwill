using System;
using MongoDB.Driver;
using MongoDB.Bson;
using Kwill.Validation;
using Xunit;
using Xunit.Sdk;

namespace Kwill.tests
{
    public class ValidatorTests : IDisposable
    {
        private readonly IMongoClient _client;
        private readonly IMongoDatabase _database;
        private readonly IMongoCollection<BsonDocument> _srdData;

        public ValidatorTests()
        {
            // Connect to MongoDB database
            _client = new MongoClient("mongodb://localhost:27017");
            _database = _client.GetDatabase("kwill");
            _srdData = _database.GetCollection<BsonDocument>("srdData");
        }

        public void Dispose()
        {
            _client?.Dispose();
        }

        // ==================================================
        // Test 1: Validate Real Wizard Class from DB
        // ==================================================
        [Fact(Skip = "Skipping because local MongoDB is not available in CI")]
        public void TestRealWizardClass()
        {
            var wizard = _srdData.Find(new BsonDocument
            {
                { "Key", "classes" },
                { "Data.index", "wizard" }
            }).FirstOrDefault();

            if(wizard == null)
            {
                throw new XunitException("Wizard class not found in database");
            }

            var data = wizard["Data"].AsBsonDocument;
            var hitDie = data["hit_die"].AsInt32;

            Assert.True(CharacterValidators.ValidateHitDie($"d{hitDie}"));
        }

        // ==================================================
        // Test 2: Validate Real Fireball Spell from DB
        // ==================================================
        [Fact(Skip = "Skipping because local MongoDB is not available in CI")]
        public void TestRealFireballSpell()
        {
            var fireball = _srdData.Find(new BsonDocument { 
                { "Key", "spells" }, 
                { "Data.index", "fireball" } 
            }).FirstOrDefault();

            if(fireball == null)
            {
                throw new XunitException("Wizard class not found in database");
            }

            var data = fireball["Data"].AsBsonDocument;
            int level = data["level"].AsInt32;

            Assert.True(CharacterValidators.ValidateCharacterLevel(level));
        }

        // ==================================================
        // Test 3: Validate All Classes Have Valid Hit Dice
        // ==================================================
        [Fact(Skip = "Skipping because local MongoDB is not available in CI")]
        public void TestValidateAllClasses()
        {
            var allClasses = _srdData.Find(new BsonDocument { { "Key", "classes" } }).ToList();

            foreach (var classDoc in allClasses)
            {
                var data = classDoc["Data"].AsBsonDocument;
                int hitDie = data["hit_die"].AsInt32;

                Assert.True(CharacterValidators.ValidateHitDie($"d{hitDie}"), $"Invalid hit die {hitDie} found for class");
            }
        }

        // ==================================================
        // Test 4: Validate Proficiency Bonus Calculation
        // ==================================================
        [Fact]
        public void TestValidateProficiencyBonus()
        {
            var testCases = new[] {
                (level: 1, bonus: 2),
                (level: 5, bonus: 3),
                (level: 9, bonus: 4),
                (level: 13, bonus: 5),
                (level: 17, bonus: 6)
            };

            foreach (var test in testCases)
            {
                Assert.True(CharacterValidators.ValidateProficiencyBonus(test.bonus, test.level));
            }
        }
    }
}