using Do_an.Data;

namespace Do_an.Models
{
    public class ProductViewModel
    {
        public List<Product> Products { get; set; }
        public int Page { get; set; }
        public int TotalPages { get; set; }
    }

}
