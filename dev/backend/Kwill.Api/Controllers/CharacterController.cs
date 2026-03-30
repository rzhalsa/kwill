using Kwill.Api.Helpers;
using Kwill.Validation;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Driver;
using System.Text.Json;
using Kwill.Api.Services;

[ApiController]
[Route("api/character")]
public class CharacterController : ControllerBase
{
    private readonly CharacterService _characterService;

    public CharacterController(CharacterService characterService) => _characterService = characterService;
    

    // POST /api/character - Create new character
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] JsonElement body)
    {
        try
        {
            Console.WriteLine("=== POST REQUEST RECEIVED ===");

            // Save to database
            var doc = BsonDocument.Parse(body.GetRawText());

            var result = await _characterService.CreateAsync(doc);

            if (!result.Success)
            {
                if (result.Errors != null)
                {
                    return BadRequest(new
                    {
                        message = "Validation failed",
                        errors = result.Errors
                    });
                }

                return StatusCode(500, new { error = result.ErrorMessage });
            }

            return Content(
                result.Doc!.ToJson(new JsonWriterSettings
                {
                    OutputMode = JsonOutputMode.RelaxedExtendedJson
                }),
                "application/json"
            );
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }   
    }

    // GET /api/character/{characterId} - Get character by ID
    [HttpGet("{characterId}")]
    public async Task<IActionResult> Get(string characterId)
    {
        try
        {
            var character = await _characterService.GetByCharacterIdAsync(characterId);

            if (character == null)
            {
                return NotFound(new { message = "Character not found" });
            }
            
            return Content(
                character.ToJson(new JsonWriterSettings
                {
                    OutputMode = JsonOutputMode.RelaxedExtendedJson
                }),
                "application/json"
            );
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // GET /api/character/user/{userId} - Get all characters for a user
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserCharacters(string userId)
    {
        try
        {

            var characters = await _characterService.GetByUserIdAsync(userId);

            var settings = new JsonWriterSettings { OutputMode = JsonOutputMode.RelaxedExtendedJson };
            var json = "[" + string.Join(",", characters.Select(c => c.ToJson(settings))) + "]";
            
            return Content(json, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // PUT /api/character/{characterId} - Update character
    [HttpPut("{characterId}")]
    public async Task<IActionResult> Update(string characterId, [FromBody] JsonElement body)
    {
        try
        {
            var doc = BsonDocument.Parse(body.GetRawText());

            if (!doc.Contains("user_id"))
                return BadRequest(new { message = "user_id is required" });

            var userId = doc["user_id"].AsString;

            var result = await _characterService.UpdateAsync(userId, characterId, doc);

            if (result.NotFound)
                return NotFound(new { message = "Character not found" });

            if (result.Forbidden)
                return StatusCode(403, new { message = "User does not own this character" });

            if (!result.Success)
            {
                if (result.Errors != null)
                {
                    return BadRequest(new
                    {
                        message = "Validation failed",
                        errors = result.Errors
                    });
                }

                return StatusCode(500, new { error = result.ErrorMessage });
            }

            return Content(
                result.Doc!.ToJson(new JsonWriterSettings
                {
                    OutputMode = JsonOutputMode.RelaxedExtendedJson
                }),
                "application/json"
            );
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // DELETE /api/character/{characterId} - Delete character
    [HttpDelete("{characterId}")]
    public async Task<IActionResult> Delete(string characterId, [FromQuery] string userId)
    {
        try
        {
            var result = await _characterService.DeleteAsync(userId, characterId);

            if (result.NotFound)
                return NotFound(new { message = "Character not found" });

            if (result.Forbidden)
                return StatusCode(403, new { message = "User does not own this character" });

            if (!result.Success)
                return StatusCode(500, new { error = result.ErrorMessage });

            return Ok(new { deleted = true, character_id = characterId });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}