namespace Do_an.Areas.Admin.Dtos
{
    public class OrderDto
    {
        public int OrderId { get; set; }
        public DateTime? OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Status { get; set; }
        public List<OrderDetailDto> OrderDetails { get; set; }
    }
}
