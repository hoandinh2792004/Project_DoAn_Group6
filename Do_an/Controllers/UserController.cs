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
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.PixelFormats;
using OpenCvSharp;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Hosting; // Đảm bảo bạn đã khai báo namespace này


namespace Do_an.Controllers
{
    public class UserController : Controller
    {
        private readonly ILogger<UserController> _logger;
        private readonly DoAnContext _context;
        private readonly CustomerService _customerService;
        private readonly IWebHostEnvironment _hostEnvironment;  // Khai báo IWebHostEnvironment

        // Thêm IWebHostEnvironment vào constructor
        public UserController(ILogger<UserController> logger, DoAnContext context, CustomerService customerService, IWebHostEnvironment hostEnvironment)
        {
            _logger = logger;
            _context = context;
            _customerService = customerService;
            _hostEnvironment = hostEnvironment;  // Khởi tạo _hostEnvironment
        }

        // Phương thức kiểm tra JWT trong cookie
        private IActionResult CheckAuthToken()
        {
            // Lấy JWT từ cookie
            var authToken = HttpContext.Request.Cookies["authtoken"];
            if (string.IsNullOrEmpty(authToken))
            {
                ViewBag.ErrorMessage = "Bạn cần đăng nhập để truy cập trang này.";
                return RedirectToAction("Login", "Login");
            }

            return null; // Trả về null nếu token hợp lệ
        }

        public IActionResult UserDashboard(int page = 1, int pageSize = 4)
        {
            var authResult = CheckAuthToken();
            if (authResult != null) return authResult; // Nếu token không hợp lệ, trả về RedirectToAction

            try
            {
                // Lấy thông tin người dùng từ cookie
                var userIdCookie = HttpContext.Request.Cookies["authToken"];
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


        

        public IActionResult Order()
        {
            var authResult = CheckAuthToken();
            if (authResult != null) return authResult;
            return View();
        }


        public IActionResult Payment()
        {
            var authResult = CheckAuthToken();
            if (authResult != null) return authResult;
            return View();
        }


        public IActionResult Privacy()
        {
            var authResult = CheckAuthToken();
            if (authResult != null) return authResult;
            return View();
        }

        public IActionResult Profile()
        {
            var authResult = CheckAuthToken();
            if (authResult != null) return authResult;

            try
            {
                // Giải mã JWT và lấy thông tin UserId
                var handler = new JwtSecurityTokenHandler();
                var authToken = HttpContext.Request.Cookies["authtoken"];
                var jsonToken = handler.ReadToken(authToken) as JwtSecurityToken;
                if (jsonToken == null)
                {
                    _logger.LogWarning("Invalid JWT token.");
                    ViewBag.ErrorMessage = "Token không hợp lệ.";
                    return View();
                }

                var userIdClaim = jsonToken?.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/userid");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    _logger.LogWarning("UserId claim not found or invalid in token.");
                    ViewBag.ErrorMessage = "Không thể lấy thông tin người dùng.";
                    return View();
                }

                var customer = _customerService.GetCustomerByUserId(userId);
                if (customer == null)
                {
                    ViewBag.ErrorMessage = "Khách hàng không tồn tại.";
                    return View();
                }

                ViewBag.Username = customer.Username;
                ViewBag.Email = customer.Email;
                ViewBag.PhoneNumber = customer.PhoneNumber;
                ViewBag.Address = customer.Address;
                ViewBag.FullName = customer.FullName;

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

        public IActionResult Shop(string query = "", int page = 1, int pageSize = 12)
        {
            var authResult = CheckAuthToken();
            if (authResult != null) return authResult;

            try
            {
                var products = _context.Products.ToList();
                var uniqueProducts = products.GroupBy(p => p.ProductId).Select(g => g.First()).ToList();

                // Search logic if query is provided
                if (!string.IsNullOrEmpty(query))
                {
                    uniqueProducts = uniqueProducts.Where(p => p.Name.Contains(query, StringComparison.OrdinalIgnoreCase)).ToList();
                }

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

        [HttpPost]
        public IActionResult Search(string query)
        {
            // Chuẩn hóa query để tìm kiếm không phân biệt hoa thường và khoảng trắng
            query = query?.Trim().ToLower() ?? "";

            // Tìm kiếm theo tên hoặc các thuộc tính khác
            var results = _context.Products
                .Where(p => p.Name.ToLower().Contains(query) ||
                            p.Description.ToLower().Contains(query))
                .ToList();

            if (results.Any())
            {
                return PartialView("_ProductListPartial", results); // Trả về danh sách sản phẩm
            }
            else
            {
                return Content("Không tìm thấy sản phẩm nào."); // Khi không tìm thấy
            }
        }

        [HttpPost]
        public IActionResult FetchAllProducts()
        {
            var products = _context.Products.ToList(); // Lấy danh sách tất cả sản phẩm từ database
            return PartialView("_ProductListPartial", products); // Render danh sách sản phẩm
        }

        [HttpPost]
        public IActionResult SearchImage(string query)
        {
            query = query?.Trim().ToLower() ?? "";

            var results = _context.Products
                .Where(p => p.Name.ToLower().Contains(query) ||
                            p.Description.ToLower().Contains(query))
                .ToList();

            if (results.Any())
            {
                return PartialView("_ProductListPartial", results);
            }
            else
            {
                return Content("Không tìm thấy sản phẩm nào.");
            }
        }





        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        public IActionResult ProductDetail()
        {
            var authResult = CheckAuthToken();
            if (authResult != null) return authResult;
            return View();
        }

        public IActionResult AboutUs()
        {
            var authResult = CheckAuthToken();
            if (authResult != null) return authResult;
            return View();
        }

        public IActionResult QuyenGop()
        {
            var authResult = CheckAuthToken();
            if (authResult != null) return authResult;
            return View();
        }
    }
}