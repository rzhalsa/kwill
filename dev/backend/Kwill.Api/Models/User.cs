namespace Kwill.Api.Models
{
    public class User
    {
        public string UserId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<string> Characters { get; set; } = new List<string>();
    }
}