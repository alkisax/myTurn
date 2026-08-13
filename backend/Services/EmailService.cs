// backend/Services/EmailService.cs

using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace backend.Services;

public class EmailService(
  IConfiguration configuration
)
{
  public async Task SendTicketEmail(
    string to,
    string subject,
    string body,
    byte[]? pdfAttachment = null
  )
  {
    var host = configuration["Email:SmtpHost"];
    var portString = configuration["Email:SmtpPort"];
    var username = configuration["Email:Username"];
    var password = configuration["Email:Password"];
    var fromEmail = configuration["Email:FromEmail"];
    var fromName = configuration["Email:FromName"] ?? "MyTurn";

    if (
      string.IsNullOrWhiteSpace(host) ||
      string.IsNullOrWhiteSpace(portString) ||
      string.IsNullOrWhiteSpace(username) ||
      string.IsNullOrWhiteSpace(password) ||
      string.IsNullOrWhiteSpace(fromEmail)
    )
    {
      throw new InvalidOperationException(
        "Email SMTP configuration is incomplete"
      );
    }

    var port = int.Parse(portString);

    var message = new MimeMessage();

    message.From.Add(
      new MailboxAddress(fromName, fromEmail)
    );

    message.To.Add(
      MailboxAddress.Parse(to)
    );

    message.Subject = subject;

    // BodyBuilder μας επιτρέπει body + attachments.
    var bodyBuilder = new BodyBuilder
    {
      TextBody = body
    };

    if (pdfAttachment is not null)
    {
      bodyBuilder.Attachments.Add(
        "ticket.pdf",
        pdfAttachment,
        ContentType.Parse("application/pdf")
      );
    }

    message.Body = bodyBuilder.ToMessageBody();

    using var smtp = new SmtpClient();

    // Port 587 συνήθως χρησιμοποιεί STARTTLS.
    await smtp.ConnectAsync(
      host,
      port,
      SecureSocketOptions.StartTls
    );

    await smtp.AuthenticateAsync(
      username,
      password
    );

    await smtp.SendAsync(message);

    await smtp.DisconnectAsync(true);
  }
}