using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Do_an.Services;
using System.Threading.Tasks;
using Do_an.Data;
using Do_an.DTOs;
using System.Net.Mail;
using System.Text.RegularExpressions;

namespace Auth.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly DoAnContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEmailServices _emailService;
        private readonly IUserService _userService;


        public AuthController(DoAnContext context, IConfiguration configuration, IEmailServices emailService, IUserService userService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
            _userService = userService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(new { Errors = errors });
            }

            // Kiểm tra xem email đã được đăng ký hay chưa
            if (await _context.User.AnyAsync(u => u.Email == model.Email))
            {
                return BadRequest("Email đã được đăng ký.");
            }

            // Tạo một người dùng mới
            var user = new User
            {
                Username = model.Username,
                Email = model.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(model.Password)
            };

            _context.User.Add(user);
            await _context.SaveChangesAsync();

            // Tự động gán RoleId là 2 cho người dùng
            var userRoleEntry = new UserRole
            {
                UserId = user.UserId,
                RolesId = 2 // Gán RoleId là 2
            };

            _context.UserRoles.Add(userRoleEntry);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đăng ký thành công", UserId = user.UserId });
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            // Tìm user theo email
            var user = await _context.User
                .Include(u => u.UserRoles) // Nạp thông tin UserRoles
                    .ThenInclude(ur => ur.Role) // Nạp thông tin Role
                .SingleOrDefaultAsync(u => u.Email == model.Email);

            // Kiểm tra nếu user không tồn tại hoặc mật khẩu không hợp lệ
            if (user == null || !BCrypt.Net.BCrypt.Verify(model.Password, user.Password))
            {
                return Unauthorized("Email hoặc mật khẩu không hợp lệ.");
            }

            // Kiểm tra xem người dùng có vai trò Admin không
            bool isAdmin = user.UserRoles.Any(ur => ur.Role.RolesId == 1); // Kiểm tra với giá trị RolesId là kiểu số

            // Sinh token JWT
            var token = GenerateJwtToken(user);

            // Lưu thông tin vào Session
            HttpContext.Session.SetInt32("UserId", user.UserId);
            HttpContext.Session.SetString("Username", user.Username);
            HttpContext.Session.SetString("Role", isAdmin ? "Admin" : "User");

            // Trả về token cùng với vai trò
            Console.WriteLine($"User Role: {(isAdmin ? "1" : "2")}"); // Thay đổi để thể hiện ID vai trò
            return Ok(new
            {
                Token = token,
                Role = isAdmin ? "1" : "2", // Trả về ID vai trò
                ClearCart = true
            });
        }


        private string GenerateJwtToken(User user)
        {
            // Lấy các vai trò của người dùng
            var roles = _context.UserRoles
                                .Include(ur => ur.Role)
                                .Where(ur => ur.UserId == user.UserId)
                                .Select(ur => ur.Role.RolesName)
                                .ToList();

            // Tạo các claims cho JWT
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/userid", user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email)
            };

            // Thêm các vai trò vào claims
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            // Tạo key và credentials
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Tạo token
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(30),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpPost("SendOtp")]
        public async Task<IActionResult> SendOtp([FromBody] SendOtpRequestDto request)
        {
            // Kiểm tra tính hợp lệ của địa chỉ email
            if (request == null || string.IsNullOrEmpty(request.Email) || !IsValidEmail(request.Email))
            {
                return BadRequest(new { message = "Địa chỉ email không hợp lệ." });
            }

            // Kiểm tra xem tài khoản email có tồn tại trong cơ sở dữ liệu không
            var userExists = await _userService.CheckUserExistsByEmailAsync(request.Email);
            if (!userExists)
            {
                return BadRequest(new { message = "Địa chỉ email không tồn tại trong hệ thống." });
            }

            // Giới hạn số lần gửi OTP
            const int maxOtpAttempts = 5;
            var otpAttempts = HttpContext.Session.GetInt32("OtpAttempts") ?? 0;

            if (otpAttempts >= maxOtpAttempts)
            {
                return BadRequest(new { message = "Bạn đã vượt quá số lần gửi OTP." });
            }

            // Tạo OTP ngẫu nhiên bằng phương thức từ EmailService
            var otp = _emailService.GenerateOtp();
            HttpContext.Session.SetString("Otp", otp);  // Lưu OTP vào session
            HttpContext.Session.SetInt32("OtpAttempts", otpAttempts + 1); // Tăng số lần gửi OTP

            try
            {
                // Gửi OTP qua email
                await _emailService.SendOtpEmail(request.Email, otp);

                // Trả về thông điệp thành công
                return Ok(new
                {
                    message = "OTP đã được gửi thành công!",
                    redirectUrl = "/verifyOtp"  // URL trang VerifyOtp
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending OTP: {ex.Message}");
                return BadRequest(new { message = "Có lỗi xảy ra khi gửi OTP. Vui lòng thử lại sau.", error = ex.Message });
            }
        }

        // Hàm kiểm tra tính hợp lệ của địa chỉ email
        private bool IsValidEmail(string email)
        {
            var re = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
            return re.IsMatch(email);
        }


        [HttpPost("verifyOtp")]
        public IActionResult VerifyOtp([FromBody] Dictionary<string, string> requestData)
        {
            if (!requestData.ContainsKey("otp"))
            {
                return BadRequest(new { success = false, message = "OTP is required." });
            }

            var otp = requestData["otp"];
            var sessionOtp = HttpContext.Session.GetString("Otp");

            if (otp == sessionOtp)
            {
                HttpContext.Session.Remove("Otp"); // Xóa OTP sau khi xác thực thành công
                return Ok(new { success = true, message = "Xác thực thành công!" });
            }
            else
            {
                return BadRequest(new { success = false, message = "OTP không hợp lệ!" });
            }
        }

        [HttpPost("resetPassword")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetpasswordDto model)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(new { Errors = errors });
            }

            // Kiểm tra xem email có tồn tại trong cơ sở dữ liệu không
            var user = await _context.User.SingleOrDefaultAsync(u => u.Email == model.Email);
            if (user == null)
            {
                return NotFound("Email không tồn tại.");
            }

            // Cập nhật mật khẩu
            user.Password = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);

            // Cập nhật người dùng trong cơ sở dữ liệu
            _context.User.Update(user);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Mật khẩu đã được cập nhật thành công." });
        }

    }
}

  
