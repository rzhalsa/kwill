using MongoDB.Bson;
using MongoDB.Driver;

namespace Kwill.Api
{
    public static class MongoIndexes
    {
        public static async Task EnsureAsync(KwillDB.KwillDB db)
        {
            // SRD: unique key
            var srdIndex = new CreateIndexModel<BsonDocument>(
                Builders<BsonDocument>.IndexKeys.Ascending("key"),
                new CreateIndexOptions { Unique = true, Name = "uniq_srd_key" }
            );
            await db.SrdData.Indexes.CreateOneAsync(srdIndex);

            // CharacterSheets: unique userId + characterId
            var csIndex = new CreateIndexModel<BsonDocument>(
                Builders<BsonDocument>.IndexKeys
                    .Ascending("userId")
                    .Ascending("characterId"),
                new CreateIndexOptions { Unique = true, Name = "uniq_user_character" }
            );
            await db.CharacterSheets.Indexes.CreateOneAsync(csIndex);
        }
    }
}
