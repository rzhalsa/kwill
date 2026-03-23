using MongoDB.Bson;
using MongoDB.Driver;

namespace Kwill.Api.Helpers
{
    /// <summary>
    /// Helper class for validating user-character relationships
    /// Task 2: "implement a feature to validate that each character matches the correct user"
    /// </summary>
    public static class ValidationHelper
    {
        /// <summary>
        /// Validate that a character belongs to a specific user
        /// </summary>
        /// <param name="userId">User ID to check</param>
        /// <param name="characterId">Character ID to verify ownership</param>
        /// <param name="db">Database instance</param>
        /// <returns>True if user owns the character, false otherwise</returns>
        public static async Task<bool> ValidateCharacterOwnership(
            string userId, 
            string characterId, 
            KwillDB.KwillDB db)
        {
            try
            {
                // Get user from database
                var userFilter = Builders<BsonDocument>.Filter.Eq("user_id", userId);
                var user = await db.Users.Find(userFilter).FirstOrDefaultAsync();
                
                if (user == null)
                {
                    Console.WriteLine($"Validation failed: User '{userId}' not found");
                    return false;
                }
                
                // Check if user has characters array
                if (!user.Contains("characters"))
                {
                    Console.WriteLine($"Validation failed: User '{userId}' has no characters array");
                    return false;
                }
                
                // Check if character is in user's list
                var characters = user["characters"].AsBsonArray;
                bool owns = characters.Any(c => c.AsString == characterId);
                
                if (!owns)
                {
                    Console.WriteLine($"Validation failed: User '{userId}' does not own character '{characterId}'");
                }
                else
                {
                    Console.WriteLine($"Validation passed: User '{userId}' owns character '{characterId}'");
                }
                
                return owns;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Validation error: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Get all character IDs owned by a user
        /// </summary>
        public static async Task<List<string>> GetUserCharacterIds(
            string userId,
            KwillDB.KwillDB db)
        {
            try
            {
                var userFilter = Builders<BsonDocument>.Filter.Eq("user_id", userId);
                var user = await db.Users.Find(userFilter).FirstOrDefaultAsync();
                
                if (user == null || !user.Contains("characters"))
                {
                    return new List<string>();
                }
                
                return user["characters"].AsBsonArray
                    .Select(c => c.AsString)
                    .ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting user characters: {ex.Message}");
                return new List<string>();
            }
        }
    }
}