namespace Do_an.Areas.Admin.Dtos
{
    public class UpdateOrderDto
    {
        public DateTime? OrderDate { get; set; }
        public string Status { get; set; }
        public decimal? TotalAmount { get; set; }
        public List<UpdateOrderDetailDto> OrderDetails { get; set; }
    }
}
