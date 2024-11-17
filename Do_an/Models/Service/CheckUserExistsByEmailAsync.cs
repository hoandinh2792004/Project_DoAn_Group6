using System.Threading.Tasks;
using Do_an.Data;
using Microsoft.EntityFrameworkCore;

namespace Do_an.Services
{
    public interface IUserService
    {
        Task<bool> CheckUserExistsByEmailAsync(string email);
    }

    public class UserService : IUserService
    {
        private readonly DoAnContext _context;

        public UserService(DoAnContext context)
        {
            _context = context;
        }

        public async Task<bool> CheckUserExistsByEmailAsync(string email)
        {
            // Kiểm tra xem người dùng có tồn tại với email đã cho hay không
            return await _context.User.AnyAsync(u => u.Email == email);
        }
    }
}
