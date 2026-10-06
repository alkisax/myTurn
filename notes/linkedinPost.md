Γεια 👋


Σας παρουσιάζω το MyTurn, μια εφαρμογή digital queue management που ανέπτυξα με .NET, React και React Native.

Η ιδέα είναι να αντικαταστήσει το κλασικό χαρτάκι προτεραιότητας με ένα ψηφιακό ticket που θα μπορεί ο πελάτης να έχει στο κινητό του και να το εκδίδει απο το σπίτι.

Ένας πελάτης μπορεί να πάρει αριθμό είτε απομακρυσμένα είτε από ένα tablet/kiosk στον χώρο, να παρακολουθεί την πορεία του ticket του και το estimated waiting time, ενώ το προσωπικό μπορεί να δουλεύει σε συγκεκριμένα desks και queues, να καλεί τον επόμενο πελάτη και να διαχειρίζεται completed, missed και recalled tickets.

Υπάρχει επίσης realtime number display μέσω SignalR, ώστε οι δημόσιες οθόνες να ενημερώνονται καθώς αλλάζει ο αριθμός που εξυπηρετείται.

Ένας από τους βασικούς στόχους του project ήταν να δουλέψω περισσότερο πάνω στο .NET backend.

Ήταν επίσης η πρώτη φορά που υλοποίησα ένα multi-tenant backend: κάθε organization μπορεί να έχει πολλαπλά locations, queues, services, desks, admins και staff members, με tenant isolation και role-based authorization.

Τεχνολογικά, ήταν μια ευκαιρία να δουλέψω περισσότερο με:

- ASP.NET Core / .NET 10
- Entity Framework Core & SQLite
- Multi-tenant architecture
- SignalR και realtime communication
- React Native & Expo
- PDF generation
- QR codes και email ticket delivery
- Hetzner / Nginx deployment
- Google Play deployment και AdMob

Στο repository υπάρχουν επίσης αρκετά backend test methods.

Ένας ακόμη μικρότερος στόχος του project ήταν να εξοικειωθώ περισσότερο με AI CLI development tools. Για την ανάπτυξη χρησιμοποίησα και το Codex με GPT-5.6 Luna (low reasoning) ως coding assistant.

Η εφαρμογή πέρασε πλέον ολόκληρο το Google Play deployment/release cycle και είναι διαθέσιμη στο Google Play 🎉

https://play.google.com/store/apps/details?id=com.alkisax.myturn



---
### 🎫 MyTurn - Multi-Tenant Queue Management Platform

MyTurn is a digital queue management platform built with .NET, React and React Native.

Businesses can manage locations, queues, desks and staff, while customers can issue digital tickets remotely or from a kiosk, track their waiting time and follow realtime number displays powered by SignalR.

The project was my first implementation of a multi-tenant architecture. It also includes JWT role-based authorization, ticket lifecycle management, analytics, PDF/email tickets and automated backend testing. 

The Android app has completed the Google Play deployment process and is now available on Google Play.

<img width="594" height="371" alt="Image" src="https://github.com/user-attachments/assets/4952f4d8-1024-4a76-b321-381834472e26" />
<img width="720" height="1600" alt="Image" src="https://github.com/user-attachments/assets/1bc679f9-1959-415f-81d7-6830c8b9f412" />
<img width="720" height="1600" alt="Image" src="https://github.com/user-attachments/assets/17c8f7f7-2a99-4116-b669-6c87ca4f253c" />