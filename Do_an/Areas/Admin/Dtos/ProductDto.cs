namespace Do_an.Areas.Admin.Dtos
{
    public class ProductDto
    {
        public int ProductId { get; set; }

        public string Name { get; set; }

        public string? Description { get; set; }

        public decimal Price { get; set; }

        public int Quantity { get; set; }

        public string? ImageUrl { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public string? CategoryName { get; set; }
    }
}
