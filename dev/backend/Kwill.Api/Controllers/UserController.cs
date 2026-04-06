using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using Kwill.Api.Services;
using System.Text.Json;

namespace Kwill.Api.Controllers
{
    [ApiController]
    [Route("api/user")]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;

        public UserController(UserService userService) => _userService = userService;

        [HttpGet("{userId}")]
        public async Task<IActionResult> Get(string userId)
        {
            var user = await _userService.GetByUserIdAsync(userId);

            if (user == null)
                return NotFound(new { message = $"User '{userId}' not found" });

            return Content(
                user.ToJson(new JsonWriterSettings
                {
                    OutputMode = JsonOutputMode.RelaxedExtendedJson
                }),
                "application/json"
            );
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] JsonElement body)
        {
            try
            {
                var doc = JsonDocument.Parse(body.GetRawText());
                var root = doc.RootElement;

                if (!root.TryGetProperty("userId", out var userIdElement) || 
                    string.IsNullOrEmpty(userIdElement.GetString()))
                {
                    return BadRequest(new { message = "userId is required" });
                }

                string userId = userIdElement.GetString()!;
                string email = root.TryGetProperty("email", out var emailElement) 
                    ? emailElement.GetString() ?? "" 
                    : "";

                var result = await _userService.CreateAsync(userId, email);

                if (!result.Success)
                {
                    if (result.ErrorMessage?.Contains("already exists") == true)
                        return Conflict(new { message = result.ErrorMessage });

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

        [HttpGet("{userId}/characters")]
        public async Task<IActionResult> GetUserCharacters(string userId)
        {
            var characterIds = await _userService.GetUserCharacterIdsAsync(userId);

            return Ok(new
            {
                user_id = userId,
                characters = characterIds
            });
        }

        [HttpPost("{userId}/characters")]
        public async Task<IActionResult> AddCharacter(string userId, [FromBody] JsonElement body)
        {
            try
            {
                var doc = JsonDocument.Parse(body.GetRawText());
                var root = doc.RootElement;

                if (!root.TryGetProperty("characterId", out var charIdElement) || 
                    string.IsNullOrEmpty(charIdElement.GetString()))
                {
                    return BadRequest(new { message = "characterId is required" });
                }

                string characterId = charIdElement.GetString()!;
                var result = await _userService.AddCharacterAsync(userId, characterId);

                if (result.NotFound)
                    return NotFound(new { message = $"User '{userId}' not found" });

                if (!result.Success)
                    return StatusCode(500, new { error = result.ErrorMessage });

                return Ok(new { message = "Character added successfully", character_id = characterId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpDelete("{userId}/characters/{characterId}")]
        public async Task<IActionResult> RemoveCharacter(string userId, string characterId)
        {
            var result = await _userService.RemoveCharacterAsync(userId, characterId);

            if (result.NotFound)
                return NotFound(new { message = $"User '{userId}' not found" });

            if (!result.Success)
                return StatusCode(500, new { error = result.ErrorMessage });

            return Ok(new { message = "Character removed successfully", deleted = true });
        }

        [HttpGet("{userId}/owns/{characterId}")]
        public async Task<IActionResult> CheckOwnership(string userId, string characterId)
        {
            var owns = await _userService.UserOwnsCharacterAsync(userId, characterId);

            return Ok(new
            {
                user_id = userId,
                character_id = characterId,
                owns = owns
            });
        }
    }
}