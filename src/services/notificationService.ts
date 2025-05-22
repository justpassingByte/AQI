import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getAQILevel } from './aqiService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  let token;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
};

export const sendAQIAlert = async (aqi: number, location: string) => {
  const aqiLevel = getAQILevel(aqi);
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${aqiLevel.emoji} AQI Alert (${aqi})`,
      body: `${location}: ${aqiLevel.message}`,
      data: { aqi, location },
    },
    trigger: null,
  });
};

export const scheduleAQICheckNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔔 AQI Check Reminder',
      body: 'Remember to check your local air quality index today!',
    },
    trigger: {
      hour: 9, // 9 AM
      minute: 0,
      repeats: true,
    },
  });
}; 