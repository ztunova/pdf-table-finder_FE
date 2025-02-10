import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Rect, TPointerEvent, TPointerEventInfo } from 'fabric';

interface DrawingCanvasProps {
  width: number;
  height: number;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ width, height }) => {
  // useRef for storing values that we need to access throughout the component's lifecycle but don't need to trigger re-renders
  // usage of useState instead of useRef would cause unnecessary re-renders

  // references the actual HTML canvas DOM element
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // references the Fabric.js Canvas instance that wraps the HTML canvas
  // We need both because:
  // 1. Fabric.js needs the HTML canvas element to initialize
  // 2. We need the Fabric.js canvas instance to control drawing features
  // access using fabricRef.current
  const fabricRef = useRef<Canvas>();

  // This state controls whether rectangle drawing is enabled or disabled
  const [isDrawingEnabled, setIsDrawingEnabled] = useState<boolean>(false);
  
  // tracking if we are currently in the process of drawing rectangle
  // to maintain state between mouse events (mouse down/ moving/ up)
  // using useState instead of useRef would cause re-renders on every mouse move 
  const isDrawingRef = useRef<boolean>(false)
  const rectRef = useRef<Rect>();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric canvas
    const canvas = new Canvas(canvasRef.current, {
      width,
      height,
    });

    canvas.on('mouse:down', handleMouseDown);

    fabricRef.current = canvas;

    // Cleanup on unmount
    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.dispose();
    };
  }, [width, height]);

  const handleMouseDown = (eventData: TPointerEventInfo<TPointerEvent>) => {
    console.log(eventData)
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
      <canvas ref={canvasRef} />
    </div>
  );
};
