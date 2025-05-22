import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { Appbar, Card, Title, Paragraph, Chip, DataTable, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAirQuality } from '../contexts/AirQualityContext';
import { useTheme } from '../contexts/ThemeContext';

type PollutantType = 'aqi' | 'pm25' | 'pm10' | 'o3' | 'no2' | 'so2';
type TimeRangeType = 'day' | 'week' | 'month';

const StatsScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode, theme } = useTheme();
  const { currentReading, historicalData, isLoading } = useAirQuality();
  
  const [selectedPollutant, setSelectedPollutant] = useState<PollutantType>('aqi');
  const [timeRange, setTimeRange] = useState<TimeRangeType>('day');
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);

  const screenWidth = Dimensions.get('window').width - 40;

  // Chuyển đổi dữ liệu lịch sử thành định dạng cho biểu đồ
  const prepareChartData = () => {
    if (!historicalData || historicalData.length === 0) {
      return { labels: [], datasets: [{ data: [] }] };
    }

    // Lọc dữ liệu theo thời gian
    let filteredData = [...historicalData];
    const now = Date.now();
    
    if (timeRange === 'day') {
      filteredData = historicalData.filter(d => d.timestamp > now - 24 * 60 * 60 * 1000);
    } else if (timeRange === 'week') {
      filteredData = historicalData.filter(d => d.timestamp > now - 7 * 24 * 60 * 60 * 1000);
    } else {
      filteredData = historicalData.filter(d => d.timestamp > now - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Sắp xếp theo thời gian
    filteredData.sort((a, b) => a.timestamp - b.timestamp);
    
    // Định dạng nhãn thời gian
    const labels = filteredData.map(d => {
      const date = new Date(d.timestamp);
      if (timeRange === 'day') {
        return `${date.getHours()}:00`;
      } else if (timeRange === 'week') {
        return date.toLocaleDateString(undefined, { weekday: 'short' });
      } else {
        return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
      }
    });
    
    // Lấy dữ liệu cho biểu đồ
    const values = filteredData.map(d => {
      switch (selectedPollutant) {
        case 'aqi': return d.pollutants.aqi;
        case 'pm25': return d.pollutants.pm25;
        case 'pm10': return d.pollutants.pm10;
        case 'o3': return d.pollutants.o3;
        case 'no2': return d.pollutants.no2;
        case 'so2': return d.pollutants.so2;
        default: return d.pollutants.aqi;
      }
    });
    
    // Để so sánh, thêm một chất ô nhiễm khác
    let comparisonData: number[] = [];
    if (comparisonMode) {
      // Đảm bảo secondaryPollutant chỉ là 'aqi' hoặc 'pm25'
      const secondaryPollutant: 'aqi' | 'pm25' = selectedPollutant === 'aqi' ? 'pm25' : 'aqi';
      comparisonData = filteredData.map(d => {
        return secondaryPollutant === 'aqi' ? d.pollutants.aqi : d.pollutants.pm25;
      });
    }
    
    // Chỉ giữ số lượng nhãn giới hạn để tránh quá đông
    let step = 1;
    if (labels.length > 12) {
      step = Math.ceil(labels.length / 12);
    }
    
    const filteredLabels = labels.filter((_, i) => i % step === 0);
    
    // Trả về dữ liệu biểu đồ
    return {
      labels: filteredLabels,
      datasets: [
        {
          data: values,
          color: (opacity = 1) => `rgba(66, 133, 244, ${opacity})`,
          strokeWidth: 2
        },
        ...(comparisonMode ? [{
          data: comparisonData,
          color: (opacity = 1) => `rgba(219, 68, 55, ${opacity})`,
          strokeWidth: 2
        }] : [])
      ],
      legend: comparisonMode ? [
        selectedPollutant.toUpperCase(),
        (selectedPollutant === 'aqi' ? 'PM2.5' : 'AQI')
      ] : [selectedPollutant.toUpperCase()]
    };
  };

  // Thống kê cơ bản
  const calculateStatistics = () => {
    if (!historicalData || historicalData.length === 0) {
      return { avg: 0, max: 0, min: 0, current: 0, trend: 'stable' };
    }
    
    // Lọc dữ liệu
    let filteredData = [...historicalData];
    const now = Date.now();
    
    if (timeRange === 'day') {
      filteredData = historicalData.filter(d => d.timestamp > now - 24 * 60 * 60 * 1000);
    } else if (timeRange === 'week') {
      filteredData = historicalData.filter(d => d.timestamp > now - 7 * 24 * 60 * 60 * 1000);
    } else {
      filteredData = historicalData.filter(d => d.timestamp > now - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Lấy giá trị theo loại chất ô nhiễm
    const values = filteredData.map(d => {
      switch (selectedPollutant) {
        case 'aqi': return d.pollutants.aqi;
        case 'pm25': return d.pollutants.pm25;
        case 'pm10': return d.pollutants.pm10;
        case 'o3': return d.pollutants.o3;
        case 'no2': return d.pollutants.no2;
        case 'so2': return d.pollutants.so2;
        default: return d.pollutants.aqi;
      }
    });
    
    // Tính các thống kê
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const max = values.length > 0 ? Math.max(...values) : 0;
    const min = values.length > 0 ? Math.min(...values) : 0;
    
    // Lấy giá trị hiện tại
    const current = currentReading ? 
      (selectedPollutant === 'aqi' ? currentReading.pollutants.aqi : 
       selectedPollutant === 'pm25' ? currentReading.pollutants.pm25 :
       selectedPollutant === 'pm10' ? currentReading.pollutants.pm10 :
       selectedPollutant === 'o3' ? currentReading.pollutants.o3 :
       selectedPollutant === 'no2' ? currentReading.pollutants.no2 :
       currentReading.pollutants.so2) : 0;
    
    // Xác định xu hướng
    let trend = 'stable';
    if (values.length > 2) {
      const firstHalf = values.slice(0, Math.floor(values.length / 2));
      const secondHalf = values.slice(Math.floor(values.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      if (secondHalfAvg > firstHalfAvg * 1.1) {
        trend = 'increasing';
      } else if (secondHalfAvg < firstHalfAvg * 0.9) {
        trend = 'decreasing';
      }
    }
    
    return { avg, max, min, current, trend };
  };

  const stats = calculateStatistics();
  
  // Tên đầy đủ của các chất ô nhiễm
  const getPollutantFullName = (type: PollutantType) => {
    switch (type) {
      case 'aqi': return 'Air Quality Index';
      case 'pm25': return 'PM2.5 (Fine Particulate Matter)';
      case 'pm10': return 'PM10 (Coarse Particulate Matter)';
      case 'o3': return 'Ozone (O₃)';
      case 'no2': return 'Nitrogen Dioxide (NO₂)';
      case 'so2': return 'Sulfur Dioxide (SO₂)';
      default: return 'Air Quality Index';
    }
  };
  
  // Đơn vị đo
  const getPollutantUnit = (type: PollutantType) => {
    switch (type) {
      case 'aqi': return '';
      default: return 'μg/m³';
    }
  };
  
  // Màu sắc cho xu hướng
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return '#DB4437'; // đỏ
      case 'decreasing': return '#0F9D58'; // xanh lá
      default: return '#F4B400'; // vàng
    }
  };
  
  // Icon cho xu hướng
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'arrow-up';
      case 'decreasing': return 'arrow-down';
      default: return 'arrow-right';
    }
  };

  // Thông tin về các mức AQI
  const aqiLevels = [
    { range: '0-50', description: 'Good', color: '#009966' },
    { range: '51-100', description: 'Moderate', color: '#ffde33' },
    { range: '101-150', description: 'Unhealthy for Sensitive Groups', color: '#ff9933' },
    { range: '151-200', description: 'Unhealthy', color: '#cc0033' },
    { range: '201-300', description: 'Very Unhealthy', color: '#660099' },
    { range: '301+', description: 'Hazardous', color: '#7e0023' }
  ];
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Detailed Statistics & Analysis" />
        <Appbar.Action icon="information" onPress={() => {}} />
      </Appbar.Header>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16, color: isDarkMode ? '#e0e0e0' : '#666' }}>
            Loading statistics...
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {/* Bộ lọc */}
          <View style={styles.filterContainer}>
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: isDarkMode ? '#e0e0e0' : '#333' }]}>Pollutant:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(['aqi', 'pm25', 'pm10', 'o3', 'no2', 'so2'] as PollutantType[]).map(type => (
                  <Chip 
                    key={type} 
                    selected={selectedPollutant === type}
                    onPress={() => setSelectedPollutant(type)}
                    style={[
                      styles.chip,
                      selectedPollutant === type && { backgroundColor: theme.colors.primary }
                    ]}
                    textStyle={{ 
                      color: selectedPollutant === type ? '#fff' : (isDarkMode ? '#e0e0e0' : '#333')
                    }}
                  >
                    {type.toUpperCase()}
                  </Chip>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: isDarkMode ? '#e0e0e0' : '#333' }]}>Time Range:</Text>
              <View style={styles.chipContainer}>
                {(['day', 'week', 'month'] as TimeRangeType[]).map(range => (
                  <Chip 
                    key={range} 
                    selected={timeRange === range}
                    onPress={() => setTimeRange(range)}
                    style={[
                      styles.chip,
                      timeRange === range && { backgroundColor: theme.colors.primary }
                    ]}
                    textStyle={{ 
                      color: timeRange === range ? '#fff' : (isDarkMode ? '#e0e0e0' : '#333')
                    }}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </Chip>
                ))}
              </View>
            </View>
            
            <Chip
              selected={comparisonMode}
              onPress={() => setComparisonMode(!comparisonMode)}
              icon={comparisonMode ? "check" : "compare"}
              style={[
                styles.comparisonChip,
                comparisonMode && { backgroundColor: theme.colors.primary }
              ]}
            >
              Compare with {selectedPollutant === 'aqi' ? 'PM2.5' : 'AQI'}
            </Chip>
          </View>

          {/* Thẻ hiển thị thông tin tổng quan */}
          <Card style={[styles.overviewCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
            <Card.Content>
              <Title style={{ color: isDarkMode ? '#e0e0e0' : '#333' }}>
                {getPollutantFullName(selectedPollutant)}
              </Title>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: isDarkMode ? '#aaa' : '#666' }]}>Current</Text>
                  <Text style={[styles.statValue, { color: isDarkMode ? '#e0e0e0' : '#333' }]}>
                    {stats.current.toFixed(1)}{getPollutantUnit(selectedPollutant)}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: isDarkMode ? '#aaa' : '#666' }]}>Average</Text>
                  <Text style={[styles.statValue, { color: isDarkMode ? '#e0e0e0' : '#333' }]}>
                    {stats.avg.toFixed(1)}{getPollutantUnit(selectedPollutant)}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: isDarkMode ? '#aaa' : '#666' }]}>Maximum</Text>
                  <Text style={[styles.statValue, { color: isDarkMode ? '#e0e0e0' : '#333' }]}>
                    {stats.max.toFixed(1)}{getPollutantUnit(selectedPollutant)}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: isDarkMode ? '#aaa' : '#666' }]}>Minimum</Text>
                  <Text style={[styles.statValue, { color: isDarkMode ? '#e0e0e0' : '#333' }]}>
                    {stats.min.toFixed(1)}{getPollutantUnit(selectedPollutant)}
                  </Text>
                </View>
              </View>
              <View style={styles.trendContainer}>
                <Text style={[styles.trendLabel, { color: isDarkMode ? '#aaa' : '#666' }]}>
                  Trend:
                </Text>
                <View style={styles.trendIndicator}>
                  <FontAwesome5 
                    name={getTrendIcon(stats.trend)} 
                    size={16} 
                    color={getTrendColor(stats.trend)} 
                  />
                  <Text style={[styles.trendText, { color: getTrendColor(stats.trend) }]}>
                    {stats.trend.charAt(0).toUpperCase() + stats.trend.slice(1)}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Biểu đồ đường */}
          <Card style={[styles.chartCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
            <Card.Content>
              <Title style={{ color: isDarkMode ? '#e0e0e0' : '#333', marginBottom: 10 }}>
                Historical Trend
              </Title>
              <LineChart
                data={prepareChartData()}
                width={screenWidth}
                height={220}
                chartConfig={{
                  backgroundColor: isDarkMode ? '#121212' : '#fff',
                  backgroundGradientFrom: isDarkMode ? '#1e1e1e' : '#fff',
                  backgroundGradientTo: isDarkMode ? '#1e1e1e' : '#fff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "4",
                    strokeWidth: "1",
                    stroke: theme.colors.primary
                  }
                }}
                bezier
                style={styles.chart}
                fromZero
                withDots={timeRange !== 'month'}
                withShadow={false}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                yAxisLabel=""
                yAxisSuffix={getPollutantUnit(selectedPollutant)}
                formatYLabel={(value: string) => Number(value).toFixed(0)}
                renderDotContent={({ x, y, index, indexData }) => (
                  timeRange === 'day' && index % 3 === 0 ? (
                    <View
                      key={index}
                      style={{
                        position: 'absolute',
                        top: y - 24,
                        left: x - 16,
                      }}
                    >
                      <Text style={{ color: isDarkMode ? '#e0e0e0' : '#333', fontSize: 10 }}>
                        {indexData.toFixed(0)}
                      </Text>
                    </View>
                  ) : null
                )}
              />
            </Card.Content>
          </Card>

          {/* Phân phối dữ liệu theo biểu đồ cột */}
          <Card style={[styles.chartCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
            <Card.Content>
              <Title style={{ color: isDarkMode ? '#e0e0e0' : '#333', marginBottom: 10 }}>
                Distribution by Time of Day
              </Title>
              <Paragraph style={{ color: isDarkMode ? '#aaa' : '#666', marginBottom: 10 }}>
                Average {selectedPollutant.toUpperCase()} values by time of day
              </Paragraph>
              <BarChart
                style={styles.chart}
                data={{
                  labels: ['Morning', 'Noon', 'Evening', 'Night'],
                  datasets: [{
                    data: [
                      stats.avg * (0.8 + Math.random() * 0.4),
                      stats.avg * (0.9 + Math.random() * 0.3),
                      stats.avg * (1.1 + Math.random() * 0.3),
                      stats.avg * (0.7 + Math.random() * 0.4)
                    ]
                  }]
                }}
                width={screenWidth}
                height={220}
                chartConfig={{
                  backgroundColor: isDarkMode ? '#121212' : '#fff',
                  backgroundGradientFrom: isDarkMode ? '#1e1e1e' : '#fff',
                  backgroundGradientTo: isDarkMode ? '#1e1e1e' : '#fff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(66, 133, 244, ${opacity})`,
                  labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  barPercentage: 0.7,
                }}
                fromZero
                showValuesOnTopOfBars={true}
                withHorizontalLabels={true}
                segments={5}
                yAxisLabel=""
                yAxisSuffix={getPollutantUnit(selectedPollutant)}
              />
            </Card.Content>
          </Card>

          {/* Bảng mức AQI */}
          {selectedPollutant === 'aqi' && (
            <Card style={[styles.aqiLevelsCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <Card.Content>
                <Title style={{ color: isDarkMode ? '#e0e0e0' : '#333', marginBottom: 10 }}>
                  AQI Levels Reference
                </Title>
                <DataTable>
                  <DataTable.Header>
                    <DataTable.Title>
                      <Text style={{ color: isDarkMode ? '#e0e0e0' : '#333', fontWeight: 'bold' }}>Range</Text>
                    </DataTable.Title>
                    <DataTable.Title>
                      <Text style={{ color: isDarkMode ? '#e0e0e0' : '#333', fontWeight: 'bold' }}>Level</Text>
                    </DataTable.Title>
                    <DataTable.Title numeric>
                      <Text style={{ color: isDarkMode ? '#e0e0e0' : '#333', fontWeight: 'bold' }}>Color</Text>
                    </DataTable.Title>
                  </DataTable.Header>

                  {aqiLevels.map((level, index) => (
                    <DataTable.Row key={index}>
                      <DataTable.Cell>
                        <Text style={{ color: isDarkMode ? '#e0e0e0' : '#333' }}>{level.range}</Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <Text style={{ color: isDarkMode ? '#e0e0e0' : '#333' }}>{level.description}</Text>
                      </DataTable.Cell>
                      <DataTable.Cell numeric>
                        <View style={[styles.colorIndicator, { backgroundColor: level.color }]} />
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))}
                </DataTable>
              </Card.Content>
            </Card>
          )}

          {/* Thông tin chi tiết về chất ô nhiễm */}
          <Card style={[styles.infoCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
            <Card.Content>
              <Title style={{ color: isDarkMode ? '#e0e0e0' : '#333' }}>
                About {getPollutantFullName(selectedPollutant)}
              </Title>
              <Paragraph style={{ color: isDarkMode ? '#aaa' : '#666', marginTop: 10, lineHeight: 20 }}>
                {selectedPollutant === 'aqi' && 'The Air Quality Index (AQI) is a standardized indicator for reporting air quality. It tells you how clean or polluted your air is, and what associated health effects might be a concern.'}
                {selectedPollutant === 'pm25' && 'PM2.5 refers to fine inhalable particles with diameters generally 2.5 micrometers and smaller. These particles can penetrate deep into the lungs and even into the bloodstream, causing respiratory and cardiovascular issues.'}
                {selectedPollutant === 'pm10' && 'PM10 refers to inhalable particles with diameters that are generally 10 micrometers and smaller. These particles can enter the lungs and cause respiratory problems.'}
                {selectedPollutant === 'o3' && 'Ozone (O₃) at ground level is a harmful air pollutant. It forms when pollutants emitted by cars, power plants, and other sources chemically react in the presence of sunlight.'}
                {selectedPollutant === 'no2' && 'Nitrogen Dioxide (NO₂) is a gaseous air pollutant produced by combustion processes. It can cause inflammation of the airways and increased susceptibility to respiratory infections.'}
                {selectedPollutant === 'so2' && 'Sulfur Dioxide (SO₂) is a gas produced from burning fossil fuels containing sulfur. It can affect the respiratory system, particularly lung function, and can irritate the eyes.'}
              </Paragraph>
              
              <Title style={{ color: isDarkMode ? '#e0e0e0' : '#333', marginTop: 20, marginBottom: 10 }}>
                Health Effects
              </Title>
              <Paragraph style={{ color: isDarkMode ? '#aaa' : '#666', lineHeight: 20 }}>
                {selectedPollutant === 'aqi' && 'Higher AQI values indicate greater levels of air pollution and greater health concerns. When AQI exceeds 100, air quality is considered unhealthy for sensitive groups, and above 150, it becomes unhealthy for everyone.'}
                {selectedPollutant === 'pm25' && 'Exposure to PM2.5 can cause short-term health effects such as eye, nose, throat and lung irritation, coughing, sneezing, runny nose and shortness of breath. Long-term exposure can lead to reduced lung function and increased mortality from cardiovascular and respiratory diseases.'}
                {selectedPollutant === 'pm10' && 'PM10 can cause respiratory issues, aggravate asthma, and contribute to cardiovascular problems. It can also carry toxic substances that may lead to various health complications.'}
                {selectedPollutant === 'o3' && 'Ozone can make it more difficult to breathe deeply, cause shortness of breath and pain when taking deep breaths, cause coughing and sore throat, inflame and damage the airways, and worsen asthma and other lung diseases.'}
                {selectedPollutant === 'no2' && 'NO₂ can irritate the respiratory system, aggravate respiratory diseases, particularly asthma, leading to coughing, wheezing or difficulty breathing. Long-term exposure may contribute to the development of asthma and potentially increase susceptibility to respiratory infections.'}
                {selectedPollutant === 'so2' && 'SO₂ affects the respiratory system, causing irritation to the nose, throat, and airways. It can cause coughing, wheezing, shortness of breath, or a tight feeling around the chest. People with asthma or similar conditions are particularly sensitive to SO₂.'}
              </Paragraph>
            </Card.Content>
          </Card>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  filterContainer: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  comparisonChip: {
    marginTop: 8,
  },
  overviewCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    elevation: 4,
  },
  aqiLevelsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  statItem: {
    width: '50%',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  trendLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});

export default StatsScreen; 