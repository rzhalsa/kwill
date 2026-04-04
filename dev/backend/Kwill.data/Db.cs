using Microsoft.Extensions.Configuration;
using MongoDB.Bson;
using MongoDB.Driver;

namespace KwillDB 
{
    /**
     * Creates a singleton for the DB. Only one instance of this class can exist at a time which is created by ASP.NET.
     * Instance is global and exists until the backend is killed.
     */
    public sealed class KwillDB 
    {
        //private const string ConnectionUri = "mongodb://localhost:27017"; // hard coded local db
       // private const string DatabaseName = "Kwill";

        private readonly IMongoDatabase db;

        //Creates a local database given the db name
        //.
        public KwillDB(IConfiguration configuration)
        {
            //var client = new MongoClient(ConnectionUri);
            // db = client.GetDatabase(DatabaseName);
            var connectionString = configuration["MongoDbSettings:ConnectionString"];
            var databaseName = configuration["MongoDbSettings:DatabaseName"];

            var client = new MongoClient(connectionString);
            db = client.GetDatabase(databaseName);
        }

        public IMongoCollection<BsonDocument> SrdData =>
            db.GetCollection<BsonDocument>("srdData");

        public IMongoCollection<BsonDocument> CharacterSheets =>
            db.GetCollection<BsonDocument>("characterSheets");

        public IMongoCollection<BsonDocument> Users =>
            db.GetCollection<BsonDocument>("users");    
    }
}

