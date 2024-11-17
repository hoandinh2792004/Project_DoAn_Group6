namespace Do_an.Areas.Admin.Dtos
{
    public class CustomerDto
    {
        public int UserId { get; set; } 
        public string FullName { get; set; } = null!; 
        public string Email { get; set; } = null!; 
        public string? PhoneNumber { get; set; } 
        public string? Address { get; set; } 
        public DateTime? CreatedAt { get; set; } 
        public DateTime? UpdatedAt { get; set; } 
    }
}
