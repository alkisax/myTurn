# MyTurn

MyTurn is a multi-tenant queue management application for businesses and organizations.

Customers can receive a queue number either from a tablet at the physical location or remotely through the web/mobile application. Staff members manage the queue from their devices, while administrators configure companies, locations, desks, services, and staff.

The initial backend will be built with **ASP.NET Core / C# and SQLite**. The first frontend will use **Vite + React**. After the web application is complete, a **React Native** version will be developed and published on Google Play.

Web monetization may use **Google AdSense**, while the native Android application may use **Google AdMob**.

## Main Entities

- Company / Tenant
- Location
- Desk
- User
  - Admin
  - Staff
- Service
- Ticket
- Queue
- Staff / Desk status
- Optional customer email

Customers do not initially need registered accounts.

## Ticket Information

Each ticket may contain:

- Sequential queue number
- Verification PIN
- Secure public tracking token
- Optional email
- One or more requested services
- Creation timestamp
- Current status
- Assigned staff member / desk
- Service start time
- Completion time
- Estimated waiting time

Possible ticket statuses:

- Waiting
- Called
- Serving
- Completed
- Missed
- Cancelled

## Backend Roadmap

- [ ] Initialize Git repository
- [ ] Initialize ASP.NET Core backend
- [ ] Configure project structure
- [ ] Configure SQLite
- [ ] Configure Entity Framework Core
- [ ] Add database migrations
- [ ] Transfer and adapt legacy JWT authentication
- [ ] Define roles and authorization rules
- [ ] Design multi-tenant architecture
- [ ] Create Company model
- [ ] Create Location model
- [ ] Create Desk model
- [ ] Create Service model
- [ ] Create User / Staff model
- [ ] Create Ticket model
- [ ] Define ticket lifecycle and queue rules
- [ ] Create DTOs
- [ ] Create data-access / service layer
- [ ] Add request validation
- [ ] Create controllers
- [ ] Create API endpoints
- [ ] Register services and routes in `Program.cs`
- [ ] Implement atomic sequential ticket-number generation
- [ ] Add staff desk status: active, busy, break, closed
- [ ] Support multiple simultaneous staff members
- [ ] Implement estimated waiting-time calculation
- [ ] Recalculate estimates using the last N completed tickets
- [ ] Add secure public ticket tracking endpoint
- [ ] Generate ticket QR codes
- [ ] Generate printable ticket PDF
- [ ] Add optional ticket email delivery
- [ ] Add API logging and error handling
- [ ] Add basic rate limiting
- [ ] Add automated backend tests
- [ ] Configure production environment variables
- [ ] Deploy backend to Hetzner
- [ ] Configure Nginx / HTTPS
- [ ] Configure database backup strategy

## Web Frontend Roadmap

- [ ] Initialize Vite + React + TypeScript frontend
- [ ] Configure API client
- [ ] Transfer and adapt legacy authentication
- [ ] Transfer and adapt legacy navigation
- [ ] Add light / dark theme
- [ ] Configure routing
- [ ] Create Home page
- [ ] Create customer ticket issuance page
- [ ] Create ticket result page
- [ ] Create live ticket tracking page
- [ ] Display queue number, PIN, QR and estimated wait
- [ ] Add printable PDF action
- [ ] Create staff dashboard
- [ ] Add "Next Customer"
- [ ] Add "Service Completed"
- [ ] Add "Break"
- [ ] Add "Open Desk"
- [ ] Add "Close Desk"
- [ ] Show currently serving tickets and staff/desks
- [ ] Show requested services for each customer
- [ ] Create admin dashboard
- [ ] Manage company settings
- [ ] Manage locations
- [ ] Manage desks
- [ ] Manage services
- [ ] Manage staff accounts
- [ ] Add real-time queue updates
- [ ] Add responsive tablet/mobile layouts
- [ ] Integrate AdSense where appropriate
- [ ] Deploy web frontend

## React Native Roadmap

- [ ] Initialize React Native / Expo application
- [ ] Reuse shared TypeScript types where practical
- [ ] Implement authentication
- [ ] Implement customer ticket issuance
- [ ] Implement live ticket tracking
- [ ] Implement staff dashboard
- [ ] Implement admin functionality where appropriate
- [ ] Add light / dark theme
- [ ] Add QR display / scanning where needed
- [ ] Add AdMob
- [ ] Configure Android production build
- [ ] Add privacy policy and required store declarations
- [ ] Publish to Google Play

## Future Features

- Customer location / proximity checks
- Push notifications
- SMS notifications
- Advanced estimated waiting-time models
- Waiting-time estimates per service
- Historical statistics and analytics
- Multiple queues per location
- Desk specialization by service
- Physical thermal-printer integration
- Kiosk mode
- Appointment integration
- Subscription plans for businesses
