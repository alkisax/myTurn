// native\src\hooks\useNotificationSound.ts

import { useRef } from 'react'
import { useAudioPlayer } from 'expo-audio'

const CHAT_NOTIFICATION_SOUND = require(
  '../../assets/sounds/chrysalyn-short-soft-muted-notification.mp3',
)

export const useNotificationSound = () => {
  const lastPlayedAtRef = useRef(0)

  const chatNotificationPlayer = useAudioPlayer(
    CHAT_NOTIFICATION_SOUND,
  )

  const playChatNotification = () => {
    const now = Date.now()

    if (now - lastPlayedAtRef.current < 700) {
      return
    }

    lastPlayedAtRef.current = now

    if (chatNotificationPlayer.playing) {
      return
    }

    chatNotificationPlayer.seekTo(0)
    chatNotificationPlayer.play()
  }

  return {
    playChatNotification,
  }
}