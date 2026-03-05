using MongoDB.Bson;
using MongoDB.Driver;

namespace Kwill.Api
{
    // The Kwill db will reject any entry with a duplicate key or duplicate userId + characterId pair
    public static class MongoIndexes
    {
        public static async Task EnsureAsync(KwillDB.KwillDB db)
        {
            // SRD: unique Key + Data.index combination
            var srdIndex = new CreateIndexModel<BsonDocument>(
                Builders<BsonDocument>.IndexKeys
                    .Ascending("Key")
                    .Ascending("Data.index"),
                new CreateIndexOptions { Unique = true, Name = "uniq_srd_key" }
            );
            await db.SrdData.Indexes.CreateOneAsync(srdIndex);

            // CharacterSheets: unique user_id + character_id
            var csIndex = new CreateIndexModel<BsonDocument>(
                Builders<BsonDocument>.IndexKeys
                    .Ascending("user_id")
                    .Ascending("character_id"),
                new CreateIndexOptions { Unique = true, Name = "uniq_user_character" }
            );
            await db.CharacterSheets.Indexes.CreateOneAsync(csIndex);
        }
    }
}