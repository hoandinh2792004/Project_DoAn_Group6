using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Do_an.Data;
using Do_an.Areas.Admin.Dtos; // Thêm để sử dụng model Product
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Do_an.Areas.Admin.Controllers
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
        [HttpGet("AddProduct")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
        {
            try
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

                if (products.Count == 0)
                {
                    return Ok(new List<ProductDto>()); // Trả về danh sách trống nếu không có sản phẩm
                }

                return Ok(products);
            }
            catch (Exception ex)
            {
                // Ghi log hoặc xử lý lỗi thêm ở đây
                return StatusCode(500, "Đã xảy ra lỗi trong quá trình lấy dữ liệu.");
            }
        }

        // POST: api/Product
        [HttpPost("AddProduct")]
        public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto createProductDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var product = new Product
            {
                Name = createProductDto.Name,
                Description = createProductDto.Description,
                Price = createProductDto.Price,
                Quantity = createProductDto.Quantity,
                ImageUrl = createProductDto.ImageUrl,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
            };

            try
            {
                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                var productDto = new ProductDto
                {
                    ProductId = product.ProductId,
                    Name = product.Name,
                    Description = product.Description,
                    Price = product.Price,
                    Quantity = product.Quantity,
                    ImageUrl = product.ImageUrl,
                    CreatedAt = product.CreatedAt,
                    UpdatedAt = product.UpdatedAt,
                };

                return CreatedAtAction(nameof(GetProducts), new { id = product.ProductId }, productDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Đã xảy ra lỗi khi tạo sản phẩm.");
            }
        }
    }
}