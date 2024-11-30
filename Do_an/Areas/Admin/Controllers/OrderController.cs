using Do_an.Areas.Admin.Dtos;
using Do_an.Data; 
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Google;
using Do_an.Models;


namespace Do_an.Areas.Admin.Controllers
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

        // GET: api/Order/GetOrderCustomers
        [HttpGet("GetOrderCustomers")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrderCustomers()
        {
            try
            {
                var orders = await _context.Orders
                    
                    .Select(o => new OrderDto
                    {
                        OrderId = o.OrderId,
                        OrderDate = o.OrderDate,
                        TotalAmount = o.TotalAmount,
                        Status = o.Status,
                        UserId = o.UserId, // Lấy UserId từ bảng Customer (giả sử Order có liên kết với Customer)
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

                if (!orders.Any())
                {
                    return Ok(new List<OrderDto>()); // Trả về danh sách rỗng nếu không tìm thấy đơn hàng nào
                }

                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving order customer data.");
                return StatusCode(500, "An error occurred while retrieving order customer data."); // Trả về lỗi server
            }
        }


        [HttpDelete("Delete/{id}")]
        public async Task<ActionResult> DeleteOrder(int id)
        {
            try
            {
                // Tìm đơn hàng theo ID
                var order = await _context.Orders
                    .Include(o => o.OrderDetails) // Bao gồm cả các chi tiết đơn hàng
                    .FirstOrDefaultAsync(o => o.OrderId == id); // Đảm bảo tên thuộc tính đúng (OrderId)

                if (order == null)
                {
                    return NotFound("Đơn hàng không tồn tại."); // Trả về lỗi nếu không tìm thấy đơn hàng
                }

                // Xóa các chi tiết đơn hàng liên quan trước
                _context.OrderDetails.RemoveRange(order.OrderDetails);

                // Xóa đơn hàng
                _context.Orders.Remove(order);

                // Lưu thay đổi vào cơ sở dữ liệu
                await _context.SaveChangesAsync();

                return NoContent(); // Trả về status 204 khi xóa thành công
            }
            catch (Exception ex)
            {
                // Log lỗi và trả về lỗi server
                _logger.LogError(ex, "Lỗi khi xóa đơn hàng.");
                return StatusCode(500, "Đã xảy ra lỗi trong quá trình xóa đơn hàng.");
            }
        }

        [HttpGet("GetOrderCustomers/{id}")]
        public async Task<ActionResult<OrderDto>> GetOrderCustomersById(int id)
        {
            try
            {
                // Lấy đơn hàng cùng thông tin chi tiết và khách hàng
                var order = await _context.Orders
                    .Include(o => o.OrderDetails) // Bao gồm thông tin chi tiết đơn hàng
                    .Where(o => o.OrderId == id)
                    .Select(o => new OrderDto
                    {
                        OrderId = o.OrderId,
                        OrderDate = o.OrderDate,
                        TotalAmount = o.TotalAmount,
                        Status = o.Status,
                        UserId = o.UserId,
                        ShippingAddress = o.ShippingAddress,  
                        PaymentMethod = o.PaymentMethod,
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
                    .FirstOrDefaultAsync();

                if (order == null)
                {
                    return NotFound($"Không tìm thấy đơn hàng với ID = {id}.");
                }

                // Log để kiểm tra thông tin chi tiết đơn hàng
                _logger.LogInformation($"Order Details for Order ID {id}: {string.Join(", ", order.OrderDetails.Select(od => od.ProductName))}");

                return Ok(order); // Trả về thông tin đơn hàng
            }
            catch (Exception ex)
            {
                // Log lỗi và trả về lỗi server
                _logger.LogError(ex, $"Error occurred while retrieving order data for ID = {id}.");
                return StatusCode(500, "An error occurred while retrieving order data.");
            }
        }

    [HttpPut("EditOrder/{id}")]
        public async Task<IActionResult> EditOrder(int id, [FromBody] UpdateOrderDto updateOrderDto)
        {
            try
            {
                // Tìm đơn hàng theo ID
                var order = await _context.Orders
                    .Include(o => o.OrderDetails)
                    .FirstOrDefaultAsync(o => o.OrderId == id);

                if (order == null)
                {
                    return NotFound($"Không tìm thấy đơn hàng với ID = {id}");
                }

                // Cập nhật các thông tin khác của đơn hàng
                if (updateOrderDto.OrderDate.HasValue)
                {
                    order.OrderDate = updateOrderDto.OrderDate.Value;
                }

                if (!string.IsNullOrEmpty(updateOrderDto.Status))
                {
                    order.Status = updateOrderDto.Status;
                }

                if (updateOrderDto.TotalAmount.HasValue)
                {
                    order.TotalAmount = updateOrderDto.TotalAmount.Value;
                }

                // Cập nhật OrderDetails nếu có
                if (updateOrderDto.OrderDetails != null && updateOrderDto.OrderDetails.Any())
                {
                    foreach (var detailDto in updateOrderDto.OrderDetails)
                    {
                        // Tìm OrderDetail hiện tại trong đơn hàng
                        var existingDetail = order.OrderDetails.FirstOrDefault(od => od.OrderDetailId == detailDto.OrderDetailId);

                        if (existingDetail != null)
                        {
                            // Chỉ cập nhật những giá trị khác ngoài giá trị null hoặc 0
                            existingDetail.ProductId = detailDto.ProductId > 0 ? detailDto.ProductId : existingDetail.ProductId;
                            existingDetail.ProductName = !string.IsNullOrEmpty(detailDto.ProductName) ? detailDto.ProductName : existingDetail.ProductName;
                            existingDetail.Quantity = detailDto.Quantity.HasValue ? detailDto.Quantity : existingDetail.Quantity;
                            existingDetail.Price = detailDto.Price.HasValue ? detailDto.Price : existingDetail.Price;
                            existingDetail.Total = (existingDetail.Quantity ?? 0) * (existingDetail.Price ?? 0);
                        }
                        else
                        {
                            // Nếu không tìm thấy OrderDetail, bạn có thể tạo mới nếu cần
                            var newOrderDetail = new OrderDetail
                            {
                                ProductId = detailDto.ProductId,
                                ProductName = detailDto.ProductName,
                                Quantity = detailDto.Quantity ?? 0,
                                Price = detailDto.Price ?? 0,
                                Total = (detailDto.Quantity ?? 0) * (detailDto.Price ?? 0)
                            };

                            order.OrderDetails.Add(newOrderDetail);
                        }
                    }
                }

                // Lưu thay đổi vào cơ sở dữ liệu
                await _context.SaveChangesAsync();

                return Ok(order); // Trả về thông tin đơn hàng đã cập nhật
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi chỉnh sửa thông tin đơn hàng với ID: {id}");
                return StatusCode(500, "Đã xảy ra lỗi khi chỉnh sửa thông tin đơn hàng.");
            }
        }

        [HttpPut("UpdateStatus/{orderId}")]
        public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromBody] UpdateStatusRequest request)
        {
            // Kiểm tra đầu vào
            if (request == null || string.IsNullOrWhiteSpace(request.Status))
            {
                return BadRequest("Dữ liệu cập nhật không hợp lệ.");
            }

            // Tìm đơn hàng dựa trên orderId
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                return NotFound($"Không tìm thấy đơn hàng với ID: {orderId}.");
            }

            // Cập nhật trạng thái đơn hàng
            order.Status = request.Status;
            await _context.SaveChangesAsync();

            return Ok($"Trạng thái của đơn hàng ID: {orderId} đã được cập nhật thành '{request.Status}'.");
        }
    }
}

