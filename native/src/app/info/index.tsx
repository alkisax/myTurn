import { useContext } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ThemeContext } from "@/context/ThemeContext";
import Navbar from "@/layout/Navbar";
import { createGlobalStyles } from "@/styles/global";

const Info = () => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);

  return (
    <View style={globalStyles.screen}>
      <Navbar minimal />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={globalStyles.title}>About MyTurn</Text>

        <Text style={globalStyles.text}>
          MyTurn is a digital queue management app.
        </Text>
        <Text style={globalStyles.text}>
          It helps businesses and organizations give customers queue numbers,
          call the next customer, manage waiting lines, and show customers
          which number is being served.
        </Text>

        <InfoSection title="Getting Started">
          <Text style={globalStyles.text}>
            If you created the organization, you are an Admin.
          </Text>
          <Text style={globalStyles.text}>
            Before MyTurn can be used, you need to set up:
          </Text>
          <Text style={globalStyles.text}>
            • Company — your business or organization{"\n"}• Locations — the
            places where you serve customers{"\n"}• Queues — the waiting lines
            {"\n"}• Services — what customers can ask for{"\n"}• Desks — the
            service points that serve a queue{"\n"}• Staff — the people who
            serve customers
          </Text>
          <Text style={globalStyles.text}>
            You can have more than one company, location, queue, service, desk,
            or staff member.
          </Text>
        </InfoSection>

        <InfoSection title="Staff Accounts">
          <Text style={globalStyles.text}>
            You need to create an account and password for every staff member.
          </Text>
          <Text style={globalStyles.text}>
            A staff login is required to start a staff session and serve
            customers.
          </Text>
          <Text style={globalStyles.text}>
            If your company has no other staff yet, consider creating a Staff
            account for yourself too.
          </Text>
        </InfoSection>

        <InfoSection title="Example: Supermarket">
          <Text style={globalStyles.text}>
            Imagine a supermarket with two queues:
          </Text>
          <Text style={globalStyles.text}>
            Fresh Meat{"\n"}• 1 queue{"\n"}• 1 desk serving this queue
          </Text>
          <Text style={globalStyles.text}>
            Deli{"\n"}• 1 queue{"\n"}• 2 desks serving this queue
          </Text>
          <Text style={globalStyles.text}>
            The two Deli employees can work at the same time and serve
            customers from the same Deli queue.
          </Text>
        </InfoSection>

        <InfoSection title="Now you are ready to go">
          <Text style={globalStyles.text}>
            Share your public URL or QR code with your customers so they can
            open your public MyTurn page and get a ticket.
          </Text>
          <Text style={globalStyles.text}>
            You can find the public URL and QR code in:
          </Text>
          <Text style={globalStyles.dimText}>
            Admin Panel → Organizations → Info
          </Text>
        </InfoSection>

        <InfoSection title="Public Tablet / Kiosk">
          <Text style={globalStyles.text}>
            As a staff member, you can turn a screen into a Public Tablet /
            Kiosk.
          </Text>
          <Text style={globalStyles.text}>
            Customers can use this screen at your location to issue their own
            ticket, choose a queue and, when available, choose the services
            they need.
          </Text>
        </InfoSection>

        <InfoSection title="Number Display">
          <Text style={globalStyles.text}>
            You can also turn a screen into a Number Display.
          </Text>
          <Text style={globalStyles.text}>
            This screen shows the numbers currently being called and tells
            customers which desk to go to.
          </Text>
          <Text style={globalStyles.text}>
            You can use a phone, tablet, or another screen for these functions.
          </Text>
        </InfoSection>
      </ScrollView>
    </View>
  );
};

const InfoSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);

  return (
    <View style={styles.section}>
      <Text style={globalStyles.title}>{title}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 12,
  },
});

export default Info;
