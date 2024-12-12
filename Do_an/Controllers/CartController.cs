using Do_an.Data;
using Do_an.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Do_an.Models;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Authorization;

namespace Do_an.Controllers
{

    [ApiController]
    [Route("api/cart")]
    public class CartController : ControllerBase
    {
        private readonly DoAnContext _context;

        public CartController(DoAnContext context)
        {
            _context = context;
        }
        [HttpPost("upload")]
        public async Task<IActionResult> UploadCart([FromBody] CartRequestDto request)
        {
            try
            {
                // Log: Start of the method
                Console.WriteLine("Start uploading cart...");

                // Kiểm tra dữ liệu nhận được
                if (request == null || request.CartItems == null || !request.CartItems.Any())
                {
                    Console.WriteLine("Không có sản phẩm trong giỏ hàng.");
                    return BadRequest("Không có sản phẩm trong giỏ hàng.");
                }

                Console.WriteLine($"Received {request.CartItems.Count} items in the cart.");

                // Lấy UserId từ request
                int userId = request.UserId;

                Console.WriteLine($"UserId đã nhận từ request: {userId}");

                // Tạo đơn hàng mới và gán UserId
                var order = new Order
                {
                    OrderDate = DateTime.UtcNow,
                    TotalAmount = request.CartItems.Sum(item => item.Price * item.Quantity),
                    Status = "Chờ xác nhận",
                    UserId = request.UserId,
                    PaymentMethod = request.PaymentMethod,
                    ShippingAddress = request.ShippingAddress,
                    Img = request.CartItems[0].Img
                };

                Console.WriteLine($"Tạo đơn hàng với tổng số tiền: {order.TotalAmount}");

                // Thêm sản phẩm vào đơn hàng
                foreach (var item in request.CartItems)
                {
                    var orderDetail = new OrderDetail
                    {
                        ProductName = item.Name,
                        Quantity = item.Quantity,
                        Price = item.Price
                    };
                    order.OrderDetails.Add(orderDetail);

                    Console.WriteLine($"Thêm sản phẩm: {item.Name}, Số lượng: {item.Quantity}, Giá: {item.Price}");
                }

                // Lưu đơn hàng vào cơ sở dữ liệu
                Console.WriteLine("Lưu đơn hàng vào cơ sở dữ liệu...");
                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                Console.WriteLine("Đơn hàng đã được lưu thành công.");

                return Ok(true); // Trả về true khi thành công
            }
            catch (Exception ex)
            {
                Console.WriteLine("Lỗi khi tải giỏ hàng lên: " + ex.Message);
                Console.WriteLine("StackTrace: " + ex.StackTrace);
                return StatusCode(500, "Lỗi server: " + ex.Message); // Trả về lỗi server
            }
        }
    }

}