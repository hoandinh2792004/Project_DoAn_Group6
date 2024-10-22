using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Do_an.Data;
using Do_an.DTOs;

namespace Auth.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly DoAnContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(DoAnContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(new { Errors = errors });
            }

            // Kiểm tra xem email đã được đăng ký chưa
            if (await _context.User.AnyAsync(u => u.Email == model.Email))
            {
                return BadRequest("Email đã được đăng ký.");
            }

            var user = new User
            {
                Username = model.Username,
                Email = model.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(model.Password)
            };

            _context.User.Add(user);
            await _context.SaveChangesAsync();

            // Tạo hoặc lấy role "User"
            var userRole = await _context.Roles.FirstOrDefaultAsync(r => r.RolesName == "User")
                            ?? new Role { RolesName = "User" };

            // Gắn user với role "User"
            var userRoleEntry = new UserRole
            {
                UserId = user.UserId,
                RolesId = userRole.RolesId
            };

            _context.UserRoles.Add(userRoleEntry);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đăng ký thành công", UserId = user.UserId });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            var user = await _context.User.SingleOrDefaultAsync(u => u.Email == model.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(model.Password, user.Password))
            {
                return Unauthorized("Email hoặc mật khẩu không hợp lệ.");
            }

            var token = GenerateJwtToken(user);
            return Ok(new { Token = token });
        }

        [HttpPost("admin/login")]
        public async Task<IActionResult> AdminLogin([FromBody] LoginDto model)
        {
            var user = await _context.User
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .SingleOrDefaultAsync(u => u.Email == model.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(model.Password, user.Password))
            {
                return Unauthorized("Email hoặc mật khẩu không hợp lệ.");
            }

            // Kiểm tra xem người dùng có vai trò Admin không
            if (!user.UserRoles.Any(ur => ur.Role.RolesName == "Admin"))
            {
                return Forbid("Bạn không có quyền truy cập vào tài nguyên này.");
            }

            var token = GenerateJwtToken(user);
            return Ok(new { Token = token });
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
    }
}
