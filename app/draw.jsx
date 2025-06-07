import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    PanResponder,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    LogBox
} from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import WebCanvasDraw from './WebCanvasDraw';
import { loadModel,getPrediction } from './utils/tf';

// Ignore specific warnings if they're not critical
LogBox.ignoreLogs(['Warning: ...']); // Ignore specific warnings
// console.log('Draw component loading...');

// Class labels matching your model's output
const CLASSES = [
  'apple', 'banana', 'bat', 'book', 'candle', 'car', 'carrot', 'cat', 'circle', 'clock',
  'cloud', 'cookie', 'cup', 'dog', 'door', 'ear', 'eraser', 'eye', 'fish', 'flower',
  'grapes', 'grass', 'hand', 'ice_cream', 'line', 'lollipop', 'scissors', 'shoe', 'snake',
  'snowflake', 'sock', 'strawberry', 'swan', 'table', 'tennis_racquet', 'tree', 'wheel', 'windmill'
];

// Available words for drawing
const DRAWING_WORDS = [
  // Animals
  'cat', 'dog', 'bird', 'fish', 'rabbit', 'horse', 'elephant', 'lion', 'bear', 'duck',
  // Objects
  'house', 'car', 'boat', 'book', 'chair', 'table', 'cup', 'ball', 'hat', 'shoe',
  // Nature
  'tree', 'flower', 'sun', 'moon', 'star', 'cloud', 'rain', 'mountain', 'river', 'leaf',
  // Simple shapes
  'circle', 'square', 'triangle', 'heart', 'line',
  // Food
  'apple', 'banana', 'pizza', 'cake', 'ice cream'
];

// Track used words to avoid immediate repetition
let usedWords = [];

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#FF3838', '#17C0EB', '#7F8C8D'
];

const CANVAS_PADDING = 5;
const STROKE_WIDTH = 5;
const brushSizes = [3, 5, 8, 12];

// Model input parameters (adjust these to your model's requirements)
// const MODEL_INPUT_WIDTH = 256;
// const MODEL_INPUT_HEIGHT = 256;
// const MODEL_INPUT_CHANNELS = 3; // 3 for RGB, 1 for Grayscale


export default function Draw() {
  //console.log('Draw component rendering...');

  const [currentWord, setCurrentWord] = useState('');
  const [prevWord, setPrevWord] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTH);
  const pathRef = useRef('');
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const isDrawing = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });
  const viewShotRef = useRef();
  const modelRef = useRef(null);


  // TensorFlow model loading
// const [model, setModel] = useState(null);
// const [modelError, setModelError] = useState(null);
// const [isTfReady, setIsTfReady] = useState(false);

// useEffect(() => { // Comment out TF.js setup
//   async function setupTensorflow() {
//     await tf.ready();
//     setIsTfReady(true);
//     console.log('TensorFlow.js ready');
//   }
//   setupTensorflow();
// }, []);

// useEffect(() => { // Comment out model loading
//   if (!isTfReady) return;

//   async function loadModel() {
//     try {
//       await tf.ready(); // Ensure TensorFlow.js is ready
//       const loadedModel = await tf.loadLayersModel("https://cdn.jsdelivr.net/gh/kichu12348/tesing_tfs_model@main/model.json");
//       setModel(loadedModel);
//       console.log('TensorFlow.js model loaded successfully');
//     } catch (error) {
//       console.log('Error loading TensorFlow.js model:', error.message);
//       setModelError(error);
//     }
//   }
//   loadModel();
// }, [isTfReady]);

// Get a random word that hasn't been used recently

useEffect(() => {
  loadModel().then(model => {
    modelRef.current = model;
    console.log('Model loaded successfully');
  }).catch(error => {
    console.log('Error loading model:', error.message);
  });
},[])

const getNextWord = () => {
  // If all words have been used, reset the used words list
  if (usedWords.length >= DRAWING_WORDS.length - 1) {
    usedWords = [];
  }
  
  // Get available words (not recently used)
  const availableWords = DRAWING_WORDS.filter(word => !usedWords.includes(word));
  
  // Pick a random word from available ones
  const word = availableWords[Math.floor(Math.random() * availableWords.length)];
  
  // Add to used words
  usedWords.push(word);
  console.log('Next word:', word);
  return word;
};



  // Canvas dimensions
  const { width, height } = Dimensions.get('window');
  console.log('Screen dimensions:', { width, height });
  const canvasWidth = Math.max(width - 20, 100);
  const canvasHeight = Math.max(height * 0.75, 100);

  // Initialize or change word
  const changeWord = useCallback(() => {
    setPrevWord(currentWord);
    const newWord = getNextWord();
    setCurrentWord(newWord);
    
    // Animate word change
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
  }, [currentWord, scaleAnim]);

  // Initialize word on mount
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Check URL parameters for web
      const params = new URLSearchParams(window.location.search);
      const target = params.get('target');
      if (target && DRAWING_WORDS.includes(target.toLowerCase())) {
        setCurrentWord(target.toLowerCase());
        usedWords.push(target.toLowerCase());
        return;
      }
    }
    // Set initial word
    const initialWord = getNextWord();
    setCurrentWord(initialWord);
  }, []);

  // Speaker for current word
  const speakWord = useCallback(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
    Alert.alert('🔊 Listen!', `Draw: "${currentWord}"`, [
      { text: 'Got it! 👍', style: 'default' }
    ]);
  }, [currentWord, fadeAnim]);

  // Speaker for previous word
  const speakPrevWord = useCallback(() => {
    if (prevWord) {
      Alert.alert('🔊 Listen!', `Previous: "${prevWord}"`, [
        { text: 'Got it! 👍', style: 'default' }
      ]);
    }
  }, [prevWord]);

  const clearDrawing = useCallback(() => {
    setPaths([]);
    setCurrentPath('');
    pathRef.current = '';
    isDrawing.current = false;
  }, []);

  // PanResponder for drawing (mobile)
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponderCapture: () => true,

    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const x = Math.max(CANVAS_PADDING, Math.min(locationX, canvasWidth - CANVAS_PADDING));
      const y = Math.max(CANVAS_PADDING, Math.min(locationY, canvasHeight - CANVAS_PADDING));
      const newPath = `M${x.toFixed(1)},${y.toFixed(1)}`;
      pathRef.current = newPath;
      setCurrentPath(newPath);
      isDrawing.current = true;
      lastPoint.current = { x, y };
    },

    onPanResponderMove: (evt) => {
      if (!isDrawing.current) return;
      const { locationX, locationY } = evt.nativeEvent;
      const x = Math.max(CANVAS_PADDING, Math.min(locationX, canvasWidth - CANVAS_PADDING));
      const y = Math.max(CANVAS_PADDING, Math.min(locationY, canvasHeight - CANVAS_PADDING));
      
      // Calculate control point for smooth curve
      const midPoint = {
        x: (lastPoint.current.x + x) / 2,
        y: (lastPoint.current.y + y) / 2
      };
      
      // Create smooth quadratic Bézier curve
      const newPath = `${pathRef.current} Q${lastPoint.current.x.toFixed(1)},${lastPoint.current.y.toFixed(1)} ${midPoint.x.toFixed(1)},${midPoint.y.toFixed(1)}`;
      pathRef.current = newPath;
      setCurrentPath(newPath);
      lastPoint.current = { x, y };
    },

    onPanResponderRelease: () => {
      if (isDrawing.current && pathRef.current.length > 10) {
        setPaths(prevPaths => [...prevPaths, {
          path: pathRef.current,
          color: selectedColor,
          width: strokeWidth
        }]);
        setTimeout(() => {
          setCurrentPath('');
          pathRef.current = '';
        }, 50);
      } else {
        setCurrentPath('');
        pathRef.current = '';
      }
      isDrawing.current = false;
    },
  });

  // Function to process the drawn image
  const processDrawing = async () => {
    if (!modelRef.current) { 
      console.warn('Model not loaded yet.');
      Alert.alert('Model Loading', 'The drawing model is still loading. Please wait a moment and try again.');
      return;
    }

    if (paths.length === 0 && currentPath === '') {
      Alert.alert('Almost there! 🎨', 'Draw something amazing first!', [
        { text: 'Let me draw!', style: 'default' }
      ]);
      return;
    }

    let processedImageUri = '';

    try {
      // 1. Capture the drawing as an image
      const uri = await viewShotRef.current.capture();
      processedImageUri = uri; 

      // 2. Get prediction from the model
      const probabilities = await getPrediction(processedImageUri, modelRef.current);

      if (!probabilities || probabilities.length === 0) {
        console.error('Prediction returned empty or invalid:', probabilities);
        Alert.alert('Error', 'Failed to get a valid prediction from the model.');
        return;
      }
      
      // Find the highest probability and its index
      let modelConfidence = 0;
      let predictedIndex = -1;
      for (let i = 0; i < probabilities.length; i++) {
        if (probabilities[i] > modelConfidence) {
          modelConfidence = probabilities[i];
          predictedIndex = i;
        }
      }

      let modelPrediction = 'unknown';
      if (predictedIndex !== -1 && predictedIndex < CLASSES.length) {
        modelPrediction = CLASSES[predictedIndex];
      } else {
        console.warn(`Predicted index ${predictedIndex} is out of bounds for CLASSES array.`);
      }

      console.log('Drawing captured and prediction received:', { modelPrediction, modelConfidence, predictedIndex });
      
      // Navigate to result with the captured image and model prediction
      router.push({
        pathname: '/result',
        params: {
          prediction: modelPrediction, // Use model's prediction
          confidence: modelConfidence.toFixed(2), // Use model's confidence
          target: currentWord,
          studentDrawingUri: processedImageUri,
        }
      });

    } catch (error) {
      console.error('Error processing drawing or getting prediction:', error);
      Alert.alert('Error', 'Failed to process drawing or get prediction.');
    }
  };

  // Handle drawing submission
  const handleSubmit = useCallback(() => {
    processDrawing();
  }, [paths, currentPath, currentWord,modelRef.current]); 

  // Web: handle export from canvas
  const handleWebExport = useCallback((dataUrl) => {
    router.push({
      pathname: '/result',
      params: {
        prediction: currentWord, // In offline mode, we assume the drawing matches the word
        confidence: 1.0,
        target: currentWord,
        studentDrawingUri: dataUrl,
      }
    });
  }, [currentWord]);

  // --- RENDER ---
  if (Platform.OS === 'web') {
    // Web: show canvas drawing
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', background: '#E8F5E8' }}>
        {/* Header UI for web */}
        <View style={{ width: 420, marginBottom: 20 }}>
          {prevWord ? (
            <View style={styles.prevWordBox}>
              <Text style={styles.prevWordLabel}>Previous:</Text>
              <Text style={styles.prevWordText}>{prevWord}</Text>
              <TouchableOpacity
                style={styles.voiceButton}
                onPress={speakPrevWord}
                activeOpacity={0.7}
              >
                <Text style={styles.voiceIcon}>🔊</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          <Text style={styles.drawText}>🎨 Draw:</Text>
          <View style={styles.wordBox}>
            <Text style={styles.currentWord}>{currentWord}</Text>
            <TouchableOpacity
              style={styles.voiceButton}
              onPress={speakWord}
              activeOpacity={0.7}
            >
              <Text style={styles.voiceIcon}>🔊</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Tools Row for web */}
        <View style={[styles.toolsRow, { width: 420, marginBottom: 12 }]}>
          <View style={styles.colorPalette}>
            <View style={styles.colorsGrid}>
              {colors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColor
                  ]}
                  onPress={() => setSelectedColor(color)}
                  activeOpacity={0.8}
                />
              ))}
            </View>
          </View>
          <View style={styles.brushPalette}>
            <View style={styles.brushRow}>
              {brushSizes.map((size, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.brushButton,
                    strokeWidth === size && styles.selectedBrush
                  ]}
                  onPress={() => setStrokeWidth(size)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.brushPreview,
                      {
                        width: Math.min(size + 2, 12),
                        height: Math.min(size + 2, 12),
                        backgroundColor: selectedColor
                      }
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        {/* Web canvas */}
        <WebCanvasDraw
          onExport={handleWebExport}
          color={selectedColor}
          strokeWidth={strokeWidth}
          width={256}
          height={256}
        />
        {/* New word button for web */}
        <TouchableOpacity
          style={[styles.newWordButton, { marginTop: 20 }]}
          onPress={changeWord}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4ECDC4', '#44A08D']}
            style={styles.newWordGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.newWordText}>🎲</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // Mobile: show original UI
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5E8" />
      <LinearGradient
        colors={['#E8F5E8', '#F0F8FF', '#FFF8DC']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.topRow}>
            <Animated.View
              style={[
                styles.wordContainer,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: fadeAnim
                }
              ]}
            >
              {/* Previous word */}
              {prevWord ? (
                <View style={styles.prevWordBox}>
                  <Text style={styles.prevWordLabel}>Previous:</Text>
                  <Text style={styles.prevWordText}>{prevWord}</Text>
                  <TouchableOpacity
                    style={styles.voiceButton}
                    onPress={speakPrevWord}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.voiceIcon}>🔊</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              {/* Current word */}
              <Text style={styles.drawText}>🎨 Draw:</Text>
              <View style={styles.wordBox}>
                <Text style={styles.currentWord}>{currentWord}</Text>
                <TouchableOpacity
                  style={styles.voiceButton}
                  onPress={speakWord}
                  activeOpacity={0.7}
                >
                  <Text style={styles.voiceIcon}>🔊</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
            <TouchableOpacity
              style={styles.newWordButton}
              onPress={changeWord}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4ECDC4', '#44A08D']}
                style={styles.newWordGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.newWordText}>🎲</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          {/* Tools Row */}
          <View style={styles.toolsRow}>
            <View style={styles.colorPalette}>
              <View style={styles.colorsGrid}>
                {colors.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      selectedColor === color && styles.selectedColor
                    ]}
                    onPress={() => setSelectedColor(color)}
                    activeOpacity={0.8}
                  />
                ))}
              </View>
            </View>
            <View style={styles.brushPalette}>
              <View style={styles.brushRow}>
                {brushSizes.map((size, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.brushButton,
                      strokeWidth === size && styles.selectedBrush
                    ]}
                    onPress={() => setStrokeWidth(size)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.brushPreview,
                        {
                          width: Math.min(size + 2, 12),
                          height: Math.min(size + 2, 12),
                          backgroundColor: selectedColor
                        }
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
        {/* Drawing Area */}
        <View style={styles.drawingContainer}>
          <ViewShot
            ref={viewShotRef}
            options={{ format: "jpg", quality: 0.95, result: "tmpfile" }}
            style={[styles.canvas, { width: canvasWidth, height: canvasHeight }]}
          >
            <View 
              style={{ flex: 1 }}
              {...panResponder.panHandlers}
            >
              <Svg width={canvasWidth} height={canvasHeight}>
                <Defs>
                  <RadialGradient id="grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <Stop offset="0%" stopColor="#fff" stopOpacity="0.1" />
                    <Stop offset="100%" stopColor="#fff" stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                {paths.map((path, index) => (
                  <Path
                    key={index}
                    d={path.path}
                    stroke={path.color}
                    strokeWidth={path.width}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                ))}
                {currentPath && (
                  <Path
                    d={currentPath}
                    stroke={selectedColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                )}
              </Svg>
            </View>
          </ViewShot>
        </View>
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={clearDrawing}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.submitButton]}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  wordContainer: {
    flex: 1,
    marginRight: 15,
  },
  prevWordBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  prevWordLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  prevWordText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  drawText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 5,
  },
  wordBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentWord: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  voiceButton: {
    padding: 8,
  },
  voiceIcon: {
    fontSize: 20,
  },
  newWordButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  newWordGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newWordText: {
    fontSize: 24,
  },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  colorPalette: {
    flex: 2,
    marginRight: 10,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 3,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  brushPalette: {
    flex: 1,
  },
  brushRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  brushButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 3,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBrush: {
    backgroundColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  brushPreview: {
    borderRadius: 6,
  },
  drawingContainer: {
    flex: 1,
    margin: 10,
    backgroundColor: '#FFF',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  canvas: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF0000',
    marginBottom: 20,
  },
  retryButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
  },
});