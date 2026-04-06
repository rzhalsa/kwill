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

             // CharacterSheets: unique characterId only (globally unique)
            var csIndex = new CreateIndexModel<BsonDocument>(
                 Builders<BsonDocument>.IndexKeys
                    .Ascending("characterid"),
                new CreateIndexOptions { Unique = true, Name = "uniq_character_id" }
            );
            await db.CharacterSheets.Indexes.CreateOneAsync(csIndex);

            // Users: unique user_id
            var userIndex = new CreateIndexModel<BsonDocument>(
                 Builders<BsonDocument>.IndexKeys
                    .Ascending("userid"),
                 new CreateIndexOptions { Unique = true, Name = "uniq_user_id" }
            );
            await db.Users.Indexes.CreateOneAsync(userIndex);
        }
    }
}