/*
using Kwill.Api;
using MongoDB.Bson;
using MongoDB.Driver;

// look in properties/launchSettings.json for ports.
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<KwillDB.KwillDB>(); // ASP.NET creates the instance of the singleton class.

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<KwillDB.KwillDB>();
    await MongoIndexes.EnsureAsync(db);
}

app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
*/

using Kwill.Api;
using MongoDB.Bson;
using MongoDB.Driver;

// look in properties/launchSettings.json for ports.
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS - Fixed version
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => 
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// MongoDB setup
builder.Services.AddSingleton<KwillDB.KwillDB>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Middleware order is important
app.UseHttpsRedirection();
app.UseRouting(); // Add this line
app.UseCors("AllowAll"); // This needs to come after UseRouting()
app.UseAuthorization();

// MongoDB setup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<KwillDB.KwillDB>();
    await MongoIndexes.EnsureAsync(db);
}

app.MapControllers();

app.Run();

