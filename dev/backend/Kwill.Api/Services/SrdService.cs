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
            return await _db.SrdData.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<List<object>> GetCollectionsAsync()
        {
            var keys = await _db.SrdData
                .Distinct<string>("Key", Builders<BsonDocument>.Filter.Empty)
                .ToListAsync();

            var collections = new List<object>();

            foreach (var key in keys)
            {
                var count = await _db.SrdData.CountDocumentsAsync(
                    Builders<BsonDocument>.Filter.Eq("Key", key)
                );

                collections.Add(new { name = key, count = count });
            }

            return collections;
        }

        public async Task<List<BsonDocument>> GetSpellsAsync(string? className = null, int? level = null)
        {
            var filterBuilder = Builders<BsonDocument>.Filter;
            var filter = filterBuilder.Eq("Key", "spells");

            if (!string.IsNullOrEmpty(className))
            {
                filter = filterBuilder.And(
                    filter,
                    filterBuilder.Eq("Data.classes", className)
                );
            }

            if (level.HasValue)
            {
                filter = filterBuilder.And(
                    filter,
                    filterBuilder.Eq("Data.level", level.Value)
                );
            }

            var documents = await _db.SrdData.Find(filter).ToListAsync();
            return documents.Select(doc => doc["Data"].AsBsonDocument).ToList();
        }

        public async Task<List<BsonDocument>> GetEquipmentAsync(string? category = null)
        {
            var filterBuilder = Builders<BsonDocument>.Filter;
            var filter = filterBuilder.Eq("Key", "equipment");

            if (!string.IsNullOrEmpty(category))
            {
                filter = filterBuilder.And(
                    filter,
                    filterBuilder.Eq("Data.equipment_category", category)
                );
            }

            var documents = await _db.SrdData.Find(filter).ToListAsync();
            return documents.Select(doc => doc["Data"].AsBsonDocument).ToList();
        }

        public async Task<List<BsonDocument>> GetCollectionAsync(string collection)
        {
            var filter = Builders<BsonDocument>.Filter.Eq("Key", collection);
            var documents = await _db.SrdData.Find(filter).ToListAsync();

            return documents.Select(doc => doc["Data"].AsBsonDocument).ToList();
        }

        public async Task<BsonDocument?> GetItemAsync(string collection, string id)
        {
            var filter = Builders<BsonDocument>.Filter.And(
                Builders<BsonDocument>.Filter.Eq("Key", collection),
                Builders<BsonDocument>.Filter.Eq("Data.index", id)
            );

            var document = await _db.SrdData.Find(filter).FirstOrDefaultAsync();
            return document?["Data"].AsBsonDocument;
        }
    }
}

