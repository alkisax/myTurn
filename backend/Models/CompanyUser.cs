// backend\Models\CompanyUser.cs

namespace Backend;

/*
  CompanyUser
  Αυτή η οντότητα είναι ο ενδιάμεσος πίνακας που συνδέει έναν User με μία Company.
  Τον χρειαζόμαστε επειδή το Role από μόνο του ΔΕΝ αρκεί για authorization.
  Παράδειγμα:
    User:
      Id = 10
      Role = "ADMIN"
  Αυτό μας λέει μόνο ότι ο χρήστης είναι ADMIN.
  ΔΕΝ μας λέει ποια εταιρεία έχει δικαίωμα να διαχειρίζεται.

  Με CompanyUser μπορούμε να έχουμε:
    User 10 → Company 1
    User 10 → Company 3
  Άρα ο συγκεκριμένος ADMIN μπορεί να έχει πρόσβαση στις Company 1 και 3,
  αλλά όχι στην Company 2.

  Ένας ADMIN μπορεί να συνδέεται με πολλές Companies.
  Μία Company μπορεί επίσης να έχει περισσότερους από έναν ADMIN.
  SECURITY ISSUE ΠΟΥ ΠΡΕΠΕΙ ΝΑ ΛΥΘΕΙ:
  Αυτή τη στιγμή το authorization ελέγχει κυρίως το role:
    .RequireAuthorization("AdminOnly")
  Αυτό σημαίνει ότι οποιοσδήποτε ADMIN θα μπορούσε θεωρητικά να κάνει request όπως:
    GET /locations/company/999
  και να δει ή να αλλάξει δεδομένα μιας Company που δεν του ανήκει.
  Άρα αργότερα, στα protected endpoints, δεν αρκεί να ελέγχουμε:
    user.Role == "ADMIN"
  Πρέπει επίσης να ελέγχουμε ότι υπάρχει CompanyUser record με:
    UserId == loggedInUserId
    CompanyId == requestedCompanyId
  Ο SUPERADMIN αποτελεί εξαίρεση:
  έχει global πρόσβαση σε όλες τις Companies και δεν χρειάζεται CompanyUser relation.
  Επομένως η authorization λογική θα είναι περίπου:
    SUPERADMIN
      → allow
    ADMIN
      → allow μόνο αν υπάρχει CompanyUser(UserId, CompanyId)
    STAFF / USER
      → διαφορετικοί κανόνες που θα οριστούν αργότερα
  Το CompanyUser επομένως δεν είναι απλά relationship table.
  Είναι βασικό μέρος του access control της εφαρμογής.
*/


// ΝΕΑ ΧΡΗΣΗ:
// Το CompanyUser πλέον χρησιμοποιείται και για STAFF.
//
// Παράδειγμα:
//
//   Admin Alkis → Company 1
//   Staff Maria → Company 1
//
// Και οι δύο έχουν CompanyUser relation με την Company 1,
// αλλά τα permissions τους παραμένουν διαφορετικά επειδή καθορίζονται
// από το User.Role.
//
// ADMIN → διαχειρίζεται την company.
// STAFF → μπορεί αργότερα να εργαστεί σε location/desk της company.
//
// Ένας ADMIN μπορεί να προσθέσει STAFF μόνο σε company
// στην οποία έχει ο ίδιος πρόσβαση.
//
// Ένας απλός ADMIN ΔΕΝ πρέπει μέσω CompanyUser endpoint
// να μπορεί να προσθέτει αυθαίρετα άλλους ADMIN ή SUPERADMIN.


public class CompanyUser
{
  public int Id { get; set; }

  public int UserId { get; set; }

  public int CompanyId { get; set; }

  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}