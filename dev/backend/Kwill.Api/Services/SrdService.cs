using MongoDB.Bson;
using MongoDB.Driver;



namespace Kwill.Api.Services 
{
    public class SrdService
    {
        private readonly KwillDB.KwillDB _db;

        public SrdService(KwillDB.KwillDB db)
        {
            _db = db;
        }

        public async Task<List<BsonDocument>> GetAllAsync()
        {
            return await _db.SrdData
                .Find(FilterDefinition<BsonDocument>.Empty)
                .ToListAsync();
        }

        public async Task<BsonDocument?> GetByKeyAsync(string key)
        {
            var filter = Builders<BsonDocument>.Filter.Eq("Key", key);
            return await _db.SrdData
                .Find(filter)
                .FirstOrDefaultAsync();
        }
    }
}

