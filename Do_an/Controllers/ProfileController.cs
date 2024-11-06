using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Do_an.Data;
using Microsoft.AspNetCore.Authorization; 
using System;
using System.Linq;
using Do_an.DTOs;
using Newtonsoft.Json;

namespace Do_an.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    public class ProfileController : Controller
    {
        private readonly DoAnContext _context;

        public ProfileController(DoAnContext context)
        {
            _context = context;
        }

        [HttpPost("UpdateCustomer")]
        [Authorize]
        public async Task<IActionResult> UpdateCustomer([FromBody] UpdateCustomerDto customerDto)
        {
            try
            {
                // Log dữ liệu customerDto nhận được
                Console.WriteLine($"Updating customer data: FullName: {customerDto.FullName}, Email: {customerDto.Email}, PhoneNumber: {customerDto.PhoneNumber}, Address: {customerDto.Address}");

                if (customerDto == null)
                {
                    return BadRequest(new { success = false, message = "Dữ liệu cập nhật không hợp lệ" });
                }

                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/userid");
                if (userIdClaim == null || string.IsNullOrEmpty(userIdClaim.Value))
                {
                    return BadRequest(new { success = false, message = "Người dùng không hợp lệ." });
                }

                if (!int.TryParse(userIdClaim.Value, out int userId))
                {
                    return BadRequest(new { success = false, message = "ID người dùng không hợp lệ." });
                }

                var customer = _context.Customers.SingleOrDefault(c => c.UserId == userId);

                // Kiểm tra nếu không có customer
                if (customer == null)
                {
                    return Json(new { success = false, message = "Khách hàng không tồn tại." });
                }

                // Chỉ cập nhật những thông tin cần thiết
                customer.FullName = customerDto.FullName;
                customer.Email = customerDto.Email;
                customer.PhoneNumber = customerDto.PhoneNumber;
                customer.Address = customerDto.Address;
                customer.UpdatedAt = DateTime.Now;

                Console.WriteLine($"Đã cập nhật khách hàng: {customerDto.FullName}, {customerDto.Email}, {customerDto.PhoneNumber}, {customerDto.Address}");

                await _context.SaveChangesAsync(); // Sử dụng bất đồng bộ

                return Json(new { success = true, message = "Cập nhật thành công" });
            }
            catch (DbUpdateException dbEx)
            {
                // Xử lý lỗi khi cập nhật cơ sở dữ liệu
                return Json(new { success = false, message = "Lỗi cơ sở dữ liệu: " + dbEx.InnerException?.Message });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi: " + ex.Message });
            }
        }



        [HttpPost("Addcustomer")]
        [Authorize]
        public async Task<IActionResult> AddCustomer([FromBody] AddCustomerDto customerDto)
        {
            try
            {
                // Log the entire customerDto object to the console
                Console.WriteLine($"Received customer data: FullName: {customerDto.FullName}, Email: {customerDto.Email}, PhoneNumber: {customerDto.PhoneNumber}, Address: {customerDto.Address}");

                // Kiểm tra dữ liệu đầu vào
                if (customerDto == null)
                {
                    return BadRequest(new { success = false, message = "Dữ liệu khách hàng không hợp lệ" });
                }

                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/userid");
                if (userIdClaim == null || string.IsNullOrEmpty(userIdClaim.Value))
                {
                    return BadRequest(new { success = false, message = "Người dùng không hợp lệ." });
                }

                // Log the userIdClaim value
                Console.WriteLine($"UserIdClaim Value: {userIdClaim.Value}");

                int userId;
                if (!int.TryParse(userIdClaim.Value, out userId))
                {
                    return BadRequest(new { success = false, message = "ID người dùng không hợp lệ." });
                }

                // Tạo đối tượng Customer
                var customer = new Customer
                {
                    UserId = userId,
                    FullName = customerDto.FullName,
                    Email = customerDto.Email,
                    PhoneNumber = customerDto.PhoneNumber,
                    Address = customerDto.Address,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                Console.WriteLine($"Thêm khách hàng: {customerDto.FullName}, {customerDto.Email}, {customerDto.PhoneNumber}, {customerDto.Address}");

                // Thêm khách hàng vào cơ sở dữ liệu
                _context.Customers.Add(customer);
                await _context.SaveChangesAsync(); // Thay đổi để sử dụng phương thức bất đồng bộ

                return Json(new { success = true, message = "Thêm mới khách hàng thành công" });
            }
            catch (DbUpdateException dbEx)
            {
                // Xử lý lỗi khi cập nhật cơ sở dữ liệu
                return Json(new { success = false, message = "Lỗi cơ sở dữ liệu: " + dbEx.InnerException?.Message });
            }
        }



        [HttpGet("CheckCustomerInfo")]
        [Authorize]
        public IActionResult CheckCustomerInfo(int userId)
        {
            var customer = _context.Customers.SingleOrDefault(c => c.UserId == userId);
            if (customer != null)
            {
                return Json(new { hasCustomerInfo = true });
            }
            return Json(new { hasCustomerInfo = false });
        }


    }
}
