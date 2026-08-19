import { useContext, type ReactNode } from "react";
import { View } from "react-native";

import { useRoomContext } from "@/context/RoomContext";
import { ThemeContext } from "@/context/ThemeContext";
import Navbar from "@/layout/Navbar";
import { createGlobalStyles } from "@/styles/global";

const StaffScreenLayout = ({ children }: { children: ReactNode }) => {
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
      {children}
    </View>
  );
};

export default StaffScreenLayout;
