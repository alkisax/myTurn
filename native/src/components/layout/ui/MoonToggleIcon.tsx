// native\src\components\layout\ui\MoonToggleIcon.tsx

import Svg, { Path } from 'react-native-svg'
import { Pressable, Animated } from 'react-native'
import { useRef } from 'react'

type Props = {
  color: string
  onFinished: () => void
}

const MoonToggleIcon = ({ color, onFinished }: Props) => {
  const rotate = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(1)).current

  const handlePress = () => {
    Animated.parallel([
      Animated.timing(rotate, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start(() => {
      rotate.setValue(0)
      opacity.setValue(1)
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
          opacity,
          transform: [{ rotate: spin }],
        }}
      >
        <Svg width={20} height={26} viewBox="0 0 200 200">
          <Path
            d="M147 179
               C134 186 119 190 103 190
               C43 190 0 148 0 95
               C0 46 37 5 85 0
               C62 16 41 48 41 85
               C41 137 84 180 129 180
               C132 180 136 180 147 179Z"
            fill={color}
            stroke={color}
          />
        </Svg>
      </Animated.View>
    </Pressable>
  )
}

export default MoonToggleIcon