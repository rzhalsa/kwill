using Kwill.Api.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Kwill.Api.Services
{
    public class UserService
    {
        private readonly KwillDB.KwillDB _db;

        public UserService(KwillDB.KwillDB db) => _db = db;

        public async Task<BsonDocument?> GetByUserIdAsync(string userId)
        {
            var filter = Builders<BsonDocument>.Filter.Eq("userid", userId);
            return await _db.Users.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<(bool Success, BsonDocument? Doc, string? ErrorMessage)> CreateAsync(string userId, string email)
        {
            try
            {
                var existing = await GetByUserIdAsync(userId);
                if (existing != null)
                    return (false, null, $"User with ID '{userId}' already exists");

                var userDoc = new BsonDocument
                {
                    { "userid", userId },
                    { "email", email },
                    { "created_at", DateTime.UtcNow },
                    { "characters", new BsonArray() }
                };

                await _db.Users.InsertOneAsync(userDoc);
                return (true, userDoc, null);
            }
            catch (Exception ex)
            {
                return (false, null, ex.Message);
            }
        }

        public async Task<(bool Success, bool NotFound, string? ErrorMessage)> AddCharacterAsync(string userId, string characterId)
        {
            try
            {
                var filter = Builders<BsonDocument>.Filter.Eq("userid", userId);
                var user = await _db.Users.Find(filter).FirstOrDefaultAsync();

                if (user == null)
                    return (false, true, null);

                var update = Builders<BsonDocument>.Update.AddToSet("characters", characterId);
                await _db.Users.UpdateOneAsync(filter, update);
                return (true, false, null);
            }
            catch (Exception ex)
            {
                return (false, false, ex.Message);
            }
        }

        public async Task<(bool Success, bool NotFound, string? ErrorMessage)> RemoveCharacterAsync(string userId, string characterId)
        {
            try
            {
                var filter = Builders<BsonDocument>.Filter.Eq("userid", userId);
                var user = await _db.Users.Find(filter).FirstOrDefaultAsync();

                if (user == null)
                    return (false, true, null);

                var update = Builders<BsonDocument>.Update.Pull("characters", characterId);
                await _db.Users.UpdateOneAsync(filter, update);
                return (true, false, null);
            }
            catch (Exception ex)
            {
                return (false, false, ex.Message);
            }
        }

        public async Task<List<string>> GetUserCharacterIdsAsync(string userId)
        {
            var user = await GetByUserIdAsync(userId);
            if (user == null || !user.Contains("characters"))
                return new List<string>();

            return user["characters"].AsBsonArray.Select(c => c.AsString).ToList();
        }

        public async Task<bool> UserOwnsCharacterAsync(string userId, string characterId)
        {
            var user = await GetByUserIdAsync(userId);
            if (user == null || !user.Contains("characters"))
                return false;

            return user["characters"].AsBsonArray.Any(c => c.AsString == characterId);
        }
    }
}