# AdMob Integration Pipeline (React Native Expo)

## 0. Overview
AdMob account → App → Ad Unit → React Native integration → Play Store → Revenue

---

## 1. AdMob Setup

### Create App
- https://admob.google.com
- Apps → Add app
- Platform: Android
- Package:
```
com.alkis.astrolark
```

### Create Ad Unit
- Ad units → Add ad unit
- Type: Rewarded

Example:
```
single-chart-llm-reward
```

Ad Unit ID:
```
ca-app-pub-4041382605494077/XXXXXXXXXX
```

---

## 2. app-ads.txt

### File
`backend/public/app-ads.txt`

```
google.com, pub-4041382605494077, DIRECT, f08c47fec0942fa0
```

### Express Route
```ts
app.get('/app-ads', (_req, res) => {
  res.type('text/plain')
  res.sendFile(path.join(__dirname, '../public/app-ads.txt'))
})
```

### Nginx
```nginx
location = /app-ads.txt {
  proxy_pass http://localhost:3013/app-ads;
}
```

### Test
```
https://astro.portfolio-projects.space/app-ads.txt
```

---

## 3. Install SDK

```
npm install react-native-google-mobile-ads
```

### app.json
```json
[
  "react-native-google-mobile-ads",
  {
    "androidAppId": "ca-app-pub-4041382605494077~5910087821"
  }
]
```

---

## 4. Rewarded Ad Hook

### /hooks/useRewardedAd.ts
```ts
import { useEffect, useState } from 'react'
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads'

const adUnitId = __DEV__
  ? TestIds.REWARDED
  : 'ca-app-pub-4041382605494077/XXXXXXXXXX'

export const useRewardedAd = () => {
  const [loaded, setLoaded] = useState(false)
  const [rewarded, setRewarded] = useState(false)

  const rewardedAd = RewardedAd.createForAdRequest(adUnitId)

  useEffect(() => {
    const unsubscribeLoaded = rewardedAd.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => setLoaded(true)
    )

    const unsubscribeReward = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => setRewarded(true)
    )

    const unsubscribeClosed = rewardedAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setLoaded(false)
        rewardedAd.load()
      }
    )

    rewardedAd.load()

    return () => {
      unsubscribeLoaded()
      unsubscribeReward()
      unsubscribeClosed()
    }
  }, [])

  return {
    loaded,
    rewarded,
    show: () => {
      if (loaded) rewardedAd.show()
    },
    resetReward: () => setRewarded(false),
  }
}
```

---

## 5. Integration

```ts
const { loaded, rewarded, show, resetReward } = useRewardedAd()

const handleLLM = async () => {
  if (!loaded) {
    alert('Ad not ready')
    return
  }

  show()
}
```

### After Reward
```ts
useEffect(() => {
  if (rewarded) {
    callBackendLLM()
    resetReward()
  }
}, [rewarded])
```

---

## 6. Backend Call

```ts
const callBackendLLM = async () => {
  const res = await axios.post(`${backendUrl}/interpret`, payload)
  setResult(res.data)
}
```

---

## 7. AdMob Reports

- Impressions
- Estimated earnings
- eCPM

Delay: 24–48h normal

---

## 8. Economics

Rewarded Ad:
```
0.01€ – 0.05€
```

LLM Cost:
```
0.01€ – 0.03€
```

---

## 9. Common Mistakes

- Missing app-ads.txt
- Using production ads in dev
- No GDPR consent
- Testers not joined

---

## 10. Policy Requirements

- Privacy policy
- Ads declaration
- app-ads.txt
- No fake rewards

---

## TL;DR

AdMob → App → Ad unit → SDK → Hook → Gate feature → Deploy → app-ads.txt → Revenue
