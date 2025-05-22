import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { DefaultTheme, MD3DarkTheme as DarkTheme, Provider as PaperProvider, MD3Theme } from 'react-native-paper';
import { Theme } from '@react-navigation/native';

// Define custom theme with our app-specific colors
const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2196F3',
    accent: '#03A9F4',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#333333',
    error: '#B00020',
    notification: '#f50057',
    card: '#ffffff',
    border: '#E0E0E0',
  },
};

const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#2196F3',
    accent: '#03A9F4',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    error: '#CF6679',
    notification: '#f50057',
    card: '#1e1e1e',
    border: '#333333',
  },
};

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: MD3Theme & { colors: Theme['colors'] };
}

// Create the theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get device color scheme
  const colorScheme = useColorScheme();
  
  // State to track current theme
  const [isDarkMode, setIsDarkMode] = useState<boolean>(colorScheme === 'dark');
  
  // Update theme when device color scheme changes
  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);
  
  // Function to toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  // Get current theme
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook for using the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext; 