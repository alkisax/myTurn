// native\src\app\info\index.tsx

import { ThemeContext } from '@/context/ThemeContext';
import Navbar from '@/layout/Navbar'
import { createGlobalStyles } from '@/styles/global';
import { useContext } from 'react';
import { Text, View } from 'react-native'

const Info = () => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);

  return (

    <>
      <View style={globalStyles.screen}>
        <Navbar minimal />
        <View style={globalStyles.centerContent}>
          <Text style={globalStyles.title}>Info</Text>
        </View>
      </View>
    </>

  )
}

export default Info
