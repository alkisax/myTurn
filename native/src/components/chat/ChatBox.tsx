// native\src\components\chat\ChatBox.tsx

import Markdown from 'react-native-markdown-display'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, } from 'react-native'
import { useContext, useEffect, useRef, useState } from 'react'
import { createMarkdownStyles } from '@/styles/markdown.styles'

import { ThemeContext } from '@/context/ThemeContext'
import { useRoomContext } from '@/context/RoomContext'
import { Ionicons } from '@expo/vector-icons'

type Props = {
  title?: string
}

const ChatBox = ({
  title = 'Room Chat',
}: Props) => {
  const { colors } = useContext(ThemeContext)

  const {
    username,
    isConnected,
    chatMessages,
    sendChatMessage,
  } = useRoomContext()

  const styles = createStyles(colors)
  const markdownStyles = createMarkdownStyles(colors, true)

  const [text, setText] = useState('')

  const scrollViewRef = useRef<ScrollView | null>(null)

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({
      animated: true,
    })
  }, [chatMessages])

  const handleSend = async () => {
    const cleanText = text.trim()

    if (!cleanText) return

    await sendChatMessage(cleanText)

    setText('')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {title}
      </Text>

      <Text style={styles.usernameText}>
        You: {username}
      </Text>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesBox}
        onContentSizeChange={() => {
          scrollViewRef.current?.scrollToEnd({
            animated: true,
          })
        }}
      >
        {chatMessages.length === 0 && (
          <Text style={styles.emptyText}>
            No messages yet
          </Text>
        )}

        {chatMessages.map((message, index) => (
          <View
            key={`${message.username}-${message.createdAt}-${index}`}
            style={styles.messageRow}
          >
            <Text style={styles.messageUsername}>
              {message.username}:
            </Text>

            <Markdown style={markdownStyles}>
              {message.text}
            </Markdown>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={
            isConnected
              ? 'Message'
              : 'Connect first'
          }
          placeholderTextColor={colors.dimText}
          editable={isConnected}
          style={[
            styles.input,
            !isConnected && styles.inputDisabled,
          ]}
        />

        <Pressable
          onPress={handleSend}
          disabled={!isConnected}
          style={[
            styles.sendButton,
            !isConnected && styles.sendButtonDisabled,
          ]}
        >
          <Text style={styles.sendButtonText}>
            <Ionicons
              name="send"
              size={20}
              color={colors.green}
            />
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

export default ChatBox

const createStyles = (
  colors: Record<string, string>,
) =>
  StyleSheet.create({
    container: {
      width: '100%',
      padding: 12,
      borderRadius: 14,
      backgroundColor: colors.panel,
      borderWidth: 1,
      borderColor: colors.panelBorder,
      gap: 8,
    },

    title: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
    },

    usernameText: {
      color: colors.dimText,
      fontSize: 12,
      textAlign: 'center',
    },

    messagesBox: {
      maxHeight: 160,
      borderWidth: 1,
      borderColor: colors.panelBorder,
      borderRadius: 10,
      padding: 8,
    },

    emptyText: {
      color: colors.dimText,
      fontSize: 13,
      textAlign: 'center',
    },

    messageRow: {
      marginBottom: 8,
    },

    messageUsername: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
    },

    messageText: {
      color: colors.text,
      fontSize: 14,
    },

    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    input: {
      flex: 1,
      height: 40,
      backgroundColor: '#ffffff',
      color: '#030303',
      borderRadius: 8,
      paddingHorizontal: 8,
    },

    inputDisabled: {
      opacity: 0.5,
    },

    sendButton: {
      height: 40,
      paddingHorizontal: 12,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.buttonBackground,
      borderWidth: 1,
      borderColor: colors.buttonBorder,
    },

    sendButtonDisabled: {
      opacity: 0.5,
    },

    sendButtonText: {
      color: colors.buttonText,
      fontWeight: '700',
    },
  })