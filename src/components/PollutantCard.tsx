import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';

interface PollutantCardProps {
  type: 'no2' | 'so2' | 'o3' | 'pm25' | 'pm10';
  value: number;
  onPress?: () => void;
}

const PollutantCard: React.FC<PollutantCardProps> = ({ type, value, onPress }) => {
  // Get pollutant information
  const pollutantInfo = getPollutantInfo(type, value);

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card style={[styles.card, { borderLeftColor: pollutantInfo.color }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.leftContent}>
            <Text style={styles.pollutantName}>{pollutantInfo.name}</Text>
            <Text style={styles.pollutantDescription}>{pollutantInfo.description}</Text>
          </View>
          
          <View style={styles.rightContent}>
            <Text style={[styles.value, { color: pollutantInfo.color }]}>
              {value.toFixed(pollutantInfo.decimals)}
            </Text>
            <Text style={styles.unit}>{pollutantInfo.unit}</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

// Helper function to get information about each pollutant
const getPollutantInfo = (type: string, value: number) => {
  switch (type) {
    case 'no2':
      return {
        name: 'NO₂',
        description: 'Nitrogen dioxide',
        unit: 'ppb',
        decimals: 1,
        color: getColorForLevel(getNO2Level(value)),
      };
    case 'so2':
      return {
        name: 'SO₂',
        description: 'Sulfur dioxide',
        unit: 'ppb',
        decimals: 1,
        color: getColorForLevel(getSO2Level(value)),
      };
    case 'o3':
      return {
        name: 'O₃',
        description: 'Ozone',
        unit: 'ppb',
        decimals: 1,
        color: getColorForLevel(getO3Level(value)),
      };
    case 'pm25':
      return {
        name: 'PM2.5',
        description: 'Fine particulate matter',
        unit: 'μg/m³',
        decimals: 1,
        color: getColorForLevel(getPM25Level(value)),
      };
    case 'pm10':
      return {
        name: 'PM10',
        description: 'Coarse particulate matter',
        unit: 'μg/m³',
        decimals: 0,
        color: getColorForLevel(getPM10Level(value)),
      };
    default:
      return {
        name: 'Unknown',
        description: 'Pollutant',
        unit: '',
        decimals: 0,
        color: '#757575',
      };
  }
};

// Utility functions to determine pollution levels
const getNO2Level = (value: number) => {
  if (value <= 53) return 0;
  if (value <= 100) return 1;
  if (value <= 360) return 2;
  if (value <= 649) return 3;
  if (value <= 1249) return 4;
  return 5;
};

const getSO2Level = (value: number) => {
  if (value <= 35) return 0;
  if (value <= 75) return 1;
  if (value <= 185) return 2;
  if (value <= 304) return 3;
  if (value <= 604) return 4;
  return 5;
};

const getO3Level = (value: number) => {
  if (value <= 54) return 0;
  if (value <= 70) return 1;
  if (value <= 85) return 2;
  if (value <= 105) return 3;
  if (value <= 200) return 4;
  return 5;
};

const getPM25Level = (value: number) => {
  if (value <= 12) return 0;
  if (value <= 35.4) return 1;
  if (value <= 55.4) return 2;
  if (value <= 150.4) return 3;
  if (value <= 250.4) return 4;
  return 5;
};

const getPM10Level = (value: number) => {
  if (value <= 54) return 0;
  if (value <= 154) return 1;
  if (value <= 254) return 2;
  if (value <= 354) return 3;
  if (value <= 424) return 4;
  return 5;
};

const getColorForLevel = (level: number) => {
  const colors = [
    '#00E400', // Good - Green
    '#FFFF00', // Moderate - Yellow
    '#FF7E00', // Unhealthy for Sensitive Groups - Orange
    '#FF0000', // Unhealthy - Red
    '#99004C', // Very Unhealthy - Purple
    '#7E0023'  // Hazardous - Maroon
  ];
  return colors[level];
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderLeftWidth: 6,
    borderRadius: 8,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  leftContent: {
    flex: 3,
  },
  rightContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  pollutantName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pollutantDescription: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
});

export default PollutantCard; 