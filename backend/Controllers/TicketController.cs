// backend\Controllers\TicketController.cs

using Backend;
using backend.Dtos.TicketDtos;
using System.Security.Claims;
using backend.Dtos.TicketServiceDtos;
using backend.Services;
using backend.auth.Daos;

namespace backend.Controllers;

public class TicketController
{
  private readonly TicketDao _dao;
  private readonly QueueDao _queueDao;
  private readonly CompanyUserDao _companyUserDao;
  private readonly StaffSessionDao _staffSessionDao;
  private readonly ServiceDao _serviceDao;
  private readonly TicketServiceDao _ticketServiceDao;
  private readonly QueueResetService _queueResetService;
  private readonly MissedTicketExpiryService _missedTicketExpiryService;
  private readonly TicketEstimateService _ticketEstimateService;
  private readonly EmailService _emailService;
  private readonly UserDao _userDao;
  private readonly TicketPdfService _ticketPdfService;
  private readonly CompanyDao _companyDao;
  private readonly LocationDao _locationDao;
  private readonly IConfiguration _configuration;

  public TicketController(
    TicketDao dao,
    QueueDao queueDao,
    CompanyUserDao companyUserDao,
    StaffSessionDao staffSessionDao,
    ServiceDao serviceDao,
    TicketServiceDao ticketServiceDao,
    QueueResetService queueResetService,
    MissedTicketExpiryService missedTicketExpiryService,
    TicketEstimateService ticketEstimateService,
    EmailService emailService,
    UserDao userDao,
    TicketPdfService ticketPdfService,
    CompanyDao companyDao,
    LocationDao locationDao,
    IConfiguration configuration
  )
  {
    _dao = dao;
    _queueDao = queueDao;
    _companyUserDao = companyUserDao;
    _staffSessionDao = staffSessionDao;
    _serviceDao = serviceDao;
    _ticketServiceDao = ticketServiceDao;
    _queueResetService = queueResetService;
    _missedTicketExpiryService = missedTicketExpiryService;
    _ticketEstimateService = ticketEstimateService;
    _emailService = emailService;
    _userDao = userDao;
    _ticketPdfService = ticketPdfService;
    _companyDao = companyDao;
    _locationDao = locationDao;
    _configuration = configuration;
  }

  public async Task<IResult> Create(
    CreateTicketDto dto,
    ClaimsPrincipal currentUser // token payload
  )
  {
    // 1. Βρίσκουμε το Queue. έρχεται απο το request body του post στο CreateTicketDto
    var queue = await _queueDao.GetById(dto.QueueId);
    if (queue is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Queue not found"
      });
    }

    await _missedTicketExpiryService.EnsureExpiredMissedTickets(queue.Id);
    await _queueResetService.EnsureResetIfNeeded(queue);

    // 2. Δεν εκδίδουμε ticket σε inactive Queue.
    if (!queue.IsActive)
    {
      return Results.BadRequest(new
      {
        status = false,
        message = "Queue is inactive"
      });
    }

    // TICKETSERVICE 3. Παίρνουμε τα ServiceIds από το dto.
    // Αν δεν έχουν σταλεί services, δημιουργούμε κενή λίστα.
    var serviceIds = dto.ServiceIds ?? [];

    // TICKETSERVICE Αφαιρούμε τυχόν διπλά service ids. πχ [2, 2, 5] -> [2, 5]
    serviceIds = serviceIds
      .Distinct()
      .ToList();

    // TICKETSERVICE Ελέγχουμε όλα τα services ΠΡΙΝ δημιουργήσουμε το Ticket.
    foreach (var serviceId in serviceIds)
    {
      var service = await _serviceDao.GetById(serviceId);
      // το service πρέπει να υπάρχει
      if (service is null)
      {
        return Results.NotFound(new
        {
          status = false,
          message = $"Service {serviceId} not found"
        });
      }

      // το service πρέπει να ανήκει στο ίδιο Location με το Queue
      if (service.LocationId != queue.LocationId)
      {
        return Results.BadRequest(new
        {
          status = false,
          message = $"Service {serviceId} does not belong to this location"
        });
      }

      // δεν επιτρέπουμε inactive service
      if (!service.IsActive)
      {
        return Results.BadRequest(new
        {
          status = false,
          message = $"Service {serviceId} is inactive"
        });
      }
    }

    // // 4. Βρίσκουμε τον επόμενο αριθμό.
    // comment out γιατι η διαδικασία μεταφέρθηκε στο create του DAO για να μπορεί να γίνει atomic με δυνατότητα Rollback
    // var lastNumber = await _dao.GetLastNumberToday(queue.Id);
    // var nextNumber = lastNumber + 1;


    // 5. Δημιουργούμε PIN και ελέγχουμε ότι δεν υπάρχει ήδη σήμερα στο ίδιο Location.
    string pin;

    // δίνε pin μέχρι να μην υπάρχει σήμερα
    do
    {
      // .Shared σημαίνει ουσιαστικά: «χρησιμοποίησε τον κοινό, έτοιμο random generator που έχει ήδη το .NET.
      // pin = Random.Shared.Next(1000, 10000).ToString(); για να έχω και πχ 0001 κάνουμε μορφοποίηση με leading 0 → d4
      pin = Random.Shared.Next(0, 10000).ToString("D4");
    }
    while (await _dao.PinExistsToday(
      queue.LocationId,
      pin
    ));

    // 6. Δημιουργούμε secure tracking token.
    // GUID → Globally Unique Identifier. μου το δίνει το using system
    // "N" →  32 χαρακτήρες χωρίς παύλες
    var trackingToken = Guid.NewGuid().ToString("N");

    // 7. Αν υπάρχει authenticated user, παίρνουμε το id από το JWT.
    int? userId = null;

    var userIdString = currentUser.FindFirst("id")?.Value;

    // προσπάθησε να μετατρέψεις το "17" σε 17
    if (int.TryParse(userIdString, out var parsedUserId))
    {
      userId = parsedUserId;
    }

    // 8. Δημιουργούμε το Ticket.
    var ticket = new Ticket
    {
      CompanyId = queue.CompanyId,
      LocationId = queue.LocationId,
      QueueId = queue.Id,
      UserId = userId,
      CustomerEmail = dto.Email,
      // Number = nextNumber, // Τώρα το Number προστίθεται μέσα στο TicketDao.Create(), πριν σωθεί το ticket.
      Pin = pin,
      TrackingToken = trackingToken,
      Status = "WAITING"
    };

    // 9. Αποθήκευση.
    // TICKETSERVICE + ATOMIC TRANSACTION
    // Το TicketDao αναλαμβάνει πλέον να αποθηκεύσει:
    // - το Ticket - όλα τα TicketService σαν μία ενιαία atomic λειτουργία. Αν αποτύχει κάποιο TicketService, γίνεται rollback και του Ticket.
    var created = await _dao.Create(
      ticket,
      serviceIds,
      queue
    );

    // ⚠️εδω στέλνουμε το mail με zoho mail
    // TODO: στέλνετε απο το δικό μου zoho mail και δεν φαίνεται πουθενα έστω το ονομα του Company 
    // ⚠️ Βρίσκουμε σε ποιο email θα σταλεί το ticket.
    // Προτεραιότητα έχει το email που έδωσε ο χρήστης στο request.
    string? email = dto.Email;

    // Αν δεν έδωσε email αλλά είναι logged in,
    // χρησιμοποιούμε το email του λογαριασμού του.
    if (string.IsNullOrWhiteSpace(email) && userId is not null)
    {
      var user = await _userDao.GetById(userId.Value);
      email = user?.Email;
    }

    // Αν έχουμε email, δημιουργούμε PDF και το στέλνουμε.
    if (!string.IsNullOrWhiteSpace(email))
    {
      var company = await _companyDao.GetById(created.CompanyId);
      var location = await _locationDao.GetById(created.LocationId);

      // Παίρνουμε τα services του ticket.
      var ticketServices = await _ticketServiceDao.GetByTicketId(created.Id);

      var serviceNames = new List<string>();

      foreach (var ticketService in ticketServices)
      {
        var service = await _serviceDao.GetById(ticketService.ServiceId);

        if (service is not null) serviceNames.Add(service.Name);
      }

      // Υπολογίζουμε το τωρινό ETA.
      var estimatedWaitingMinutes = await _ticketEstimateService.GetEstimatedWaitingMinutes(created, queue.LastResetAt);
      // URL για public tracking.
      var trackingUrl = $"{_configuration["Frontend:TicketTrackingBaseUrl"]?.TrimEnd('/')}/{created.TrackingToken}";

      // Δημιουργούμε το ίδιο PDF που μπορεί να κατεβάσει και ο χρήστης.
      var pdf = _ticketPdfService.Generate(
        created,
        company!.Name,
        location!.Name,
        queue.Name,
        serviceNames,
        estimatedWaitingMinutes
      );

      // Περιεχόμενο του email.
      var body =
      $"""
        MyTurn

        Company: {company.Name}
        Location: {location.Name}
        Queue: {queue.Name}

        Ticket number: {created.Number}
        PIN: {created.Pin}

        Services:
        {string.Join("\n", serviceNames.Select(name => $"- {name}"))}

        Estimated waiting time: {estimatedWaitingMinutes:F1} minutes

        Tracking:
        {trackingUrl}
      """;

      // Στέλνουμε email μαζί με το PDF attachment.
      try
      {
        await _emailService.SendTicketEmail(
          email,
          $"MyTurn - Ticket #{created.Number}",
          body,
          pdf
        );
      }
      catch (Exception ex)
      {
        // Το ticket έχει ήδη δημιουργηθεί.
        // Αποτυχία email δεν πρέπει να αποτυγχάνει το POST /tickets.
        Console.WriteLine(
          $"Failed to send ticket email for ticket {created.Id}: {ex.Message}"
        );

        // TODO: αργότερα proper logging / retry mechanism.
      }
    }
    // ⚠️ 👆🏽 εδω τελειώνει η λειτουργία του mail

    var data = new
    {
      created.Id,
      created.CompanyId,
      created.LocationId,
      created.QueueId,
      created.Number,
      created.Pin,
      created.TrackingToken,
      created.Status,
      created.CreatedAt,
      ServiceIds = serviceIds
    };

    // 10. Response.
    return Results.Created(
      $"/tickets/{created.TrackingToken}",
      new
      {
        status = true,
        data
      }
    );
  }

  // Βρίσκει τα services που έχουν συνδεθεί με ένα ticket και επιστρέφει id + όνομα του κάθε service.
  private async Task<List<TicketServiceInfoDto>> GetServicesForTicket(
    int ticketId
  )
  {
    var ticketServices = await _ticketServiceDao.GetByTicketId(ticketId);
    var services = new List<TicketServiceInfoDto>();

    foreach (var ticketService in ticketServices)
    {
      var service = await _serviceDao.GetById(
        ticketService.ServiceId
      );

      if (service is not null)
      {
        services.Add(new TicketServiceInfoDto(
          service.Id,
          service.Name
        ));
      }
    }
    return services;
  }

  // για να μπορούμε να παρακολουθούμε το ticket απο σελίδα που μας οδηγεί το qr
  public async Task<IResult> GetByTrackingToken(
    string trackingToken
  )
  {
    var ticket = await _dao.GetByTrackingToken(trackingToken);

    if (ticket is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Ticket not found"
      });
    }

    // χρειαζόμαστε την Queue για το LastResetAt
    var queue = await _queueDao.GetById(ticket.QueueId);

    if (queue is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Queue not found"
      });
    }

    var services = await GetServicesForTicket(ticket.Id);

    // υπολογίζουμε estimated waiting time
    var estimatedWaitingMinutes =
      await _ticketEstimateService.GetEstimatedWaitingMinutes(
        ticket,
        queue.LastResetAt
      );

    var data = new TicketTrackingDto(
      ticket.Id,
      ticket.CompanyId,
      ticket.LocationId,
      ticket.QueueId,
      ticket.Number,
      ticket.Pin,
      ticket.Status,
      ticket.CreatedAt,
      ticket.ServingStartedAt,
      ticket.CompletedAt,
      services,
      estimatedWaitingMinutes
    );

    return Results.Ok(new
    {
      status = true,
      data
    });
  }

  // για να μπορεί να δεί ο χρήστης τα ticket του παλια και νέα
  public async Task<IResult> GetMine(
    ClaimsPrincipal currentUser // token payload
  )
  {
    var userIdString = currentUser.FindFirst("id")?.Value;

    if (!int.TryParse(userIdString, out var userId)) return Results.Unauthorized();

    var tickets = await _dao.GetByUserId(userId);

    var data = new List<MyTicketDto>();

    foreach (var ticket in tickets)
    {
      var services = await GetServicesForTicket(ticket.Id);

      data.Add(new MyTicketDto(
        ticket.Id,
        ticket.CompanyId,
        ticket.LocationId,
        ticket.QueueId,
        ticket.Number,
        ticket.Pin,
        ticket.TrackingToken,
        ticket.CustomerEmail,
        ticket.Status,
        ticket.CreatedAt,
        ticket.ServingStartedAt,
        ticket.CompletedAt,
        services
      ));
    }

    return Results.Ok(new
    {
      status = true,
      data
    });
  }

  // για όλο το προσωπικό να βλέπει ποιοι αριθμοί είναι σε ένα queue. Το staff βλέπει το queue στο οποίο είναι assigned, ο admin τα queue του company και ο super admin όλα
  // Το CompanyUser είναι ο μηχανισμός company-level access για ADMIN/STAFF.
  // όλα τα tickets του queue αργότερα filter

  // ⚠️ Access helper
  // boolean συνάρτηση που μου απαντάει στο ερώτημα ποιος έχει προσβαση
  private async Task<bool> HasQueueAccess(
    Queue queue,
    ClaimsPrincipal currentUser
  )
  {
    var role = currentUser.FindFirst(ClaimTypes.Role)?.Value;

    // ο superadmin έχει προσβαση σε όλα
    if (role == "SUPERADMIN")
    {
      return true;
    }

    // αν δεν είναι superuser → ελέγχω το id του. θέλουμε να δουμε αν είναι admin και owner του company ή staff και assigned στο queue
    var userIdString = currentUser.FindFirst("id")?.Value;

    if (!int.TryParse(userIdString, out var userId))
    {
      return false;
    }

    // αν είναι admin ψάχνω αν έχει σχέση με τo company στο οποίο ανήκει το queue (είχαμε φτιάξει σχετικό dao στο company)
    if (role == "ADMIN")
    {
      // CompanyUser = ενδιάμεση οντότητα που συνδέει έναν User με μία Company και καθορίζει σε ποιες Companies έχει πρόσβαση.
      // GetByUserAndCompany(userId, companyId) = ψάχνει αν υπάρχει συγκεκριμένη σχέση User ↔ Company.
      var relation = await _companyUserDao.GetByUserAndCompany(userId, queue.CompanyId);
      return relation is not null; // true αν βρέθηκε σχέση CompanyUser, αλλιώς false
    }

    if (role == "STAFF")
    {
      // StaffSession = προσωρινή οντότητα που δείχνει σε ποιο Desk/Queue εργάζεται αυτή τη στιγμή ένας STAFF και αν είναι ACTIVE/BREAK.
      // GetActiveByUserId(userId) = βρίσκει το ανοιχτό StaffSession του συγκεκριμένου STAFF, δηλαδή session με EndedAt == null.
      var session = await _staffSessionDao.GetActiveByUserId(userId);
      // μόνο αν ισχύουν και τα τρία: έχει ενεργό StaffSession, το session είναι για το ίδιο Queue, το session είναι σε status ACTIVE
      return session is not null && session.QueueId == queue.Id;
      // && session.Status == "ACTIVE"; //commented → θέλω να βλέπει την σειρά και σε break
    }

    return false;
  }

  public async Task<IResult> GetByQueueId(
  int queueId,
    ClaimsPrincipal currentUser
  )
  {
    var queue = await _queueDao.GetById(queueId);

    if (queue is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Queue not found"
      });
    }

    var hasAccess = await HasQueueAccess(
      queue,
      currentUser
    );

    if (!hasAccess)
    {
      return Results.Forbid();
    }

    await _queueResetService.EnsureResetIfNeeded(queue);
    await _missedTicketExpiryService.EnsureExpiredMissedTickets(queueId);

    var tickets = await _dao.GetByQueueId(queueId, queue.LastResetAt);

    var data = new List<MyTicketDto>();

    foreach (var ticket in tickets)
    {
      var services = await GetServicesForTicket(ticket.Id);

      data.Add(new MyTicketDto(
        ticket.Id,
        ticket.CompanyId,
        ticket.LocationId,
        ticket.QueueId,
        ticket.Number,
        ticket.Pin,
        ticket.TrackingToken,
        ticket.CustomerEmail,
        ticket.Status,
        ticket.CreatedAt,
        ticket.ServingStartedAt,
        ticket.CompletedAt,
        services
      ));
    }

    return Results.Ok(new
    {
      status = true,
      data
    });
  }

  // staff πατάει next
  // ⚠️ Helper που ελέγχει αν αυτός ο user μπορεί να εξυπηρετησει αυτήν την queue
  public async Task<IResult> GetHistoryByQueueId(
    int queueId,
    ClaimsPrincipal currentUser
  )
  {
    var queue = await _queueDao.GetById(queueId);

    if (queue is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Queue not found"
      });
    }

    var hasAccess = await HasQueueAccess(queue, currentUser);

    if (!hasAccess)
    {
      return Results.Forbid();
    }

    var tickets = await _dao.GetHistoryByQueueId(queueId);
    var data = new List<MyTicketDto>();

    foreach (var ticket in tickets)
    {
      var services = await GetServicesForTicket(ticket.Id);

      data.Add(new MyTicketDto(
        ticket.Id,
        ticket.CompanyId,
        ticket.LocationId,
        ticket.QueueId,
        ticket.Number,
        ticket.Pin,
        ticket.TrackingToken,
        ticket.CustomerEmail,
        ticket.Status,
        ticket.CreatedAt,
        ticket.ServingStartedAt,
        ticket.CompletedAt,
        services
      ));
    }

    return Results.Ok(new
    {
      status = true,
      data
    });
  }

  private async Task<StaffSession?> GetServingSession(
    ClaimsPrincipal currentUser
  )
  {
    var userIdString = currentUser.FindFirst("id")?.Value;
    if (!int.TryParse(userIdString, out var userId)) return null;
    var role = currentUser.FindFirst(ClaimTypes.Role)?.Value;

    // μονο Staff ⚠️ αργότερα θα φτιάξουμε ξεχωριστές administrative recovery actions
    if (role != "STAFF") return null;

    var session = await _staffSessionDao.GetActiveByUserId(userId);

    if (session is null) return null;
    if (session.Status != "ACTIVE") return null;

    return session;
  }

  public async Task<IResult> Next(
    ClaimsPrincipal currentUser
  )
  {
    // 1. Ελέγχουμε ότι ο user είναι STAFF και έχει ACTIVE StaffSession.
    var session = await GetServingSession(currentUser);

    if (session is null) return Results.Forbid();

    var queue = await _queueDao.GetById(session.QueueId);

    if (queue is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Queue not found"
      });
    }

    await _missedTicketExpiryService.EnsureExpiredMissedTickets(queue.Id);
    await _queueResetService.EnsureResetIfNeeded(queue);

    // 2. Το DAO κάνει πλέον όλη την atomic διαδικασία:
    // - βρίσκει το πρώτο WAITING ticket - το κάνει SERVING - βάζει Staff - βάζει Desk - βάζει ServingStartedAt και όλα αυτά μέσα στο transaction.
    var claimResult = await _dao.ClaimNextWaiting(
      session.QueueId,
      session.UserId,
      session.DeskId
    );

    if (claimResult.AlreadyServing)
    {
      return Results.Conflict(new
      {
        status = false,
        message = "Staff or desk already has a serving ticket"
      });
    }

    var ticket = claimResult.Ticket;

    // Δεν υπάρχει άλλο WAITING ticket.
    if (ticket is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "No waiting tickets"
      });
    }

    // 3. Response.
    var services = await GetServicesForTicket(ticket.Id);
    var data = new MyTicketDto(
      ticket.Id,
      ticket.CompanyId,
      ticket.LocationId,
      ticket.QueueId,
      ticket.Number,
      ticket.Pin,
      ticket.TrackingToken,
      ticket.CustomerEmail,
      ticket.Status,
      ticket.CreatedAt,
      ticket.ServingStartedAt,
      ticket.CompletedAt,
      services
    );

    return Results.Ok(new
    {
      status = true,
      data
    });
  }


  public async Task<IResult> Complete(
    int ticketId,
    CompleteTicketDto dto,
    ClaimsPrincipal currentUser
  )
  {
    // 1. Πρέπει να είναι STAFF με ACTIVE StaffSession.
    var session = await GetServingSession(currentUser);

    if (session is null) return Results.Forbid();

    // 2. Δεχόμαστε μόνο SUCCESS ή FAILED.
    var completionResult = dto.CompletionResult.ToUpper();

    if (completionResult != "SUCCESS" && completionResult != "FAILED")
    {
      return Results.BadRequest(new
      {
        status = false,
        message = "CompletionResult must be SUCCESS or FAILED"
      });
    }

    // 3. Προσπαθούμε να ολοκληρώσουμε το ticket.
    // Χρησιμοποιούμε userId + deskId από το StaffSession, όχι δεδομένα που έστειλε ο client.
    var ticket = await _dao.Complete(
      ticketId,
      session.UserId,
      session.DeskId,
      completionResult
    );

    if (ticket is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Serving ticket not found"
      });
    }

    // 4. Response.
    var services = await GetServicesForTicket(ticket.Id);
    var data = new MyTicketDto(
      ticket.Id,
      ticket.CompanyId,
      ticket.LocationId,
      ticket.QueueId,
      ticket.Number,
      ticket.Pin,
      ticket.TrackingToken,
      ticket.CustomerEmail,
      ticket.Status,
      ticket.CreatedAt,
      ticket.ServingStartedAt,
      ticket.CompletedAt,
      services
    );

    return Results.Ok(new
    {
      status = true,
      data
    });
  }

  public async Task<IResult> MarkMissed(
    int ticketId,
    ClaimsPrincipal currentUser
  )
  {
    // Πρέπει να είναι STAFF με ACTIVE StaffSession.
    var session = await GetServingSession(currentUser);

    if (session is null) return Results.Forbid();

    var ticket = await _dao.MarkMissed(
      ticketId,
      session.UserId,
      session.DeskId
    );

    if (ticket is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Serving ticket not found"
      });
    }

    var services = await GetServicesForTicket(ticket.Id);
    var data = new MyTicketDto(
      ticket.Id,
      ticket.CompanyId,
      ticket.LocationId,
      ticket.QueueId,
      ticket.Number,
      ticket.Pin,
      ticket.TrackingToken,
      ticket.CustomerEmail,
      ticket.Status,
      ticket.CreatedAt,
      ticket.ServingStartedAt,
      ticket.CompletedAt,
      services
    );

    return Results.Ok(new
    {
      status = true,
      data
    });
  }

  public async Task<IResult> RecallMissed(
    int ticketId,
    ClaimsPrincipal currentUser
  )
  {
    var session = await GetServingSession(currentUser);

    if (session is null) return Results.Forbid();

    var ticket = await _dao.RecallMissed(
      ticketId,
      session.QueueId,
      session.UserId,
      session.DeskId
    );

    if (ticket is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Missed ticket not found"
      });
    }

    var services = await GetServicesForTicket(ticket.Id);
    var data = new MyTicketDto(
      ticket.Id,
      ticket.CompanyId,
      ticket.LocationId,
      ticket.QueueId,
      ticket.Number,
      ticket.Pin,
      ticket.TrackingToken,
      ticket.CustomerEmail,
      ticket.Status,
      ticket.CreatedAt,
      ticket.ServingStartedAt,
      ticket.CompletedAt,
      services
    );

    return Results.Ok(new
    {
      status = true,
      data
    });
  }

  // ⚠️ δεν έχουμε δεί ακόμα αν αυτό θα είναι automated
  public async Task<IResult> ExpireMissed(
    int ticketId,
    ClaimsPrincipal currentUser
  )
  {
    // 1. Βρίσκουμε πρώτα το ticket.
    var ticket = await _dao.GetById(ticketId);

    if (ticket is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Ticket not found"
      });
    }

    // 2. Βρίσκουμε την Queue στην οποία ανήκει.
    var queue = await _queueDao.GetById(ticket.QueueId);

    if (queue is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Queue not found"
      });
    }

    // 3. Χρησιμοποιούμε το υπάρχον access check.
    // SUPERADMIN -> επιτρέπεται
    // ADMIN -> πρέπει να έχει CompanyUser relation με την Company της Queue.
    var hasAccess = await HasQueueAccess(
      queue,
      currentUser
    );

    if (!hasAccess) return Results.Forbid();

    // 4. Τώρα μπορούμε με ασφάλεια να κάνουμε: MISSED -> EXPIRED
    var expiredTicket = await _dao.ExpireMissed(ticketId);

    if (expiredTicket is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Missed ticket not found"
      });
    }

    var services = await GetServicesForTicket(expiredTicket.Id);
    var data = new MyTicketDto(
      expiredTicket.Id,
      expiredTicket.CompanyId,
      expiredTicket.LocationId,
      expiredTicket.QueueId,
      expiredTicket.Number,
      expiredTicket.Pin,
      expiredTicket.TrackingToken,
      expiredTicket.CustomerEmail,
      expiredTicket.Status,
      expiredTicket.CreatedAt,
      expiredTicket.ServingStartedAt,
      expiredTicket.CompletedAt,
      services
    );

    return Results.Ok(new
    {
      status = true,
      data
    });
  }

  public async Task<IResult> Cancel(
    int ticketId,
    ClaimsPrincipal currentUser
  )
  {
    var userIdString = currentUser.FindFirst("id")?.Value;

    if (!int.TryParse(userIdString, out var userId)) return Results.Unauthorized();

    var ticket = await _dao.Cancel(
      ticketId,
      userId
    );

    if (ticket is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Waiting ticket not found"
      });
    }

    var services = await GetServicesForTicket(ticket.Id);
    var data = new MyTicketDto(
      ticket.Id,
      ticket.CompanyId,
      ticket.LocationId,
      ticket.QueueId,
      ticket.Number,
      ticket.Pin,
      ticket.TrackingToken,
      ticket.CustomerEmail,
      ticket.Status,
      ticket.CreatedAt,
      ticket.ServingStartedAt,
      ticket.CompletedAt,
      services
    );

    return Results.Ok(new
    {
      status = true,
      data
    });
  }

  // generic get by id
  public async Task<IResult> GetById(
    int ticketId,
    ClaimsPrincipal currentUser
  )
  {
    var ticket = await _dao.GetById(ticketId);
    if (ticket is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Ticket not found"
      });
    }

    var queue = await _queueDao.GetById(ticket.QueueId);

    if (queue is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Queue not found"
      });
    }

    var hasAccess = await HasQueueAccess(
      queue,
      currentUser
    );

    if (!hasAccess) return Results.Forbid();

    var estimatedWaitingMinutes =
      await _ticketEstimateService.GetEstimatedWaitingMinutes(
        ticket,
        queue.LastResetAt
      );

    var services = await GetServicesForTicket(ticket.Id);
    var data = new MyTicketDto(
      ticket.Id,
      ticket.CompanyId,
      ticket.LocationId,
      ticket.QueueId,
      ticket.Number,
      ticket.Pin,
      ticket.TrackingToken,
      ticket.CustomerEmail,
      ticket.Status,
      ticket.CreatedAt,
      ticket.ServingStartedAt,
      ticket.CompletedAt,
      services
    );

    return Results.Ok(new
    {
      status = true,
      data
      // configuredDuration
    });
  }

  public async Task<IResult> Delete(int ticketId)
  {
    var ticket = await _dao.GetById(ticketId);

    if (ticket is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Ticket not found"
      });
    }

    // Διαγράφουμε πρώτα όλες τις σχέσεις του ticket με services.
    await _ticketServiceDao.DeleteByTicketId(ticketId);

    var deleted = await _dao.Delete(ticketId);

    return Results.Ok(new
    {
      status = true,
      message = $"Ticket {deleted!.Number} deleted"
    });
  }


}
