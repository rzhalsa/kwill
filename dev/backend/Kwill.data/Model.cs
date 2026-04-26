using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace KwillDB
{
    public class SrdData
    {
        [BsonId]
        public ObjectId Id { get; set; }

        [BsonElement("key")]
        public string Key { get; set; } = "";

        [BsonElement("data")]
        public BsonDocument Data { get; set; } = new BsonDocument();
    }

    public class CharacterSheet
    {
        [BsonId]
        public ObjectId Id { get; set; }

        [BsonElement("userId")]
        public Guid UserId { get; set; }  // Changed from string to Guid

        [BsonElement("characterId")]
        public Guid CharacterId { get; set; }  // Changed from string to Guid

        [BsonElement("data")]
        public BsonDocument Data { get; set; } = new BsonDocument();
    }
}