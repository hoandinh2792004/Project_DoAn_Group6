public class UserRole
{
    public int UserId { get; set; }
    public int RolesId { get; set; }

    public virtual User User { get; set; }
    public virtual Role Role { get; set; }
}
