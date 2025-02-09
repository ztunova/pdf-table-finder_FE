import React, { useEffect, useRef } from 'react';
import { Canvas, PencilBrush } from 'fabric';

interface DrawingCanvasProps {
  width: number;
  height: number;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas>();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric canvas
    const canvas = new Canvas(canvasRef.current, {
      width,
      height,
      isDrawingMode: true,
    });

    // Set up drawing brush
    const brush = new PencilBrush(canvas);
    brush.width = 2;
    brush.color = 'red';
    canvas.freeDrawingBrush = brush;

    fabricRef.current = canvas;

    // Cleanup on unmount
    return () => {
      canvas.dispose();
    };
  }, [width, height]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
      <canvas ref={canvasRef} />
    </div>
  );
};
