# Auth notes
## USER
1. appSettings.json
πρώτα πρέπει να προσθέσουμε στα appSetings και development
```json
"JWT_SECRET": "JWT_SECRET_2102011895_6947733075"
```
πρέπει να είναι αρκετά μεγάλο

2. Context
```c#
// Το Entity Framework Core είναι ο “μεταφραστής” ανάμεσα στην C# και τη βάση δεδομένων. Εσύ γράφεις C#: _db.Users.ToListAsync(); και το Entity Framework το μεταφράζει σε SQL τύπου: SELECT * FROM Users;
using Microsoft.EntityFrameworkCore; //ORM - Object-Relational Mapper

// εδω η db μου είναι σαν μια ντουλάπα με συρτάρια. αργότερα στο dao κάνω private readonly MyTurnContext _db; για να έχω πρόσβαση στην db

public class MyTurnContext(DbContextOptions<MyTurnContext> options) : DbContext(options)
{
  public DbSet<User> Users => Set<User>();
}
```

3. Model 
```c#
// backend\auth\Models\User.cs
namespace backend.auth.Models;
// γιατι έχω model και dto που μοιάζουν να κάνουν τα ίδια? Θα μπορούσε να πεις κανεις οτι το Model είναι το πραγματικό αντικείμενο και τα dto η ταυτότητα του. Επίσης φτιαχνουμε πολλά διαφορετικά dto για την ίδια οντότητα αναλογα με το τι θέλουμε να φέρουμε και τι να κρύψουμε. πχ create, update, summary dto.  Το DTO είναι η μορφή με την οποία επιτρέπω στα δεδομένα να μπουν ή να βγουν από το API
public class User
{
  public int Id { get; set; }
  public required string Username { get; set; }
  public string? Name { get; set; }
  public string? Email { get; set; }
  public string Role { get; set; } = "USER";
  public required string HashedPassword { get; set; }
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
```
4. Dtos
```c#
// backend\auth\Dtos\CreateUserDto.cs
using System.ComponentModel.DataAnnotations;

namespace backend.auth.Dtos;
// δεν έχει id, role (είναι αυτόματα user), created at (φτιάχνετε αυτόματα)
// αλλα έχει plain text password γιατί είναι αυτό που μας στέλνει ο user. δεν θα αποθηκευτεί έτσι ομως. Εδω αυτό είναι μόνο για την μεταφορα κατα την δημιουργία
public record class CreateUserDto(
  [Required]
  string Username,

  string? Name,

  [EmailAddress]
  string? Email,

  [Required]
  [MinLength(6)]
  string Password
);
```

```c#
// backend\auth\Dtos\LoginUserDto.cs
using System.ComponentModel.DataAnnotations;
namespace backend.auth.Dtos;

// μόνο username password
public record class LoginUserDto
(
  [Required]
  [MinLength(3)]
  [MaxLength(50)]
  string Username,

  [Required]
  [MinLength(6)]
  [MaxLength(128)]
  string Password
);
```

```c#
// backend\auth\Dtos\UserSummaryDto.cs
namespace backend.auth.Dtos;

// δεν στέλνει καθόλου password (ούτε Plain Ούτε hashed)
public record UserSummaryDto(
  int Id,
  string Username,
  string? Name,
  string? Email,
  string Role,
  DateTime CreatedAt,
  DateTime  UpdatedAt
);
```

```c#
// backend\auth\Dtos\UpdateRoleDto.cs
namespace backend.auth.Dtos;

// η αλλαγή του να είναι self or admin protected
public record class UpdateRoleDto
(
  string Role
);
```

```c#
// backend\auth\Dtos\UpdateUserDto.cs
namespace backend.auth.Dtos;

// DTO για update → όλα optional 
// έχει όλα τα πεδία εκτός απο role γιατι πρέπει η αλλαγή του να είναι self or admin protected και γίνετε με άλλο endpoint update role
// το updated at το κάνει ο controller
public record UpdateUserDto(
  string? Username,
  string? Name,
  string? Email,
  string? Password
);
```

5. Daos
```c#
// backend\auth\Daos\UserDao.cs
using backend.auth.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.auth.Daos;

public class UserDao
{
  // φτιάχνω μια μεταβλητή που μέσα της θα βάλω την λειτουργικότητα της db. Στο ονομα βάζω _ γιατι είναι convention για τα private fields.
  private readonly MyTurnContext _db;

  // DI καλό την ίδια την UserDao μεσα στην οποία είμαστε ήδη μεσα. Η UserDao χρειάζεται για να δουλέψει ένα db, δεν το φτιάχνει με new αλλα βλέπει οτι υπάρχει στο περιβάλλον του προγραμματος (είναι δηλωμένο στην program με builder.Services.AddSqlite<MyTurnContext>(connString);)
  public UserDao(MyTurnContext db)
  {
    _db = db;
  }

  // εδω χρησιμοποιώ παντου type User γιατί αυτο το αρχείο μιλάει με την βάση απευθείας. τον ελεγχο με τα Dto τον κάνω στον controller


  // mapper DB → app (εδώ απλά επιστρέφουμε το entity)
  private static User Map(User user) => user;

  // GET ALL → .ToListAsync();
  public async Task<List<User>> GetAll()
  {
    var users = await _db.Users
      .AsNoTracking() //Φέρε μου τα δεδομένα μόνο για να τα διαβάσω. Μην τα παρακολουθείς για αλλαγές - μια φωτοτυπία της λίστας. Δεν σκοπεύω να την επεξεργαστώ..
      .ToListAsync();

    // Πάρε όλους τους users, πέρασε τον καθένα από τη Map, και ξανακανε τους λίστα. Αλλά επειδή η Map κάνει μόνο: User Map(User user) => user; αυτή η γραμμή είναι ουσιαστικά άχρηστη. Θα μπορούσα απλά: return users;
    return users.Select(Map).ToList();
  }

  // GET BY ID → .FindAsync(id)
  public async Task<User?> GetById(int id)
  {
    var user = await _db.Users.FindAsync(id);
    return user is null ? null : Map(user);
  }

  // GET BY USERNAME → .FirstOrDefaultAsync
  public async Task<User?> GetByUsername(string username)
  {
    var user = await _db.Users
      .FirstOrDefaultAsync(u => u.Username == username);

    return user is null ? null : Map(user);
  }

  // GET BY EMAIL
  public async Task<User?> GetByEmail(string email)
  {
    var user = await _db.Users
      .FirstOrDefaultAsync(user => user.Email == email);

    return user is null ? null : Map(user);
  }

  // CREATE → .Add
  public async Task<User> Create(User user)
  {
    _db.Users.Add(user);
    await _db.SaveChangesAsync();
    return user;
  }

  // UPDATE
  public async Task<User?> Update(int id, User updatedData)
  {
    // πρώτα ψάχνουμε να δούμε αν υπάρχει
    var user = await _db.Users.FindAsync(id);
    if (user is null) return null;

    user.Username = updatedData.Username;
    user.Name = updatedData.Name;
    user.Email = updatedData.Email;
    user.Role = updatedData.Role;
    user.HashedPassword = updatedData.HashedPassword;
    user.UpdatedAt = DateTime.UtcNow;

    await _db.SaveChangesAsync();
    return user;
  }

  // DELETE → .Remove
  public async Task<User?> Delete(int id)
  {
    var user = await _db.Users.FindAsync(id);
    if (user is null) return null;

    _db.Users.Remove(user);
    await _db.SaveChangesAsync();

    return user;
  }
}
```

6. User Controller (αλλο απο auth)
```c#
// backend\auth\Controllers\UserController.cs
using backend.auth.Daos;
using backend.auth.Dtos;
using backend.auth.Models;

namespace backend.auth.Controllers;

public class UserController
{
  // DI
  private readonly UserDao _dao;

  public UserController(UserDao dao)
  {
    _dao = dao;
  }

  // GET ALL
  public async Task<IResult> GetAll()
  {
    var users = await _dao.GetAll();

    // UserSummaryDto → δεν στέλνει καθόλου password (ούτε Plain Ούτε hashed)
    var data = users.Select(user => new UserSummaryDto(
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

  // GET BY ID
  public async Task<IResult> GetById(int id)
  {
    var user = await _dao.GetById(id);

    if (user is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "User not found"
      });
    }

    var dto = new UserSummaryDto(
      user.Id,
      user.Username,
      user.Name,
      user.Email,
      user.Role,
      user.CreatedAt,
      user.UpdatedAt
    );

    return Results.Ok(new
    {
      status = true,
      data = dto
    });
  }

  // CREATE (με check όπως node)
  // CreateUserDto → δεν έχει id, role (είναι αυτόματα user), created at (φτιάχνετε αυτόματα) αλλα έχει plain text password γιατί είναι αυτό που μας στέλνει ο user. δεν θα αποθηκευτεί έτσι ομως. Εδω αυτό είναι μόνο για την μεταφορα κατα την δημιουργία
  public async Task<IResult> Create(CreateUserDto newUser)
  {
    // check username exists
    var existing = await _dao.GetByUsername(newUser.Username);

    if (existing is not null)
    {
      return Results.Conflict(new
      {
        status = false,
        message = "Username already taken"
      });
    }

    // ⚠️ δεν αποθηκεύουμε plain text password
    var hashed = BCrypt.Net.BCrypt.HashPassword(newUser.Password);

    var user = new User
    {
      Username = newUser.Username,
      Name = newUser.Name,
      Email = newUser.Email,
      Role = "USER", // εδω μπαίνει το role που δεν έρχεται απο το dto. Πάντα πρώτα User και η αλλαγή είναι αναβάθμιση που κάνει ο admin με την  TODO
      HashedPassword = hashed
    };

    var created = await _dao.Create(user);

    // UserSummaryDto για την επιστροφή
    var dto = new UserSummaryDto(
      created.Id,
      created.Username,
      created.Name,
      created.Email,
      created.Role,
      created.CreatedAt,
      created.UpdatedAt
    );

    // οχι Results.Ok
    // Ο user δημιουργήθηκε επιτυχώς, γύρνα HTTP 201 Created. Το: $"/users/{created.Id}" βάζει στο response header το πού βρίσκεται ο νέος resource.
    return Results.Created($"/users/{created.Id}", new
    {
      status = true,
      data = dto
    });
  }

  // UPDATE
  // UpdateUserDto → έχει όλα τα πεδία εκτός απο role γιατι πρέπει η αλλαγή του να είναι self or admin protected και γίνετε με άλλο endpoint update role. Tο updated at το κάνει ο controller 
  public async Task<IResult> Update(int id, UpdateUserDto data)
  {
    var user = await _dao.GetById(id);

    if (user is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "User not found"
      });
    }

    // μπορώ με το update να φτιάξω νέο password αρα χρειαζομαι να το κάνω Hashed
    if (data.Password is not null)
    {
      user.HashedPassword = BCrypt.Net.BCrypt.HashPassword(data.Password);
    }

    user.Username = data.Username ?? user.Username;
    user.Name = data.Name ?? user.Name;
    user.Email = data.Email ?? user.Email;

    var updated = await _dao.Update(id, user);

    if (updated is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "User not found"
      });
    }

    var dto = new UserSummaryDto(
      updated.Id,
      updated.Username,
      updated.Name,
      updated.Email,
      updated.Role,
      updated.CreatedAt,
      updated.UpdatedAt
    );

    return Results.Ok(new
    {
      status = true,
      data = dto
    });
  }

  // UpdateRoleDto → η αλλαγή του να είναι self or admin protected
  public async Task<IResult> UpdateRole(int id, UpdateRoleDto dto)
  {
    var user = await _dao.GetById(id);

    if (user is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "user not found"
      });
    }

    // validate roles χωρίς enum
    var validRoles = new[] { "ADMIN", "STAFF", "USER" };

    if (!validRoles.Contains(dto.Role))
    {
      return Results.BadRequest(new
      {
        status = false,
        message = "Invalid role"
      });
    }

    user.Role = dto.Role;

    var updated = await _dao.Update(id, user);

    var data = new
    {
      updated!.Id,
      updated.Username,
      updated.Role
    };

    return Results.Ok(new
    {
      status = true,
      data = data
    });
  }

  // DELETE
  public async Task<IResult> Delete(int id)
  {
    var deleted = await _dao.Delete(id);

    if (deleted is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "User not found"
      });
    }

    return Results.Ok(new
    {
      status = true,
      message = $"User {deleted.Username} deleted"
    });
  }
}
```

7. AuthExtensions
Επειδή διάφορα endpoints του user είναι middleware protected πάμε να δουμε το πρώτα το extensions
```c#
// backend\auth\Extensions\AuthExtensions.cs
// Αυτό το αρχείο ρυθμίζει ΠΩΣ το backend καταλαβαίνει και ελέγχει JWT tokens
// 1. λέει στο .NET: "θα χρησιμοποιώ JWT authentication"
// 2. λέει: "όταν έρχεται request με token, έλεγξε το έτσι:"
// έλεγξε signature (IMPORTANT)
// έλεγξε αν έχει λήξει
// ΧΩΡΙΣ αυτό:
// [Authorize] δεν δουλεύει

// αυτό μου φτιάχνει και τα policies που καλώ στα endpoints. πχ
// group.MapPut("/{id}", async (int id, UserController controller) =>
// {
//   return await controller.Update(id, data);
// })
// .RequireAuthorization("AdminOnly");

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace backend.auth.Extensions;

// ολα static γιατι αφορούν όλο το πρόγραμμα και δεν χρειάζονται κάποιο entity instantiation
public static class AuthExtensions
{
  // Το this εδώ κάνει τη μέθοδο extension method, ώστε να φαίνεται σαν να ανήκει στο builder.Services
  // IServiceCollection services = το builder.Services. Είναι η λίστα όπου δηλώνεις τι μπορεί να δημιουργεί το .NET μέσω DI. Το this κάνει το AddJwtAuth() να καλείται έτσι: builder.Services.AddJwtAuth(...)
  public static void AddJwtAuth(this IServiceCollection services, IConfiguration config)
  {
    // απορία: γιατί διαβάζαμε το .env με άλλο τρόπο στην program.cs
    // IConfiguration config
    // Γιατί είναι δύο διαφορετικοί τρόποι ανάγνωσης configuration. Το: builder.Configuration.GetConnectionString("MyTurn"); είναι ειδικό helper για connection strings. Ψάχνει συγκεκριμένα εδώ:  "ConnectionStrings": { "MyTurn": "Data Source=MyTurn.db" } Ενώ το: config["JWT_SECRET"]; είναι γενική πρόσβαση σε οποιοδήποτε config key. Π.χ.: { "JWT_SECRET": "abc123" } Άρα: GetConnectionString("MyTurn") ≈ config["ConnectionStrings:MyTurn"] και config["JWT_SECRET"] ≈ config["JWT_SECRET"] Θα μπορούσες δηλαδή να γράψεις και: var connString = builder.Configuration["ConnectionStrings:MyTurn"]; Αλλα το άλλο είναι ειδικα φτιαγμένο για αυτή την χρήση στο program

    // ελεγχουμε αν έχω env jwt secret
    var secret = config["JWT_SECRET"];

    if (string.IsNullOrEmpty(secret))
    {
      throw new Exception("JWT_SECRET not configured");
    }

    // παίρνω το builder.Services και του προσθέτω 2 πράγματα → AddAuthentication και AddAuthorization με δύο policies (SelfOrAdmin - AdminOnly)
    // το δηλώνω στην program με builder.Services.AddJwtAuth(builder.Configuration);

    // Ρυθμίζει το authentication.
    services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
      .AddJwtBearer(options =>
      {
        // Κανόνες με τους οποίους θα ελέγχεται κάθε JWT token.
        // Δεν ελέγχουμε ποιος server εξέδωσε το token.
        // Δεν ελέγχουμε για ποιον προορίζεται το token.
        // Ελέγχουμε αν το token έχει λήξει.
        // Ελέγχουμε ότι η υπογραφή του token είναι σωστή.
        options.TokenValidationParameters = new TokenValidationParameters
        {
          ValidateIssuer = false,
          ValidateAudience = false,
          ValidateLifetime = true,
          ValidateIssuerSigningKey = true,
          // Το secret key που χρησιμοποιούμε για να ελέγξουμε την υπογραφή.
          IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(secret!)
          )
        };
      });

    // Εδώ ορίζουμε authorization rules/policies.
    services.AddAuthorization(options =>
    {
      // Policy: μπορεί να περάσει είτε ο ίδιος ο user είτε ADMIN.
      options.AddPolicy("SelfOrAdmin", policy =>
        policy.RequireAssertion(context =>
        {
          // Παίρνουμε το id του logged-in user από το JWT.
          var userId = context.User.FindFirst("id")?.Value;
          // Παίρνουμε το role από το JWT.
          var role = context.User.FindFirst(ClaimTypes.Role)?.Value;
          // Παίρνουμε το id από το URL. π.χ. /users/5 → routeId = "5"
          var routeId = context.Resource switch
          {
            HttpContext http => http.Request.RouteValues["id"]?.ToString(),
            _ => null
          };

          // Επιτρέπεται αν: 1. είναι ADMIN ή 2. ζητάει το δικό του user id.
          return role == "ADMIN" || userId == routeId;
        })
      );

      // Policy: επιτρέπεται μόνο ADMIN.
      options.AddPolicy("AdminOnly", policy =>
        policy.RequireRole("ADMIN")
      );
    });
  }
}
```

8. User Endpoints
```c#
// backend\auth\Endpoints\UserEndpoint.cs
using backend.auth.Controllers;
using backend.auth.Dtos;

namespace backend.auth.Endpoints;

public static class UserEndpoint
{
  public static void MapUsersEndpoints(this WebApplication app)
  {
    var group = app.MapGroup("/users");

    // GET /users → καλεί controller
    group.MapGet("/", async (UserController controller) =>
    {
      return await controller.GetAll();
    })
    .RequireAuthorization("AdminOnly");

    // GET /users/:id
    group.MapGet("/{id}", async (int id, UserController controller) =>
    {
      return await controller.GetById(id);
    })
    .RequireAuthorization("SelfOrAdmin");

    // POST /users
    group.MapPost("/", async (CreateUserDto newUser, UserController controller) =>
    {
      return await controller.Create(newUser);
    })
    .RequireAuthorization("AdminOnly");

    // PUT /users/:id
    // SELF OR ADMIN
    group.MapPut("/{id}", async (int id, UpdateUserDto data, UserController controller) =>
    {
      return await controller.Update(id, data);
    })
    .RequireAuthorization("SelfOrAdmin");


    // ADMIN ONLY
    group.MapPut("/{id}/role", async (int id, UpdateRoleDto dto, UserController controller) =>
    {
      return await controller.UpdateRole(id, dto);
    })
    .RequireAuthorization("AdminOnly");

    // DELETE /users/:id
    group.MapDelete("/{id}", async (int id, UserController controller) =>
    {
      return await controller.Delete(id);
    })
    .RequireAuthorization("SelfOrAdmin");
  }
}
```

## AUTH
9. Auth service

```c#
// backend\auth\Services\AuthService.cs
using System.Security.Claims;
using backend.auth.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace backend.auth.Services;

public class AuthService
{
  // IConfiguration → διαβάζει config από: - appSettings.json - appSettings.Development.json - environment variables
  // Node: process.env.JWT_SECRET  ← από .env
  // .NET: _config["JWT_SECRET"]  ← από appSettings ή env vars
  private readonly IConfiguration _config;

  // constructor injection (DI) → το .NET φτιάχνει το AuthService και περνάει το config αυτόματα
  // '_' = private field convention

  public AuthService(IConfiguration config)
  {
    _config = config;
  }

  /// <summary>
  /// GENERATE ACCESS TOKEN
  /// </summary>
  /// <param name="user"></param>
  /// <returns>token in string</returns>
  public string GenerateAccessToken(User user)
  {
    var secret = _config["JWT_SECRET"];

    if (string.IsNullOrEmpty(secret))
    {
      throw new Exception("no jwt");
    }

    // το convention στην C# είναι να ονομάζουν claims αυτο που σε js είναι payload
    var claims = new[]
    {
      new Claim("id", user.Id.ToString()),
      new Claim("username", user.Username),
      new Claim("role", user.Role),
      new Claim(ClaimTypes.Role, user.Role)
    };

    // παίρνει το secret και το μετατρέπει σε κλειδί για να δουλέψει με την βιβλιοθήκη όπως και το κάνει sign με Sha256
    // στο node ολα αυτά γίνονταν πολύ πιο ευκολα με  jwt.sign(payload, secret, options)
    // αν δεν το εμφανίζει το nuget είναι System.IdentityModel.Tokens.Jwt
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
      claims: claims,
      expires: DateTime.UtcNow.AddHours(1),
      signingCredentials: creds
    );

    var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

    return tokenString;
  }

  /// <summary>
  /// VERIFY PASSWORD
  /// </summary>
  /// <param name="password"></param>
  /// <param name="hashedPassword"></param>
  /// <returns>isVerified bool</returns>
  public bool VerifyPassword(string password, string hashedPassword)
  {
    var isVerified = BCrypt.Net.BCrypt.Verify(password, hashedPassword);
    return isVerified;
  }


  /// <summary>
  /// VERIFY TOKEN
  /// </summary>
  /// <param name="token"></param>
  /// <returns>επιστρέφει δύο πράγματα. Ένα boolean αν πέρασε τον έλεγχο και ένα αντικείμενο με τα claims του user ή error message</returns>
  // tuple return: επιστρέφουμε πολλαπλές τιμές (bool + data) με ονόματα για readability
  // αντί για object/class, εδώ χρησιμοποιούμε (bool verified, object data)
  public (bool verified, object data) VerifyAccessToken(string token)
  {
    var secret = _config["JWT_SECRET"];
    if (string.IsNullOrEmpty(secret))
    {
      throw new Exception("jwt secret not defined");
    }

    // σε node γίνονταν με μια γραμμή 
    // JwtSecurityTokenHandler → class της βιβλιοθήκης που κάνει parse / validate JWT
    var tokenHandler = new JwtSecurityTokenHandler();
    // secret (string) → πρέπει να γίνει bytes για crypto operations
    var key = Encoding.UTF8.GetBytes(secret);

    try
    {
      var validationParameters = new TokenValidationParameters
      {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key)
      };

      // System.IdentityModel.Tokens.Jwt
      // ValidateToken:
      // 1. παίρνει το JWT string (token)
      // 2. το ελέγχει (signature, expiry, κτλ) με βάση τα validationParameters
      // 3. αν είναι valid → επιστρέφει ClaimsPrincipal (δηλαδή το decoded payload του χρήστη)
      // 4. μέσω του `out validatedToken` επιστρέφει και το raw parsed token object (αν χρειαστεί)
      //
      // εδώ:
      // - userClaimsPayload = τα claims του χρήστη (id, username, role κτλ)
      // out: δεν επιστρέφουμε κάτι
      var userClaimsPayload = tokenHandler.ValidateToken(token, validationParameters, out _);

      return (true, userClaimsPayload.Claims);
    }
    catch (Exception ex)
    {
      return (false, ex.Message);
    }
  }

  /// <summary>
  /// EXTRACT TOKEN FROM REQUEST
  /// </summary>
  /// <param name="request"></param>
  /// <returns>ένα string (αν υπάρχει) με το token χωρίς το "Bearer "</returns>
  public string? GetTokenFrom(HttpRequest request)
  {
    var authorization = request.Headers.Authorization.FirstOrDefault();

    if (authorization != null && authorization.StartsWith("Bearer "))
    {
      return authorization.Substring("Bearer ".Length).Trim();
    }
    return null;
  }
}
```

10. auth controller
```c#
// backend\auth\Controllers\AuthController.cs
using backend.auth.Daos;
using backend.auth.Dtos;
using backend.auth.Models;
using backend.auth.Services;

namespace backend.auth.Controllers;

// DI → στο program έχω 
// builder.Services.AddScoped<UserDao>();
// builder.Services.AddScoped<AuthService>();
public class AuthController
{
  private readonly UserDao _dao;
  private readonly AuthService _authService;

  // DI
  public AuthController(UserDao dao, AuthService authService)
  {
    _dao = dao;
    _authService = authService;
  }


  /// <summary>
  /// Register
  /// </summary>
  /// <param name="dto"></param>
  /// <returns>
  /// IResult:
  /// - 201 Created → όταν δημιουργηθεί επιτυχώς ο user (επιστρέφει status + user data)
  /// - 409 Conflict → όταν το username υπάρχει ήδη
  /// </returns>
  // το Task<IResult> είναι το return type και ειναι το αντίστοιχο του Promise
  public async Task<IResult> Register(CreateUserDto dto)
  {
    // check username exists
    // εδώ ΔΕΝ έχουμε req.body όπως στο Node
    // το dto.Username έρχεται ήδη parsed από το JSON body μέσω model binding
    // δηλαδή το ASP.NET παίρνει το request.body και το μετατρέπει αυτόματα σε CreateUserDto
    // οπότε δουλεύουμε απευθείας με dto αντί για req.body.username
    var existing = await _dao.GetByUsername(dto.Username);

    if (existing is not null)
    {
      return Results.Conflict(new
        {
         status = false,
         message = "Username already taken" 
        }
      );
    };

    // hash password
    var hashed = BCrypt.Net.BCrypt.HashPassword(dto.Password);

    var user = new User
    {
      Username = dto.Username,
      Name = dto.Name,
      Email = dto.Email,
      Role = "USER",
      HashedPassword = hashed
    };

    var created = await _dao.Create(user);

    // "/users/{created.Id}" → Location header (που δημιουργήθηκε ο resource)
    return Results.Created($"/users/{created.Id}", new
    {
      status = true,
      data = new
      {
        created.Id,
        created.Username,
        created.Name,
        created.Email,
        created.Role
      }
    });
  }

  /// <summary>
  /// Login χρήστη.
  /// Ελέγχει αν υπάρχει ο χρήστης, επαληθεύει το password (bcrypt)
  /// και επιστρέφει JWT token μαζί με basic user info.
  /// </summary>
  /// <param name="dto">Username + Password από το request body</param>
  /// <returns>
  /// 200 OK → token + user data
  /// 401 Unauthorized → λάθος credentials
  /// </returns>
  public async Task<IResult> Login(LoginUserDto dto)
  {
    var user = await _dao.GetByUsername(dto.Username);

    if (user is null)
    {
      return Results.Json(new
      {
        status = false,
        message = "Invalid username or password"
      }, statusCode: 401);
    }

    var isMatch = _authService.VerifyPassword(dto.Password, user.HashedPassword);

    if (!isMatch)
    {
      return Results.Json(new
      {
        status = false,
        message = "Invalid username or password"
      }, statusCode: 401);
    }

    var token = _authService.GenerateAccessToken(user);
    var userData = new
    {
      token,
      user = new
      {
        user.Id,
        user.Username,
        user.Name,
        user.Email,
        user.Role
      }
    };

    return Results.Ok(new
    {
      status = true,
      message = "user logged in successfully",
      data = userData
    });
  }

  /// <summary>
  /// Ανανεώνει το JWT token χρήστη.
  /// Παίρνει το υπάρχον token από το Authorization header,
  /// το επαληθεύει και εκδίδει νέο.
  /// </summary>
  /// <param name="request">
  /// Το HTTP request που περιέχει το Authorization header (Bearer token)
  /// </param>
  /// <returns>
  /// 200 OK → νέο token
  /// 401 Unauthorized → αν το token λείπει, είναι invalid ή ο χρήστης δεν βρεθεί
  /// </returns>
  public async Task<IResult> RefreshToken(HttpRequest request)
  {
    //extract token
    var token = _authService.GetTokenFrom(request);

    if (string.IsNullOrEmpty(token))
    {
      return Results.Json(new
      {
        status = false
      }, statusCode: 401);
    }

    //verify token
    var verification = _authService.VerifyAccessToken(token);

    if (!verification.verified)
    {
      return Results.Json(new
      {
        status = false
      }, statusCode: 401);
    }

    // get username from Claims/payload
    var claims = verification.data as IEnumerable<System.Security.Claims.Claim>;
    var username = claims?.First(c => c.Type == "username").Value;

    if (string.IsNullOrEmpty(username))
    {
      return Results.Json(new
      {
        status = false
      }, statusCode: 401);
    }

    // fetch user
    var dbUser = await _dao.GetByUsername(username);

    if (dbUser is null)
    {
      return Results.Json(new
      {
        status = false
      }, statusCode: 401);
    }

    var newToken = _authService.GenerateAccessToken(dbUser);

    return Results.Ok(new
    {
      status = true,
      data = new { token = newToken }
    });
  }
}
```

11. Auth endpoints
```c#
// backend-csharp\Endpoints\AuthEndpoints.cs

using backend.auth.Controllers;
using backend.auth.Dtos;

namespace backend.auth.Endpoints;

public static class AuthEndpoints
{
  public static void MapAuthEndpoints(this WebApplication app)
  {
    var group = app.MapGroup("/auth");

    //Register 
    //POST /auth
    group.MapPost("/register", async (CreateUserDto dto, AuthController controller) =>
    {
      return await controller.Register(dto);
    });

    //login
    // POST /login
    group.MapPost("/login", async (LoginUserDto dto, AuthController controller) =>
    {
      return await controller.Login(dto);
    });

    //refresh token
    // POST  /refresh
    group.MapPost("/refresh", async (HttpRequest request, AuthController controller) =>
      await controller.RefreshToken(request)
    )
    .RequireAuthorization();
  }
};
```

12. program.cs
```c#
// backend\Program.cs

using backend;
using backend_csharp.Controllers;
using backend_csharp.Endpoints;
using backend.auth.Extensions;
using backend.auth.Services;
using backend.auth.Controllers;
using backend.auth.Daos;
using backend.auth.Endpoints;

var builder = WebApplication.CreateBuilder(args);

// για να βάζω [required] etc
builder.Services.AddValidation();
builder.Services.AddScoped<LogController>();
builder.Services.AddScoped<CompanyDao>();
builder.Services.AddScoped<CompanyController>();
builder.Services.AddScoped<UserDao>();
builder.Services.AddScoped<UserController>();
builder.Services.AddScoped<AuthController>();
builder.Services.AddScoped<AuthService>();

builder.Services.AddJwtAuth(builder.Configuration);

builder.Services.AddCors( options =>
{
  options.AddPolicy("AllowedFrontend", policy =>
  {
    policy
      .WithOrigins(
        "http://localhost:8081",
        "http://localhost:5173"
      )
      .AllowAnyHeader()
      .AllowAnyMethod();
  });
});

var connString  = builder.Configuration.GetConnectionString("MyTurn");
builder.Services.AddSqlite<MyTurnContext>(connString);

var app = builder.Build();
app.UseCors("AllowedFrontend");

app.MigrateDb();
// για να κάνουμε server τα static pages που έχω στο wwwroot
app.UseStaticFiles();

app.MapGet("/", () => "Hello World!");
app.MapGet("/health", () => "ok");
app.MapGet("/api/ping", () =>
{
  System.Console.WriteLine("someone pinged here");
  return "Pong";
});
app.MapFrontLogEndpoints();
app.MapCompanyEndpoints();

app.UseAuthentication();
app.UseAuthorization();

app.MapUsersEndpoints();
app.MapAuthEndpoints();

app.Urls.Add("http://localhost:3020");
app.Run();
```

13. ⚠️⚠️⚠️ 
θα χρειαστώ `dotnet ef migrations add AddUsers --output-dir Data\Migrations`

## Super admin
Added a new global `SUPERADMIN` role for the platform owner.

Roles are now:
- `SUPERADMIN` → full platform access across all companies
- `ADMIN` → manages only assigned companies
- `STAFF` → works on a location/desk
- `USER` → normal customer, can later view personal ticket history

Changes made:
- Added `SuperAdminOnly` authorization policy.
- Updated `AdminOnly` so `SUPERADMIN` is also allowed.
- Updated `SelfOrAdmin` so `SUPERADMIN` is also allowed.
- Kept normal role updates limited to:
  - `ADMIN`
  - `STAFF`
  - `USER`
- Added a separate endpoint for promotion to `SUPERADMIN`:
PUT /users/{id}/superadmin

Protected with:
.RequireAuthorization("SuperAdminOnly");

The first SUPERADMIN was bootstrapped manually by temporarily removing the endpoint protection, promoting the initial user, then restoring SuperAdminOnly.