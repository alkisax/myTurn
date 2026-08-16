sqlite3 .\backend\MyTurn.db ".headers on" ".mode column" "SELECT * FROM Users;" "SELECT * FROM CompanyUsers;" "SELECT * FROM Companies;" "SELECT * FROM Locations;" "SELECT * FROM Queues;" "SELECT * FROM Desks;" "SELECT * FROM StaffSessions;" "SELECT * FROM Services;" "SELECT * FROM Tickets;" "SELECT * FROM TicketServices;" > db_snapshot.txt

## clear db (not superuser)
```
sqlite3 .\backend\MyTurn.db
```
```sql
PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

DELETE FROM TicketServices;
DELETE FROM Tickets;
DELETE FROM StaffSessions;
DELETE FROM Desks;
DELETE FROM Services;
DELETE FROM Queues;
DELETE FROM Locations;
DELETE FROM CompanyUsers;
DELETE FROM Companies;

DELETE FROM Users
WHERE Role != 'SUPERADMIN';

-- Reset AUTOINCREMENT counters
DELETE FROM sqlite_sequence
WHERE name IN (
  'TicketServices',
  'Tickets',
  'StaffSessions',
  'Desks',
  'Services',
  'Queues',
  'Locations',
  'CompanyUsers',
  'Companies',
  'Users'
);

COMMIT;

PRAGMA foreign_keys = ON;
```
`.quit`

για να σβήσω μόνο τα tickets
```sql
BEGIN TRANSACTION;

DELETE FROM TicketServices;
DELETE FROM Tickets;

DELETE FROM sqlite_sequence
WHERE name IN (
  'TicketServices',
  'Tickets'
);

COMMIT;
```