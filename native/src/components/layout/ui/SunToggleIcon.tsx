// native\src\components\layout\ui\SunToggleIcon.tsx

import Svg, { Circle, G, Line } from 'react-native-svg'
import { Pressable, Animated } from 'react-native'
import { useRef } from 'react'

type Props = {
  color: string
  onFinished: () => void
}

const SunToggleIcon = ({ color, onFinished }: Props) => {
  const rotate = useRef(new Animated.Value(0)).current

  const handlePress = () => {
    Animated.timing(rotate, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start(() => {
      rotate.setValue(0)
      onFinished()
    })
  }

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={{
          transform: [{ rotate: spin }],
        }}
      >
        <Svg width={20} height={20} viewBox="0 0 200 200">
          <Circle
            cx="100"
            cy="100"
            r="40"
            fill={color}
            stroke={color}
            strokeWidth={4}
          />

          <G>
            {Array.from({ length: 8 }).map((_, i) => (
              <Line
                key={i}
                x1="100"
                y1="10"
                x2="100"
                y2="40"
                stroke={color}
                strokeWidth={6}
                transform={`rotate(${i * 45} 100 100)`}
              />
            ))}
          </G>
        </Svg>
      </Animated.View>
    </Pressable>
  )
}

export default SunToggleIcon