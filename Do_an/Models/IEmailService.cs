using Do_an.Services;
using MailKit.Net.Smtp;
using MimeKit;
using System;
using System.Threading.Tasks;

public class EmailService : IEmailServices
{
    public async Task SendEmail(string recipient, string subject, string body)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Nhóm 6_Do_An", "service@gmail.com"));
        message.To.Add(new MailboxAddress("", recipient));
        message.Subject = subject;
        message.Body = new TextPart("plain") { Text = body };

        using (var client = new SmtpClient())
        {
            try
            {
                client.Connect("smtp.gmail.com", 587, MailKit.Security.SecureSocketOptions.StartTls);
                client.Authenticate("phungduc430@gmail.com", "uewa impb ofxr aads");
                await client.SendAsync(message);
                client.Disconnect(true);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi gửi email: {ex.Message}");
            }
        }
    }

    public async Task SendOtpEmail(string email, string otp)
    {
        await SendEmail(email, "Mã OTP để khôi phục mật khẩu", $"Mã OTP của bạn là: {otp}");
    }

    public string GenerateOtp()
    {
        Random random = new Random();
        return random.Next(100000, 999999).ToString();
    }
}
