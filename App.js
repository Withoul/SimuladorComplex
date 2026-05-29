import React, { useState, useEffect } from 'react';
import { StatusBar, AppState, View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';
import { addStudyTime } from './src/services/storage';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (fontsLoaded) {
      // Hide native static splash immediately
      SplashScreen.hideAsync();
      
      // Keep dynamic splash visible for 2.5 seconds
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  // Foreground Study Time Tracking
  useEffect(() => {
    let timerId = null;
    let accumulatedSeconds = 0;

    const startTimer = () => {
      if (!timerId) {
        timerId = setInterval(() => {
          accumulatedSeconds += 1;
          // Accumulate and persist study time every 10 seconds
          if (accumulatedSeconds >= 10) {
            addStudyTime(accumulatedSeconds);
            accumulatedSeconds = 0;
          }
        }, 1000);
      }
    };

    const stopTimer = () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
        if (accumulatedSeconds > 0) {
          addStudyTime(accumulatedSeconds);
          accumulatedSeconds = 0;
        }
      }
    };

    if (AppState.currentState === 'active') {
      startTimer();
    }

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        startTimer();
      } else {
        stopTimer();
      }
    });

    return () => {
      subscription.remove();
      stopTimer();
    };
  }, []);

  if (!fontsLoaded || showSplash) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#131370" />
        <View style={styles.splashContent}>
          <Image 
            source={require('./assets/Logo Desarrollo de Software.png')} 
            style={styles.splashLogo}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color="#FAC70F" style={styles.spinner} />
        </View>
        <View style={styles.splashFooter}>
          <Text style={styles.splashCreditsLabel}>DESARROLLADO POR</Text>
          <Text style={styles.splashCreditsName}>ALEX MURILLO</Text>
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#FCF9F8" />
      <AppNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#131370', // Navy Blue from logo
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  splashContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  splashLogo: {
    width: 220,
    height: 220,
    marginBottom: 30,
  },
  spinner: {
    marginTop: 10,
  },
  splashFooter: {
    alignItems: 'center',
    gap: 4,
  },
  splashCreditsLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.5,
  },
  splashCreditsName: {
    color: '#FAC70F', // Secondary yellow/gold accent
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
