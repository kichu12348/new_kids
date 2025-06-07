import React from 'react';
import { Platform } from 'react-native';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'react-native';

const drawingWords = [
  'cat', 'bat', 'car', 'book', 'banana', 'apple', 'candle', 'carrot', 'circle', 'flower',
  'clock', 'cloud', 'cookie', 'cup', 'dog', 'door', 'ear', 'eraser', 'eye', 'fish','grapes', 
  'grass', 'hand', 'line', 'lollipop','scissors','shoe','snake','snowflake','sock','strawberry','swan','table','tennis racquet','tree','wheel','windmill'
];

export default function ResultPage() {
  const { prediction, confidence, target, studentDrawingUri, reference_image_url} = useLocalSearchParams();
  const baseUrl = 'http://127.0.0.1:8000'; // Always use backend for static files
  const fullReferenceImageUrl = reference_image_url
  ? (reference_image_url.startsWith('http') ? reference_image_url : baseUrl + reference_image_url)
  : undefined;
  const isCorrect = prediction?.toLowerCase() === target?.toLowerCase();
  // Debug: log the URI before returning JSX
  console.log('studentDrawingUri:', studentDrawingUri);
  console.log('reference_image_url:', reference_image_url);
  console.log('fullReferenceImageUrl:', fullReferenceImageUrl);
  // Pick a new random word (not the same as current)
  const getNewWord = () => {
    let newWord;
    do {
      newWord = drawingWords[Math.floor(Math.random() * drawingWords.length)];
    } while (newWord === target);
    return newWord;
  };

  return (
    <LinearGradient colors={['#E8F5E8', '#F0F8FF', '#FFF8DC']} style={styles.container}>
      <View style={styles.resultBox}>
        <Text style={styles.title}>🎉 Result 🎉</Text>
        <Text style={styles.predictionText}>
          {isCorrect
            ? `✅ Great job! You drew a ${target}!`
            : `You drew a ${prediction}. Try again to draw a ${target}!`}
        </Text>
        <Text style={styles.confidenceText}>
          Confidence: <Text style={styles.confidenceHighlight}>{(parseFloat(confidence) * 100).toFixed(1)}%</Text>
        </Text>
        <Text style={styles.emoji}>👏🖍️✨</Text>
        {/* Show student's drawing */}
        
        {studentDrawingUri && (
          <View style={{ alignItems: 'center', marginVertical: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>Your Drawing:</Text>
            <Image source={{ uri: studentDrawingUri }} style={{ width: 128, height: 128, borderRadius: 12, marginVertical: 5 }} />
          </View>
        )}

        {/* Show reference image if prediction is wrong */}
        {!isCorrect && fullReferenceImageUrl && (
          <View style={{ alignItems: 'center', marginVertical: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>Reference: {target}</Text>
            <Image source={{ uri: fullReferenceImageUrl }} style={{ width: 128, height: 128, borderRadius: 12, marginVertical: 5 }} />
          </View>
        )}
        {/* Retry Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace({ pathname: '/draw', params: { target } })}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#FFB6C1', '#87CEEB']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Draw Again!</Text>
          </LinearGradient>
        </TouchableOpacity>
        {/* Next Button */}
        <TouchableOpacity
          style={[styles.button, { marginTop: 10 }]}
          onPress={() => router.replace({ pathname: '/draw', params: { target: getNewWord() } })}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#87CEEB', '#FFB6C1']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Next Word</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  resultBox: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 18,
    textAlign: 'center',
  },
  predictionText: {
    fontSize: 22,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  predictionHighlight: {
    color: '#4ECDC4',
    fontWeight: 'bold',
    fontSize: 24,
  },
  confidenceText: {
    fontSize: 18,
    color: '#888',
    marginBottom: 18,
    textAlign: 'center',
  },
  confidenceHighlight: {
    color: '#FFB300',
    fontWeight: 'bold',
  },
  emoji: {
    fontSize: 36,
    marginBottom: 18,
    textAlign: 'center',
  },
  button: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 10,
  },
  buttonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
}); 