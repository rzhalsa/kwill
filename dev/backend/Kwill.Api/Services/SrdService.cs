using MongoDB.Bson;
using MongoDB.Driver;
using System.Text.RegularExpressions;

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
            return await _db.SrdData
                .Find(KeyFilter(key))
                .FirstOrDefaultAsync();
        }

        public async Task<List<object>> GetCollectionsAsync()
        {
            var filter = Builders<BsonDocument>.Filter.Or(
                Builders<BsonDocument>.Filter.Exists("Key"),
                Builders<BsonDocument>.Filter.Exists("key")
            );

            var docs = await _db.SrdData.Find(filter).ToListAsync();

            var collections = docs
                .Select(GetDocKey)
                .Where(k => !string.IsNullOrWhiteSpace(k))
                .GroupBy(k => k!)
                .Select(g =>
                {
                    if (g.Key == "spells")
                    {
                        var spellDoc = docs.FirstOrDefault(d => GetDocKey(d) == "spells");

                        var count = spellDoc != null &&
                                    spellDoc.Contains("spelllist") &&
                                    spellDoc["spelllist"].IsBsonArray
                            ? spellDoc["spelllist"].AsBsonArray.Count
                            : g.Count();

                        return new { name = g.Key, count = (long)count };
                    }

                    return new { name = g.Key, count = (long)g.Count() };
                })
                .Cast<object>()
                .ToList();

            return collections;
        }

        public async Task<List<BsonDocument>> GetSpellsAsync(string? className = null, int? level = null)
        {
            var spellDoc = await _db.SrdData
                .Find(KeyFilter("spells"))
                .FirstOrDefaultAsync();

            if (spellDoc == null ||
                !spellDoc.Contains("spelllist") ||
                !spellDoc["spelllist"].IsBsonArray)
            {
                return new List<BsonDocument>();
            }

            var spells = spellDoc["spelllist"]
                .AsBsonArray
                .Where(x => x.IsBsonDocument)
                .Select(x => NormalizeOutput(x.AsBsonDocument))
                .ToList();

            if (level.HasValue)
            {
                spells = spells
                    .Where(s => GetInt(s, "level") == level.Value)
                    .ToList();
            }

            if (!string.IsNullOrWhiteSpace(className))
            {
                var classDocs = await _db.SrdData
                    .Find(KeyFilter("classes"))
                    .ToListAsync();

                var classDoc = classDocs.FirstOrDefault(d =>
                    d.Contains("name") &&
                    Normalize(d["name"].ToString()) == Normalize(className)
                );

                if (classDoc == null ||
                    !classDoc.Contains("spells") ||
                    !classDoc["spells"].IsBsonArray)
                {
                    return new List<BsonDocument>();
                }

                var allowedSpellNames = classDoc["spells"]
                    .AsBsonArray
                    .Select(x => Normalize(x.ToString()))
                    .ToHashSet();

                spells = spells
                    .Where(s =>
                        s.Contains("name") &&
                        allowedSpellNames.Contains(Normalize(s["name"].ToString()))
                    )
                    .ToList();
            }

            return spells;
        }

        public async Task<List<BsonDocument>> GetEquipmentAsync(string? category = null)
        {
            var filterBuilder = Builders<BsonDocument>.Filter;
            var filter = KeyFilter("equipment");

            if (!string.IsNullOrWhiteSpace(category))
            {
                filter = filterBuilder.And(
                    filter,
                    filterBuilder.Or(
                        filterBuilder.Eq("Data.equipment_category", category),
                        filterBuilder.Eq("equipment_category", category)
                    )
                );
            }

            var documents = await _db.SrdData
                .Find(filter)
                .ToListAsync();

            return documents
                .Select(NormalizeOutput)
                .ToList();
        }

        public async Task<List<BsonDocument>> GetCollectionAsync(string collection)
        {
            collection = collection.ToLower();

            if (collection == "spells")
            {
                return await GetSpellsAsync();
            }

            var documents = await _db.SrdData
                .Find(KeyFilter(collection))
                .ToListAsync();

            return documents
                .Select(NormalizeOutput)
                .ToList();
        }

        public async Task<BsonDocument?> GetItemAsync(string collection, string id)
        {
            collection = collection.ToLower();
            id = id.ToLower();

            if (collection == "spells")
            {
                var spells = await GetSpellsAsync();

                return spells.FirstOrDefault(s => MatchId(s, id));
            }

            var documents = await _db.SrdData
                .Find(KeyFilter(collection))
                .ToListAsync();

            return documents
                .Select(NormalizeOutput)
                .FirstOrDefault(d => MatchId(d, id));
        }

        private static FilterDefinition<BsonDocument> KeyFilter(string key)
        {
            var filterBuilder = Builders<BsonDocument>.Filter;

            return filterBuilder.Or(
                filterBuilder.Eq("Key", key),
                filterBuilder.Eq("key", key)
            );
        }

        private static string? GetDocKey(BsonDocument doc)
        {
            if (doc.Contains("Key"))
                return doc["Key"].ToString().ToLower();

            if (doc.Contains("key"))
                return doc["key"].ToString().ToLower();

            return null;
        }

        private static BsonDocument NormalizeOutput(BsonDocument doc)
        {
            BsonDocument output;

            // Old SRD structure:
            // { Key: "equipment", Data: { index: "...", name: "..." } }
            if (doc.Contains("Data") && doc["Data"].IsBsonDocument)
            {
                output = doc["Data"].AsBsonDocument.DeepClone().AsBsonDocument;
            }
            else
            {
                // New SRD structure:
                // { Key: "classes", name: "wizard", features: [], spells: [] }
                output = doc.DeepClone().AsBsonDocument;

                output.Remove("_id");
                output.Remove("Key");
                output.Remove("key");
            }

            if (!output.Contains("index") && output.Contains("name"))
            {
                output.InsertAt(0, new BsonElement("index", Normalize(output["name"].ToString())));
            }

            return output;
        }

        private static bool MatchId(BsonDocument doc, string id)
        {
            if (doc.Contains("index") &&
                Normalize(doc["index"].ToString()) == Normalize(id))
            {
                return true;
            }

            if (doc.Contains("name") &&
                Normalize(doc["name"].ToString()) == Normalize(id))
            {
                return true;
            }

            return false;
        }

        private static int? GetInt(BsonDocument doc, string field)
        {
            if (!doc.Contains(field))
                return null;

            var value = doc[field];

            if (value.IsInt32)
                return value.AsInt32;

            if (value.IsInt64)
                return (int)value.AsInt64;

            if (value.IsDouble)
                return (int)value.AsDouble;

            if (value.IsString && int.TryParse(value.AsString, out var parsed))
                return parsed;

            return null;
        }

        private static string Normalize(string value)
        {
            value = value.Trim().ToLower();

            value = value
                .Replace("'", "")
                .Replace("’", "")
                .Replace("/", "-");

            value = Regex.Replace(value, @"[^a-z0-9]+", "-");
            value = Regex.Replace(value, @"-+", "-");

            return value.Trim('-');
        }
    }
}