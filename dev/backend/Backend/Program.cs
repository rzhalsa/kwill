using MongoDB.Bson;
using MongoDB.Driver;

namespace KwillDB 
{
    public class KwillDB 
    {
        public static async Task Main(string[] args) 
        {
            var client = new MongoClient("mongodb://localhost:27017");
            var db = client.GetDatabase("Kwill");
            var collections = await db.ListCollectionNames().ToListAsync();
            if (!collections.Contains("srdData"))
            {
                await db.CreateCollectionAsync("srdData");
            }

            Console.WriteLine("Created DB");
        }
    }
}
