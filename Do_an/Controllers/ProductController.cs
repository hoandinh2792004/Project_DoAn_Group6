using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Do_an.Data;
using Do_an.DTOs;
using System.Linq;
using System.Threading.Tasks;

namespace Do_an.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly DoAnContext _context;

        public ProductController(DoAnContext context)
        {
            _context = context;
        }

        // GET: api/Product
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
        {
            var products = await _context.Products
                .Include(p => p.Category) // Include the Category for CategoryName
                .Select(p => new ProductDto
                {
                    ProductId = p.ProductId,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    Quantity = p.Quantity,
                    ImageUrl = p.ImageUrl,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                    CategoryName = p.Category != null ? p.Category.CategoryName : null // CategoryName handling
                })
                .ToListAsync();

            if (products == null)
            {
                return NotFound();
            }

            return Ok(products);
        }
    }
}
