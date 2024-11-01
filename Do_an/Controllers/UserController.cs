using Do_an.Data;
using Do_an.Models;
using Do_an.Models.Service;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using Do_an.Services;
using Auth.Controllers;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Do_an.Controllers
{

    public class UserController : Controller

    {
        private readonly ILogger<UserController> _logger;
        private readonly DoAnContext _context;
        private readonly CustomerService _customerService;


        public UserController(ILogger<UserController> logger,DoAnContext context, CustomerService customerService)
        {
            _logger = logger;
            _context = context;
            _customerService = customerService;

        }

        public IActionResult UserDashboard(int page = 1, int pageSize = 4)
        {
            // Lấy token JWT từ header Authorization
            var token = HttpContext.Request.Cookies["authToken"];

            // Kiểm tra token có tồn tại không
            if (string.IsNullOrEmpty(token))
            {
                ViewBag.ErrorMessage = "Vui lòng đăng nhập để tiếp tục.";
                 return RedirectToAction("/User/Login");
            }

            // Xác thực và giải mã token
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);

            // Ghi lại token và claims vào log để kiểm tra
            _logger.LogInformation("Token: {Token}", token);
            _logger.LogInformation("Claims:");
            foreach (var claim in jwtToken.Claims)
            {
                _logger.LogInformation(" - {Type}: {Value}", claim.Type, claim.Value);
            }

            // Trích xuất claim UserId từ token
            var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/userid");
            if (userIdClaim == null)
            {
                ViewBag.ErrorMessage = "Claim người dùng không tồn tại.";
                return View(); // Trả về View mặc định
            }

            // Phân tích UserId từ claim
            if (!int.TryParse(userIdClaim.Value, out int userId))
            {
                ViewBag.ErrorMessage = "Không thể phân tích UserId.";
                return View(); // Trả về View mặc định
            }

            // Lấy thông tin khách hàng bằng UserId
            var customer = _customerService.GetCustomerByUserId(userId);
            if (customer == null)
            {
                ViewBag.ErrorMessage = "Khách hàng không tồn tại.";
                return View(); // Trả về View mặc định
            }

            var products = _context.Products.ToList();
            var uniqueProducts = products.GroupBy(p => p.ProductId).Select(g => g.First()).ToList();
            var totalPages = (int)Math.Ceiling((double)uniqueProducts.Count / pageSize);
            var pagedProducts = uniqueProducts.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            var model = new Do_an.Models.DashboardViewModel
            {
                Products = pagedProducts,
                Page = page,
                TotalPages = totalPages,
                Customer = customer
            };

            return View(model);
        }

        public IActionResult Payment() 
        {
            return View(); 
        }

        public IActionResult Privacy()
        {
            return View();
        }
        public IActionResult Profile()
        {
            // Lấy token từ cookie
            var token = HttpContext.Request.Cookies["authToken"]; // Lấy token từ cookie có tên là authToken

            if (string.IsNullOrEmpty(token))
            {
                // Không có token, trả về trang đăng nhập hoặc thông báo lỗi
                ViewBag.ErrorMessage = "Bạn cần đăng nhập để truy cập trang này.";
                return View(); // Hoặc trả về View thông báo lỗi
            }

            var handler = new JwtSecurityTokenHandler();
            try
            {
                var jwtToken = handler.ReadJwtToken(token);

                // Lấy thông tin tên và email từ claims
                var username = jwtToken.Claims.First(claim => claim.Type == JwtRegisteredClaimNames.Sub).Value;
                var email = jwtToken.Claims.First(claim => claim.Type == ClaimTypes.Email).Value;

                // Truyền thông tin vào ViewBag để hiển thị trong View
                ViewBag.Username = username;
                ViewBag.Email = email;

                return View(); // Trả về View với thông tin người dùng
            }
            catch (Exception ex)
            {
                // Ghi lại lỗi để kiểm tra
                _logger.LogError(ex, "Lỗi khi xác thực token trong Profile.");
                ViewBag.ErrorMessage = "Có lỗi xảy ra khi xác thực. Vui lòng thử lại.";
                return View(); // Trả về View thông báo lỗi
            }
        }


        public IActionResult Shop(int page = 1, int pageSize = 12)
        {
            var products = _context.Products.ToList();
            var uniqueProducts = products.GroupBy(p => p.ProductId)
                                          .Select(g => g.First())
                                          .ToList();

            var totalProducts = uniqueProducts.Count();
            var totalPages = (int)Math.Ceiling((double)totalProducts / pageSize);

            var pagedProducts = uniqueProducts.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            var model = new ProductViewModel
            {
                Products = pagedProducts,
                Page = page,
                TotalPages = totalPages
            };

            ViewBag.PageSize = pageSize; 
            return View(model);
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }

}
