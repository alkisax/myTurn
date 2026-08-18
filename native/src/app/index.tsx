// native\src\app\index.tsx

import { useRoomContext } from "@/context/RoomContext";
import { ThemeContext } from "@/context/ThemeContext";
import Navbar from "@/layout/Navbar";
import { createGlobalStyles } from "@/styles/global";
import { useContext } from "react";
import { Text, View, StyleSheet } from "react-native";

export default function Index() {

  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);

  const {
    roomCode,
    setRoomCode,
    username,
    setUsername,
    isConnected,
    hasPeer,
    connectToChatRoom,
    disconnectFromChatRoom,
  } = useRoomContext();

  return (
    <>
      <View style={globalStyles.screen}>
        <Navbar
          roomId={roomCode}
          setRoomId={setRoomCode}
          username={username}
          setUsername={setUsername}
          handleConnectSocket={connectToChatRoom}
          handleDisconnectSocket={disconnectFromChatRoom}
          isConnected={isConnected}
          hasPeer={hasPeer}
        />

        {/* page content */}
        <View style={globalStyles.centerContent}>
          <Text  style={globalStyles.title}>Hello World</Text>
        </View>
      </View>
    </>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
