# React Native Crash Course

This file contains the steps and all the code for the React Native Crash Course project. You can follow along by watching the video and copying the code into your own project. The code is organized into sections that correspond to the different topics covered in the course.

## Project Overview

The project is a simple macro tracking app called MacroZone that allows users to add meals and track their macros (calories, protein, carbs, fat). The app has a home screen that displays the current date, a grid of macro cards showing the total macros for the day, and a list of recent meals. There is also a screen for adding new meals and a screen for viewing all meals.

<p align="center">
  <img src="assets/screen.png" alt="MacroZone App" width="300" />
</p>

## 📑 Table of Contents

### 🚀 Project Setup

1. [Create An Expo Account & Install The EAS CLI](#1-create-an-expo-account--install-the-eas-cli)
2. [Create React Native App](#2-create-react-native-app)
3. [Initialize The EAS Project](#3-initialize-the-eas-project)
4. [Running the App](#4-running-the-app)

### 🎨 Core Concepts & Styling

5. [Resetting the Project](#5-resetting-the-project)
6. [Live Reloading](#6-live-reloading)
7. [Remove The DevTools Icon](#7-remove-the-devtools-icon)
8. [Basic Home Screen](#8-basic-home-screen)
9. [Checking The Platform](#9-checking-the-platform)
10. [Checking The Device Information](#10-checking-the-device-information)
11. [Inline Styling](#11-inline-styling)
12. [StyleSheet API](#12-stylesheet-api)
13. [Changing Header Text](#13-changing-header-text)
14. [Remove The Header](#14-remove-the-header)
15. [Global Styles](#15-global-styles)

### 🗺️ Navigation & Layout

16. [Update Home Screen with Global Styles](#16-update-home-screen-with-global-styles)
17. [Home Header With Date](#17-home-header-with-date)
18. [Update Home Screen With Header](#18-update-home-screen-with-header)
19. [Meal List Screen](#19-meal-list-screen)
20. [Add Screen to Stack](#20-add-screen-to-stack)
21. [Navigating Screens & Links](#21-navigating-screens--links)
22. [Adding A Header To The Meals Screen](#22-adding-a-header-to-the-meals-screen)
23. [Add Meals Screen](#23-add-meals-screen)
24. [Add Link To Add Meal Screen](#24-add-link-to-add-meal-screen)
25. [Tabs](#25-tabs)

### 🧩 UI Components

26. [Create The Tab Layout](#26-create-the-tab-layout)
27. [Update The Root Layout](#27-update-the-root-layout)
28. [Macro Card Component](#28-macro-card-component)
29. [Macro Grid Component](#29-macro-grid-component)
30. [Add Macro Grid To Home Screen](#30-add-macro-grid-to-home-screen)
31. [Meal Item Component](#31-meal-item-component)
32. [Recent Meals Component](#32-recent-meals-component)
33. [Add Recent Meals To Home Screen](#33-add-recent-meals-to-home-screen)

### 💾 Data Management

34. [Add Meal Form](#34-add-meal-form)
35. [AsyncStorage](#35-asyncstorage)
36. [Quick AsyncStorage Example](#36-quick-asyncstorage-example-dont-add-to-project)
37. [Storage Handler](#37-storage-handler)
38. [Update Add Meal Form To Use Storage Handler](#38-update-add-meal-form-to-use-storage-handler)
39. [Get Meals From Storage](#39-get-meals-from-storage)
40. [Update Recent Meals To Use Storage Handler](#40-update-recent-meals-to-use-storage-handler)
41. [Update Macro Grid To Calculate Totals](#41-update-macro-grid-to-calculate-totals)
42. [Delete Meal Functionality](#42-delete-meal-functionality)
43. [Update Meal Item To Delete Meals](#43-update-meal-item-to-delete-meals)
44. [Update Recent Meals To Pass Delete Callback](#44-update-recent-meals-to-pass-delete-callback)
45. [`onDelete` Callback For All Meals Screen](#45-ondelete-callback-for-all-meals-screen)
46. [All Meals Data](#46-all-meals-data)

### ✨ User Experience Features

. [Clear All Meals](#-clear-all-meals) 48. [Haptic Feedback](#48-haptic-feedback) 49. [Haptic Feedback For Deleting Meals](#49-haptic-feedback-for-deleting-meals) 50. [Share API](#50-share-api) 51. [Clipboard API](#51-clipboard-api) 52. [Notifications](#52-notifications) 53. [Reminder Toggler](#53-reminder-toggler)

### 🏗️ Building & Deployment

54. [EAS Build](#54-eas-build)

---

## 1. Create An Expo Account & Install The EAS CLI

Go to [expo.dev](https://expo.dev/) and create a free account. This will allow you to use EAS(Expo Application Services) for building and deploying your app later on.

Click on "Create Project" and give it a name.

Once you create your project, you will see a list of commands to run.

Start by installing the Expo CLI globally on your machine:

```bash
npm install -g eas-cli
```

This will install the EAS tool to allow you to build and deploy your app later on.

## 2. Create React Native App

Navigate to where you want to create your project and use the following command to create a new React Native app using Expo:

```bash
npx create-expo-app@latest --template default@sdk-55
```

This will create a new React Native app with the latest Expo SDK. It will ask for a name. I will call it **macrozone**.

## 3. Initialize The EAS Project

Run the command that it gives you after creating the project to initialize the EAS project. It will look like this but with your own project ID:

```bash
eas init --id 6ea729d8-cce3-463a-a1f2-2ef8744d36ea
```

This will link your local project to the Expo account you created earlier and allow you to use EAS for building and deploying your app.

## 4. Running the App

Run the following command to start the Expo development server:

```bash
npm start (or `expo start`)
```

From here, you can open your project in multiple platforms. You can run it in the iOS Simulator, Android Emulator, or in the web browser using React Native Web.

- Press `i` to open in iOS Simulator (Requires macOS & Xcode)
- Press `a` to open in Android Emulator (Requires Android Studio)
- Press `w` to open in the web browser (Uses React Native Web)
- Scan the QR code with the Expo Go app on your phone to run it on your physical device

You can also use the following commands to run the app on specific platforms:

```bash
# To run in the iOS Simulator (Requires macOS & Xcode)
npm run ios
# To run in the Android Emulator (Requires Android Studio)
npm run android
# To run in the web browser (Uses React Native Web)
npm run web
```

## 5. Resetting the Project

Clear out the boilerplate code:

```bash
npm run reset-project
```

## 6. Live Reloading

Open `src/app/index.tsx` and change the text to "Hello World":

```ts
 <View style={styles.container}>
    <Text>Hello World</Text>
  </View>
```

Save and you should see the changes immediately in the simulator or web browser.

### Force Simulator Reload

You can also force a reload in the simulator if you want to make sure you're seeing the latest changes:

```bash
# For iOS Simulator
Cmd + R
# Or use the devtools (Cmd + D) and select "Reload" from the menu that appears
```

```bash
# For Android Emulator
Ctrl + M
# Then select "Reload" from the menu that appears
```

## 7. Remove The DevTools Icon

To remove the devtools icon that appears in the top right corner of the app, click on it and uncheck the "Tools Button" option in the menu that appears. You can still access the devtools by pressing Cmd + D

## 8. Basic Home Screen

Open `src/app/screens/home/index.tsx` and replace everything with the following code to create a simple Home Screen:

```ts
import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View>
      <Text>Welcome to Macrozone!</Text>
    </View>
  );
}
```

If you need to reload, use your hotkeys or the devtools to see the changes. You should now see "Welcome to Macrozone!" on the screen.

## 9. Checking The Platform

You can check which platform you're running on using the `Platform` module from React Native.

```ts
import { Platform } from 'react-native';

export default function HomeScreen() {
  return (
    <View>
      <Text>Welcome to Macrozone!</Text>
      <Text>Running on: {Platform.OS}</Text>
    </View>
  );
}
```

## 10. Checking The Device Information

You can also check the device information using the `Device` module from Expo:

```ts
import * as Device from 'expo-device';
import { Platform, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View>
      <Text>Welcome to Macrozone!</Text>
      <Text>Running on: {Platform.OS}</Text>
      <Text>Device Model: {Device.modelName}</Text>
      <Text>Device Brand: {Device.brand}</Text>
      <Text>OS Version: {Device.osVersion}</Text>
    </View>
  );
}
```

## 11. Inline Styling

You can style your components using inline styles, which are just JavaScript objects that you pass to the `style` prop of a component:

```ts
import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Hello World</Text>
  </View>
  );
}
```

## 12. StyleSheet API

For more complex styles, you can use the `StyleSheet` API to create a stylesheet object:

```ts
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MacroZone</Text>
      <Text style={styles.date}>Monday, March 16</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  date: {
    fontSize: 14,
    color: '#a0a0b0',
    marginTop: 4,
    marginBottom: 30,
  },
});
```

## 13. Changing Header Text

To change the text of the header, you can use the `options` prop on the `Stack.Screen` component in the `_layout.tsx` file:

```ts
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitle: 'MacroZone',
      }}
    />
  );
}
```

## 14. Remove The Header

If you want to remove the header entirely (which I do), you can set `headerShown` to `false` in the `screenOptions`:

```ts
import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

## 15. Global Styles

Create a file at `src/styles/global.ts` and add the following code to define some global styles and colors that we can use throughout the app:

```ts
import { StyleSheet } from 'react-native';

export const colors = {
  background: '#1a1a2e',
  header: '#242444',
  surface: '#2a2a4a',
  primary: '#4fc3f7',
  text: '#ffffff',
  textSecondary: '#a0a0b0',
  alert: '#ff5252',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 30,
    marginBottom: 16,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
```

## 16. Update Home Screen with Global Styles

Now we can update our `HomeScreen` to use the global styles and colors we just defined. We will also change the root `View` to a `ScrollView` so that we can scroll the content if it exceeds the height of the screen. Open `src/app/(tabs)/index.tsx` and update to the following:

```ts
import { StyleSheet, Text, ScrollView } from 'react-native';
import { globalStyles } from '@/styles/global';

export default function HomeScreen() {
  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>MacroZone</Text>
      <Text style={styles.date}>Monday, March 16</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  date: {
    fontSize: 14,
    color: '#a0a0b0',
    marginTop: 4,
    marginBottom: 30,
  },
});
```

We also are using the `<ScrollView>` now instead of the `<View>` Component.

## 17. Home Header With Date

Let's create a header component for the home screen that displays the current date. Create a component at `src/components/HomeHeader.tsx` with the following code:

```ts
import { StyleSheet, Text, View } from 'react-native';
import { colors. globalStyles } from '@/styles/global';

export default function HomeHeader() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={globalStyles.header}>
      <Text style={styles.date}>{currentDate}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  date: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 30,
  },
});
```

## 18. Update Home Screen With Header

Now we can use the `HomeHeader` component in our `HomeScreen`. Open `src/app/(tabs)/index.tsx` and update to the following:

```ts
import { globalStyles } from '@/styles/global';
import { Text, ScrollView } from 'react-native';
import HomeHeader from '@/components/HomeHeader';

export default function HomeScreen() {
  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>MacroZone</Text>
      <HomeHeader />
    </ScrollView>
  );
}
```

## 19. Meal List Screen

Create a new file at `src/app/meals.tsx` and add the following code:

```ts
import { globalStyles } from '@/styles/global';
import { Text, ScrollView } from 'react-native';

export default function MealsScreen() {
  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>All Meals</Text>
    </ScrollView>
  );
}
```

## 20. Add Screen to Stack

Then, open `src/app/_layout.tsx` and add the new screen to the stack:

```ts
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="meals" />
    </Stack>
  );
}
```

## 21. Navigating Screens & Links

To navigate between screens, we can use the `Link` component from `expo-router`. Open `src/app/index.tsx` and add a link to the meals screen:

```ts
import { globalStyles } from '@/styles/global';
import { Link } from 'expo-router';
import { Text, ScrollView } from 'react-native';
import HomeHeader from '../components/HomeHeader';

export default function HomeScreen() {
  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>MacroZone</Text>
     <HomeHeader />
      <Link href='/meals' style={{ fontSize: 18, color: '#007bff' }}>
        Go to Meals
      </Link>
    </ScrollView>
  );
}
```

Now you can navigate to the meals screen.

## 22. Adding A Header To The Meals Screen

To Add a header to the meals screen, we can use the `Stack.Screen` options in the `_layout.tsx` file. Open `src/app/_layout.tsx` and update to the following:

```ts
import { colors } from '@/styles/global';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name='index' options={{ headerShown: false }} />
      <Stack.Screen options={{ title: 'Meals' }} name='meals' />
    </Stack>
  );
}
```

## 23. Add Meals Screen

Let's create one more page/screen for adding meals. Create a new file at `src/app/add-meal.tsx` and add the following code:

```ts
import { globalStyles } from '@/styles/global';
import { Text, View } from 'react-native';

export default function AddMealScreen() {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Add Meal</Text>
    </View>
  );
}
```

Then, add it to the stack in `src/app/_layout.tsx`:

```ts
import { colors } from '@/styles/global';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name='index' options={{ headerShown: false }} />
      <Stack.Screen options={{ title: 'Meals' }} name='meals' />
      <Stack.Screen options={{ title: 'Add Meal' }} name='add-meal' />
    </Stack>
  );
}
```

## 24. Add Link To Add Meal Screen

Just to test it out, let's add a link to the add meal screen from the meals screen. Open `src/app/meals.tsx` and update to the following:

```ts
import { globalStyles } from '@/styles/global';
import { Link } from 'expo-router';
import { StyleSheet, Text, ScrollView } from 'react-native';

export default function MealsScreen() {
  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>All Meals</Text>
      <Link href='/add-meal' style={{ fontSize: 18, color: '#007bff' }}>
        Add New Meal
      </Link>
    </ScrollView>
  );
}
```

## 25. Tabs

All this is well and good, but it would be nice to have a tab bar for navigating between the different screens instead of just links.

Create a new folder at `src/app/(tabs)`. This is a special folder that Expo Router uses to group screens into a tab navigator. A group is a folder that contains screens that should be grouped together in some way. By naming the folder `(tabs)`, we're telling Expo Router that the screens inside should be part of a tab navigator.

## Move The Screens Into The Tabs Folder

Move the following into the new `src/app/(tabs)` folder:

- `index.tsx`
- `meals.tsx`
- `add-meal.tsx`

## 26. Create The Tab Layout

We also need to create a new layout file for the tabs. Create a new file at `src/app/(tabs)/_layout.tsx` and add the following code:

```ts
import { colors } from '@/styles/global';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.surface,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='home' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='add-meal'
        options={{
          title: 'Add Meal',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='add-circle' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='meals'
        options={{
          title: 'All Meals',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='list' size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

```

This code sets up a tab navigator with three tabs: Home, Add Meal, and All Meals. Each tab has an icon from the Ionicons library.

## 27. Update The Root Layout

Finally, we need to update the root layout to use the new tab layout. Open `src/app/_layout.tsx` and update to the following:

```ts
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='(tabs)' />
    </Stack>
  );
}
```

This tells the root layout to render the tab layout, which in turn renders the individual screens as tabs. We no longer need the top bar with the back button, so we set `headerShown` to `false` in the stack screen options.

## 28. Macro Card Component

Let's create a reusable component for displaying the macros in a card format. Create a new file at `src/components/MacroCard.tsx` and add the following code:

```ts
import { StyleSheet, Text, View } from 'react-native';

type MacroCardProps = {
  label: string;
  value: string;
  goal: string;
  color: string;
};

export default function MacroCard({
  label,
  value,
  goal,
  color,
}: MacroCardProps) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.goal}>/ {goal}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    borderLeftWidth: 4,
  },
  label: {
    fontSize: 14,
    color: '#a0a0b0',
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  goal: {
    fontSize: 14,
    color: '#a0a0b0',
    marginTop: 2,
  },
});
```

This component takes in a label (e.g. "Protein"), a value (e.g. "120g"), a goal (e.g. "150g"), and a color for the left border of the card. It displays the information in a styled card format.

## 29. Macro Grid Component

Now let's create a component that uses the `MacroCard` component to display a grid of macros. Create a new file at `src/components/MacroGrid.tsx` and add the following code:

```ts
import { StyleSheet, View } from 'react-native';
import MacroCard from './MacroCard';

export default function MacroGrid() {
  return (
    <View style={styles.grid}>
      <MacroCard label='Calories' value='0' goal='2,000' color='#ff6b6b' />
      <MacroCard label='Protein' value='0g' goal='150g' color='#4ecdc4' />
      <MacroCard label='Carbs' value='0g' goal='250g' color='#ffd93d' />
      <MacroCard label='Fat' value='0g' goal='65g' color='#6bcb77' />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
```

Right now the values are hardcoded but in a bit, we will make them dynamic based on the meals that we add. The `MacroGrid` component arranges the `MacroCard` components in a 2x2 grid using flexbox.

## 30. Add Macro Grid To Home Screen

Finally, let's add the `MacroGrid` component to the home screen. Open `src/app/(tabs)/index.tsx` and update to the following:

```ts
import { globalStyles } from '@/styles/global';
import { StyleSheet, Text, View } from 'react-native';
import HomeHeader from '../components/HomeHeader';
import MacroGrid from '@/components/MacroGrid';

export default function HomeScreen() {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>MacroZone</Text>
      <HomeHeader />
      <MacroGrid />
    </View>
  );
}
```

Now you should see the 2x2 grid of macro cards on the home screen.

## 31. Meal Item Component

Let's also create a component for displaying recent meals on the home screen. Let's start with the meal item component that will be displayed from the recent meals list. Create `src/components/MealItem.tsx` and add the following code:

```ts
import { StyleSheet, Text, View } from 'react-native';

type MealItemProps = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export default function MealItem({
  name,
  calories,
  protein,
  carbs,
  fat,
}: MealItemProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.macros}>
        {calories} cal • {protein}g P • {carbs}g C • {fat}g F
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  macros: {
    fontSize: 13,
    color: '#a0a0b0',
    marginTop: 4,
  },
});
```

This component takes in the meal name and its macros and displays them in a styled container.

## 32. Recent Meals Component

Now create a component that will display a list of recent meals. Create `src/components/RecentMeals.tsx` and add the following code:

```ts
import { StyleSheet, Text, View } from 'react-native';
import { globalStyles } from '@/styles/global';
import MealItem from './MealItem';

export default function RecentMeals() {
  return (
    <View style={{ marginTop: 30 }}>
      <Text style={globalStyles.sectionTitle}>Recent Meals</Text>
      <MealItem
        name='Chicken & Rice'
        calories={540}
        protein={45}
        carbs={50}
        fat={12}
      />
      <MealItem
        name='Protein Shake'
        calories={280}
        protein={30}
        carbs={20}
        fat={8}
      />
      <MealItem
        name='Salmon Salad'
        calories={430}
        protein={35}
        carbs={10}
        fat={25}
      />
    </View>
  );
}
```

## 33. Add Recent Meals To Home Screen

Finally, let's add the `RecentMeals` component to the home screen below the macro grid. Open `src/app/(tabs)/index.tsx` and update to the following:

```ts
import HomeHeader from '@/components/HomeHeader';
import MacroGrid from '@/components/MacroGrid';
import RecentMeals from '@/components/RecentMeals';
import { globalStyles } from '@/styles/global';
import { ScrollView, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>MacroZone</Text>
      <HomeHeader />
      <MacroGrid />
      <RecentMeals />
    </ScrollView>
  );
}
```

You should now see the recent meals section below the macro grid on the home screen.

## 34. Add Meal Form

Create a form for adding meals on the add meal screen. Open `src/app/(tabs)/add-meal.tsx` and update to the following:

```ts
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, globalStyles } from '@/styles/global';

export default function AddMealScreen() {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const handleAddMeal = () => {
    console.log({ name, calories, protein, carbs, fat });
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Add Meal</Text>

      <TextInput
        style={styles.input}
        placeholder='Meal name'
        placeholderTextColor={colors.textSecondary}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder='Calories'
        placeholderTextColor={colors.textSecondary}
        keyboardType='numeric'
        value={calories}
        onChangeText={setCalories}
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder='Protein (g)'
          placeholderTextColor={colors.textSecondary}
          keyboardType='numeric'
          value={protein}
          onChangeText={setProtein}
        />
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder='Carbs (g)'
          placeholderTextColor={colors.textSecondary}
          keyboardType='numeric'
          value={carbs}
          onChangeText={setCarbs}
        />
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder='Fat (g)'
          placeholderTextColor={colors.textSecondary}
          keyboardType='numeric'
          value={fat}
          onChangeText={setFat}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAddMeal}>
        <Text style={styles.buttonText}>Add Meal</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowInput: {
    flex: 1,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

Fill out the form and submit and you will see the values logged in the console.

## 35. AsyncStorage

When you build a mobile app, you often need to store data. This may be through an API or locally on the device. For local storage in React Native, a common solution is to use `AsyncStorage`, which is a simple key-value storage system that allows you to persist data across app launches.

Install the package using the following command:

```bash
npx expo install @react-native-async-storage/async-storage
```

## 36. Quick AsyncStorage Example (Don't add to project)

Here is a quick example of how to use `AsyncStorage`:

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

// To save data
const saveData = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error saving data', e);
  }
};

// To retrieve data
const getData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error retrieving data', e);
  }
};
```

As you can see, it is very similar to using `localStorage` in a web app, but with async/await syntax since it is asynchronous. You can use these functions to save and retrieve meals and macros in your app.

## 37. Storage Handler

Let's create a simple storage handler that we can use to save and retrieve meals from `AsyncStorage`. Create a file at `src/storage/meals.ts` and add the following code:

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Meal = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
};

const MEALS_KEY = 'meals';

export const getMeals = async (): Promise<Meal[]> => {
  const data = await AsyncStorage.getItem(MEALS_KEY);
  return data ? JSON.parse(data) : [];
};

export const addMeal = async (
  meal: Omit<Meal, 'id' | 'createdAt'>,
): Promise<Meal> => {
  const meals = await getMeals();
  const newMeal: Meal = {
    ...meal,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(MEALS_KEY, JSON.stringify([newMeal, ...meals]));
  return newMeal;
};
```

This code defines a `Meal` type and two functions: `getMeals` to retrieve the list of meals from storage, and `addMeal` to add a new meal to the storage. The meals are stored as an array in `AsyncStorage` under the key `meals`. Each meal has a unique ID generated from the current timestamp and a createdAt timestamp.

## 38. Update Add Meal Form To Use Storage Handler

Now let's update the add meal form to use the `addMeal` function from our storage handler to save meals to `AsyncStorage`. Open `src/app/(tabs)/add-meal.tsx` and update the `handleAddMeal` function to the following:

```tsx
import { addMeal } from '@/storage/meals';
import { colors, globalStyles } from '@/styles/global';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AddMealScreen() {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const handleAddMeal = async () => {
    if (!name || !calories) {
      Alert.alert('Error', 'Please enter a meal name and calories.');
      return;
    }

    await addMeal({
      name,
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
    });

    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');

    Alert.alert('Success', 'Meal added successfully!');

    router.push('/');
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Add Meal</Text>

      <TextInput
        style={styles.input}
        placeholder='Meal name'
        placeholderTextColor={colors.textSecondary}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder='Calories'
        placeholderTextColor={colors.textSecondary}
        keyboardType='numeric'
        value={calories}
        onChangeText={setCalories}
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder='Protein (g)'
          placeholderTextColor={colors.textSecondary}
          keyboardType='numeric'
          value={protein}
          onChangeText={setProtein}
        />
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder='Carbs (g)'
          placeholderTextColor={colors.textSecondary}
          keyboardType='numeric'
          value={carbs}
          onChangeText={setCarbs}
        />
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder='Fat (g)'
          placeholderTextColor={colors.textSecondary}
          keyboardType='numeric'
          value={fat}
          onChangeText={setFat}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAddMeal}>
        <Text style={styles.buttonText}>Add Meal</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowInput: {
    flex: 1,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

Try adding a meal using the form.

If you see an error restart and clear cache with the following command:

```bash
npx expo start -c
```

Submit and you should see a success alert and then be redirected back to the home screen. The meal will be saved in `AsyncStorage`. Right now you can not see it on the home screen but in the next steps, we will update the home screen to display the meals from storage.

## 39. Get Meals From Storage

Open `src/app/(tabs)/index.tsx` and import the `getMeals` function from the storage handler and use it to retrieve the meals from storage. Update the file to the following:

```tsx
import HomeHeader from '@/components/HomeHeader';
import MacroGrid from '@/components/MacroGrid';
import RecentMeals from '@/components/RecentMeals';
import { getMeals, Meal } from '@/storage/meals';
import { globalStyles } from '@/styles/global';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text } from 'react-native';

export default function HomeScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);

  const loadMeals = async () => {
    const data = await getMeals();
    setMeals(data);
    console.log('Loaded meals:', data);
  };

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, []),
  );

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>MacroZone</Text>
      <HomeHeader />
      <MacroGrid />
      <RecentMeals />
    </ScrollView>
  );
}
```

You will not see anything change in the UI yet because we haven't updated the `RecentMeals` component, but if you check the console logs, you should see the loaded meals being logged whenever you navigate back to the home screen or reload the app.

We use the `useFocusEffect` hook from `expo-router` to load the meals whenever the home screen comes into focus. This ensures that we always have the latest meals from storage whenever we view the home screen. If we use a regular `useEffect` with an empty dependency array, it would only load the meals once when the component mounts and would not update when we add new meals and navigate back to the home screen.

## 40. Update Recent Meals To Use Storage Handler

Now we need to show the meals from storage in the recent meals section on the home screen. Let's pass in the meals as a prop to the `RecentMeals` component. Open `src/app/(tabs)/index.tsx` and update the `RecentMeals` component to the following:

```tsx
<RecentMeals meals={meals} />
```

Then, open `src/components/RecentMeals.tsx` and update to the following:

```tsx
import { Meal } from '@/storage/meals';
import { globalStyles } from '@/styles/global';
import { Text, View } from 'react-native';
import MealItem from './MealItem';

type RecentMealsProps = {
  meals: Meal[];
};

export default function RecentMeals({ meals }: RecentMealsProps) {
  return (
    <View style={{ marginTop: 30 }}>
      <Text style={globalStyles.sectionTitle}>Recent Meals</Text>
      {meals.length === 0 ? (
        <Text style={globalStyles.empty}>No meals logged yet.</Text>
      ) : (
        meals
          .slice(0, 5)
          .map((meal) => (
            <MealItem
              key={meal.id}
              name={meal.name}
              calories={meal.calories}
              protein={meal.protein}
              carbs={meal.carbs}
              fat={meal.fat}
            />
          ))
      )}
    </View>
  );
}
```

## 41. Update Macro Grid To Calculate Totals

Now let's update the `MacroGrid` component to calculate the total calories, protein, carbs, and fat from the meals and display them in the macro cards.

First, we need to pass the meals as a prop to the `MacroGrid` component. Open `src/app/(tabs)/index.tsx` and update the `MacroGrid` component to the following:

```tsx
<MacroGrid meals={meals} />
```

Open `src/components/MacroGrid.tsx` and update to the following:

```tsx
import { StyleSheet, View } from 'react-native';
import { Meal } from '@/storage/meals';
import MacroCard from './MacroCard';

type MacroGridProps = {
  meals: Meal[];
};

export default function MacroGrid({ meals }: MacroGridProps) {
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return (
    <View style={styles.grid}>
      <MacroCard
        label='Calories'
        value={`${totals.calories}`}
        goal='2,000'
        color='#ff6b6b'
      />
      <MacroCard
        label='Protein'
        value={`${totals.protein}g`}
        goal='150g'
        color='#4ecdc4'
      />
      <MacroCard
        label='Carbs'
        value={`${totals.carbs}g`}
        goal='250g'
        color='#ffd93d'
      />
      <MacroCard
        label='Fat'
        value={`${totals.fat}g`}
        goal='65g'
        color='#6bcb77'
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
```

Now the macro grid will display the values from all the meals that have been added. Whenever you add a new meal and navigate back to the home screen, the totals in the macro grid will update accordingly.

## 42. Delete Meal Functionality

Let's add the ability to delete meals from storage. First, we need to add a delete function to our storage handler. Open `src/storage/meals.ts` and add the following function:

```tsx
export const deleteMeal = async (id: string): Promise<void> => {
  const meals = await getMeals();
  const filtered = meals.filter((meal) => meal.id !== id);
  await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(filtered));
};
```

This function takes in the ID of the meal to delete, retrieves the current meals from storage, filters out the meal with the matching ID, and then saves the updated list back to storage.

## 43. Update Meal Item To Delete Meals

Now let's update the `MealItem` component to include a delete button that calls the `deleteMeal` function. Open `src/components/MealItem.tsx` and update to the following:

```tsx
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { deleteMeal } from '@/storage/meals';
import { colors } from '@/styles/global';

type MealItemProps = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  onDelete: () => void;
};

export default function MealItem({
  id,
  name,
  calories,
  protein,
  carbs,
  fat,
  onDelete,
}: MealItemProps) {
  const handleLongPress = () => {
    Alert.alert('Delete Meal', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMeal(id);
          onDelete();
        },
      },
    ]);
  };

  return (
    <TouchableOpacity style={styles.container} onLongPress={handleLongPress}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.macros}>
        {calories} cal • {protein}g P • {carbs}g C • {fat}g F
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  macros: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
```

We added an `onDelete` prop to the `MealItem` component, which is a function that will be called after a meal is deleted. We also added a long press handler that shows an alert asking the user to confirm the deletion. If the user confirms, it calls the `deleteMeal` function from the storage handler and then calls the `onDelete` callback to refresh the meals list.

## 44. Update Recent Meals To Pass Delete Callback

Finally, we need to pass the `loadMeals` function as the `onDelete` callback to the `MealItem` components in the `RecentMeals` component. Open `src/components/RecentMeals.tsx` and update to the following:

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { Meal } from '@/storage/meals';
import MealItem from './MealItem';

type RecentMealsProps = {
  meals: Meal[];
  onDelete: () => void;
};

export default function RecentMeals({ meals, onDelete }: RecentMealsProps) {
  return (
    <View style={{ marginTop: 30 }}>
      <Text style={styles.sectionTitle}>Recent Meals</Text>
      {meals.length === 0 ? (
        <Text style={styles.empty}>No meals logged yet.</Text>
      ) : (
        meals
          .slice(0, 5)
          .map((meal) => (
            <MealItem
              key={meal.id}
              id={meal.id}
              name={meal.name}
              calories={meal.calories}
              protein={meal.protein}
              carbs={meal.carbs}
              fat={meal.fat}
              onDelete={onDelete}
            />
          ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  empty: {
    color: '#a0a0b0',
    fontSize: 14,
  },
});
```

We passed the `onDelete` function and the meal ID down to the `MealItem` component.

## 45. `onDelete` Callback For All Meals Screen

We also need to pass the `loadMeals` function as the `onDelete` callback to the `RecentMeals` component on the home screen. Open `src/app/(tabs)/index.tsx` and add it as a prop to the `RecentMeals` component:

```tsx
<RecentMeals meals={meals} onDelete={loadMeals} />
```

This will ensure that when we delete a meal from the recent meals section on the home screen, it will also refresh the meals list and update the macro grid totals accordingly.

## 46. All Meals Data

Now that we have the meals being stored and retrieved from `AsyncStorage`, let's update the meals screen to display all the meals from storage. This is very similar to the index screen where we get the data from storage and pass it to the component that displays the meals.

Open `src/app/(tabs)/meals.tsx` and update to the following:

```tsx
import MealItem from '@/components/MealItem';
import { getMeals, Meal } from '@/storage/meals';
import { globalStyles } from '@/styles/global';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function MealsScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);

  const loadMeals = async () => {
    const data = await getMeals();
    setMeals(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, []),
  );

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>All Meals</Text>
      <View style={{ marginTop: 30 }}>
        {meals.length === 0 ? (
          <Text style={globalStyles.empty}>No meals logged yet.</Text>
        ) : (
          meals.map((meal) => (
            <MealItem
              key={meal.id}
              id={meal.id}
              name={meal.name}
              calories={meal.calories}
              protein={meal.protein}
              carbs={meal.carbs}
              fat={meal.fat}
              onDelete={loadMeals}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}
```

Now you will see all meals on this screen and you can delete meals from here as well.

## 47. Clear All Meals

Since this app is meant to track one day at a time, let's add a button to clear all meals from storage so that you can start fresh each day. Open `src/storage/meals.ts` and add the following function:

```tsx
export const clearAllMeals = async (): Promise<void> => {
  await AsyncStorage.removeItem(MEALS_KEY);
};
```

Now update the all meals screen to include a button that calls this function. Open `src/app/(tabs)/meals.tsx` and update to the following:

```tsx
import MealItem from '@/components/MealItem';
import { clearAllMeals, getMeals, Meal } from '@/storage/meals';
import { globalStyles } from '@/styles/global';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function AllMealsScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);

  const loadMeals = async () => {
    const data = await getMeals();
    setMeals(data);
  };

  const handleClearAll = async () => {
    await clearAllMeals();
    loadMeals();
  };

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, []),
  );

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>All Meals</Text>
        <TouchableOpacity onPress={handleClearAll}>
          <Text style={styles.clearButton}>Clear All</Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginTop: 30 }}>
        {meals.length === 0 ? (
          <Text style={globalStyles.empty}>No meals logged yet.</Text>
        ) : (
          meals.map((meal) => (
            <MealItem
              key={meal.id}
              id={meal.id}
              name={meal.name}
              calories={meal.calories}
              protein={meal.protein}
              carbs={meal.carbs}
              fat={meal.fat}
              onDelete={loadMeals}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = {
  clearButton: {
    color: 'red',
    fontSize: 16,
  },
};
```

## 48. Haptic Feedback

We have a basic meal tracking app with the ability to add and delete meals, and view them on the home screen and all meals screen. Let's add some haptic feedback (vibration) to improve the user experience when they add or delete a meal. Haptic feedback provides a tactile response to user actions, making the app feel more responsive and engaging.

Install the `expo-haptics` package using the following command:

```bash
npx expo install expo-haptics
```

There are a few places we want to add haptic feedback:

- When a meal is successfully added
- When a meal is deleted (home and all meals screens)

Let's start with the add meal screen. Open `src/app/(tabs)/add-meal.tsx` and import `Haptics` from `expo-haptics` at the top:

```tsx
import * as Haptics from 'expo-haptics';
```

Then, inside the `handleAddMeal` function, after the meal is successfully added and before showing the success alert, add the following line to trigger a success haptic feedback:

```tsx
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

That's it. You will not be able to feel the haptic feedback in the simulator, but when you run this on a physical device, you will feel a vibration when you add a meal.

## 49. Haptic Feedback For Deleting Meals

Now let's add haptic feedback for when a meal is deleted. Open `src/components/MealItem.tsx` and import `Haptics` from `expo-haptics` at the top:

```tsx
import * as Haptics from 'expo-haptics';
```

Then, inside the `handleLongPress` function, after the meal is successfully deleted and before calling the `onDelete` callback, add the following line to trigger a success haptic feedback:

```tsx
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

Now, whenever you delete a meal from either the home screen or the all meals screen, you will feel a vibration confirming that the meal has been deleted.

## 50. Share API

React Native provides a built-in `Share` API that allows you to share content from your app to other apps on the user's device, such as messaging apps, social media, email, etc. This can be a great way to let users share their meals or progress with friends or on social media.

Let's create a new component called `ShareButton` that we can reuse anywhere in the app. Create a new file at `src/components/ShareButton.tsx` and add the following code:

```tsx
import { Ionicons } from '@expo/vector-icons';
import { Share, TouchableOpacity } from 'react-native';
import { Meal } from '@/storage/meals';
import { colors } from '@/styles/global';

type ShareButtonProps = {
  meals: Meal[];
};

export default function ShareButton({ meals }: ShareButtonProps) {
  const handleShare = async () => {
    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    await Share.share({
      message: `MacroZone Daily Summary\n\nCalories: ${totals.calories}\nProtein: ${totals.protein}g\nCarbs: ${totals.carbs}g\nFat: ${totals.fat}g\n\nMeals: ${meals.length} logged today`,
    });
  };

  return (
    <TouchableOpacity onPress={handleShare}>
      <Ionicons name='share-outline' size={24} color={colors.primary} />
    </TouchableOpacity>
  );
}
```

This `ShareButton` component takes in an array of meals as a prop, calculates the total macros, and then uses the `Share` API to share a summary message that includes the total calories, protein, carbs, fat, and the number of meals logged for the day.

Now we can use the `ShareButton` component on the home screen. Open the `src/app/(tabs)/index.tsx` file and import the `ShareButton` component at the top:

```tsx
import ShareButton from '@/components/ShareButton';
```

Then add the `ShareButton` Replace the title with the following code to include the share button:

```tsx
<View style={globalStyles.header}>
  <Text style={globalStyles.title}>MacroZone</Text>
  <ShareButton meals={meals} />
</View>
```

Make sure to add the `header` style to your `globalStyles` in `src/styles/global.ts` if it is not there:

```tsx
header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},
```

Now you should see a share icon in the header of the home screen. When you tap it, it will open the native share dialog on your device with the summary of your meals for the day.

## 51. Clipboard API

Expo also provides a Clipboard API that allows you to copy text to the user's clipboard. This can be useful if you want to allow users to easily copy their meal summary or any other information from the app.

Let's install the `expo-clipboard` package to use the Clipboard API:

```bash
npx expo install expo-clipboard
```

Create a new component called `CopyButton` that we can reuse anywhere in the app. Create a new file at `src/components/CopyButton.tsx` and add the following code:

```tsx
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Meal } from '@/storage/meals';
import { colors } from '@/styles/global';

type CopyButtonProps = {
  meals: Meal[];
};

export default function CopyButton({ meals }: CopyButtonProps) {
  const handleCopy = async () => {
    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    const summary = `MacroZone Daily Summary\n\nCalories: ${totals.calories}\nProtein: ${totals.protein}g\nCarbs: ${totals.carbs}g\nFat: ${totals.fat}g\n\nMeals: ${meals.length} logged today`;

    await Clipboard.setStringAsync(summary);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copied!', 'Macro summary copied to clipboard.');
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleCopy}>
      <Ionicons name='copy-outline' size={18} color={colors.primary} />
      <Text style={styles.text}>Copy Summary</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  text: {
    color: colors.primary,
    fontSize: 14,
  },
});
```

In this component, we calculate the total the totals and create a formatted summary string and use `Clipboard.setStringAsync` to copy it to the user's clipboard. We also trigger a success haptic feedback and show an alert to confirm that the summary has been copied.

Now we can use the `CopyButton` component on the home screen. Open the `src/app/(tabs)/index.tsx` file and import the `CopyButton` component at the top:

```tsx
import CopyButton from '@/components/CopyButton';
```

Then add the `CopyButton` to the home screen, passing in the meals as a prop:

```tsx
<MacroGrid meals={meals} />
<CopyButton meals={meals} />
<RecentMeals meals={meals} onDelete={loadMeals} />
```

You should now see a "Copy Summary" button below the macro grid on the home screen.

## 52. Notifications

Expo also provides a Notifications API that allows you to schedule and send local notifications to the user. This can be useful for reminding users to log their meals, providing daily summaries, or any other type of notification you want to send.

It is important to mention that notifications will not work in the simulator using Expo Go as of SDK 53. You will need to run the app on a physical device to test notifications.

To use the Notifications API, we need to install the `expo-notifications` package:

```bash
npx expo install expo-notifications
```

### Notifications Utility

Let's setup a utility file to handle scheduling notifications. Create a new file at `src/utils/notifications.ts` and add the following code:

```tsx
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const requestPermissions = async (): Promise<boolean> => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const scheduleMealReminders = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'MacroZone',
      body: "Don't forget to log your lunch!",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 12,
      minute: 0,
    },
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'MacroZone',
      body: 'Time to log your dinner!',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 18,
      minute: 0,
    },
  });
};

export const cancelMealReminders = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
```

We set up a notification handler to specify how notifications should be displayed. We also have a function to request notification permissions from the user, a function to schedule daily meal reminder notifications at specific times, and a function to cancel all scheduled notifications.

## 53. Reminder Toggler

We have the notifications utility set up, now let's create a simple component that allows the user to toggle meal reminders on and off. Create a new file at `src/components/ReminderToggle.tsx` and add the following code:

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { colors } from '@/styles/global';
import {
  cancelMealReminders,
  requestPermissions,
  scheduleMealReminders,
} from '@/utils/notifications';

const REMINDERS_KEY = 'remindersEnabled';

export default function ReminderToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const load = async () => {
      const val = await AsyncStorage.getItem(REMINDERS_KEY);
      setEnabled(val === 'true');
    };
    load();
  }, []);

  const toggle = async (value: boolean) => {
    if (value) {
      const granted = await requestPermissions();
      if (!granted) return;
      await scheduleMealReminders();
    } else {
      await cancelMealReminders();
    }
    setEnabled(value);
    await AsyncStorage.setItem(REMINDERS_KEY, value.toString());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Meal Reminders</Text>
      <Switch
        value={enabled}
        onValueChange={toggle}
        trackColor={{ false: colors.surface, true: colors.primary }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
  },
  label: {
    color: colors.text,
    fontSize: 16,
  },
});
```

We use a `Switch` to allow the user to enable or disable meal reminders. We load the initial state from `AsyncStorage` to remember the user's preference. When the switch is toggled on, we request notification permissions and schedule the meal reminders. When toggled off, we cancel all scheduled notifications. We also save the user's preference in `AsyncStorage` so that it persists across app restarts.

### Add ReminderToggle to Home Screen

Finally, we can add the `ReminderToggle` component to the home screen. Open the `src/app/(tabs)/index.tsx` file and import the `ReminderToggle` component at the top:

```tsx
import ReminderToggle from '@/components/ReminderToggle';
```

Then add the `ReminderToggle` to the home screen, preferably below the recent meals section:

```tsx
<MacroGrid meals={meals} />
<CopyButton meals={meals} />
<ReminderToggle />
<RecentMeals meals={meals} onDelete={loadMeals} />
```

Now you should see a "Meal Reminders" toggle on the home screen. When you enable it, it will request notification permissions and schedule daily reminders to log meals. When you disable it, it will cancel all scheduled notifications. The user's preference will be saved so that it persists across app restarts.

### Important Note For Android Testing

If you are testing with Android using the simulator, you will not receive notifications because the Android emulator does not support push notifications. To test notifications on Android, you will need to run the app on a physical device.

In order to avoid the app breaking in the sim, you can add a check like this:

```tsx
{
  Platform.OS !== 'android' && <ReminderToggle />;
}
```

If you want notifications to work on the production build for Android, remove the platform check and make sure to test on a physical Android device before publishing.

## 54. EAS Build

Now that we have our application fully built out with meal tracking, storage, sharing, and notifications, we can create a production build that can be distributed to users. We already registered our app with Expo and have the EAS CLI installed, so we are ready to create a production build using EAS Build.

- For iOS, you need a $99/year Apple Developer account to create a production build that can be distributed on the App Store or installed on physical devices.
- For Android, you need a Google Play Developer account to create a production build that can be distributed on the Google Play Store. However, you can create an Android production build and install it on physical devices without a Google Play Developer account.

To create a production build, run the following command in your terminal:

```bash
npx eas build --platform all
```

You can also specify a single platform if you only want to build for iOS or Android:

```bash
npx eas build --platform ios
```

```bash
npx eas build --platform android
```

This command will start the build process for the specified platform(s). Follow the prompts to configure your build, such as selecting the type of build (development or production) and providing any necessary credentials.

Once the build is complete, you will receive a link to download the production build of your app.

For Android, it will give you a **.aab** file, which is the file type to submit to the app store. If you want to just install on a device, you need a **.apk** file, which you can get by changing a value in your **eas.json** file:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

Then you would run the following to build:

```bash
eas build --platform android --profile preview
```

Then you can install the apk file on a physical device over a USB.
