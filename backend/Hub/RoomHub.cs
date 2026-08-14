using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

public class QueueHub : Hub
{
  public override async Task OnConnectedAsync()
  {
    // με override αλλάζω default behavior του Hub lifecycle
    Console.WriteLine(
      $"🔌 SignalR connected: {Context.ConnectionId}"
    );

    // τρέξε και το normal internal SignalR behavior
    await base.OnConnectedAsync();
  }

  // Αυτό το βήμα είναι σημαντικό γιατί:
  // disconnect δεν είναι "method που καλεί ο client"
  // είναι lifecycle event του Hub.
  public override async Task OnDisconnectedAsync(
    Exception? exception
  )
  {
    Console.WriteLine(
      $"❌ SignalR disconnected: {Context.ConnectionId}"
    );

    // Δεν χρειάζεται να αφαιρέσουμε manually τον client
    // από τα SignalR Groups.
    //
    // Το SignalR αφαιρεί αυτόματα το connection
    // από όλα τα groups όταν γίνει disconnect.
    await base.OnDisconnectedAsync(exception);
  }

  /// <summary>
  /// Ο client αρχίζει να παρακολουθεί realtime
  /// μία συγκεκριμένη Queue.
  ///
  /// πχ queueId = 5
  /// group = "queue-5"
  /// </summary>
  public async Task JoinQueue(int queueId)
  {
    // Δεν χρησιμοποιούμε σκέτο "5" σαν group name.
    // Με το prefix είναι ξεκάθαρο τι αντιπροσωπεύει.
    var groupName = $"queue-{queueId}";

    // Context.ConnectionId:
    // ποιος συγκεκριμένος connected client μπαίνει στο group.
    await Groups.AddToGroupAsync(
      Context.ConnectionId,
      groupName
    );

    Console.WriteLine(
      $"🫂 {Context.ConnectionId} joined {groupName}"
    );
  }

  /// <summary>
  /// Ο client σταματάει να παρακολουθεί
  /// μία συγκεκριμένη Queue.
  /// </summary>
  public async Task LeaveQueue(int queueId)
  {
    var groupName = $"queue-{queueId}";

    // Αφαιρούμε το συγκεκριμένο connection
    // από το realtime group της Queue.
    await Groups.RemoveFromGroupAsync(
      Context.ConnectionId,
      groupName
    );

    Console.WriteLine(
      $"🚪 {Context.ConnectionId} left {groupName}"
    );
  }
}