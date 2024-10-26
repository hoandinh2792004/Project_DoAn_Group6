using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Do_an.Data;
using Do_an.Areas.Admin.Dtos;
using Microsoft.AspNetCore.Hosting;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.Extensions.Hosting.Internal;
using Microsoft.Extensions.Hosting;

namespace Do_an.Areas.Admin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly DoAnContext _context;
        private readonly ILogger<ProductController> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;

        public ProductController(DoAnContext context, ILogger<ProductController> logger, IWebHostEnvironment hostingEnvironment)
        {
            _context = context;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
        }

        // GET: api/Product
        [HttpGet("GetProducts")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
        {
            try
            {
                var products = await _context.Products
                    .Include(p => p.Category) // Bao gồm Category để lấy CategoryName
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
                        CategoryName = p.CategoryName
                    })
                    .ToListAsync();

                if (!products.Any()) // Kiểm tra danh sách sản phẩm có trống không
                {
                    return Ok(new List<ProductDto>()); // Trả về danh sách trống nếu không có sản phẩm
                }

                return Ok(products); // Trả về danh sách sản phẩm
            }
            catch (Exception ex)
            {
                // Ghi log lỗi chi tiết
                _logger.LogError(ex, "Đã xảy ra lỗi trong quá trình lấy dữ liệu sản phẩm.");
                return StatusCode(500, "Đã xảy ra lỗi trong quá trình lấy dữ liệu."); // Trả về lỗi server
            }
        }


        // POST: api/Product
        [HttpPost("AddProduct")]
        public async Task<ActionResult<ProductDto>> CreateProduct([FromForm] CreateProductDto createProductDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Xử lý tệp hình ảnh
            string imageUrl = null;
            if (createProductDto.ImageFile != null && createProductDto.ImageFile.Length > 0)
            {
                var fileName = Path.GetFileName(createProductDto.ImageFile.FileName);
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", fileName);

                // Lưu tệp hình ảnh vào thư mục
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await createProductDto.ImageFile.CopyToAsync(stream);
                }

                imageUrl = $"/images/{fileName}"; // Đường dẫn tới hình ảnh
            }

            var product = new Product
            {
                Name = createProductDto.Name,
                Description = createProductDto.Description,
                Price = createProductDto.Price,
                Quantity = createProductDto.Quantity,
                ImageUrl = imageUrl, // Lưu URL hình ảnh vào cơ sở dữ liệu
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                CategoryName = createProductDto.CategoryName
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
                    CategoryName = product.CategoryName
                };

                return CreatedAtAction(nameof(GetProducts), new { id = product.ProductId }, productDto);
            }
            catch (Exception ex)
            {
                // Ghi log lỗi để xem chi tiết
                _logger.LogError(ex, "Đã xảy ra lỗi khi tạo sản phẩm."); // Ghi log

                return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo sản phẩm. Vui lòng thử lại." });
            }
        }

        [HttpPut("UpdateProduct/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromForm] UpdateProductDto updateProductDto)
        {
            // Kiểm tra tính hợp lệ của model
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); // Trả về lỗi nếu model không hợp lệ
            }

            // Tìm sản phẩm theo ID
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(); // Trả về lỗi 404 nếu không tìm thấy sản phẩm
            }

            // Cập nhật thông tin sản phẩm từ DTO
            product.Name = updateProductDto.Name;
            product.Description = updateProductDto.Description;
            product.Price = updateProductDto.Price;
            product.Quantity = updateProductDto.Quantity;

            // Xử lý file hình nếu có
            if (updateProductDto.ImageFile != null)
            {
                // Lưu đường dẫn hình ảnh cũ để xóa sau này (nếu cần)
                var imageFilePath = Path.Combine(_hostingEnvironment.WebRootPath, "images", product.ImageUrl);

                // Xóa file hình ảnh cũ nếu tồn tại
                if (System.IO.File.Exists(imageFilePath))
                {
                    System.IO.File.Delete(imageFilePath); // Xóa file hình ảnh cũ
                }

                // Lưu hình ảnh mới
                var newImageName = Guid.NewGuid() + Path.GetExtension(updateProductDto.ImageFile.FileName);
                var newImagePath = Path.Combine(_hostingEnvironment.WebRootPath, "images", newImageName);

                using (var stream = new FileStream(newImagePath, FileMode.Create))
                {
                    await updateProductDto.ImageFile.CopyToAsync(stream); // Lưu file hình ảnh mới
                }

                // Cập nhật URL hình ảnh mới vào sản phẩm
                product.ImageUrl = newImageName;
            }
            // Nếu không có file mới, giữ nguyên ImageUrl cũ

            // Lưu thay đổi vào cơ sở dữ liệu
            await _context.SaveChangesAsync();
            return NoContent(); // Trả về 204 No Content nếu cập nhật thành công
        }



        // DELETE: api/Product/DeleteProduct/{id}
        [HttpDelete("DeleteProduct/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Sản phẩm không tồn tại." });
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent(); // Trả về 204 No Content khi xóa thành công
        }
        // GET: api/Product/GetProduct/{id}
        [HttpGet("GetProduct/{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            try
            {
                var product = await _context.Products
                    .Include(p => p.Category)
                    .Where(p => p.ProductId == id)
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
                        CategoryName = p.Category != null ? p.Category.CategoryName : null
                    })
                    .FirstOrDefaultAsync();

                if (product == null)
                {
                    return NotFound(); // Trả về 404 nếu không tìm thấy sản phẩm
                }

                return Ok(product); // Trả về sản phẩm nếu tìm thấy
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Đã xảy ra lỗi trong quá trình lấy sản phẩm với ID: {id}", id);
                return StatusCode(500, "Đã xảy ra lỗi trong quá trình lấy dữ liệu."); // Trả về lỗi server
            }
        }
    }
}
