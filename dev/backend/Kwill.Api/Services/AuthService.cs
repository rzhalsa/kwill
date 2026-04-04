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

        public AuthService(AppDbContext db, IConfiguration configuration, KwillDB.KwillDB mongoDb)
        {
            _db = db;
            _configuration = configuration;
            _mongoDb = mongoDb;
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
                .Find(Builders<BsonDocument>.Filter.Eq("user_id", user.UserId))
                .FirstOrDefaultAsync();
            try
            {
                if (existingMongoUser == null)
                {

                var mongoUser = new BsonDocument
                {
                    { "object_id", "user" },
                    { "user_id", user.UserId }
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

        public async Task<User?> GetUserByIdAsync(int userId)
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
    }
}
