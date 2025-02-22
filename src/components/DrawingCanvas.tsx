import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Control, Rect, TPointerEvent, TPointerEventInfo, util } from 'fabric';
import { useDrawing } from '../custom-context/DrawingContext';

interface DrawingCanvasProps {
  width: number;
  height: number;
}

const deleteIcon = document.createElement('img');
deleteIcon.src = 'data:image/svg+xml;base64,' + btoa(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="black" stroke-width="2">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
  </svg>
`);

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
    if (!canvas) {
      return;
    }

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

  // Render delete icon
  const renderIcon = (icon: HTMLImageElement) => {
    return function(
      ctx: CanvasRenderingContext2D,  // canvas context to draw on
      left: number,   // coordinates where to draw
      top: number, 
      styleOverride: any,   // Any style overrides
      fabricObject: any     // rectangle or object the control belongs to
    ) {
      const size = 24;
      ctx.save();   // Save the current canvas state (position, rotation, etc.)
      ctx.translate(left, top);   // Moves the canvas origin (0,0) to the control's position - makes it easier to position and rotate the icon
      ctx.rotate(util.degreesToRadians(fabricObject.angle));    // Makes the icon rotate with the rectangle
      ctx.drawImage(icon, -size/2, -size/2, size, size);    // Draws the icon centered at the current position
      ctx.restore();    // Restore the canvas state to what it was before
    }
  };

  // Delete object handler
  const deleteObject = (eventData: TPointerEvent, transform: any) => {
    const target = transform.target;    // get the object
    const canvas = target.canvas;   // get its canvas
    canvas.remove(target);
    canvas.requestRenderAll();    // tells Fabric.js to redraw the canvas
    return true;
  };

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

    rectRef.current.controls.deleteControl = new Control({
      // positioning delete controll icon relative to the rectangle
      // x, y range is <-0.5; 0.5> : 
      // +0.5 means 50% of the drawn rectangle width (for x) or height (for y) to the right (for x) or upward (for y) from the center
      // -0.5 is to the left (for x) or downward (for y)
      // 0 would be at the center
      x: 0.5,
      y: -0.5,
      // additional pixel offset: positive number moves right (for x) or down (for y), negative number moves left (for x) or up (for y) (as for x, y axes)
      offsetY: -16,
      offsetX: 16,
      // defines how mouse cursor will look like when hovering over the control (pointer => pointing hand) 
      cursorStyle: 'pointer',
      mouseUpHandler: deleteObject,
      render: renderIcon(deleteIcon),
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
