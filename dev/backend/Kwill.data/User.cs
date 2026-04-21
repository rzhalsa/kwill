using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kwill.data
{
    /**
     * Setups up the model for the sql database.
     */
    public class User
    {
        public Guid UserId { get; set; }  // Changed from string to Guid
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
    }
}
