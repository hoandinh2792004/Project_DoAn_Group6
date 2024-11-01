using System.Linq;
using Microsoft.EntityFrameworkCore;
using Do_an.Data;
using Do_an.Models;

public class CustomerService
{
    private readonly DoAnContext _context;

    public CustomerService(DoAnContext context)
    {
        _context = context;
    }

    public Customer GetCustomerByUserId(int userId)
    {
        return _context.Customers
                       .Include(c => c.Carts)
                       .Include(c => c.Orders)
                       .Include(c => c.Reviews)
                       .Include(c => c.WasteExchanges)
                       .FirstOrDefault(c => c.UserId == userId);
    }
}
