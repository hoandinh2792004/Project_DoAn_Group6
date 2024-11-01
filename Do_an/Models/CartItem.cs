public class CartItem
{
	public int Id { get; set; } // Kh?a ch?nh
	public string Name { get; set; }
	public decimal Price { get; set; }
	public int Quantity { get; set; }
	public string Img { get; set; }
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
