import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

console.log('WebCanvasDraw component loading...');

export default function WebCanvasDraw({ onExport, color = '#FF6B6B', strokeWidth = 5, width = 256, height = 256 }) {
  console.log('WebCanvasDraw rendering with props:', { color, strokeWidth, width, height });
  
  const [error, setError] = useState(null);
  const canvasRef = useRef();
  const colorRef = useRef(color);
  const widthRef = useRef(strokeWidth);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const controlPointRef = useRef({ x: 0, y: 0 });

  // Keep refs updated with latest props
  useEffect(() => { colorRef.current = color; }, [color]);
  useEffect(() => { widthRef.current = strokeWidth; }, [strokeWidth]);

  useEffect(() => {
    console.log('Setting up canvas...');
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('Canvas ref is null');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Could not get 2d context');
        return;
      }
      
      // Set canvas background to white
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const draw = (e) => {
        if (!isDrawingRef.current) return;

        try {
          const rect = canvas.getBoundingClientRect();
          const currentPoint = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          };

          ctx.beginPath();
          ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
          
          // Calculate control point for quadratic curve
          controlPointRef.current = {
            x: (lastPointRef.current.x + currentPoint.x) / 2,
            y: (lastPointRef.current.y + currentPoint.y) / 2
          };

          // Draw quadratic curve
          ctx.quadraticCurveTo(
            lastPointRef.current.x,
            lastPointRef.current.y,
            controlPointRef.current.x,
            controlPointRef.current.y
          );

          ctx.strokeStyle = colorRef.current;
          ctx.lineWidth = widthRef.current;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();

          lastPointRef.current = currentPoint;
        } catch (err) {
          console.error('Error during draw:', err);
          setError(err.message);
        }
      };

      const startDrawing = (e) => {
        try {
          isDrawingRef.current = true;
          const rect = canvas.getBoundingClientRect();
          lastPointRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          };
          controlPointRef.current = { ...lastPointRef.current };
        } catch (err) {
          console.error('Error starting drawing:', err);
          setError(err.message);
        }
      };

      const stopDrawing = () => {
        isDrawingRef.current = false;
      };

      // Mouse events
      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('mouseleave', stopDrawing);

      // Touch events
      canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
      });

      canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
      });

      canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        canvas.dispatchEvent(mouseEvent);
      });

      return () => {
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mouseleave', stopDrawing);
        canvas.removeEventListener('touchstart', startDrawing);
        canvas.removeEventListener('touchmove', draw);
        canvas.removeEventListener('touchend', stopDrawing);
      };
    } catch (err) {
      console.error('Error in canvas setup:', err);
      setError(err.message);
    }
  }, []);

  const handleExport = () => {
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onExport(dataUrl);
    } catch (err) {
      console.error('Error exporting canvas:', err);
      setError(err.message);
    }
  };

  const handleClear = () => {
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } catch (err) {
      console.error('Error clearing canvas:', err);
      setError(err.message);
    }
  };

  if (error) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ color: 'red', marginBottom: 10 }}>Error: {error}</Text>
        <TouchableOpacity 
          onPress={() => setError(null)}
          style={{ 
            padding: 10, 
            backgroundColor: '#4CAF50',
            borderRadius: 5
          }}
        >
          <Text style={{ color: 'white' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height} 
        style={{
          border: '2px solid #ccc',
          borderRadius: 20,
          background: '#fff',
          touchAction: 'none' // Prevent scrolling while drawing on touch devices
        }} 
      />
      <div style={{ marginTop: 20, display: 'flex', gap: 16 }}>
        <button
          style={{
            padding: '10px 30px',
            borderRadius: 10,
            background: '#8B4CB8',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 18,
            border: 'none',
            cursor: 'pointer'
          }}
          onClick={handleExport}
        >
          ✅ Submit
        </button>
        <button
          style={{
            padding: '10px 30px',
            borderRadius: 10,
            background: '#FF6B6B',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 18,
            border: 'none',
            cursor: 'pointer'
          }}
          onClick={handleClear}
        >
          🗑️ Clear
        </button>
      </div>
    </div>
  );
} 