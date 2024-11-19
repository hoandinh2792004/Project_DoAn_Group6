using Do_an.Data;
using Do_an.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
        public async Task<bool> UploadCart(List<CartItemDto> cartItems)
        {
            try
            {
                // Kiểm tra dữ liệu nhận được
                if (cartItems == null || !cartItems.Any())
                {
                    Console.WriteLine("Không có sản phẩm trong giỏ hàng.");
                    return false; // Trả về false nếu không có sản phẩm
                }

                // Tạo đơn hàng mới
                var order = new Order
                {
                    OrderDate = DateTime.UtcNow,
                    TotalAmount = cartItems.Sum(item => item.Price * item.Quantity),
                    Status = "Completed",
                };

                // Thêm sản phẩm vào đơn hàng
                foreach (var item in cartItems)
                {
                    var orderDetail = new OrderDetail
                    {
                        ProductName = item.Name,
                        Quantity = item.Quantity,
                        Price = item.Price
                    };
                    order.OrderDetails.Add(orderDetail);
                }

                // Lưu đơn hàng vào cơ sở dữ liệu
                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                Console.WriteLine("Đơn hàng đã được lưu thành công.");

                return true; // Trả về true khi thành công
            }
            catch (Exception ex)
            {
                Console.WriteLine("Lỗi khi tải giỏ hàng lên: " + ex.Message);
                return false;
            }
        }

    }

}
