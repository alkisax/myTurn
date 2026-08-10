// backend\auth\Services\AuthService.cs
using System.Security.Claims;
using backend_csharp.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace backend_csharp.Services;

public class AuthService
{
  // IConfiguration → διαβάζει config από: - appsettings.json - appsettings.Development.json - environment variables
  // Node: process.env.JWT_SECRET  ← από .env
  // .NET: _config["JWT_SECRET"]  ← από appsettings ή env vars
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
    var Claims = new[]
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
      claims: Claims,
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
