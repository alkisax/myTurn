// backend\auth\Endpoints\AuthEndpoints.cs

using backend.auth.Controllers;
using backend.auth.Dtos;

namespace backend.auth.Endpoints;

public static class AuthEndpoints
{
  public static void MapAuthEndpoints(this WebApplication app)
  {
    var group = app.MapGroup("/auth");


    // Register ADMIN
    // Αυτό είναι το βασικό registration κάποιου που χρησιμοποιεί
    // το MyTurn για να δημιουργήσει Companies.
    //
    // POST /auth/register-admin
    group.MapPost("/register-admin", async (
      CreateUserDto dto,
      AuthController controller
    ) =>
    {
      return await controller.RegisterAdmin(dto);
    });


    // Register απλού USER / πελάτη
    //
    // POST /auth/register-user
    group.MapPost("/register-user", async (
      CreateUserDto dto,
      AuthController controller
    ) =>
    {
      return await controller.RegisterUser(dto);
    });


    //login
    // POST /login
    //
    // Το ίδιο login χρησιμοποιείται για ADMIN / STAFF / USER / SUPERADMIN.
    // Το frontend αργότερα θα βλέπει το role και θα ανοίγει
    // το αντίστοιχο interface.
    group.MapPost("/login", async (
      LoginUserDto dto,
      AuthController controller
    ) =>
    {
      return await controller.Login(dto);
    });


    //refresh token
    // POST /refresh
    group.MapPost("/refresh", async (
      HttpRequest request,
      AuthController controller
    ) =>
      await controller.RefreshToken(request)
    )
    .RequireAuthorization();
  }
}