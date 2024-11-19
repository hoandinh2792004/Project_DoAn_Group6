namespace Do_an.DTOs
{
    public class CreatePaymentDto
    {
        public long PaymentAmount { get; set; } // Payment amount in the smallest currency unit (cents for USD, VND for VND)
        public int AuctionID { get; set; } // ID of the auction item
        public int UserID { get; set; } // ID of the user making the payment
    }
}
