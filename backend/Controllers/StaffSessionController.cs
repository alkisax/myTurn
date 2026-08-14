// backend\Controllers\StaffSessionController.cs
using Backend;
using backend.Dtos.StaffSessionDtos;
using backend.auth.Daos;
using System.Security.Claims;

namespace backend.Controllers;

public class StaffSessionController
{
  private readonly StaffSessionDao _dao;
  private readonly DeskDao _deskDao;
  private readonly CompanyUserDao _companyUserDao;
  private readonly UserDao _userDao;

  public StaffSessionController(
    StaffSessionDao dao,
    DeskDao deskDao,
    CompanyUserDao companyUserDao,
    UserDao userDao
  )
  {
    _dao = dao;
    _deskDao = deskDao;
    _companyUserDao = companyUserDao;
    _userDao = userDao;
  }


  private static int? GetCurrentUserId(ClaimsPrincipal currentUser)
  {
    var userIdString = currentUser.FindFirst("id")?.Value;

    if (!int.TryParse(userIdString, out var userId))
    {
      return null;
    }

    return userId;
  }


  private static StaffSessionDto MapToDto(StaffSession session)
  {
    return new StaffSessionDto(
      session.Id,
      session.UserId,
      session.CompanyId,
      session.LocationId,
      session.QueueId,
      session.DeskId,
      session.Status,
      session.StartedAt,
      session.BreakStartedAt,
      session.TotalBreakSeconds,
      session.EndedAt,
      session.CreatedAt,
      session.UpdatedAt
    );
  }


  // SUPERADMIN → όλα τα sessions
  public async Task<IResult> GetAll()
  {
    var sessions = await _dao.GetAll();

    return Results.Ok(new
    {
      status = true,
      data = sessions.Select(MapToDto)
    });
  }


  // STAFF βλέπει το δικό του ενεργό session.
  public async Task<IResult> GetMine(
    ClaimsPrincipal currentUser
  )
  {
    var userId = GetCurrentUserId(currentUser);

    if (userId is null)
    {
      return Results.Unauthorized();
    }

    var session = await _dao.GetActiveByUserId(userId.Value);

    return Results.Ok(new
    {
      status = true,
      data = session is null ? null : MapToDto(session)
    });
  }


  // STAFF μπαίνει σε Desk.
  public async Task<IResult> Create(
    CreateStaffSessionDto dto,
    ClaimsPrincipal currentUser
  )
  {
    var userId = GetCurrentUserId(currentUser);

    if (userId is null)
    {
      return Results.Unauthorized();
    }

    var user = await _userDao.GetById(userId.Value);

    if (user is null || user.Role != "STAFF")
    {
      return Results.Forbid();
    }

    // Staff δεν μπορεί να έχει δύο ανοιχτά sessions.
    var existingSession = await _dao.GetActiveByUserId(userId.Value);

    if (existingSession is not null)
    {
      return Results.Conflict(new
      {
        status = false,
        message = "Staff already has an active session"
      });
    }

    var desk = await _deskDao.GetById(dto.DeskId);

    if (desk is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Desk not found"
      });
    }

    if (!desk.IsActive)
    {
      return Results.BadRequest(new
      {
        status = false,
        message = "Desk is inactive"
      });
    }

    // ✅ STAFF πρέπει να ανήκει στην Company του Desk.
    var companyRelation =
      await _companyUserDao.GetByUserAndCompany(
        userId.Value,
        desk.CompanyId
      );

    if (companyRelation is null)
    {
      return Results.Forbid();
    }

    // ✅ Ένα Desk δεν μπορεί να χρησιμοποιείται
    // ταυτόχρονα από δύο STAFF.
    var deskSession = await _dao.GetActiveByDeskId(desk.Id);

    if (deskSession is not null)
    {
      return Results.Conflict(new
      {
        status = false,
        message = "Desk is already occupied"
      });
    }

    var session = new StaffSession
    {
      UserId = userId.Value,
      CompanyId = desk.CompanyId,
      LocationId = desk.LocationId,
      QueueId = desk.QueueId,
      DeskId = desk.Id
    };

    var created = await _dao.CreateIfAvailable(session);

    if (created is null)
    {
      return Results.Conflict(new
      {
        status = false,
        message = "Staff or desk already has an active session"
      });
    }

    return Results.Created(
      $"/staff-sessions/{created.Id}",
      new
      {
        status = true,
        data = MapToDto(created)
      }
    );
  }


  // ACTIVE <-> BREAK
  public async Task<IResult> UpdateStatus(
    int id,
    UpdateStaffSessionStatusDto dto,
    ClaimsPrincipal currentUser
  )
  {
    var userId = GetCurrentUserId(currentUser);

    if (userId is null)
    {
      return Results.Unauthorized();
    }

    var session = await _dao.GetById(id);

    if (session is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Staff session not found"
      });
    }

    if (session.UserId != userId.Value)
    {
      return Results.Forbid();
    }

    if (session.EndedAt is not null)
    {
      return Results.BadRequest(new
      {
        status = false,
        message = "Session has already ended"
      });
    }

    var status = dto.Status.ToUpper();

    if (status != "ACTIVE" && status != "BREAK")
    {
      return Results.BadRequest(new
      {
        status = false,
        message = "Invalid status"
      });
    }

    if (status == session.Status)
    {
      return Results.BadRequest(new
      {
        status = false,
        message = $"Session is already {status}"
      });
    }

    if (status == "BREAK")
    {
      session.Status = "BREAK";
      session.BreakStartedAt = DateTime.UtcNow;
    }

    if (status == "ACTIVE")
    {
      if (session.BreakStartedAt is not null)
      {
        var breakSeconds =
          (int)(DateTime.UtcNow - session.BreakStartedAt.Value)
          .TotalSeconds;

        session.TotalBreakSeconds += breakSeconds;
      }

      session.Status = "ACTIVE";
      session.BreakStartedAt = null;
    }

    var updated = await _dao.Update(id, session);

    return Results.Ok(new
    {
      status = true,
      data = MapToDto(updated!)
    });
  }


  // STAFF φεύγει από Desk.
  public async Task<IResult> End(
    int id,
    ClaimsPrincipal currentUser
  )
  {
    var userId = GetCurrentUserId(currentUser);

    if (userId is null)
    {
      return Results.Unauthorized();
    }

    var session = await _dao.GetById(id);

    if (session is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Staff session not found"
      });
    }

    if (session.UserId != userId.Value)
    {
      return Results.Forbid();
    }

    if (session.EndedAt is not null)
    {
      return Results.BadRequest(new
      {
        status = false,
        message = "Session has already ended"
      });
    }

    // Αν φύγει ενώ είναι σε BREAK,
    // αποθηκεύουμε και τον τελευταίο χρόνο break.
    if (session.BreakStartedAt is not null)
    {
      var breakSeconds =
        (int)(DateTime.UtcNow - session.BreakStartedAt.Value)
        .TotalSeconds;

      session.TotalBreakSeconds += breakSeconds;
      session.BreakStartedAt = null;
    }

    session.EndedAt = DateTime.UtcNow;

    var updated = await _dao.Update(id, session);

    return Results.Ok(new
    {
      status = true,
      data = MapToDto(updated!)
    });
  }
}
