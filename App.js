import 'react-native-gesture-handler';
import React from 'react';
import {StatusBar} from 'react-native';
import StackNavigator from './src/navigation/navigation';

function App() {
  return (
    <>
      <StatusBar animated={true} barStyle="dark-content" backgroundColor="#fff"/>
      <StackNavigator />
    </>
  );
}

export default App;
