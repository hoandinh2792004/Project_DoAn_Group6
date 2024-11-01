using System;
using System.Collections.Generic;

namespace Do_an.Data;

public partial class WasteCollectionPoint
{
    public int CollectionPointId { get; set; }

    public string LocationName { get; set; } = null!;

    public string Address { get; set; } = null!;

    public DateTime? CollectionDate { get; set; }

    public int? Capacity { get; set; }

    public string? ManagerName { get; set; }

    public string? PhoneNumber { get; set; }

    public int? CreatedBy { get; set; }

    public virtual Admin? CreatedByNavigation { get; set; }

    public virtual ICollection<WasteExchange> WasteExchanges { get; set; } = new List<WasteExchange>();
}
