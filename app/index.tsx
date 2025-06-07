import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function Index() {
  const handleStartDrawing = () => {
    router.push('/draw');
  };

  return (
    <LinearGradient
      colors={['#FFB6C1', '#87CEEB']}
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <View style={styles.landingContent}>
          <Text style={styles.appTitle}>✨ Kids Art Studio ✨</Text>
          <Text style={styles.subtitle}>Create amazing drawings and get scored!</Text>
          
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStartDrawing}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF8E8E']}
              style={styles.buttonGradient}
            >
              <Text style={styles.startButtonText}>🎨 Start Drawing</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.featuresContainer}>
            <Text style={styles.featureText}>🌈 Multiple Colors</Text>
            <Text style={styles.featureText}>⭐ Get Scored</Text>
            <Text style={styles.featureText}>🎉 Earn Compliments</Text>
          </View>
        </View>

        {/* Footer Section */}
        <View style={styles.footerContainer}>
          <LinearGradient
            colors={['rgba(238, 224, 224, 0.5)', 'rgba(238, 224, 224, 0.8)']}
            style={styles.footerOverlay}
          >
            <View style={styles.footerContent}>
              <Text style={styles.footerText}>
                © 2025 Kids Art Studio. All rights reserved.
              </Text>
              <Text style={styles.footerText}>
                Contact: 8129993666
              </Text>
              <Text style={styles.footerText}>
                Email: contact@zenturiotech.com
              </Text>
              <Text style={styles.footerText}>
                Address: Technomall Building Phase 1,Technopark ,Trivandrum
              </Text>
            </View>
          </LinearGradient>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  landingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  appTitle: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  startButton: {
    marginBottom: 40,
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    paddingHorizontal: 50,
    paddingVertical: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  featuresContainer: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginVertical: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  footerContainer: {
    width: '100%',
    height: 150,
    justifyContent: 'flex-end',
    marginBottom: 0,
  },
  footerOverlay: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  footerContent: {
    alignItems: 'center',
  },
  footerText: {
    color: '#000000',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});