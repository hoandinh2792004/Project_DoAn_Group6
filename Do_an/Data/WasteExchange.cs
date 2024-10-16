using System;
using System.Collections.Generic;

namespace Do_an.Data;

public partial class WasteExchange
{
    public int ExchangeId { get; set; }

    public int? CustomerId { get; set; }

    public int? CollectionPointId { get; set; }

    public int? ProductId { get; set; }

    public decimal WasteAmount { get; set; }

    public DateTime? ExchangeDate { get; set; }

    public virtual WasteCollectionPoint? CollectionPoint { get; set; }

    public virtual Customer? Customer { get; set; }

    public virtual Product? Product { get; set; }
}
