using Do_an.Services;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

public class JwtMiddleware
{
    private readonly RequestDelegate _next;

    public JwtMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IUserService userService, IConfiguration configuration)
    {
        // Lấy token từ cookie hoặc header Authorization
        var token = context.Request.Cookies["authToken"] ?? context.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

        if (!string.IsNullOrEmpty(token))
        {
            try
            {
                Console.WriteLine("Token received: " + token); // Log token nhận được

                // Đảm bảo token hợp lệ
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(configuration["Jwt:SecretKey"]);
                var tokenValidationParams = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidIssuer = configuration["Jwt:Issuer"],
                    ValidAudience = configuration["Jwt:Audience"]
                };

                // Xác thực token
                var principal = tokenHandler.ValidateToken(token, tokenValidationParams, out var validatedToken);

                // Log thông tin về token đã xác thực
                Console.WriteLine("Token validated successfully.");
                Console.WriteLine("User claims: " + string.Join(", ", principal.Claims.Select(c => $"{c.Type}: {c.Value}")));

                // Đặt thông tin người dùng vào HttpContext
                context.User = principal;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Token validation failed: " + ex.Message); // Log lỗi nếu token không hợp lệ
                context.Response.StatusCode = 401; // Unauthorized
                await context.Response.WriteAsync("Token không hợp lệ hoặc hết hạn.");
                return;
            }
        }
        else
        {
            Console.WriteLine("No token provided."); // Log khi không có token
        }

        await _next(context);
    }
}
