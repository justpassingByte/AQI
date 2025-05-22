import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { AirQualityProvider } from './src/contexts/AirQualityContext';
import { RootStackParamList } from './src/types';
import { Provider as PaperProvider } from 'react-native-paper';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import StatsScreen from './src/screens/StatsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ExportScreen from './src/screens/ExportScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AirQualityProvider>
            <PaperProvider>
              <NavigationContainer>
                <StatusBar style="auto" />
                <Stack.Navigator 
                  initialRouteName="Home"
                  screenOptions={{ 
                    headerShown: false,
                    animation: 'slide_from_right'
                  }}
                >
                  <Stack.Screen name="Home" component={HomeScreen} />
                  <Stack.Screen name="Stats" component={StatsScreen} />
                  <Stack.Screen name="Notifications" component={NotificationsScreen} />
                  <Stack.Screen name="Profile" component={ProfileScreen} />
                  <Stack.Screen name="Export" component={ExportScreen} />
                  <Stack.Screen 
                    name="Login" 
                    component={LoginScreen} 
                    options={{ headerShown: false }} 
                  />
                  <Stack.Screen 
                    name="Register" 
                    component={RegisterScreen}
                    options={{ headerShown: false }} 
                  />
                </Stack.Navigator>
              </NavigationContainer>
            </PaperProvider>
          </AirQualityProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
