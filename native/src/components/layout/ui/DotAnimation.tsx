// native\src\components\layout\ui\DotAnimation.tsx

import { View, Text, StyleSheet, Animated } from 'react-native'
import { useRef, useEffect, useContext } from 'react'
import { ThemeContext } from '@/context/ThemeContext'

type Props = {
  open: boolean
}

const DotAnimation = ({ open }: Props) => {
  const anim = useRef(new Animated.Value(0)).current
  const { colors } = useContext(ThemeContext)
  const styles = createStyles(colors)

  useEffect(() => {
    Animated.timing(anim, {
      toValue: open ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }, [anim, open])

  const leftStyle = {
    transform: [
      {
        translateX: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 4],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
  }

  const rightStyle = {
    transform: [
      {
        translateX: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
  }

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.dot, leftStyle]}>•</Animated.Text>
      <Text style={styles.dot}>•</Text>
      <Animated.Text style={[styles.dot, rightStyle]}>•</Animated.Text>
    </View>
  )
}

export default DotAnimation

const createStyles = (colors: Record<string, string>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: 2,
    },
    dot: {
      color: colors.text,
      fontSize: 16,
    },
  })