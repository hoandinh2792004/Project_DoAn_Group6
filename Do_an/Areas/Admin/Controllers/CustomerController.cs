using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Do_an.Data;
using Do_an.Areas.Admin.Dtos;
using Do_an.DTOs;


[Route("api/[controller]")]
[ApiController]
public class CustomerController : ControllerBase
{
    private readonly DoAnContext _context; // Your DbContext instance
    private readonly ILogger<CustomerController> _logger;

    public CustomerController(DoAnContext context, ILogger<CustomerController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/Customer/GetCustomers
    [HttpGet("GetCustomers")]
    public async Task<ActionResult<IEnumerable<CustomerDto>>> GetCustomers()
    {
        try
        {
            var customers = await _context.Customers
                .Select(c => new CustomerDto
                {
                    UserId = c.UserId,
                    FullName = c.FullName,
                    Email = c.Email,
                    PhoneNumber = c.PhoneNumber,
                    Address = c.Address,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .ToListAsync();

            if (!customers.Any())
            {
                return Ok(new List<CustomerDto>()); // Return an empty list if no customers are found
            }

            return Ok(customers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving customer data.");
            return StatusCode(500, "An error occurred while retrieving customer data."); // Return server error
        }
    }
    [HttpDelete("Delete/{id}")]
    public async Task<ActionResult> DeleteCustomer(int id)
    {
        try
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                return NotFound("Người dùng không tồn tại."); // Nếu khách hàng không tồn tại
            }

            _context.Customers.Remove(customer); // Xóa khách hàng
            await _context.SaveChangesAsync(); // Lưu thay đổi vào cơ sở dữ liệu

            return NoContent(); // Trả về status 204 khi xóa thành công
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa người dùng.");
            return StatusCode(500, "Đã xảy ra lỗi trong quá trình xóa người dùng."); // Trả về lỗi server
        }
    }
    
    // GET: api/Customer/GetCustomer/{id}
    [HttpGet("GetCustomer/{id}")]
    public async Task<ActionResult<CustomerDto>> GetCustomer(int id)
    {
        try
        {
            // Tìm khách hàng theo ID
            var customer = await _context.Customers
                .Where(c => c.UserId == id)
                .Select(c => new CustomerDto
                {
                    UserId = c.UserId,
                    FullName = c.FullName,
                    Email = c.Email,
                    PhoneNumber = c.PhoneNumber,
                    Address = c.Address
                })
                .FirstOrDefaultAsync();

            if (customer == null)
            {
                return NotFound(); // Trả về 404 nếu không tìm thấy khách hàng
            }

            return Ok(customer); // Trả về thông tin khách hàng nếu tìm thấy
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy thông tin khách hàng với ID: {id}", id);
            return StatusCode(500, "Đã xảy ra lỗi khi lấy dữ liệu."); // Trả về lỗi server
        }
    }

    // PUT: api/Customer/EditCustomer/{id}
    [HttpPut("EditCustomer/{id}")]
    public async Task<IActionResult> EditCustomer(int id, [FromBody] UpdateCustomerDto updateCustomerDto)
    {
        try
        {
            // Tìm người dùng theo ID
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                return NotFound(); // Trả về lỗi 404 nếu không tìm thấy khách hàng
            }

            // Cập nhật thông tin người dùng từ DTO nếu có
            if (!string.IsNullOrEmpty(updateCustomerDto.FullName))
            {
                customer.FullName = updateCustomerDto.FullName;
            }

            if (!string.IsNullOrEmpty(updateCustomerDto.Email))
            {
                customer.Email = updateCustomerDto.Email;
            }

            if (!string.IsNullOrEmpty(updateCustomerDto.PhoneNumber))
            {
                customer.PhoneNumber = updateCustomerDto.PhoneNumber;
            }

            if (!string.IsNullOrEmpty(updateCustomerDto.Address))
            {
                customer.Address = updateCustomerDto.Address;
            }

            // Lưu thay đổi vào cơ sở dữ liệu
            await _context.SaveChangesAsync();

            return NoContent(); // Trả về 204 No Content nếu chỉnh sửa thành công
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi chỉnh sửa thông tin người dùng với ID: {id}", id);
            return StatusCode(500, "Đã xảy ra lỗi khi chỉnh sửa thông tin người dùng."); // Trả về lỗi server
        }
    }
}
