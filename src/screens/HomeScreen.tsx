import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import { ActivityIndicator, Appbar, Button, Card, FAB } from 'react-native-paper';
import AirQualityChart from '../components/AirQualityChart';
import PollutantCard from '../components/PollutantCard';
import WeatherCard from '../components/WeatherCard';
import { useAirQuality } from '../contexts/AirQualityContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getAQI } from '../services/aqiService';
import { AQIData, RootStackParamList } from '../types';
import AQICard from '../components/AQICard';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const { isDarkMode, theme } = useTheme();
  const { 
    currentReading, 
    historicalData, 
    isLoading, 
    error: airQualityError, 
    fetchAirQualityData 
  } = useAirQuality();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPollutant, setSelectedPollutant] = useState<'no2' | 'so2' | 'o3' | 'pm25' | 'pm10' | 'aqi'>('aqi');
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAQIData = async () => {
    setError(null);
    try {
      const data = await getAQI();
      setAqiData(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AQI data');
      Alert.alert('Error', 'Failed to fetch AQI data');
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAQIData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Không dùng tọa độ cố định, để API tự động xác định vị trí
      await fetchAQIData();
    } finally {
      setRefreshing(false);
    }
  };

  // Get the overall air quality status based on aqiData
  const getAirQualityStatus = () => {
    if (!aqiData) return { text: 'Unknown', color: '#757575' };
    
    const aqi = aqiData.aqi;
    
    if (aqi <= 50) return { text: 'Good', color: '#00E400' };
    if (aqi <= 100) return { text: 'Moderate', color: '#FFFF00' };
    if (aqi <= 150) return { text: 'Unhealthy for Sensitive Groups', color: '#FF7E00' };
    if (aqi <= 200) return { text: 'Unhealthy', color: '#FF0000' };
    if (aqi <= 300) return { text: 'Very Unhealthy', color: '#99004C' };
    return { text: 'Hazardous', color: '#7E0023' };
  };

  const status = getAirQualityStatus();

  // Chuyển đổi từ dữ liệu API sang định dạng phù hợp cho biểu đồ
  const prepareHistoricalData = () => {
    if (!aqiData) return [];
    
    // Tạo dữ liệu giả cho biểu đồ dựa trên giá trị hiện tại
    // Trong thực tế, bạn sẽ sử dụng API lịch sử thực
    return Array.from({ length: 24 }, (_, i) => ({
      timestamp: Date.now() - i * 60 * 60 * 1000,
      pollutants: {
        aqi: Math.max(0, aqiData.aqi + Math.floor((Math.random() - 0.5) * 20)),
        no2: aqiData.iaqi.no2?.v || 0,
        so2: aqiData.iaqi.so2?.v || 0,
        o3: aqiData.iaqi.o3?.v || 0,
        pm25: aqiData.iaqi.pm25?.v || 0,
        pm10: aqiData.iaqi.pm10?.v || 0
      }
    }));
  };

  // Lấy giá trị từ iaqi trong aqiData
  const getPollutantValue = (type: string): number => {
    if (!aqiData || !aqiData.iaqi) return 0;
    return aqiData.iaqi[type]?.v || 0;
  };

  // Lấy dữ liệu thời tiết
  const getWeatherValue = (type: string): number => {
    if (!aqiData || !aqiData.iaqi) return 0;
    
    switch (type) {
      case 'temperature':
        return aqiData.iaqi.t?.v || 0;
      case 'humidity':
        return aqiData.iaqi.h?.v || 0;
      case 'pressure':
        return aqiData.iaqi.p?.v || 0;
      case 'windSpeed':
        return aqiData.iaqi.w?.v || 0;
      default:
        return 0;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="Air Quality Monitor" subtitle={user?.school} />
        <Appbar.Action 
          icon="bell" 
          onPress={() => navigation.navigate('Notifications' as never)} 
        />
        <Appbar.Action 
          icon="export" 
          onPress={() => navigation.navigate('Export' as never)} 
        />
        <Appbar.Action 
          icon="account" 
          onPress={() => navigation.navigate('Profile' as never)} 
        />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: isDarkMode ? '#e0e0e0' : '#666' }]}>Loading air quality data...</Text>
          </View>
        ) : error ? (
          <Card style={[styles.errorCard, { backgroundColor: isDarkMode ? '#452222' : '#ffebee' }]}>
            <Card.Content>
              <Text style={[styles.errorText, { color: isDarkMode ? '#ff6b6b' : '#d32f2f' }]}>{error}</Text>
              <Button 
                mode="contained" 
                onPress={onRefresh} 
                style={[styles.retryButton, { backgroundColor: isDarkMode ? '#ff6b6b' : '#d32f2f' }]}
              >
                Retry
              </Button>
            </Card.Content>
          </Card>
        ) : aqiData ? (
          <>
            {/* Main AQI Display */}
            <Card style={[styles.aqiCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff' }]}>
              <Card.Content style={styles.aqiContent}>
                <Text style={[styles.locationText, { color: isDarkMode ? '#e0e0e0' : '#333' }]}>
                  {aqiData.city?.name || 'Unknown Location'}
                </Text>
                
                <View style={styles.aqiContainer}>
                  <Text style={[styles.aqiValue, { color: status.color }]}>
                    {aqiData.aqi.toFixed(0) || '--'}
                  </Text>
                  <Text style={[styles.aqiLabel, { color: isDarkMode ? '#aaa' : '#757575' }]}>AQI</Text>
                </View>
                
                <Text style={[styles.aqiStatus, { color: status.color }]}>
                  {status.text}
                </Text>
                
                <Text style={[styles.updatedText, { color: isDarkMode ? '#aaa' : '#757575' }]}>
                  Updated: {aqiData.time?.s ? new Date(aqiData.time.s).toLocaleTimeString() : 'N/A'}
                </Text>
              </Card.Content>
            </Card>

            {/* Pollutants Section */}
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#e0e0e0' : '#333' }]}>Pollutants</Text>
            <PollutantCard 
              type="no2" 
              value={getPollutantValue('no2')}
              onPress={() => setSelectedPollutant('no2')}
            />
            <PollutantCard 
              type="so2" 
              value={getPollutantValue('so2')}
              onPress={() => setSelectedPollutant('so2')}
            />
            <PollutantCard 
              type="o3" 
              value={getPollutantValue('o3')}
              onPress={() => setSelectedPollutant('o3')}
            />
            <PollutantCard 
              type="pm25" 
              value={getPollutantValue('pm25')}
              onPress={() => setSelectedPollutant('pm25')}
            />
            <PollutantCard 
              type="pm10" 
              value={getPollutantValue('pm10')}
              onPress={() => setSelectedPollutant('pm10')}
            />

            {/* Weather Section */}
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#e0e0e0' : '#333' }]}>Weather Conditions</Text>
            <View style={styles.weatherGrid}>
              <View style={styles.weatherColumn}>
                <WeatherCard 
                  parameter="temperature" 
                  value={getWeatherValue('temperature')}
                />
                <WeatherCard 
                  parameter="humidity" 
                  value={getWeatherValue('humidity')}
                />
              </View>
              <View style={styles.weatherColumn}>
                <WeatherCard 
                  parameter="pressure" 
                  value={getWeatherValue('pressure')}
                />
                <WeatherCard 
                  parameter="windSpeed" 
                  value={getWeatherValue('windSpeed')}
                />
              </View>
            </View>

            {/* Chart Section */}
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#e0e0e0' : '#333' }]}>Historical Data</Text>
            <AirQualityChart
              data={prepareHistoricalData()}
              pollutantType={selectedPollutant}
              timeRange="day"
            />
          </>
        ) : (
          <Card style={styles.noDataCard}>
            <Card.Content style={styles.noDataContent}>
              <FontAwesome5 name="wind" size={40} color={isDarkMode ? '#666' : '#757575'} />
              <Text style={[styles.noDataText, { color: isDarkMode ? '#aaa' : '#757575' }]}>No air quality data available</Text>
              <Button 
                mode="contained" 
                onPress={onRefresh} 
                style={styles.noDataButton}
              >
                Get Data
              </Button>
            </Card.Content>
          </Card>
        )}

        
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="chart-line"
        onPress={() => navigation.navigate('Stats')}
        label="View Statistics"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorCard: {
    margin: 16,
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#d32f2f',
  },
  aqiCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 4,
  },
  aqiContent: {
    alignItems: 'center',
    padding: 16,
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  aqiContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 8,
  },
  aqiValue: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  aqiLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 4,
    color: '#757575',
  },
  aqiStatus: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  updatedText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  weatherGrid: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  weatherColumn: {
    flex: 1,
  },
  noDataCard: {
    margin: 16,
    padding: 24,
  },
  noDataContent: {
    alignItems: 'center',
    padding: 24,
  },
  noDataText: {
    fontSize: 16,
    color: '#757575',
    marginVertical: 16,
    textAlign: 'center',
  },
  noDataButton: {
    marginTop: 16,
  },
  infoContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 15,
  },
  aqiLevelsContainer: {
    marginTop: 10,
  },
  aqiLevel: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 5,
  },
  aqiLevelText: {
    color: 'white',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
}); 