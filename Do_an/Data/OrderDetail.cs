using System;
using System.Collections.Generic;

namespace Do_an.Data;

public partial class OrderDetail
{
    public int OrderDetailId { get; set; }

    public int? OrderId { get; set; }

    public int? ProductId { get; set; }

    public int Quantity { get; set; }

    public decimal Price { get; set; }

    public decimal? Total { get; set; }

    public virtual Order? Order { get; set; }

    public virtual Product? Product { get; set; }
}
