import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, Control, Rect, TPointerEvent, TPointerEventInfo, util } from 'fabric';
import { useDrawing } from '../custom-context/DrawingContext';
import axios from 'axios';
// import { useRectangleMapping } from '../custom-context/RectangleTableMappingContext';
import { useTableData } from '../custom-context/TableContext';
import { RectWithData, TableBoundingBox } from '../shared-types';

// pdf page number je cislovane od 1 na FE, od 0 na BE
interface DrawingCanvasProps {
  pdfPageNumber: number;
  width: number;
  height: number;
}

interface RectangleCoordinates {
  pdfPageNumber: number;
  upperLeftX: number;
  upperLeftY: number;
  lowerRightX: number;
  lowerRightY: number;
  rectWidth: number;
  rectHeight: number;
}

const deleteIcon = document.createElement('img');
deleteIcon.src = 'data:image/svg+xml;base64,' + btoa(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="black" stroke-width="2">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
  </svg>
`);

const sendIcon = document.createElement('img');
sendIcon.src = 'data:image/svg+xml;base64,' + btoa(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="black" stroke-width="2">
    <path d="M5 12h14M13 5l7 7-7 7"/>
  </svg>
`);

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ pdfPageNumber, width, height }) => {
  // const rectangleMapping = useRectangleMapping();
  const rectCounter = useRef<number>(1);

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
  const rectRef = useRef<RectWithData>();
  const tablesContext = useTableData();
  const pageTables = tablesContext.getTablesForPage(pdfPageNumber)

  useEffect(() => {
    // console.log("table data", tablesContext.tableData)
    console.log('xxx')
    const canvas = fabricRef.current
    if (!canvas) {
      return;
    }

    clearCanvas()
    const rectanglesForPage = tablesContext.getTablesForPage(pdfPageNumber);
    console.log(`Tables for page ${pdfPageNumber}:`, rectanglesForPage);
    rectanglesForPage.forEach(rectangle => {
      console.log(rectangle)
      const {upperLeftX, upperLeftY, lowerRightX, lowerRightY} = rectangle.coordinates
      console.log("coord", upperLeftX, upperLeftY, lowerRightX, lowerRightY)
      const width = lowerRightX - upperLeftX;
      const height = lowerRightY - upperLeftY;

      // Create new rectangle to canvas
      const canvasRect = new Rect({
        left: upperLeftX,
        top: upperLeftY,
        width: width,
        height: height,
        fill: 'transparent',
        stroke: 'red',
        strokeWidth: 2,
      }) as RectWithData;

      canvasRect.data = {
        rectangleId: rectangle.id
      }

      canvas.add(canvasRect)

    })

    canvas.renderAll()

  }, [pdfPageNumber, tablesContext.tablesPerPage]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric canvas
    const canvas = new Canvas(canvasRef.current, {
      width: width,
      height: height,
    });

    canvas.on('object:modified', function(e) {
      if (e.target) {
        const targetWithData = e.target as RectWithData;
        
        if (targetWithData.data?.rectangleId) {
          const rectId = targetWithData.data.rectangleId;
          console.log("modified rect id", targetWithData)
          const newCoords:TableBoundingBox = {
            upperLeftX: targetWithData.left,
            upperLeftY: targetWithData.top,
            lowerRightX: targetWithData.left + targetWithData.width * targetWithData.scaleX,
            lowerRightY: targetWithData.top + targetWithData.height * targetWithData.scaleY
          }
          tablesContext.updateTableCoordinates(rectId, newCoords)
        }
      }
    });

    fabricRef.current = canvas;

    // Cleanup on unmount
    return () => {
      canvas.dispose();
    };
  }, [width, height]);

  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) {
      return;
    }

    if (isDrawingEnabled) {
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
    const target = transform.target as unknown as RectWithData;    // get the object
    const rectangleId = target.data?.rectangleId;
    console.log('delete rect id', rectangleId)
    if (!rectangleId) {
      return;
    }
    tablesContext.deleteTableRecord(rectangleId)
    
    const canvas = target.canvas;   // get its canvas
    if (canvas) {
      canvas.remove(target);
      canvas.requestRenderAll();    // tells Fabric.js to redraw the canvas
    }

    return true;
  };

  // send get request to BE API with coordinates of selected rectangle to translate table 
  const sendRectCoordinates = async(eventData: TPointerEvent, transform: any) => {
    const target = transform.target as unknown as RectWithData;
    if (!target) {
      return false;
    }

    const rectangleId = target.data?.rectangleId;
    if (!rectangleId) {
      return false;
    }

    const rectData: RectangleCoordinates = {
      pdfPageNumber: pdfPageNumber,
      upperLeftX: target.left,
      upperLeftY: target.top,
      lowerRightX: target.left + target.width * target.scaleX,
      lowerRightY: target.top + target.height * target.scaleY,
      rectWidth: target.width * target.scaleX,
      rectHeight: target.height * target.scaleY,
    }

    try {
      // Apply visual indication that data is being fetched
      target.set({
        stroke: 'blue', // Change color to indicate processing
        strokeDashArray: [5, 5] // Add dashed line effect
      });
      fabricRef.current?.renderAll();

      const response = await axios.get("http://127.0.0.1:8000/pdf/table", {
        params: rectData
      });
      console.log('Coordinates sent successfully:', response.data);

      // Visual indication of success
      target.set({
        stroke: 'green', // Change color to indicate success
        strokeDashArray: [] // Remove dashed line effect
      });
      fabricRef.current?.renderAll();

      const content = (
        <div>
          <h3>Rectangle {rectangleId}</h3>
          <p>Page: {pdfPageNumber}</p>
          <p>Position: ({rectData.upperLeftX.toFixed(0)}, {rectData.upperLeftY.toFixed(0)}) to ({rectData.lowerRightX.toFixed(0)}, {rectData.lowerRightY.toFixed(0)})</p>
          <p>Size: {rectData.rectWidth.toFixed(0)} x {rectData.rectHeight.toFixed(0)}</p>
        </div>
      );

      // Force creation of a new tab by checking if the tabId is actually defined
      // This is important for tabs that were previously closed
      // const existingTabId = rectangleMapping.getTabIdForRectangle(rectangleId);
      // console.log(`Existing tab ID for ${rectangleId}: ${existingTabId}`);
      
      // if (existingTabId) {
      //   // Update existing tab
      //   rectangleMapping.updateTab(rectangleId, content, response.data);
      // } 
      // else {
      //   // Create new tab - this will happen for rectangles whose tabs were previously closed
      //   console.log(`Creating new tab for rectangle ${rectangleId}`);
      //   rectangleMapping.createTab(rectangleId, content, response.data);
      // }

      return true;
    }
    catch (error) {
      // Visual indication of error
      target.set({
        stroke: 'red', // Change color to indicate error
        strokeDashArray: [] // Remove dashed line effect
      });
      fabricRef.current?.renderAll();

      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data || error.message);
      } else {
        console.error('Error sending coordinates:', error);
      }
      return false;
    }
  }

  const handleMouseDown = (eventData: TPointerEventInfo<TPointerEvent>) => {
    if (!isDrawingEnabled || !fabricRef.current) {
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
    }) as RectWithData;

    // Add data property to the rectangle
    rectRef.current.data = {};

    rectRef.current.controls.deleteControl = new Control({
      // positioning delete controll icon relative to the rectangle
      // x, y range is <-0.5; 0.5> : 
      // +0.5 means 50% of the drawn rectangle width (for x) or height (for y) to the right (for x) or upward (for y) from the center
      // -0.5 is to the left (for x) or downward (for y)
      // 0 would be at the center
      x: 0.5,
      y: -0.5,
      // additional pixel offset: positive number moves right (for x) or down (for y), negative number moves left (for x) or up (for y) (as for x, y axes)
      offsetX: 16,
      offsetY: -16,
      // defines how mouse cursor will look like when hovering over the control (pointer => pointing hand) 
      cursorStyle: 'pointer',
      mouseUpHandler: deleteObject,
      render: renderIcon(deleteIcon),
    });

    rectRef.current.controls.sendControl = new Control({
      x: 0.5,
      y: -0.35,
      offsetX: 16,
      offsetY: -16,
      cursorStyle: 'pointer',
      mouseUpHandler: sendRectCoordinates,
      render: renderIcon(sendIcon),
    })

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
    if (isDrawingRef.current && rectRef.current && rectRef.current.width > 10 && rectRef.current.height > 10) {
      const left = rectRef.current.left ?? 0;
      const top = rectRef.current.top ?? 0;
      const width = rectRef.current.width * (rectRef.current.scaleX ?? 1);
      const height = rectRef.current.height * (rectRef.current.scaleY ?? 1);
      
      const tableCoordinates: TableBoundingBox = {
        upperLeftX: left,
        upperLeftY: top,
        lowerRightX: left + width,
        lowerRightY: top + height
      };
      
      // Add the record to get a rectangleId with final dimensions
      const rectangleId = tablesContext.addTableRecord(pdfPageNumber, tableCoordinates);
      
      // Assign the ID to the rectangle's data property
      rectRef.current.data = { rectangleId };
      
    }

    isDrawingRef.current = false;
    rectRef.current = undefined;
  };

  const clearCanvas = () => {
    const canvas = fabricRef.current
    if (canvas) {
      const objects = canvas.getObjects();
      for (let i = objects.length - 1; i >= 0; i--) {
        canvas.remove(objects[i]);
      }
    }
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
      <canvas ref={canvasRef} />
    </div>
  );
};
