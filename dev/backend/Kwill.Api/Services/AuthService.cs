using Kwill.Api.Models.Auth;
using Kwill.data;
using MongoDB.Bson;
using MongoDB.Driver;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Kwill.Api.Services
{
    public class AuthService
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _configuration;
        private readonly PasswordHasher<User> _passwordHasher;
        private readonly KwillDB.KwillDB _mongoDb;
        private readonly IHttpClientFactory _httpClientFactory;

        public AuthService(AppDbContext db, IConfiguration configuration, KwillDB.KwillDB mongoDb, IHttpClientFactory httpClientFactory)
        {
            _db = db;
            _configuration = configuration;
            _mongoDb = mongoDb;
            _httpClientFactory = httpClientFactory;
            _passwordHasher = new PasswordHasher<User>();
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            request.Email = request.Email.Trim().ToLowerInvariant();
            request.Username = request.Username.Trim();

            if (string.IsNullOrWhiteSpace(request.Username) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Username, email, and password are required."
                };
            }

            if (request.Password.Length < 8)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Password must be at least 8 characters long."
                };
            }

            // Validate captcha
             if (!await VerifyCaptchaAsync(request.CaptchaToken))
             {
                 return new AuthResponse
                 {
                     Success = false,
                     Message = "Captcha verification failed."
                 };
            }

            bool emailExists = await _db.Users.AnyAsync(u => u.Email == request.Email);
            if (emailExists)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "An account with that email already exists."
                };
            }

            bool usernameExists = await _db.Users.AnyAsync(u => u.Username == request.Username);
            if (usernameExists)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "That username is already taken."
                };
            }

            var user = new User
            {
                Username = request.Username,
                Email = request.Email
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
            
            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var existingMongoUser = await _mongoDb.Users
                 .Find(Builders<BsonDocument>.Filter.Eq("userid", new BsonBinaryData(user.UserId, GuidRepresentation.Standard)))
                 .FirstOrDefaultAsync();
            try
            {
                if (existingMongoUser == null)
                {

                var mongoUser = new BsonDocument
                {       
                     { "object_id", "user" },
                     { "userid", new BsonBinaryData(user.UserId, GuidRepresentation.Standard) },
                     { "characterIds", new BsonArray() }  //Empty array for character IDs
                };

                await _mongoDb.Users.InsertOneAsync(mongoUser);
                }
            }
            catch
            {
                _db.Users.Remove(user);
                await _db.SaveChangesAsync();
                throw;
            }
            var (token, expiresAtUtc) = GenerateJwtToken(user);

            return new AuthResponse
            {
                Success = true,
                Message = "Account created successfully.",
                Token = token,
                ExpiresAtUtc = expiresAtUtc,
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

            if (user == null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Invalid email or password."
                };
            }

            var verifyResult = _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password
            );

            if (verifyResult == PasswordVerificationResult.Failed)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Invalid email or password."
                };
            }

            var (token, expiresAtUtc) = GenerateJwtToken(user);

            return new AuthResponse
            {
                Success = true,
                Message = "Login successful.",
                Token = token,
                ExpiresAtUtc = expiresAtUtc,
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email
            };
        }

        public async Task<User?> GetUserByIdAsync(Guid userId)
        {
            return await _db.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        }

        private (string token, DateTime expiresAtUtc) GenerateJwtToken(User user)
        {
            var jwtSection = _configuration.GetSection("Jwt");
            var key = jwtSection["Key"]!;
            var issuer = jwtSection["Issuer"]!;
            var audience = jwtSection["Audience"]!;
            var expiresMinutes = int.Parse(jwtSection["ExpiresMinutes"]!);

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var expiresAtUtc = DateTime.UtcNow.AddMinutes(expiresMinutes);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expiresAtUtc,
                signingCredentials: credentials
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
            return (tokenString, expiresAtUtc);
        }

        private async Task<bool> VerifyCaptchaAsync(string token)
        {
            if (string.IsNullOrEmpty(token)) return false;

            var secret = _configuration["Turnstile:Secret"];
            if (string.IsNullOrEmpty(secret)) return false; // Or throw

            using var client = _httpClientFactory.CreateClient();
            var content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("secret", secret),
                new KeyValuePair<string, string>("response", token)
            });

            var response = await client.PostAsync("https://challenges.cloudflare.com/turnstile/v0/siteverify", content);
            if (!response.IsSuccessStatusCode) return false;

            var result = await response.Content.ReadFromJsonAsync<TurnstileResponse>();
            return result?.Success == true;
        }
        public async Task<AuthResponse> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
        {
            // Validate new password
            if (string.IsNullOrWhiteSpace(newPassword))
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "New password is required."
                };
            }

            if (newPassword.Length < 8)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "New password must be at least 8 characters long."
                };
            }

            // Get user from database
            var user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "User not found."
                };
            }

            // Verify current password
            var verifyResult = _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                currentPassword
            );

            if (verifyResult == PasswordVerificationResult.Failed)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Current password is incorrect."
                };
            }

            // Hash and update new password
            user.PasswordHash = _passwordHasher.HashPassword(user, newPassword);
            await _db.SaveChangesAsync();

            return new AuthResponse
            {
                Success = true,
                Message = "Password changed successfully."
            };
        }

        public async Task<AuthResponse> DeleteAccountAsync(Guid userId, string password)
        {
            // Get user from PostgreSQL
            var user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "User not found."
                };
            }

            // Verify password
            var verifyResult = _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                password
            );

            if (verifyResult == PasswordVerificationResult.Failed)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Password is incorrect."
                };
            }

            // Delete user's characters from MongoDB
            var userFilter = Builders<BsonDocument>.Filter.Eq("userid",
                new BsonBinaryData(userId, GuidRepresentation.Standard));
            var mongoUser = await _mongoDb.Users.Find(userFilter).FirstOrDefaultAsync();

            if (mongoUser != null && mongoUser.Contains("characterIds"))
            {
                var characterIds = mongoUser["characterIds"].AsBsonArray;

                // Delete each character
                foreach (var charId in characterIds)
                {
                    var charFilter = Builders<BsonDocument>.Filter.Eq("characterid", charId);
                    await _mongoDb.CharacterSheets.DeleteOneAsync(charFilter);
                }
            }

            // Delete user from MongoDB
            await _mongoDb.Users.DeleteOneAsync(userFilter);

            // Delete user from PostgreSQL
            _db.Users.Remove(user);
            await _db.SaveChangesAsync();

            return new AuthResponse
            {
                Success = true,
                Message = "Account deleted successfully."
            };
        }

        private class TurnstileResponse
        {
            public bool Success { get; set; }
            public string[] ErrorCodes { get; set; } = Array.Empty<string>();
        }
    }
}
