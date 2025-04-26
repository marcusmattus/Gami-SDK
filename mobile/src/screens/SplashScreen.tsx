import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

const SplashScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Svg width={120} height={120} viewBox="0 0 1024 1024">
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
        <ActivityIndicator size="large" color="#fff" style={styles.loader} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7631F9',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    letterSpacing: 2,
  },
  loader: {
    marginTop: 30,
  },
});

export default SplashScreen;