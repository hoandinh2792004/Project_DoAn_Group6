using System;
using System.Collections.Generic;

namespace Do_an.Data;

public partial class Admin
{
    public int AdminId { get; set; }

    public string Username { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string Role { get; set; } = null!;

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();

    public virtual ICollection<WasteCollectionPoint> WasteCollectionPoints { get; set; } = new List<WasteCollectionPoint>();
}
