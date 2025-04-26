import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import Svg, { Path, Rect } from 'react-native-svg';

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  
  const { login, register, isLoading, error } = useAuth();

  const handleAuth = async () => {
    if (!username || !password) {
      Alert.alert('Validation Error', 'Username and password are required');
      return;
    }
    
    if (!isLogin && !email) {
      Alert.alert('Validation Error', 'Email is required for registration');
      return;
    }
    
    try {
      if (isLogin) {
        await login({ username, password });
      } else {
        await register({ username, password, email });
      }
    } catch (err) {
      // Error is handled by the useAuth hook
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <Svg width={80} height={80} viewBox="0 0 1024 1024">
                <Rect width={1024} height={1024} rx={256} fill="#7631F9" />
                <Path
                  d="M512 256C370.4 256 256 370.4 256 512C256 653.6 370.4 768 512 768C653.6 768 768 653.6 768 512C768 370.4 653.6 256 512 256ZM512 704C406.4 704 320 617.6 320 512C320 406.4 406.4 320 512 320C617.6 320 704 406.4 704 512C704 617.6 617.6 704 512 704Z"
                  fill="white"
                />
                <Path d="M560 464H464V560H560V464Z" fill="white" />
                <Path
                  d="M512 384C454.4 384 408 430.4 408 488H472C472 464 488 448 512 448C536 448 552 464 552 488C552 512 536 528 512 528V592H576V544C608 528 632 504 632 472C632 424 576 384 512 384Z"
                  fill="white"
                />
              </Svg>
            </View>
            <Text style={styles.title}>GAMI PROTOCOL</Text>
            <Text style={styles.subtitle}>
              {isLogin 
                ? "Login to access your Gamification Dashboard" 
                : "Create an account to get started"}
            </Text>
          </View>

          <View style={styles.formContainer}>
            {error && <Text style={styles.errorText}>{error}</Text>}
            
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLogin ? "Login" : "Register"}
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.switchButton}
              onPress={() => setIsLogin(!isLogin)}
              disabled={isLoading}
            >
              <Text style={styles.switchButtonText}>
                {isLogin 
                  ? "Don't have an account? Register" 
                  : "Already have an account? Login"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7631F9',
    marginBottom: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#7631F9',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#7631F9',
  },
});

export default AuthScreen;