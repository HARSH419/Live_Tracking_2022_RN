/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import { View, Text } from 'react-native'
import React from 'react'
import Home from './src/Screens/Home'
import ChooseLocation from './src/Screens/ChooseLocation'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import FlashMessage from 'react-native-flash-message'

const App = () => {
  const Stack = createStackNavigator()


  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="home" component={Home} />
        <Stack.Screen name="chooseLocation" component={ChooseLocation} />
      </Stack.Navigator>
      <FlashMessage
        position="top"
      />
    </NavigationContainer>
  )
}

export default App