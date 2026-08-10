// backend-csharp\Endpoints\AuthEndpoints.cs

using backend_csharp.Controllers;
using backend_csharp.Dtos;

namespace backend_csharp.Endpoints;

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
