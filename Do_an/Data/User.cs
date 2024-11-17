using System.Text.Json.Serialization;
using Do_an.Data;

public class User
{
    public int UserId { get; set; } // Hoặc thuộc tính ID của bạn
    public string Username { get; set; }
    public string Password { get; set; }
    public string Email { get; set; }
    public string? FullName { get; set; }

    // Thêm thuộc tính UserRoles
    [JsonIgnore]
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

    [JsonIgnore]
    public virtual ICollection<Customer> Customers { get; set; } = new List<Customer>();
}
