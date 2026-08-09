info page. 
- να εξηγεί πως χρησιμοποιειται. Πρώτα αν δεν υπάρχει μάθημα πρέπει να δημιουργήσεις ένα, αυτό σωζεται σε mongodb, αν υπάρχει βλέπει πια μαθήματα υπάρχουν ήδη. απο το excel κάθε βδομαδα(; ή οποτε) παίρνει τα ονοματα των μαθητών και βάζει τις βαθμολογίες τους. την γενική και του κάθε κριτηριου αξιολόγησης. και αν υπάρχουν ήδη βλέπει αν έχει αλλαγες και τότε θεωρεί οτι είναι επιπλέων εξέταση (ο αριθμος εξετάσεων είναι προσέγγιση γιατί δεν έχουμε λύσει το θέμα να παίρνει σε όλα ιδιο βαθμο και να μην αλλάζει ο μέσος όρος, αλλα αποφασίσαμε πως δεν μας πειράζει γιατί είναι απλώς μια σειρά εξέτασης και είναι σπάνιο)
- να εξηγεί πως χρησιμοποιειτε το excel. ποιες στήλες διαβάζει και με ποιον τρόπο. Ν α εξηγεί την σημασία του να μην αλλάζει το μέγεθος των στηλών και οι τίτλοι 
- να εξηγεί γιατί δεν πρέπει να αλλάξουν τα ονόματα των μαθητών και πως υπολογίζονται το πλήθος των εξετάσεων ανα μαθητή
- να εξηγεί πως βγαίνει το σκορ προτεραιοποίησης και σε ποιο αρχείο βρίσκετε αυτό και να έχει και τα σχετικά αποσπάσματα κώδικα


οχι αυτό που έκανες είναι λάθος. Θέλουμε το κείμενο να μείνει όπως ήταν πριν με την ίδια μορφοποίηση. Αλλα να ακολουθει με το ίδιο κείμενο και την ίδια μορφοποιηση στις γλώσσες Ισπανικα, Ελληνικα, Esperanto Αγγλικα
```
import { Box, Container, Paper, Typography } from "@mui/material";

const codeBlockSx = {
  display: "block",
  overflowX: "auto",
  p: 2,
  mt: 1,
  mb: 2,
  borderRadius: 2,
  backgroundColor: "#27231f",
  color: "#f7e7c6",
  fontFamily: "monospace",
  fontSize: "0.85rem",
  lineHeight: 1.6,
  whiteSpace: "pre",
};

const Info = () => {
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 5 }, backgroundColor: "#fffdf7", color: "#4a3f35", border: "1px solid #e5e0d8", borderRadius: 3, textAlign: "left" }}>
        <Typography component="h1" variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
          Οδηγίες χρήσης Student Prioritizer
        </Typography>
        <Typography component="p" sx={{ mb: 3 }}>
          Η εφαρμογή δημιουργεί μια αιτιολογημένη, προτεινόμενη σειρά εξέτασης μαθητών. Είναι βοηθητικό εργαλείο για τον εκπαιδευτικό και όχι αυτόματη παιδαγωγική απόφαση.
        </Typography>

        <Box component="section" sx={{ mt: 3 }}>
          <Typography component="h2" variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>1. Βασική διαδικασία</Typography>
          <Typography component="p">Ακολουθήστε τα εξής βήματα:</Typography>
          <Box component="ol" sx={{ pl: 3, mb: 2 }}>
            <li>Συνδεθείτε στην εφαρμογή.</li>
            <li>Αν δεν υπάρχει το μάθημα, δημιουργήστε το με σχολικό έτος και όνομα. Η εγγραφή αποθηκεύεται στη MongoDB.</li>
            <li>Αν υπάρχουν ήδη μαθήματα, επιλέξτε πρώτα το σχολικό έτος και μετά το συγκεκριμένο μάθημα.</li>
            <li>Επιλέξτε το Excel αρχείο του τρέχοντος ελέγχου.</li>
            <li>Ελέγξτε την προεπισκόπηση και πατήστε «Save snapshot».</li>
            <li>Πατήστε «Prioritize students» για να εμφανιστεί η σειρά προτεραιότητας.</li>
          </Box>
          <Typography component="p">Νέο Excel μπορείτε να ανεβάζετε κάθε εβδομάδα ή όποτε πραγματοποιείται ένας νέος έλεγχος. Το snapshot αντικαθιστά την τρέχουσα λίστα του μαθήματος, αλλά διατηρεί το εκτιμώμενο πλήθος εξετάσεων.</Typography>
        </Box>

        <Box component="section" sx={{ mt: 4 }}>
          <Typography component="h2" variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>2. Πώς χρησιμοποιείται το Excel</Typography>
          <Typography component="p">Υποστηρίζονται αρχεία <strong>.xlsx</strong> και <strong>.xls</strong>. Διαβάζεται μόνο το πρώτο φύλλο και εντοπίζεται η γραμμή επικεφαλίδων από τη στήλη <code>Alumno/a</code>.</Typography>
          <Typography component="p" sx={{ mt: 1 }}>Οι στήλες που αναγνωρίζονται είναι:</Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li><code>Alumno/a</code>: όνομα μαθητή.</li>
            <li><code>Nota</code>: τελικός/γενικός βαθμός.</li>
            <li>Στήλες μορφής <code>αριθμός.αριθμός</code>, όπως <code>1.1</code> ή <code>2.3</code>: κριτήρια αξιολόγησης.</li>
          </Box>
          <Typography component="p">Κενές ή μη αριθμητικές τιμές θεωρούνται απουσία βαθμού. Οι δεκαδικοί αριθμοί μπορούν να χρησιμοποιούν τελεία ή κόμμα.</Typography>
          <Box component="pre" sx={codeBlockSx}>{`const criterionColumns = headers
  .map((header, index) => ({ name: String(header).trim(), index }))
  .filter((column) => /^\\d+\\.\\d+$/.test(column.name));`}</Box>
          <Typography component="p">Μην αλλάζετε τους τίτλους ή τη δομή του πίνακα. Αν μετονομαστεί η <code>Alumno/a</code> ή η <code>Nota</code>, η πληροφορία δεν θα αναγνωριστεί. Αν αλλάξει η μορφή των κριτηρίων, οι στήλες τους αγνοούνται.</Typography>
        </Box>

        <Box component="section" sx={{ mt: 4 }}>
          <Typography component="h2" variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>3. Ονόματα μαθητών και πλήθος εξετάσεων</Typography>
          <Typography component="p">Το όνομα είναι το κλειδί αντιστοίχισης με το παλιό snapshot. Η σύγκριση αγνοεί κεφαλαία/πεζά και κενά στην αρχή ή στο τέλος, αλλά όχι διαφορετική γραφή. Γράφετε λοιπόν σταθερά τα ονόματα σε κάθε Excel.</Typography>
          <Typography component="p">Στο πρώτο snapshot ο μαθητής ξεκινά με <code>1</code> εξέταση αν έχει έστω έναν βαθμό κριτηρίου, διαφορετικά με <code>0</code>. Σε επόμενο snapshot συγκρίνονται τα κριτήρια. Αν αλλάξει, προστεθεί ή αφαιρεθεί έστω ένας βαθμός/κριτήριο, το πλήθος αυξάνεται κατά μία εξέταση. Πολλές αλλαγές στο ίδιο upload μετρούν ως μία.</Typography>
          <Box component="pre" sx={codeBlockSx}>{`const changed = haveCriteriaChanged(
  oldStudent.criteria,
  newStudent.criteria,
);

estimatedExamCount:
  oldStudent.estimatedExamCount + (changed ? 1 : 0);`}</Box>
          <Typography component="p">Ο αριθμός είναι προσέγγιση και όχι ανεξάρτητο παρουσιολόγιο. Δεν ανιχνεύεται η περίπτωση όπου ο μαθητής εξετάστηκε αλλά πήρε ακριβώς τους ίδιους βαθμούς σε όλα τα κριτήρια. Έχει επιλεγεί αυτή η προσέγγιση επειδή η κατάταξη είναι βοηθητική και το περιστατικό θεωρείται σπάνιο.</Typography>
          <Typography component="p" sx={{ fontSize: "0.9rem", fontStyle: "italic" }}>Η λογική snapshots βρίσκεται στο <code>backend/src/course/course.service.ts</code>.</Typography>
        </Box>

        <Box component="section" sx={{ mt: 4 }}>
          <Typography component="h2" variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>4. Πώς υπολογίζεται η προτεραιότητα</Typography>
          <Typography component="p">Για κάθε μαθητή υπολογίζεται ένα <code>priorityScore</code>. Όσο μεγαλύτερο είναι το σκορ, τόσο ψηλότερα εμφανίζεται.</Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li><strong>+1000</strong> αν δεν έχει εξεταστεί καθόλου ή δεν έχει κανέναν βαθμό κριτηρίου.</li>
            <li><strong>+100</strong> για κάθε κριτήριο χωρίς βαθμό.</li>
            <li><strong>-10 × πλήθος εξετάσεων</strong> για μαθητές που έχουν ήδη εξεταστεί.</li>
            <li><strong>+(5 - τελικός βαθμός) × 20</strong> όταν ο τελικός βαθμός είναι μικρότερος από 5.</li>
          </Box>
          <Box component="pre" sx={codeBlockSx}>{`if (estimatedExamCount === 0 || examinedCriteria.length === 0) {
  priorityScore += 1000;
} else {
  priorityScore += missingCriteria.length * 100;
  priorityScore -= estimatedExamCount * 10;
}

if (finalGrade !== null && finalGrade < 5) {
  priorityScore += (5 - finalGrade) * 20;
}`}</Box>
          <Typography component="p">Η ταξινόμηση γίνεται φθίνουσα ως προς το σκορ. Σε ισοβαθμία χρησιμοποιείται τυχαίο tie-breaker, άρα η σειρά ισόβαθμων μαθητών μπορεί να αλλάξει μεταξύ κλήσεων.</Typography>
          <Typography component="p" sx={{ fontSize: "0.9rem", fontStyle: "italic" }}>Ο αλγόριθμος βρίσκεται στο <code>backend/src/course/course.prioritize.service.ts</code>.</Typography>
        </Box>

        <Typography sx={{ mt: 4, pt: 2, borderTop: "1px solid #e5e0d8", fontStyle: "italic" }}>Η σειρά προτεραιότητας είναι ένδειξη για καλύτερη οργάνωση της εξέτασης. Η τελική απόφαση παραμένει στον εκπαιδευτικό.</Typography>
      </Paper>
    </Container>
  );
};

export default Info;
```