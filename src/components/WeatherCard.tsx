import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { FontAwesome5 } from '@expo/vector-icons';

interface WeatherCardProps {
  parameter: 'temperature' | 'humidity' | 'pressure' | 'windSpeed';
  value: number;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ parameter, value }) => {
  const info = getWeatherInfo(parameter, value);
  
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.iconContainer}>
          <FontAwesome5 name={info.icon} size={24} color="#2196F3" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.value}>{info.formattedValue}</Text>
          <Text style={styles.parameter}>{info.label}</Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const getWeatherInfo = (parameter: string, value: number) => {
  switch (parameter) {
    case 'temperature':
      return {
        icon: 'temperature-high',
        label: 'Temperature',
        formattedValue: `${value.toFixed(1)}°C`,
      };
    case 'humidity':
      return {
        icon: 'water',
        label: 'Humidity',
        formattedValue: `${value.toFixed(0)}%`,
      };
    case 'pressure':
      return {
        icon: 'tachometer-alt',
        label: 'Pressure',
        formattedValue: `${value.toFixed(0)} hPa`,
      };
    case 'windSpeed':
      return {
        icon: 'wind',
        label: 'Wind Speed',
        formattedValue: `${value.toFixed(1)} m/s`,
      };
    default:
      return {
        icon: 'question',
        label: 'Unknown',
        formattedValue: `${value}`,
      };
  }
};

const styles = StyleSheet.create({
  card: {
    margin: 6,
    borderRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  parameter: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
});

export default WeatherCard; 