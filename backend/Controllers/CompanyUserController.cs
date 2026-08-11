// backend\Controllers\CompanyUserController.cs

using Backend;
using backend.Dtos.CompanyUserDtos;
using backend.auth.Daos;
using backend.auth.Dtos;
using backend.auth.Models;
using System.Security.Claims;

namespace backend.Controllers;

public class CompanyUserController
{
  private readonly CompanyUserDao _dao;
  private readonly UserDao _userDao;
  private readonly CompanyDao _companyDao;

  public CompanyUserController(
    CompanyUserDao dao,
    UserDao userDao,
    CompanyDao companyDao
  )
  {
    _dao = dao;
    _userDao = userDao;
    _companyDao = companyDao;
  }

  // Ελέγχει αν ο logged-in ADMIN έχει πρόσβαση στη συγκεκριμένη Company.
  // SUPERADMIN → έχει πάντα πρόσβαση.
  // ADMIN → πρέπει να υπάρχει CompanyUser relation.
  private async Task<bool> HasCompanyAccess(
    int companyId,
    ClaimsPrincipal currentUser
  )
  {
    var role = currentUser.FindFirst(ClaimTypes.Role)?.Value;

    if (role == "SUPERADMIN")
    {
      return true;
    }

    var userIdString = currentUser.FindFirst("id")?.Value;

    if (!int.TryParse(userIdString, out var userId))
    {
      return false;
    }

    var relation = await _dao.GetByUserAndCompany(
      userId,
      companyId
    );

    return relation is not null;
  }

  public async Task<IResult> GetAll()
  {
    var companyUsers = await _dao.GetAll();

    var data = companyUsers.Select(companyUser => new CompanyUserDto(
      companyUser.Id,
      companyUser.UserId,
      companyUser.CompanyId,
      companyUser.CreatedAt
    ));

    return Results.Ok(new
    {
      status = true,
      data
    });
  }

  public async Task<IResult> GetByUserId(int userId)
  {
    var companyUsers = await _dao.GetByUserId(userId);

    var data = companyUsers.Select(companyUser => new CompanyUserDto(
      companyUser.Id,
      companyUser.UserId,
      companyUser.CompanyId,
      companyUser.CreatedAt
    ));

    return Results.Ok(new
    {
      status = true,
      data
    });
  }

  // Ο logged-in User βλέπει τις πραγματικές Companies
  // με τις οποίες συνδέεται μέσω CompanyUser.
  //
  // Αυτό χρησιμοποιείται κυρίως από STAFF ώστε μετά το login
  // να ξέρει σε ποια Company ή Companies μπορεί να εργαστεί.
  //
  // Δεν παίρνουμε userId από το URL.
  // Το παίρνουμε από το JWT, ώστε ο χρήστης να μην μπορεί
  // να ζητήσει τις Companies κάποιου άλλου.
  public async Task<IResult> GetMine(ClaimsPrincipal currentUser)
  {
    var userIdString = currentUser.FindFirst("id")?.Value;

    if (!int.TryParse(userIdString, out var userId))
    {
      return Results.Unauthorized();
    }

    var companies = await _companyDao.GetByUserId(userId);

    var data = companies.Select(company => new CompanyDto(
      company.Id,
      company.Name,
      company.CreatedAt
    ));

    return Results.Ok(new
    {
      status = true,
      data
    });
  }

  public async Task<IResult> GetByCompanyId(
    int companyId,
    ClaimsPrincipal currentUser
  )
  {
    var hasAccess = await HasCompanyAccess(
      companyId,
      currentUser
    );

    if (!hasAccess)
    {
      return Results.Forbid();
    }

    var companyUsers = await _dao.GetByCompanyId(companyId);

    var data = companyUsers.Select(companyUser => new CompanyUserDto(
      companyUser.Id,
      companyUser.UserId,
      companyUser.CompanyId,
      companyUser.CreatedAt
    ));

    return Results.Ok(new
    {
      status = true,
      data
    });
  }

  // Επιστρέφει πραγματικά User στοιχεία και όχι απλά CompanyUser relations.
  //
  // Ο ADMIN μπορεί να δει τους STAFF μόνο Company
  // στην οποία έχει πρόσβαση.
  //
  // Ο SUPERADMIN περνάει πάντα από το HasCompanyAccess.
  public async Task<IResult> GetStaffByCompanyId(
    int companyId,
    ClaimsPrincipal currentUser
  )
  {
    var hasAccess = await HasCompanyAccess(
      companyId,
      currentUser
    );

    if (!hasAccess)
    {
      return Results.Forbid();
    }

    var staffUsers = await _userDao.GetStaffByCompanyId(companyId);

    // UserSummaryDto → δεν στέλνουμε ποτέ HashedPassword.
    var data = staffUsers.Select(user => new UserSummaryDto(
      user.Id,
      user.Username,
      user.Name,
      user.Email,
      user.Role,
      user.CreatedAt,
      user.UpdatedAt
    ));

    return Results.Ok(new
    {
      status = true,
      data
    });
  }

  public async Task<IResult> Create(CreateCompanyUserDto dto)
  {
    var existing = await _dao.GetByUserAndCompany(
      dto.UserId,
      dto.CompanyId
    );

    if (existing is not null)
    {
      return Results.Conflict(new
      {
        status = false,
        message = "User already belongs to this company"
      });
    }

    var companyUser = new CompanyUser
    {
      UserId = dto.UserId,
      CompanyId = dto.CompanyId
    };

    var created = await _dao.Create(companyUser);

    var data = new CompanyUserDto(
      created.Id,
      created.UserId,
      created.CompanyId,
      created.CreatedAt
    );

    return Results.Created($"/company-users/{created.Id}", new
    {
      status = true,
      data
    });
  }

  // Ο ADMIN δημιουργεί νέο STAFF account για συγκεκριμένη Company.
  //
  // Η διαδικασία γίνεται σε ένα endpoint:
  //
  // 1. Ελέγχουμε ότι ο ADMIN έχει πρόσβαση στην Company.
  // 2. Ελέγχουμε ότι το username δεν υπάρχει.
  // 3. Δημιουργούμε User με Role = STAFF.
  // 4. Δημιουργούμε CompanyUser ώστε ο STAFF να συνδεθεί με την Company.
  //
  // Το frontend ΔΕΝ μπορεί να επιλέξει το role.
  // Το role STAFF ορίζεται αποκλειστικά από τον server.
  public async Task<IResult> CreateStaff(
    int companyId,
    CreateUserDto dto,
    ClaimsPrincipal currentUser
  )
  {
    var hasAccess = await HasCompanyAccess(
      companyId,
      currentUser
    );

    if (!hasAccess)
    {
      return Results.Forbid();
    }

    var existing = await _userDao.GetByUsername(dto.Username);

    if (existing is not null)
    {
      return Results.Conflict(new
      {
        status = false,
        message = "Username already taken"
      });
    }

    // ⚠️ δεν αποθηκεύουμε plain text password
    var hashed = BCrypt.Net.BCrypt.HashPassword(dto.Password);

    var staff = new User
    {
      Username = dto.Username,
      Name = dto.Name,
      Email = dto.Email,

      // Ο ADMIN δεν στέλνει role.
      // Αυτό το endpoint δημιουργεί ΠΑΝΤΑ STAFF.
      Role = "STAFF",

      HashedPassword = hashed
    };

    var createdStaff = await _userDao.Create(staff);

    var companyUser = new CompanyUser
    {
      UserId = createdStaff.Id,
      CompanyId = companyId
    };

    await _dao.Create(companyUser);

    return Results.Created($"/users/{createdStaff.Id}", new
    {
      status = true,
      data = new
      {
        createdStaff.Id,
        createdStaff.Username,
        createdStaff.Name,
        createdStaff.Email,
        createdStaff.Role,
        CompanyId = companyId
      }
    });
  }

  // Ο ADMIN μπορεί να αφαιρέσει STAFF μόνο από Company
  // στην οποία έχει ο ίδιος πρόσβαση.
  //
  // Ελέγχουμε ξανά ότι ο target user είναι STAFF,
  // ώστε αυτό το endpoint να μην μπορεί να αφαιρέσει
  // το ownership relation κάποιου ADMIN.
  //
  // ΠΡΟΣΟΧΗ:
  // Εδώ αφαιρούμε τη σχέση του STAFF με την Company.
  // Δεν διαγράφουμε το ίδιο το User account.
  public async Task<IResult> RemoveStaff(
    int companyId,
    int userId,
    ClaimsPrincipal currentUser
  )
  {
    var hasAccess = await HasCompanyAccess(
      companyId,
      currentUser
    );

    if (!hasAccess)
    {
      return Results.Forbid();
    }

    var user = await _userDao.GetById(userId);

    if (user is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "User not found"
      });
    }

    if (user.Role != "STAFF")
    {
      return Results.BadRequest(new
      {
        status = false,
        message = "Only STAFF users can be removed with this endpoint"
      });
    }

    var deleted = await _dao.DeleteByUserAndCompany(
      userId,
      companyId
    );

    if (deleted is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Staff user does not belong to this company"
      });
    }

    return Results.Ok(new
    {
      status = true,
      message = "Staff user removed from company"
    });
  }

  public async Task<IResult> Delete(int id)
  {
    var deleted = await _dao.Delete(id);

    if (deleted is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Company-user relation not found"
      });
    }

    return Results.Ok(new
    {
      status = true,
      message = "Company-user relation deleted"
    });
  }
}