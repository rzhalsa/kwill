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
        private const string ConnectionUri = "mongodb://localhost:27017"; // hard coded local db
        private const string DatabaseName = "Kwill";

        private readonly IMongoDatabase db;

        //Creates a local database given the db name.
        public KwillDB()
        {
            var client = new MongoClient(ConnectionUri);
            db = client.GetDatabase(DatabaseName);
        }

        public IMongoCollection<SrdData> SrdData =>
            db.GetCollection<SrdData>("srdData");

        public IMongoCollection<CharacterSheet> CharacterSheets =>
            db.GetCollection<CharacterSheet>("characterSheets");
    }
}

