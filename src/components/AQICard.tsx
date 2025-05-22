import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { AQIData } from '../types';
import { getAQILevel } from '../services/aqiService';

interface AQICardProps {
  data: AQIData;
}

const AQICard: React.FC<AQICardProps> = ({ data }) => {
  const aqiLevel = getAQILevel(data.aqi);
  
  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={styles.location}>{data.city.name}</Text>
          <Text style={styles.time}>
            {new Date(data.time.v * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        
        <View style={styles.aqiContainer}>
          <View style={[styles.aqiCircle, { backgroundColor: aqiLevel.color }]}>
            <Text style={styles.aqiValue}>{data.aqi}</Text>
          </View>
          <View style={styles.aqiInfo}>
            <Text style={styles.aqiLabel}>{aqiLevel.emoji} {aqiLevel.level}</Text>
            <Text style={styles.aqiMessage}>{aqiLevel.message}</Text>
          </View>
        </View>
        
        <View style={styles.pollutantsContainer}>
          <Text style={styles.pollutantsTitle}>Pollutants</Text>
          <View style={styles.pollutantsList}>
            {Object.entries(data.iaqi).map(([key, value]) => (
              <View key={key} style={styles.pollutantItem}>
                <Text style={styles.pollutantName}>{key.toUpperCase()}</Text>
                <Text style={styles.pollutantValue}>{value.v}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.dominantPollutant}>
          <Text style={styles.dominantPollutantLabel}>
            Dominant Pollutant: <Text style={styles.dominantPollutantValue}>{data.dominentpol?.toUpperCase() || 'N/A'}</Text>
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  location: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 14,
    color: '#666',
  },
  aqiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  aqiCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  aqiValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  aqiInfo: {
    flex: 1,
  },
  aqiLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  aqiMessage: {
    fontSize: 14,
    color: '#333',
  },
  pollutantsContainer: {
    marginBottom: 15,
  },
  pollutantsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pollutantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pollutantItem: {
    width: '33%',
    marginBottom: 10,
  },
  pollutantName: {
    fontSize: 12,
    color: '#666',
  },
  pollutantValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dominantPollutant: {
    marginTop: 5,
  },
  dominantPollutantLabel: {
    fontSize: 14,
    color: '#666',
  },
  dominantPollutantValue: {
    fontWeight: 'bold',
    color: '#333',
  },
});

export default AQICard; 