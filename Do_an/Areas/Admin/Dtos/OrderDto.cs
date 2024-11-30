namespace Do_an.Areas.Admin.Dtos
{
    public class OrderDto
    {
        public int OrderId { get; set; }

        public DateTime? OrderDate { get; set; }

        public decimal TotalAmount { get; set; }

        public string? Status { get; set; }

        public int UserId { get; set; }

        public string ShippingAddress { get; set; }

        public string PaymentMethod { get; set; }

        public string Img { get; set; }

        public CustomerDto Customer { get; set; } = new CustomerDto();
        public List<OrderDetailDto> OrderDetails { get; set; }
    }
}
