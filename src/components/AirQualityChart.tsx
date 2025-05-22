import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

type PollutantType = 'no2' | 'so2' | 'o3' | 'pm25' | 'pm10' | 'aqi';
type TimeRangeType = 'day' | 'week' | 'month';

interface AirQualityChartProps {
  data: Array<{
    timestamp: number;
    pollutants: {
      aqi: number;
      no2: number;
      so2: number;
      o3: number;
      pm25: number;
      pm10: number;
    };
  }>;
  pollutantType: PollutantType;
  timeRange: TimeRangeType;
}

const getChartColor = (pollutantType: PollutantType) => {
  switch (pollutantType) {
    case 'no2': return '#E91E63'; // Pink
    case 'so2': return '#9C27B0'; // Purple
    case 'o3': return '#2196F3';  // Blue
    case 'pm25': return '#FF9800'; // Orange
    case 'pm10': return '#795548'; // Brown
    case 'aqi': return '#4CAF50';  // Green
    default: return '#4CAF50';
  }
};

const getPollutantLabel = (pollutantType: PollutantType) => {
  switch (pollutantType) {
    case 'no2': return 'NO₂';
    case 'so2': return 'SO₂';
    case 'o3': return 'O₃';
    case 'pm25': return 'PM2.5';
    case 'pm10': return 'PM10';
    case 'aqi': return 'AQI';
    default: return 'AQI';
  }
};

const formatTime = (timestamp: number, timeRange: TimeRangeType) => {
  const date = new Date(timestamp);
  
  if (timeRange === 'day') {
    return date.getHours() + ':00';
  } else if (timeRange === 'week') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  } else {
    return date.getDate() + '/' + (date.getMonth() + 1);
  }
};

const AirQualityChart: React.FC<AirQualityChartProps> = ({ data, pollutantType, timeRange }) => {
  // Skip data points based on time range to avoid crowding
  const filteredData = data.filter((_, index) => {
    if (timeRange === 'day') return index % 3 === 0; // Every 3 hours
    if (timeRange === 'week') return index % 2 === 0; // Every other day
    return true; // Show all for month
  });

  const chartData = {
    labels: filteredData.map(item => formatTime(item.timestamp, timeRange)),
    datasets: [
      {
        data: filteredData.map(item => item.pollutants[pollutantType]),
        color: (opacity = 1) => getChartColor(pollutantType),
        strokeWidth: 2,
      },
    ],
    legend: [getPollutantLabel(pollutantType)],
  };

  const screenWidth = Dimensions.get('window').width - 32;

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
      r: '5',
      strokeWidth: '2',
      stroke: getChartColor(pollutantType),
    },
  };

  // Calculate statistics
  const values = filteredData.map(item => item.pollutants[pollutantType]);
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{average.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{max}</Text>
          <Text style={styles.statLabel}>Maximum</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{min}</Text>
          <Text style={styles.statLabel}>Minimum</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    elevation: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
});

export default AirQualityChart; 