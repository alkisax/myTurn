using Backend;
using QRCoder;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace backend.Services;

public class TicketPdfService(
  IConfiguration configuration
)
{
  public byte[] Generate(
    Ticket ticket,
    string companyName,
    string locationName,
    string queueName,
    List<string> services,
    double estimatedWaitingMinutes
  )
  {
    // Παίρνουμε από το appsettings το base URL του frontend.
    var baseUrl =
      configuration["Frontend:TicketTrackingBaseUrl"]
      ?? throw new InvalidOperationException(
        "Ticket tracking base URL is not configured"
      );

    var trackingUrl = $"{baseUrl.TrimEnd('/')}/{ticket.TrackingToken}";
    var qrCodePng = PngByteQRCodeHelper.GetQRCode(
      trackingUrl,
      QRCodeGenerator.ECCLevel.Q,
      10
    );

    // Document.Create() είναι το σημείο όπου περιγράφουμε τη δομή του PDF.
    var document = Document.Create(container =>
    {
      // Ένα PDF μπορεί να έχει μία ή περισσότερες σελίδες.
      container.Page(page =>
      {
        // Περιθώριο γύρω από όλη τη σελίδα.
        page.Margin(6);

        // Receipt-style PDF width. 80 mm is a common thermal printer paper width. We keep the PDF narrow so it can later be printed on a thermal receipt printer.
        page.Size(
          width: 80,
          height: 200,
          Unit.Millimetre
        );

        // Το Content είναι το κύριο σώμα της σελίδας. Με Column βάζουμε στοιχεία το ένα κάτω από το άλλο.
        page.Content().Column(column =>
        {
          column.Spacing(10);

          column.Item()
            .Text(companyName)
            .FontSize(20)
            .Bold();

          column.Item()
            .Text(locationName);

          column.Item()
            .Text(queueName)
            .FontSize(16)
            .Bold();

          // Το ticket number το κάνουμε το πιο εμφανές στοιχείο.
          column.Item()
            .Text($"Ticket #{ticket.Number}")
            .FontSize(28)
            .Bold();

          column.Item()
            .Text($"PIN: {ticket.Pin}");

          if (services.Count > 0)
          {
            column.Item()
              .Text(
                $"Services: {string.Join(", ", services)}"
              );
          }

          column.Item()
            .Text(
              $"Estimated waiting time: " +
              $"{estimatedWaitingMinutes:F1} minutes"
            );

          column.Item()
            .Text("Tracking:");

          // Για τώρα εμφανίζουμε plaintext URL.
          // Αργότερα το ίδιο URL θα χρησιμοποιηθεί και για QR.
          column.Item()
            .AlignCenter()
            .Width(120)
            .Image(Image.FromBinaryData(qrCodePng));

          column.Item()
            .Text(trackingUrl);
        });
      });
    });

    // Το QuestPDF μετατρέπει τη δομή που περιγράψαμε σε πραγματικό PDF και μας επιστρέφει byte[]. Αυτά τα bytes μετά τα επιστρέφει ο Controller ως application/pdf.
    return document.GeneratePdf();
  }
}
