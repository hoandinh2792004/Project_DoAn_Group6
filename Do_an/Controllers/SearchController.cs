using Microsoft.AspNetCore.Mvc;
using Do_an.Data; // Đảm bảo đúng namespace chứa DbContext
using System.Linq;

namespace Do_an.Controllers
{
    public class ProductController : Controller
    {
        private readonly DoAnContext _context; // Thay bằng tên DbContext của bạn

        public ProductController(DoAnContext context)
        {
            _context = context;
        }

        // Phương thức Index hiển thị trang tìm kiếm sản phẩm
        public IActionResult Index()
        {
            var products = _context.Products.ToList();
            return View(products);
        }

        // Phương thức Search để xử lý tìm kiếm
        [HttpPost]
        public IActionResult Search(string query)
        {
            var results = _context.Products
                .Where(p => p.Name.Contains(query))
                .ToList();
            return PartialView("_ProductListPartial", results);
        }
    }
}
