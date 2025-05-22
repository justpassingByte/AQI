import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { DataPoint } from '../types';

interface AQIChartProps {
  data: DataPoint[];
  title?: string;
}

const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return '#009966'; // Good
  if (aqi <= 100) return '#ffde33'; // Moderate
  if (aqi <= 150) return '#ff9933'; // Unhealthy for Sensitive Groups
  if (aqi <= 200) return '#cc0033'; // Unhealthy
  if (aqi <= 300) return '#660099'; // Very Unhealthy
  return '#7e0023'; // Hazardous
};

const AQIChart: React.FC<AQIChartProps> = ({ data, title = 'AQI History' }) => {
  const screenWidth = Dimensions.get('window').width - 30;
  
  const chartData = {
    labels: data.map(item => item.time),
    datasets: [
      {
        data: data.map(item => item.aqi),
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['AQI'],
  };

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
    },
  };

  const averageAQI = Math.round(
    data.reduce((sum, item) => sum + item.aqi, 0) / data.length
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <LineChart
        data={chartData}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: getAQIColor(averageAQI) }]}>
          <Text style={styles.statValue}>{averageAQI}</Text>
          <Text style={styles.statLabel}>Average AQI</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: getAQIColor(Math.max(...data.map(item => item.aqi))) }]}>
          <Text style={styles.statValue}>{Math.max(...data.map(item => item.aqi))}</Text>
          <Text style={styles.statLabel}>Max AQI</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: getAQIColor(Math.min(...data.map(item => item.aqi))) }]}>
          <Text style={styles.statValue}>{Math.min(...data.map(item => item.aqi))}</Text>
          <Text style={styles.statLabel}>Min AQI</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statBox: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
  },
});

export default AQIChart; 