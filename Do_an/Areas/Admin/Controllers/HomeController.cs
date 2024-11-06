using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;

namespace Do_an.Areas.Admin.Controllers
{
    [Area("Admin")]
    
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            try
            {
                // Kiểm tra xem người dùng đã đăng nhập chưa thông qua token trong cookie
                var token = HttpContext.Request.Cookies["authToken"];
                if (string.IsNullOrEmpty(token))
                {
                    ViewBag.ErrorMessage = "Bạn cần đăng nhập để truy cập trang này.";
                    return RedirectToAction("Login", "Login");
                }

                // Xác thực JWT token
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(token) as JwtSecurityToken;

                if (jsonToken == null)
                {
                    ViewBag.ErrorMessage = "Token không hợp lệ.";
                    return RedirectToAction("Login", "Login");
                }

                // Lấy thông tin UserId từ token (nếu có)
                var userIdClaim = jsonToken?.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/userid");
                if (userIdClaim == null)
                {
                    ViewBag.ErrorMessage = "Không tìm thấy thông tin người dùng trong token.";
                    return RedirectToAction("Login", "Login");
                }

                var userId = userIdClaim.Value;
                ViewBag.UserId = userId; // Lưu UserId vào ViewBag

                return View();
            }
            catch (Exception ex)
            {
                ViewBag.ErrorMessage = "Đã xảy ra lỗi trong khi xử lý yêu cầu.";
                // Log lỗi nếu cần thiết
                return View();
            }
        }

        // Action cho trang Products
        public IActionResult ProductsManager()
        {
            return View();
        }
    }
}
