using System;
using System.Collections.Generic;

namespace Do_an.Data;

public partial class Order
{
    public int OrderId { get; set; }

    public DateTime? OrderDate { get; set; }

    public decimal TotalAmount { get; set; }

    public string? Status { get; set; }

    public int UserId { get; set; }

    public string ShippingAddress { get; set; }

    public string PaymentMethod { get; set; }

    public string Img { get; set; }

    public string? CancelReason { get; set; }

    public virtual User User { get; set; }

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();


}