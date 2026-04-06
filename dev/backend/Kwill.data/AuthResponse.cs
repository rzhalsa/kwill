using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kwill.Api.Models.Auth
{
    public class AuthResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Token { get; set; }
        public DateTime? ExpiresAtUtc { get; set; }

        public int? UserId { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
    }
}
