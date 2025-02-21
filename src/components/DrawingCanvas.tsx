import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Rect, TPointerEvent, TPointerEventInfo } from 'fabric';
import { useDrawing } from '../custom-context/DrawingContext';

interface DrawingCanvasProps {
  width: number;
  height: number;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ width, height }) => {
  const { isDrawingEnabled } = useDrawing();
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
  
  // tracking if we are currently in the process of drawing rectangle
  // to maintain state between mouse events (mouse down/ moving/ up)
  // using useState instead of useRef would cause re-renders on every mouse move 
  const isDrawingRef = useRef<boolean>(false)

  // Stores the current rectangle being drawn
  // Used to keep track of which rectangle we're currently drawing so we can update it during mouse move
  const rectRef = useRef<Rect>();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric canvas
    const canvas = new Canvas(canvasRef.current, {
      width: width,
      height: height,
    });

    fabricRef.current = canvas;

    // Cleanup on unmount
    return () => {
      canvas.dispose();
    };
  }, [width, height]);

  useEffect(() => {
    console.log("current", isDrawingEnabled)

    const canvas = fabricRef.current
    if (!canvas) return;

    // console.log("canvas", canvas)

    if (isDrawingEnabled) {
      console.log("Drawing enabled")
      canvas.on('mouse:down', handleMouseDown);
      canvas.on('mouse:move', handleMouseMove);
      canvas.on('mouse:up', handleMouseUp);
    }

    fabricRef.current = canvas;

    // Cleanup on unmount
    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
    };

  }, [isDrawingEnabled])

  const handleMouseDown = (eventData: TPointerEventInfo<TPointerEvent>) => {
    console.log("is drawing enabled", isDrawingEnabled)
    if (!isDrawingEnabled || !fabricRef.current) {
    // if (!fabricRef.current) {
      console.log("Drawing not enabled")
      return;
    }

    isDrawingRef.current = true;
    const pointer = eventData.viewportPoint;

    // Create new rectangle
    rectRef.current = new Rect({
      left: pointer.x,
      top: pointer.y,
      width: 0,
      height: 0,
      fill: 'transparent',
      stroke: 'red',
      strokeWidth: 2,
    });

    fabricRef.current.add(rectRef.current);

  }

  const handleMouseMove = (eventData: TPointerEventInfo<TPointerEvent>) => {
    const pointer = eventData.viewportPoint;
    if (!rectRef.current || !pointer) {
      return;
    }

    const startX = rectRef.current.left ?? 0;
    const startY = rectRef.current.top ?? 0;

    // Calculate width and height based on mouse position
    const width = pointer.x - startX;
    const height = pointer.y - startY;

    // Update rectangle size
    rectRef.current.set({
      width: Math.abs(width),
      height: Math.abs(height),
      left: width > 0 ? startX : pointer.x,
      top: height > 0 ? startY : pointer.y,
    });

    rectRef.current.setCoords();
    fabricRef.current?.renderAll();

  }

  const handleMouseUp = () => {
    isDrawingRef.current = false;
    rectRef.current = undefined;
  };

  const clearCanvas = () => {
    if (fabricRef.current) {
      fabricRef.current.clear();
    }
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
      <canvas ref={canvasRef} />
    </div>
  );
};
