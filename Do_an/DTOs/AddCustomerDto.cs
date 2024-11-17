using System.ComponentModel.DataAnnotations;

namespace Do_an.DTOs
{
    public class AddCustomerDto
    {
        public string FullName { get; set; }
        public string Email { get; set; }

        public string PhoneNumber { get; set; }

        public string Address { get; set; }
    }
}
