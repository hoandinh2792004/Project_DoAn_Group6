namespace Do_an.Models
{
    public class UpdateStatusRequest
    {
        public int OrderId { get; set; }
        public string Status { get; set; }

        public string? CancelReason { get; set; }
    }
}
