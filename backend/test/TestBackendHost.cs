using System.Diagnostics;
using System.Net;
using System.Runtime.CompilerServices;
using Xunit.Sdk;

namespace MyTurn.Backend.Tests;

internal static class TestBackendHost
{
  private static Process? process;

  [ModuleInitializer]
  internal static void Initialize()
  {
    Start();
  }

  private static void Start()
  {
    var backendDirectory = FindBackendDirectory();
    var databasePath = Path.Combine(backendDirectory, "myturn.test.db");

    StopExistingBackend();
    DeleteTestDatabase(databasePath);

    var startInfo = new ProcessStartInfo
    {
      FileName = "dotnet",
      Arguments = $"\"{Path.Combine(backendDirectory, "bin", "Debug", "net10.0", "backend.dll")}\"",
      WorkingDirectory = backendDirectory,
      UseShellExecute = false,
      CreateNoWindow = true
    };
    startInfo.Environment["ASPNETCORE_ENVIRONMENT"] = "Test";
    startInfo.Environment["DOTNET_ENVIRONMENT"] = "Test";
    startInfo.Environment["ASPNETCORE_URLS"] = "http://localhost:3020";

    process = Process.Start(startInfo)
      ?? throw new XunitException("Could not start the Test-environment backend.");

    AppDomain.CurrentDomain.ProcessExit += (_, _) => StopProcess();
    WaitForHealth();
  }

  private static string FindBackendDirectory()
  {
    var directory = new DirectoryInfo(AppContext.BaseDirectory);
    while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "backend.csproj")))
    {
      directory = directory.Parent;
    }

    if (directory is null)
    {
      throw new XunitException("Could not locate backend.csproj for the Test backend.");
    }

    var backendDll = Path.Combine(directory.FullName, "bin", "Debug", "net10.0", "backend.dll");
    if (!File.Exists(backendDll))
    {
      throw new XunitException("backend.dll is missing. Run dotnet build backend/backend.csproj first.");
    }

    return directory.FullName;
  }

  private static void WaitForHealth()
  {
    using var client = new HttpClient { BaseAddress = new Uri("http://localhost:3020") };
    for (var attempt = 0; attempt < 60; attempt++)
    {
      try
      {
        var response = client.GetAsync("/health").GetAwaiter().GetResult();
        if (response.StatusCode == HttpStatusCode.OK) return;
      }
      catch (HttpRequestException)
      {
        // The server is still starting.
      }

      Thread.Sleep(250);
    }

    StopProcess();
    throw new XunitException("Test backend did not become healthy at http://localhost:3020.");
  }

  private static void DeleteTestDatabase(string databasePath)
  {
    foreach (var path in new[] { databasePath, databasePath + "-shm", databasePath + "-wal" })
    {
      if (File.Exists(path)) File.Delete(path);
    }
  }

  private static void StopExistingBackend()
  {
    foreach (var candidate in Process.GetProcessesByName("backend"))
    {
      try
      {
        if (candidate.MainModule?.FileName?.Contains(Path.Combine("myTurn", "backend"), StringComparison.OrdinalIgnoreCase) == true)
        {
          candidate.Kill(entireProcessTree: true);
          candidate.WaitForExit(5000);
        }
      }
      catch (InvalidOperationException) { }
      catch (System.ComponentModel.Win32Exception) { }
    }
  }

  private static void StopProcess()
  {
    try
    {
      if (process is { HasExited: false })
      {
        process.Kill(entireProcessTree: true);
        process.WaitForExit(5000);
      }
    }
    catch (InvalidOperationException) { }
  }
}
