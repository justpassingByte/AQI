import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Snackbar, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { signUp, isLoading } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [school, setSchool] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [error, setError] = useState<string | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleRegister = async () => {
    // Simple validation
    if (!username.trim() || !email.trim() || !password.trim() || !school.trim()) {
      setError('Please fill in all fields');
      setShowSnackbar(true);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setShowSnackbar(true);
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setShowSnackbar(true);
      return;
    }

    try {
      await signUp(email, password, username);
      // Navigation will be handled by the AuthContext
    } catch (err) {
      setError('Registration failed. Please try again.');
      setShowSnackbar(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the Air Quality Monitoring Program</Text>

          <View style={styles.formContainer}>
            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="email" />}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="lock" />}
            />

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="lock-check" />}
            />

            <TextInput
              label="School Name"
              value={school}
              onChangeText={setSchool}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="school" />}
            />

            <Text style={styles.pickerLabel}>I am a:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={role}
                onValueChange={(itemValue: 'student' | 'teacher') => setRole(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Student" value="student" />
                <Picker.Item label="Teacher" value="teacher" />
              </Picker>
            </View>

            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.registerButton}
              loading={isLoading}
              disabled={isLoading}
            >
              Register
            </Button>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login' as never)}
              style={styles.loginLink}
            >
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginLinkText}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setShowSnackbar(false),
        }}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#c4c4c4',
    borderRadius: 4,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  registerButton: {
    marginTop: 8,
    paddingVertical: 6,
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
    marginBottom: 40,
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginLinkText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
}); 