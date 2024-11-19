namespace Do_an.Services
{
    public interface IEmailServices
    {
        Task SendEmail(string recipient, string subject, string body);
        Task SendOtpEmail(string email, string otp); 
        string GenerateOtp();
    }
}
