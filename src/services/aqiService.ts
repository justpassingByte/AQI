import * as Location from 'expo-location';
import axios from 'axios';
import { AQIData, AQILevel } from '../types';
import { Alert, Platform } from 'react-native';

// Replace with your API key
const API_KEY = 'fc71465f00bc808f142a0419817e61e04fa76076';

// Tọa độ mặc định (Hà Nội)
const DEFAULT_LATITUDE = 21.0285;
const DEFAULT_LONGITUDE = 105.8542;

export const getAQI = async (): Promise<AQIData> => {
  try {
    console.log('===== STARTING AQI DATA FETCH =====');
    console.log(`Default location (if needed): Hà Nội (${DEFAULT_LATITUDE}, ${DEFAULT_LONGITUDE})`);
    
    // Trước tiên, thử endpoint 'here' để tự động phát hiện vị trí
    try {
      console.log('Trying to use the "here" endpoint for automatic location detection');
      const hereResponse = await axios.get(
        `https://api.waqi.info/feed/here/?token=${API_KEY}`
      );
      
      if (hereResponse.data.status === 'ok') {
        console.log('Successfully retrieved data using the "here" endpoint');
        console.log(`City detected by API: ${hereResponse.data.data.city?.name || 'Unknown'}`);
        console.log(`Coordinates from API: ${JSON.stringify(hereResponse.data.data.city?.geo || 'Unknown')}`);
        return hereResponse.data.data;
      } else {
        console.log('The "here" endpoint failed, will try with coordinates', hereResponse.data);
      }
    } catch (hereError) {
      console.log('Error using the "here" endpoint:', hereError);
      // Continue to the coordinate-based approach
    }
    
    // Nếu endpoint "here" không hoạt động, thử sử dụng vị trí từ Expo Location
    console.log('Falling back to explicit coordinates using Expo Location');
    
    // Hỏi quyền truy cập vị trí
    const { status } = await Location.requestForegroundPermissionsAsync();
    console.log(`Location permission status: ${status}`);
    
    if (status !== 'granted') {
      // Nếu không được cấp quyền, hiển thị cảnh báo
      console.warn('Permission to access location was denied');
      
      // Trong môi trường web, hiện hướng dẫn chi tiết hơn
      if (Platform.OS === 'web') {
        Alert.alert(
          'Không thể truy cập vị trí',
          'Vui lòng cấp quyền truy cập vị trí trong trình duyệt của bạn (thường nằm ở thanh địa chỉ). Tạm thời sử dụng dữ liệu từ Hà Nội.',
          [{ text: 'OK' }]
        );
      }
      
      // Sử dụng vị trí mặc định
      console.log(`Using default coordinates for Hà Nội: ${DEFAULT_LATITUDE}, ${DEFAULT_LONGITUDE}`);
      return await fetchAQIByCoordinates(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
    }
    
    // Lấy vị trí hiện tại nếu được cấp quyền
    console.log('Getting current location...');
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    });
    
    console.log('Location obtained:', location.coords);
    return await fetchAQIByCoordinates(location.coords.latitude, location.coords.longitude);
    
  } catch (error) {
    console.error('Error in getAQI:', error);
    
    // Sử dụng vị trí mặc định nếu có lỗi
    console.log(`Falling back to default coordinates for Hà Nội due to error: ${DEFAULT_LATITUDE}, ${DEFAULT_LONGITUDE}`);
    return await fetchAQIByCoordinates(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
  }
};

// Hàm riêng để lấy dữ liệu AQI theo tọa độ
const fetchAQIByCoordinates = async (latitude: number, longitude: number): Promise<AQIData> => {
  try {
    console.log(`Fetching AQI data for coordinates: ${latitude}, ${longitude}`);
    
    // Thử các định dạng URL khác nhau theo thứ tự ưu tiên
    const urlFormats = [
      `https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=${API_KEY}`,
      `https://api.waqi.info/feed/${latitude};${longitude}/?token=${API_KEY}`,
      `https://api.waqi.info/feed/geo:${latitude},${longitude}/?token=${API_KEY}`,
      `https://api.waqi.info/feed/${latitude},${longitude}/?token=${API_KEY}`,
      `https://api.waqi.info/feed/@${latitude},${longitude}/?token=${API_KEY}`
    ];
    
    for (const url of urlFormats) {
      try {
        console.log(`Trying URL format: ${url}`);
        const response = await axios.get(url);
        
        if (response.data.status === 'ok') {
          console.log(`Success with URL format: ${url}`);
          console.log(`City returned by API: ${response.data.data.city?.name || 'Unknown'}`);
          return response.data.data;
        } else {
          console.log(`Failed with URL format: ${url}`, response.data);
        }
      } catch (formatError) {
        console.log(`Error with URL format: ${url}`, formatError);
        // Continue to the next format
      }
    }
    
    // Nếu tất cả đều thất bại, ném lỗi
    throw new Error('All API URL formats failed');
    
  } catch (error) {
    console.error('Error fetching AQI data:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw error;
  }
};

export const getAQIHistory = async (station: string): Promise<any> => {
  try {
    const response = await axios.get(
      `https://api.waqi.info/feed/${station}/?token=${API_KEY}`
    );
    return response.data.data;
  } catch (error) {
    console.error('Error in getAQIHistory:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.message);
    }
    throw error;
  }
};

export const getAQILevel = (aqi: number): AQILevel => {
  if (aqi <= 50) {
    return { 
      level: 'Good', 
      emoji: '✅', 
      message: 'Air quality is good. Enjoy outdoor activities!',
      color: '#009966'
    };
  } else if (aqi <= 100) {
    return { 
      level: 'Moderate', 
      emoji: '🟡', 
      message: 'Air quality is acceptable for most individuals.',
      color: '#ffde33'
    };
  } else if (aqi <= 150) {
    return { 
      level: 'Unhealthy for Sensitive Groups', 
      emoji: '⚠️', 
      message: 'Sensitive groups should limit outdoor activities.',
      color: '#ff9933'
    };
  } else if (aqi <= 200) {
    return { 
      level: 'Unhealthy', 
      emoji: '❌', 
      message: 'Everyone may begin to experience health effects.',
      color: '#cc0033'
    };
  } else if (aqi <= 300) {
    return { 
      level: 'Very Unhealthy', 
      emoji: '⛔', 
      message: 'Health warnings of emergency conditions.',
      color: '#660099'
    };
  } else {
    return { 
      level: 'Hazardous', 
      emoji: '☣️', 
      message: 'Health alert: everyone may experience serious health effects!',
      color: '#7e0023'
    };
  }
}; 