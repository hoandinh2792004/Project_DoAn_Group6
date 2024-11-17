namespace Do_an.Areas.Admin.Dtos
{
    public class UpdateOrderDetailDto
    {
        public int OrderDetailId { get; set; }
        public int? ProductId { get; set; }
        public string ProductName { get; set; }
        public int? Quantity { get; set; }
        public decimal? Price { get; set; }
        public decimal? Total { get; set; }
    }
}
