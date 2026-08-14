// backend\Hub\RoomHub.cs

// Για να δουλέψει το SignalR, στο Program.cs χρειαζόμαστε:
// using backend.Hubs;
// builder.Services.AddSignalR();
// app.MapHub<QueueHub>("/queue-hub"); // Όποιος SignalR client συνδεθεί στο /queue-hub, θα εξυπηρετείται από την QueueHub
// Και επειδή το frontend κάνει persistent connection, στο CORS policy χρειαζόμαστε:
// .AllowCredentials();

using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

// 🌷 1. αρχικοποίηση

// Το QueueHub είναι ένα SignalR Hub.
// Hub = class που λειτουργεί σαν realtime endpoint.
// Οι clients μπορούν να συνδεθούν σε αυτό και να καλούν public methods του.
// Στο MyTurn χρησιμοποιούμε το Hub κυρίως για:
// - να μπαίνουν clients σε groups ανά Queue
// - να λαμβάνουν realtime updates για το "Now Serving"
// Το Hub ΔΕΝ είναι REST controller. Δεν κάνουμε GET/POST πάνω στις methods του.
// Ο SignalR client συνδέεται στο /queue-hub και μετά κάνει invoke methods πάνω στο Hub.
public class QueueHub : Hub // Αυτή η class κληρονομεί όλη τη realtime υποδομή του SignalR
{
  // 🌷 2. Τι γίνεται όταν συνδέεται ένας client

  // Το OnConnectedAsync είναι lifecycle method του SignalR.
  // Lifecycle method σημαίνει: δεν την καλούμε εμείς από controller ή frontend. Την καλεί αυτόματα το SignalR όταν ένας client δημιουργήσει επιτυχώς connection με το Hub.
  // πχ frontend: await connection.start() όταν ολοκληρωθεί η σύνδεση, το SignalR θα εκτελέσει αυτόματα αυτή τη method.
  // με override αλλάζω default behavior του Hub lifecycle
  public override async Task OnConnectedAsync()
  {
    // Context = πληροφορίες για την τρέχουσα SignalR σύνδεση.
    // ConnectionId = μοναδικό id για ΑΥΤΗ τη συγκεκριμένη σύνδεση.
    // Δεν είναι UserId. Αν ο ίδιος χρήστης ανοίξει 2 tabs, θα έχει 2 διαφορετικά ConnectionIds
    Console.WriteLine($"🔌 SignalR connected: {Context.ConnectionId}");

    // Η Hub class έχει ήδη δικό της default implementation για το OnConnectedAsync. Επειδή κάναμε override, βάζουμε το δικό μας behavior αλλά μετά αφήνουμε να τρέξει και το normal behavior/ της parent class Hub.
    await base.OnConnectedAsync();
  }

  // 🌷 Βήμα 3 - Τι γίνεται όταν αποσυνδέεται ένας client
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

    // Το OnDisconnectedAsync είναι επίσης lifecycle method. Δεν το καλεί το frontend
    // Δεν χρειάζεται να αφαιρέσουμε manually τον client από τα SignalR Groups.
    // Το SignalR αφαιρεί αυτόματα το connection από όλα τα groups όταν γίνει disconnect.
    // Αυτό μπορεί να συμβεί επειδή: - ο χρήστης έκλεισε τη σελίδα - έκλεισε η εφαρμογή - χάθηκε το internet - σταμάτησε ο server - έκλεισε κανονικά το SignalR connection
    await base.OnDisconnectedAsync(exception);
  }


  // 🌷 4. — JoinQueue() και SignalR Groups - Τώρα βάζουμε το πρώτο method που όντως καλεί το frontend.
  /// Ο client αρχίζει να παρακολουθεί realtime μία συγκεκριμένη Queue.
  /// Το frontend καλεί → connection.invoke("JoinQueue", queueId)
  /// πχ queueId = 5
  /// group = "queue-5"
  public async Task JoinQueue(int queueId)
  {
    // Δεν χρησιμοποιούμε σκέτο "5" σαν group name. Με το prefix είναι ξεκάθαρο τι αντιπροσωπεύει.
    var groupName = $"queue-{queueId}";

    // Context.ConnectionId: ποιος συγκεκριμένος connected client μπαίνει στο group.
    // "βάλε ΑΥΤΟ το connection μέσα σε ΑΥΤΟ το group".
    // πχ frontend → await connection.invoke('JoinQueue', 5)
    await Groups.AddToGroupAsync(
      Context.ConnectionId,
      groupName
    );

    Console.WriteLine(
      $"🫂 {Context.ConnectionId} joined {groupName}"
    );
  }

  // 🌷 5. LeaveQueue()
  // Ο client σταματάει να παρακολουθεί μία συγκεκριμένη Queue.
  // frontend καλεί → connection.invoke("LeaveQueue", queueId)
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

/*
🌷 Πώς χρησιμοποιείται το SignalR στο MyTurn

Το QueueHub από μόνο του ΔΕΝ αποφασίζει πότε αλλάζει η Queue.
Απλώς κρατάει τις realtime connections και οργανώνει τους clients σε groups.

Όταν ο STAFF πατήσει Next, το TicketController:
1. κάνει claim το επόμενο WAITING ticket
2. το ticket αποθηκεύεται ως SERVING
3. μετά το επιτυχημένο DB commit στέλνουμε SignalR event:

await _hubContext.Clients
  .Group($"queue-{ticket.QueueId}")
  .SendAsync("NowServingChanged", new
  {
    ticket.Number,
    DeskId = session.DeskId,
    ticket.QueueId
  });

Αυτό σημαίνει:
"στείλε το event NowServingChanged σε ΟΛΑ τα connections
που έχουν κάνει JoinQueue() για αυτή την Queue".

Παράδειγμα:
queueId = 5
group = "queue-5"

Αν 3 οθόνες παρακολουθούν την queue-5
και ο STAFF πάρει το ticket #42,
και οι 3 θα λάβουν αμέσως κάτι σαν:

{
  number: 42,
  deskId: 2,
  queueId: 5
}


🌷 Τι χρειάζεται το frontend

1. Δημιουργεί SignalR connection στο /queue-hub:
const connection = new signalR.HubConnectionBuilder()
  .withUrl('/queue-hub')
  .withAutomaticReconnect()
  .build()

2. Ακούει το event που στέλνει ο backend:
connection.on('NowServingChanged', (data) => {
  console.log(data.number)
})

3. Ανοίγει τη σύνδεση:
await connection.start()

4. Μπαίνει στο group της Queue:
await connection.invoke('JoinQueue', 5)

Από αυτό το σημείο και μετά,
όταν ο backend στείλει NowServingChanged στο queue-5,
ο client θα το λάβει αμέσως.

Αν ο client αλλάξει Queue χωρίς να κλείσει το socket:
await connection.invoke('LeaveQueue', 5)
await connection.invoke('JoinQueue', 8)

Αν κλείσει εντελώς η σύνδεση,
το SignalR τον αφαιρεί αυτόματα από όλα τα groups.

Συνοπτικά:
QueueHub
→ οργανώνει connections και groups
TicketController
→ ξέρει ότι συνέβη business event
→ κάνει το emit
Frontend
→ κάνει JoinQueue()
→ ακούει το NowServingChanged
→ ενημερώνει αμέσως την οθόνη
*/