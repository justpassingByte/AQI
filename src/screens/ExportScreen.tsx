import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Appbar, Button, Card, Divider, RadioButton, Snackbar } from 'react-native-paper';
import { useAirQuality } from '../contexts/AirQualityContext';

export default function ExportScreen() {
  const navigation = useNavigation();
  const { currentReading, historicalData, exportData } = useAirQuality();
  
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('day');
  const [pollutantFilter, setPollutantFilter] = useState<'all' | 'no2' | 'so2' | 'o3' | 'pm25' | 'pm10'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleExport = async () => {
    if (!currentReading || historicalData.length === 0) {
      setSnackbarMessage('No data available to export');
      setShowSnackbar(true);
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, this would filter the data based on selections
      // and convert to appropriate format
      const jsonData = await exportData();
      
      // Share the data using the share dialog
      await Share.share({
        message: jsonData,
        title: 'Air Quality Data Export',
      });
      
      setSnackbarMessage('Data exported successfully!');
      setShowSnackbar(true);
    } catch (error) {
      Alert.alert(
        'Export Failed',
        'Failed to export data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Export Data" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Title 
            title="Export Air Quality Data" 
            subtitle="Choose your export options" 
            left={(props) => <FontAwesome5 name="file-export" size={24} color="#2196F3" />}
          />
          <Card.Content>
            <Text style={styles.sectionTitle}>Format</Text>
            <RadioButton.Group 
              onValueChange={value => setExportFormat(value as 'json' | 'csv')} 
              value={exportFormat}
            >
              <View style={styles.radioRow}>
                <RadioButton.Item label="JSON" value="json" position="leading" />
                <RadioButton.Item label="CSV" value="csv" position="leading" />
              </View>
            </RadioButton.Group>

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Time Range</Text>
            <RadioButton.Group 
              onValueChange={value => setTimeRange(value as 'day' | 'week' | 'month' | 'all')} 
              value={timeRange}
            >
              <RadioButton.Item label="Last 24 Hours" value="day" position="leading" />
              <RadioButton.Item label="Last Week" value="week" position="leading" />
              <RadioButton.Item label="Last Month" value="month" position="leading" />
              <RadioButton.Item label="All Data" value="all" position="leading" />
            </RadioButton.Group>

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Pollutants to Include</Text>
            <RadioButton.Group 
              onValueChange={value => setPollutantFilter(value as 'all' | 'no2' | 'so2' | 'o3' | 'pm25' | 'pm10')} 
              value={pollutantFilter}
            >
              <RadioButton.Item label="All Pollutants" value="all" position="leading" />
              <RadioButton.Item label="Nitrogen Dioxide (NO₂)" value="no2" position="leading" />
              <RadioButton.Item label="Sulfur Dioxide (SO₂)" value="so2" position="leading" />
              <RadioButton.Item label="Ozone (O₃)" value="o3" position="leading" />
              <RadioButton.Item label="PM2.5" value="pm25" position="leading" />
              <RadioButton.Item label="PM10" value="pm10" position="leading" />
            </RadioButton.Group>
          </Card.Content>

          <Card.Actions style={styles.cardActions}>
            <Button mode="outlined" onPress={() => navigation.goBack()}>
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleExport} 
              loading={isLoading}
              disabled={isLoading || !currentReading}
            >
              Export Data
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.infoTitle}>
              <FontAwesome5 name="info-circle" size={16} color="#666" /> Export Information
            </Text>
            <Text style={styles.infoText}>
              • The exported data includes readings for the selected time period.
            </Text>
            <Text style={styles.infoText}>
              • CSV files can be opened in spreadsheet applications like Microsoft Excel or Google Sheets.
            </Text>
            <Text style={styles.infoText}>
              • JSON files are useful for data analysis or further processing.
            </Text>
            <Text style={styles.infoText}>
              • You can share the exported data via email, messaging apps, or save it to your device.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setShowSnackbar(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  radioRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  divider: {
    marginVertical: 16,
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
}); 