using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Do_an.Data;
using Do_an.Areas.Admin.Dtos;
using Microsoft.Extensions.Logging;

namespace Do_an.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly DoAnContext _context;
        private readonly ILogger<OrderController> _logger;

        public OrderController(DoAnContext context, ILogger<OrderController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // API GET: api/order/GetOrdersByUserId
        [HttpGet("GetOrdersByUserId")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrdersByUserId(int userId)
        {
            try
            {
                // Truy vấn đơn hàng theo UserId
                var orders = await _context.Orders
                    .Where(o => o.UserId == userId)  // Lọc theo UserId
                    .Select(o => new OrderDto
                    {
                        OrderId = o.OrderId,
                        OrderDate = o.OrderDate,
                        TotalAmount = o.TotalAmount,
                        Status = o.Status,
                        UserId = o.UserId,
                        ShippingAddress = o.ShippingAddress,
                        PaymentMethod = o.PaymentMethod,
                        Img = o.Img,
                        CancelReason = o.CancelReason,
                        OrderDetails = o.OrderDetails.Select(od => new OrderDetailDto
                        {
                            OrderDetailId = od.OrderDetailId,
                            ProductId = od.ProductId,
                            ProductName = od.ProductName,
                            Quantity = od.Quantity,
                            Price = od.Price,
                            Total = od.Total
                        }).ToList()
                    })
                    .ToListAsync();

                if (orders == null || !orders.Any())
                {
                    return Ok(new List<OrderDto>()); // Trả về danh sách rỗng nếu không tìm thấy đơn hàng
                }

                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving orders for UserId " + userId);
                return StatusCode(500, "An error occurred while retrieving order data."); // Trả về lỗi server
            }
        }
    }
}
