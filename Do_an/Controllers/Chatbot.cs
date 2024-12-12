using Do_an.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class ChatBotController : ControllerBase
{
    private readonly DoAnContext _context;

    public ChatBotController(DoAnContext context)
    {
        _context = context;
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchProducts(string keyword, string dateRange = null)
    {
        if (string.IsNullOrEmpty(keyword))
        {
            return BadRequest(new { response = "Vui lòng nhập từ khóa tìm kiếm hợp lệ.", data = new List<object>() });
        }

        try
        {
            var normalizedKeyword = keyword.Trim().ToLower();

            // Xử lý từ đồng nghĩa
            var synonyms = new Dictionary<string, string[]>
            {
                { "giá rẻ", new[] { "giá rẻ", "giảm giá", "dưới 100k", "rẻ tiền", "rẻ nhất" } },
                { "giá đắt", new[] { "giá đắt", "giá cao", "đắt tiền", "mắc", "cao cấp", "sang trọng", "siêu đắt", "đắt đỏ", "đắt nhất","đắt" } },
                { "cây cảnh", new[] { "cây cảnh", "cây xanh", "chậu cây" } },
                { "để bàn", new[] { "để bàn", "bàn làm việc", "trang trí bàn" } },
                { "giàu sang", new[] { "giàu có", "phú quý", "sung túc", "thịnh vượng", "giàu có vật chất", "phong lưu", "tài lộc", "cơ đồ", "đầy đủ" } },
                { "sức khỏe", new[] { "thể trạng", "tình trạng sức khỏe", "sức lực", "dồi dào sức khỏe", "cơ thể khỏe mạnh", "tình hình thể chất" } }
            };

            // Kiểm tra từ khóa liên quan đến giá
            if (synonyms["giá rẻ"].Any(word => normalizedKeyword.Contains(word)))
            {
                var cheapProduct = await _context.Products
                    .Where(p => p.Price <= 90000)
                    .OrderBy(p => p.Price)  // Sắp xếp sản phẩm theo giá tăng dần
                    .Select(p => new
                    {
                        p.ProductId,
                        p.Name,
                        p.Description,
                        p.Price,
                        p.Quantity,
                        p.ImageUrl,
                        p.CategoryName
                    })
                    .FirstOrDefaultAsync();  // Lấy sản phẩm có giá rẻ nhất (sản phẩm đầu tiên)

                if (cheapProduct == null)
                {
                    return Ok(new { response = "Không có sản phẩm nào phù hợp với mức giá rẻ.", data = new List<object>() });
                }

                return Ok(new { response = "Thành công", data = new List<object> { cheapProduct } });
            }

            if (synonyms["giá đắt"].Any(word => normalizedKeyword.Contains(word)))
            {
                var expensiveProduct = await _context.Products
                    .Where(p => p.Price > 29000000)  // Giới hạn mức giá sản phẩm
                    .OrderByDescending(p => p.Price) // Sắp xếp giảm dần theo giá
                    .Select(p => new
                    {
                        p.ProductId,
                        p.Name,
                        p.Description,
                        p.Price,
                        p.Quantity,
                        p.ImageUrl,
                        p.CategoryName
                    })
                    .FirstOrDefaultAsync();  // Lấy sản phẩm đầu tiên (giá cao nhất)

                if (expensiveProduct == null)
                {
                    return Ok(new
                    {
                        response = "Không có sản phẩm nào phù hợp với mức giá cao.",
                        data = (object)null
                    });
                }

                return Ok(new
                {
                    response = "Thành công",
                    data = expensiveProduct
                });
            }

            // Danh sách từ không quan trọng (stop words)
            var stopWords = new HashSet<string> { "cây", "tôi", "tao", "tớ", "mày", "tao", "cần", "cho", "muốn", "giúp", "trong", "ngoài", "có" };

            // Chia nhỏ câu và loại bỏ từ không quan trọng
            var inputWords = normalizedKeyword.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                                              .Where(word => !stopWords.Contains(word))
                                              .ToList();
            // Nếu không còn từ khóa nào sau khi loại bỏ từ stop words, trả về lỗi
            if (!inputWords.Any())
            {
                return Ok(new { response = "Không có từ khóa hợp lệ để tìm kiếm.", data = new List<object>() });
            }

            // Lọc theo khoảng thời gian nếu có
            var query = _context.Products.AsQueryable();

            // Nếu có yêu cầu tìm sản phẩm theo thời gian (ví dụ: "mới nhất", "7 ngày trước", "tháng này", v.v.)
            if (!string.IsNullOrEmpty(dateRange))
            {
                DateTime? startDate = null;
                DateTime? endDate = DateTime.Now;

                // Kiểm tra các khoảng thời gian phổ biến
                if (dateRange.ToLower().Contains("mới nhất"))
                {
                    startDate = DateTime.Now.AddDays(-1); // Lọc sản phẩm trong 7 ngày qua
                }
                else if (dateRange.ToLower().Contains("tháng này"))
                {
                    startDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1); // Từ đầu tháng đến nay
                }
                else if (dateRange.ToLower().Contains("hôm nay"))
                {
                    startDate = DateTime.Today; // Sản phẩm trong ngày hôm nay
                }
                else if (dateRange.ToLower().Contains("trong khoảng"))
                {
                    // Giả sử rằng người dùng sẽ nhập khoảng thời gian như "2024-11-01 to 2024-11-10"
                    var dateParts = dateRange.Split("to", StringSplitOptions.RemoveEmptyEntries);
                    if (dateParts.Length == 2)
                    {
                        if (DateTime.TryParse(dateParts[0].Trim(), out DateTime parsedStartDate) &&
                            DateTime.TryParse(dateParts[1].Trim(), out DateTime parsedEndDate))
                        {
                            startDate = parsedStartDate;
                            endDate = parsedEndDate;
                        }
                    }
                }

                // Áp dụng điều kiện thời gian
                if (startDate.HasValue)
                {
                    query = query.Where(p => p.CreatedAt >= startDate.Value && p.CreatedAt <= (endDate ?? DateTime.Now));
                }
            }

            // Tìm kiếm sản phẩm theo từ khóa còn lại
            var products = await query
                .Where(p =>
                    inputWords.Any(word =>
                        (p.Name != null && EF.Functions.Like(p.Name.ToLower(), "%" + word + "%")) ||
                        (p.Description != null && EF.Functions.Like(p.Description.ToLower(), "%" + word + "%")) ||
                        (p.CategoryName != null && EF.Functions.Like(p.CategoryName.ToLower(), "%" + word + "%"))
                    )
                )
                .Select(p => new
                {
                    p.ProductId,
                    p.Name,
                    p.Description,
                    p.Price,
                    p.Quantity,
                    p.ImageUrl,
                    p.CategoryName
                })
                .ToListAsync();

            if (!products.Any())
            {
                return Ok(new { response = "Chúng tôi rất lấy làm tiếc vì tôi chưa hiểu ý câu trả lời của bạn. Nếu bạn có nhu cầu nào khác cụ thể, hãy nói cho tôi biết.", data = new List<object>() });
            }

            return Ok(new { response = "Thành công", data = products });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Lỗi xử lý API: {ex.Message}");
            return StatusCode(500, new { response = "Đã xảy ra lỗi khi xử lý yêu cầu của bạn.", data = new List<object>() });
        }
    }
}
