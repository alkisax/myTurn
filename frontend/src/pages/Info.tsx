import {
  Box,
  Container,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const InfoSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <Paper
      component="section"
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom>
        {title}
      </Typography>
      <Stack spacing={2}>{children}</Stack>
    </Paper>
  );
};

const Info = () => {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
      <Stack spacing={{ xs: 3, sm: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            About MyTurn
          </Typography>
          <Stack spacing={1.5}>
            <Typography>MyTurn is a digital queue management app.</Typography>
            <Typography color="text.secondary">
              It helps businesses and organizations give customers queue
              numbers, call the next customer, manage waiting lines, and show
              customers which number is being served.
            </Typography>
          </Stack>
        </Box>

        <InfoSection title="Getting Started">
          <Typography>If you created the organization, you are an Admin.</Typography>
          <Typography>
            Before MyTurn can be used, you need to set up:
          </Typography>
          <List dense disablePadding>
            <ListItem disableGutters>
              <ListItemText primary="Company — your business or organization" />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText primary="Locations — the places where you serve customers" />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText primary="Queues — the waiting lines" />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText primary="Services — what customers can ask for" />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText primary="Desks — the service points that serve a queue" />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText primary="Staff — the people who serve customers" />
            </ListItem>
          </List>
          <Typography color="text.secondary">
            You can have more than one company, location, queue, service, desk,
            or staff member.
          </Typography>
        </InfoSection>

        <InfoSection title="Staff Accounts">
          <Typography>
            You need to create an account and password for every staff member.
          </Typography>
          <Typography>
            A staff login is required to start a staff session and serve
            customers.
          </Typography>
          <Typography color="text.secondary">
            If your company has no other staff yet, consider creating a Staff
            account for yourself too.
          </Typography>
        </InfoSection>

        <InfoSection title="Example: Supermarket">
          <Typography>Imagine a supermarket with two queues:</Typography>
          <Box>
            <Typography sx={{ fontWeight: 600 }}>Fresh Meat</Typography>
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemText primary="1 queue" />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="1 desk serving this queue" />
              </ListItem>
            </List>
          </Box>
          <Divider />
          <Box>
            <Typography sx={{ fontWeight: 600 }}>Deli</Typography>
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemText primary="1 queue" />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="2 desks serving this queue" />
              </ListItem>
            </List>
          </Box>
          <Typography color="text.secondary">
            The two Deli employees can work at the same time and serve
            customers from the same Deli queue.
          </Typography>
        </InfoSection>

        <InfoSection title="Now you are ready to go">
          <Typography>
            Share your public URL or QR code with your customers so they can
            open your public MyTurn page and get a ticket.
          </Typography>
          <Typography>You can find the public URL and QR code in:</Typography>
          <Typography color="text.secondary">
            Admin Panel → Organizations → Info
          </Typography>
        </InfoSection>

        <InfoSection title="Public Tablet / Kiosk">
          <Typography>
            As a staff member, you can turn a screen into a Public Tablet /
            Kiosk.
          </Typography>
          <Typography>
            Customers can use this screen at your location to issue their own
            ticket, choose a queue and, when available, choose the services
            they need.
          </Typography>
        </InfoSection>

        <InfoSection title="Number Display">
          <Typography>
            You can also turn a screen into a Number Display.
          </Typography>
          <Typography>
            This screen shows the numbers currently being called and tells
            customers which desk to go to.
          </Typography>
          <Typography color="text.secondary">
            You can use a phone, tablet, or another screen for these functions.
          </Typography>
        </InfoSection>
      </Stack>
    </Container>
  );
};

export default Info;
