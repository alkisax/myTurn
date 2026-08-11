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
  /// Register ADMIN
  /// </summary>
  /// <param name="dto"></param>
  /// <returns>
  /// IResult:
  /// - 201 Created → όταν δημιουργηθεί επιτυχώς ο user (επιστρέφει status + user data)
  /// - 409 Conflict → όταν το username υπάρχει ήδη
  /// </returns>
  // το Task<IResult> είναι το return type και ειναι το αντίστοιχο του Promise
  //
  // Αυτό είναι το registration του βασικού χρήστη της εφαρμογής.
  // Ο χρήστης που δημιουργεί account για να στήσει Companies,
  // Locations κλπ δημιουργείται αυτόματα ως ADMIN.
  public async Task<IResult> RegisterAdmin(CreateUserDto dto)
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
      });
    }

    // hash password
    var hashed = BCrypt.Net.BCrypt.HashPassword(dto.Password);

    var user = new User
    {
      Username = dto.Username,
      Name = dto.Name,
      Email = dto.Email,

      // Το role ΔΕΝ έρχεται από το frontend.
      Role = "ADMIN",

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
  /// Register απλού USER / πελάτη.
  /// </summary>
  //
  // Ο USER είναι ο τελικός πελάτης της εφαρμογής.
  // Αργότερα θα μπορεί να βλέπει το προσωπικό ticket history του.
  //
  // Δεν συνδέεται με CompanyUser.
  public async Task<IResult> RegisterUser(CreateUserDto dto)
  {
    var existing = await _dao.GetByUsername(dto.Username);

    if (existing is not null)
    {
      return Results.Conflict(new
      {
        status = false,
        message = "Username already taken"
      });
    }

    var hashed = BCrypt.Net.BCrypt.HashPassword(dto.Password);

    var user = new User
    {
      Username = dto.Username,
      Name = dto.Name,
      Email = dto.Email,

      // Το role ορίζεται αποκλειστικά server-side.
      Role = "USER",

      HashedPassword = hashed
    };

    var created = await _dao.Create(user);

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