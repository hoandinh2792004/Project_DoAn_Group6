namespace Do_an.DTOs
{
    public class CartRequestDto
    {
        public int UserId { get; set; }  // userId from the frontend

        public string PaymentMethod { get; set; }

        public string ShippingAddress { get; set; }

        public List<CartItemDto> CartItems { get; set; }  // List of cart items
    }
}