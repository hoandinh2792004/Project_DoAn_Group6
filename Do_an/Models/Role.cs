public class Role
{
    public int RolesId { get; set; }
    public string RolesName { get; set; }

    // Thêm thuộc tính UserRoles
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
