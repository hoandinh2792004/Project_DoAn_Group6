using Do_an.Data;
using Do_an.Models;
using Do_an.Models.Service;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using Do_an.Services;
using Auth.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;

namespace Do_an.Controllers
{
    
    public class UserController : Controller
    {
        private readonly ILogger<UserController> _logger;
        private readonly DoAnContext _context;
        private readonly CustomerService _customerService;

        public UserController(ILogger<UserController> logger, DoAnContext context, CustomerService customerService)
        {
            _logger = logger;
            _context = context;
            _customerService = customerService;
        }

        public IActionResult UserDashboard(int page = 1, int pageSize = 4)
        {
            try
            {
                // Kiểm tra xem người dùng có đăng nhập hay không thông qua cookie
                var userIdCookie = HttpContext.Request.Cookies["authToken"];
                if (string.IsNullOrEmpty(userIdCookie))
                {
                    ViewBag.ErrorMessage = "Bạn cần đăng nhập để truy cập trang này.";
                    return RedirectToAction("Login", "Login");
                }

                // Chuyển đổi UserId từ cookie (giả sử giá trị lưu trong cookie là số nguyên)
                if (!int.TryParse(userIdCookie, out int userId))
                {
                    _logger.LogWarning("Invalid UserId from cookie.");
                    ViewBag.ErrorMessage = "Không thể lấy thông tin người dùng.";
                    return View();
                }

                // Lấy thông tin khách hàng từ dịch vụ customer
                var customer = _customerService.GetCustomerByUserId(userId);
                if (customer == null)
                {
                    _logger.LogWarning($"Customer not found for UserId: {userId}");
                    ViewBag.ErrorMessage = "Khách hàng không tồn tại.";
                    return View();
                }

                // Lấy danh sách sản phẩm, loại bỏ các sản phẩm trùng lặp
                var products = _context.Products.ToList();
                var uniqueProducts = products.GroupBy(p => p.ProductId).Select(g => g.First()).ToList();
                var totalPages = (int)Math.Ceiling((double)uniqueProducts.Count / pageSize);
                var pagedProducts = uniqueProducts.Skip((page - 1) * pageSize).Take(pageSize).ToList();

                // Tạo mô hình cho dashboard
                var model = new Do_an.Models.DashboardViewModel
                {
                    Products = pagedProducts,
                    Page = page,
                    TotalPages = totalPages,
                    Customer = customer
                };

                return View(model);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing UserDashboard.");
                ViewBag.ErrorMessage = "Đã xảy ra lỗi khi tải trang. Vui lòng thử lại sau.";
                return View();
            }
        }


        public IActionResult Payment()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        // Action để hiển thị thông tin người dùng trên trang Profile
        public IActionResult Profile()
        {
            try
            {
                // Lấy JWT từ cookie
                var authToken = HttpContext.Request.Cookies["authtoken"];
                if (string.IsNullOrEmpty(authToken))
                {
                    ViewBag.ErrorMessage = "Bạn cần đăng nhập để truy cập trang này.";
                    return RedirectToAction("Login", "User");
                }

                // Giải mã JWT và lấy thông tin UserId
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(authToken) as JwtSecurityToken;
                if (jsonToken == null)
                {
                    _logger.LogWarning("Invalid JWT token.");
                    ViewBag.ErrorMessage = "Token không hợp lệ.";
                    return View();
                }

                // Trích xuất UserId từ claims trong token
                var userIdClaim = jsonToken?.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/userid");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    _logger.LogWarning("UserId claim not found or invalid in token.");
                    ViewBag.ErrorMessage = "Không thể lấy thông tin người dùng.";
                    return View();
                }

                // Lấy thông tin khách hàng từ dịch vụ customer
                var customer = _customerService.GetCustomerByUserId(userId);
                if (customer == null)
                {
                    ViewBag.ErrorMessage = "Khách hàng không tồn tại.";
                    return View();
                }

                // Lưu thông tin vào ViewBag để hiển thị trên giao diện
                ViewBag.Username = customer.Username;
                ViewBag.Email = customer.Email;
                ViewBag.PhoneNumber = customer.PhoneNumber;
                ViewBag.Address = customer.Address;
                ViewBag.FullName = customer.FullName;

                // Lưu UserId vào ViewBag để sử dụng trong JavaScript
                ViewBag.UserId = userId;

                return View();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing Profile.");
                ViewBag.ErrorMessage = "Đã xảy ra lỗi khi tải trang. Vui lòng thử lại sau.";
                return View();
            }
        }

        public IActionResult Shop(int page = 1, int pageSize = 12)
        {
            try
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing Shop.");
                ViewBag.ErrorMessage = "Đã xảy ra lỗi khi tải trang. Vui lòng thử lại sau.";
                return View();
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
