// native\src\components\layout\ui\HamburgerToggle.tsx

import { useRef, useEffect } from 'react'
import { Animated } from 'react-native'
import Svg, { Line } from 'react-native-svg'

const AnimatedLine = Animated.createAnimatedComponent(Line)

type Props = {
  color: string
  open: boolean
}

const HamburgerToggle = ({ color, open }: Props) => {
  const anim = useRef(new Animated.Value(open ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(anim, {
      toValue: open ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [anim, open])

  const topY2 = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 140],
  })

  const bottomY2 = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [140, 60],
  })

  const middleOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  })

  return (
    <Animated.View style={{ width: 30, height: 30 }}>
      <Svg width={26} height={26} viewBox="0 0 200 200">

        <AnimatedLine
          x1="30"
          y1="60"
          x2="170"
          y2={topY2}
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
        />

        <AnimatedLine
          x1="30"
          y1="100"
          x2="170"
          y2="100"
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
          opacity={middleOpacity}
        />

        <AnimatedLine
          x1="30"
          y1="140"
          x2="170"
          y2={bottomY2}
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
        />

      </Svg>
    </Animated.View>
  )
}

export default HamburgerToggle