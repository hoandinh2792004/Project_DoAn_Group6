using Do_an.Data;


namespace Do_an.Models
{
    public class DashboardViewModel
    {
        public List<Product> Products { get; set; }
        public int Page { get; set; }
        public int TotalPages { get; set; }
        public Customer Customer { get; set; } // Thông tin cá nhân khách hàng
    }

}
