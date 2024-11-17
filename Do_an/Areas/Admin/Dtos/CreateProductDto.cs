namespace Do_an.Areas.Admin.Dtos
{
    public class CreateProductDto
    {
        public string Name { get; set; }

        public string? Description { get; set; }

        public decimal Price { get; set; }

        public int Quantity { get; set; }

        public IFormFile ImageFile { get; set; }

        public string CategoryName { get; set; }

    }

}
