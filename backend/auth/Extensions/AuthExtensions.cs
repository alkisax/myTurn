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
      // Policy: μπορεί να περάσει είτε ο ίδιος ο user είτε (super)ADMIN.
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

          // Επιτρέπεται αν: 1. είναι SUPERADMIN 2. ADMIN ή 3. ζητάει το δικό του user id.
          return role == "SUPERADMIN"
            || role == "ADMIN"
            || userId == routeId;
        })
      );

      // Policy: επιτρέπεται μόνο ADMIN.
      options.AddPolicy("AdminOnly", policy =>
        policy.RequireRole("ADMIN", "SUPERADMIN")
      );

      options.AddPolicy("StaffOrAdmin", policy =>
        policy.RequireRole("STAFF", "ADMIN", "SUPERADMIN")
      );

      // Policy: επιτρέπεται μόνο SUPERADMIN.
      options.AddPolicy("SuperAdminOnly", policy =>
        policy.RequireRole("SUPERADMIN")
      );
    });
  }
}
