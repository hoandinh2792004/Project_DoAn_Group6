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


        [HttpPost]
        public IActionResult SearchByImage(IFormFile image)
        {
            if (image == null || image.Length == 0)
            {
                return BadRequest("Không có hình ảnh được tải lên.");
            }

            string tempFilePath = null;
            try
            {
                // Lưu ảnh tải lên vào thư mục images
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Tạo tên file ngẫu nhiên cho ảnh
                var fileName = Path.GetFileName(image.FileName);
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    image.CopyTo(stream);
                }

                // Gọi hàm tìm sản phẩm theo ảnh
                var matchingProducts = FindMatchingProducts(filePath);

                // Trả về PartialView với danh sách sản phẩm
                if (matchingProducts.Any())
                {
                    return PartialView("_ProductListPartial", matchingProducts);
                }
                else
                {
                    return PartialView("_ProductListPartial", new List<Product>());
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi: {ex.Message}");
                return StatusCode(500, "Đã xảy ra lỗi trong quá trình xử lý.");
            }
        }

        // Tìm danh sách sản phẩm phù hợp
        private List<Product> FindMatchingProducts(string uploadedImagePath)
        {
            var matchingProducts = new List<Product>();

            // Lấy danh sách sản phẩm từ database
            var productImages = _context.Products.Select(p => new
            {
                p.ProductId,
                p.Name,
                ImagePath = Path.Combine(_hostEnvironment.WebRootPath, "User", p.ImageUrl)
            }).ToList();

            foreach (var product in productImages)
            {
                // Kiểm tra file ảnh
                if (!System.IO.File.Exists(product.ImagePath))
                {
                    Console.WriteLine($"Không tìm thấy ảnh sản phẩm tại: {product.ImagePath}");
                    continue;
                }

                // So sánh ảnh
                if (CompareImagesUsingHistogram(uploadedImagePath, product.ImagePath))
                {
                    var matchingProduct = _context.Products.FirstOrDefault(p => p.ProductId == product.ProductId);
                    if (matchingProduct != null)
                    {
                        matchingProducts.Add(matchingProduct);
                    }
                }
            }

            return matchingProducts;
        }

        // So sánh hình ảnh bằng Histogram
        private bool CompareImagesUsingHistogram(string uploadedImagePath, string productImagePath)
        {
            try
            {
                // Đọc ảnh
                using var uploadedImage = new Mat(uploadedImagePath, ImreadModes.Color);
                using var productImage = new Mat(productImagePath, ImreadModes.Color);

                // Kiểm tra xem ảnh có rỗng không
                if (uploadedImage.Empty() || productImage.Empty())
                {
                    Console.WriteLine("Ảnh tải lên hoặc ảnh sản phẩm bị lỗi.");
                    return false;
                }

                // Resize ảnh về kích thước chuẩn
                Cv2.Resize(uploadedImage, uploadedImage, new Size(128, 128));
                Cv2.Resize(productImage, productImage, new Size(128, 128));

                // Tính histogram
                var histSize = new int[] { 256 };
                var ranges = new Rangef[] { new Rangef(0, 256) };
                Mat uploadedHist = new Mat();
                Mat productHist = new Mat();

                Cv2.CalcHist(new Mat[] { uploadedImage }, new int[] { 0 }, null, uploadedHist, 1, histSize, ranges);
                Cv2.CalcHist(new Mat[] { productImage }, new int[] { 0 }, null, productHist, 1, histSize, ranges);

                // Chuẩn hóa histogram
                Cv2.Normalize(uploadedHist, uploadedHist, 0, 1, NormTypes.MinMax);
                Cv2.Normalize(productHist, productHist, 0, 1, NormTypes.MinMax);

                // So sánh histogram
                double similarity = Cv2.CompareHist(uploadedHist, productHist, HistCompMethods.Correl);
                Console.WriteLine($"Độ tương tự: {similarity}");

                // Ngưỡng tương tự
                return similarity > 0.8;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi so sánh ảnh: {ex.Message}");
                return false;
            }
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
