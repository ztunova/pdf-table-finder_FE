import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Rect, TPointerEvent, TPointerEventInfo } from 'fabric';
import { useDrawing } from '../../custom-context/DrawingContext';
import { useTableData } from '../../custom-context/TableContext';
import { absoluteCoordsToPercentage, percentageCoordsToAbsolute, RectWithData, TableBoundingBox } from '../../shared-types';
import RectangleMenu from './RectangleMenu';

// !!! pdf page number je cislovane od 1 na FE, od 0 na BE
interface DrawingCanvasProps {
  pdfPageNumber: number;
  canvasWidth: number;
  canvasHeight: number;
}

const activeCanvasRegistry = {
  activeCanvasId: null as number | null,
  canvases: new Map<number, Canvas>(),
  
  registerCanvas(id: number, canvas: Canvas) {
    this.canvases.set(id, canvas);
  },
  
  unregisterCanvas(id: number) {
    this.canvases.delete(id);
  },
  
  setActiveCanvas(id: number) {
    if (id !== this.activeCanvasId) {
      this.canvases.forEach((canvas, canvasId) => {
        if (canvasId !== id) {
          canvas.discardActiveObject();
          canvas.renderAll();
        }
      });
      this.activeCanvasId = id;
    }
  }
};

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ pdfPageNumber, canvasWidth, canvasHeight }) => {
  const drawingContext = useDrawing();
  // useRef for storing values that we need to access throughout the component's lifecycle but don't need to trigger re-renders
  // usage of useState instead of useRef would cause unnecessary re-renders

  // references the actual HTML canvas DOM element
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // references the Fabric.js Canvas instance that wraps the HTML canvas
  // We need both because:
  // 1. Fabric.js needs the HTML canvas element to initialize
  // 2. We need the Fabric.js canvas instance to control drawing features
  const fabricRef = useRef<Canvas>();
  
  // tracking if we are currently in the process of drawing rectangle
  // to maintain state between mouse events (mouse down/ moving/ up)
  // using useState instead of useRef would cause re-renders on every mouse move 
  const isDrawingRef = useRef<boolean>(false)

  // Stores the current rectangle being drawn
  // Used to keep track of which rectangle we're currently drawing so we can update it during mouse move
  const rectRef = useRef<RectWithData>();

  const tablesContext = useTableData();
  const [isSelectedRectOnPage, setIsSelectedRectOnPage] = useState(false);

  // Update the state when selected rectangle changes or page changes
  useEffect(() => {
    const checkIfSelectedRectangleOnCurrentPage = () => {
      if (!tablesContext.selectedRectangleId) {
        setIsSelectedRectOnPage(false);
        return;
      }
      
      const selectedRectangelData = tablesContext.getTableDataById(tablesContext.selectedRectangleId);
      
      // If the table exists and is on the current page (accounting for zero-indexed vs one-indexed)
      const isOnCurrentPage = selectedRectangelData !== null && 
                          tablesContext.tablesPerPage[pdfPageNumber-1]?.includes(tablesContext.selectedRectangleId);
      
      setIsSelectedRectOnPage(isOnCurrentPage);
      
      // If the selected rectangle is on this page, make sure this canvas is active
      if (isOnCurrentPage && fabricRef.current) {
        activeCanvasRegistry.setActiveCanvas(pdfPageNumber);
        
        // Find and select the correct rectangle object in this canvas
        const objects = fabricRef.current.getObjects() as RectWithData[];
        const rectToSelect = objects.find(
          obj => obj.data?.rectangleId === tablesContext.selectedRectangleId
        );
        
        if (rectToSelect && !fabricRef.current.getActiveObject()) {
          fabricRef.current.setActiveObject(rectToSelect);
          fabricRef.current.renderAll();
        }
      }
    };
    
    checkIfSelectedRectangleOnCurrentPage();
  }, [tablesContext.selectedRectangleId, tablesContext.tablesPerPage, pdfPageNumber]);

  // drawing rectangles per page
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) {
      return;
    }

    clearCanvas()
    const rectanglesForPage = tablesContext.getTablesForPage(pdfPageNumber);
    rectanglesForPage.forEach(rectangle => {
      const {upperLeftX, upperLeftY, lowerRightX, lowerRightY} = rectangle.coordinates
      const absUpperLeftX = percentageCoordsToAbsolute(upperLeftX, canvasWidth)
      const absUpperLeftY = percentageCoordsToAbsolute(upperLeftY, canvasHeight)
      const absLowerRightX = percentageCoordsToAbsolute(lowerRightX, canvasWidth)
      const absLowerRightY = percentageCoordsToAbsolute(lowerRightY, canvasHeight)
      
      const width = absLowerRightX - absUpperLeftX;
      const height = absLowerRightY - absUpperLeftY;

      // Create new rectangle to canvas
      const canvasRect = new Rect({
        left: absUpperLeftX,
        top: absUpperLeftY,
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
      width: canvasWidth,
      height: canvasHeight,
    });

    canvas.on('mouse:down', () => {
      // Set this canvas as active when interacting with it
      activeCanvasRegistry.setActiveCanvas(pdfPageNumber);
    });
    canvas.on('selection:created', handleObjectSelected);
    canvas.on('selection:updated', handleObjectSelected);
    canvas.on('selection:cleared', () => {
      // Only clear the global selection if this is the active canvas
      if (activeCanvasRegistry.activeCanvasId === pdfPageNumber) {
        tablesContext.setSelectedRectangle(null);
      }
    });

    canvas.on('object:modified', function(e) {
      if (e.target) {
        const targetWithData = e.target as RectWithData;
        
        if (targetWithData.data?.rectangleId) {
          const rectId = targetWithData.data.rectangleId;
          
          const absUpperLeftX = targetWithData.left
          const absUpperLeftY = targetWithData.top
          const absLowerRightX = targetWithData.left + targetWithData.width * targetWithData.scaleX
          const absLowerRightY = targetWithData.top + targetWithData.height * targetWithData.scaleY
          
          const percentageNewCoords:TableBoundingBox = {
            upperLeftX: absoluteCoordsToPercentage(absUpperLeftX, canvasWidth),
            upperLeftY: absoluteCoordsToPercentage(absUpperLeftY, canvasHeight),
            lowerRightX: absoluteCoordsToPercentage(absLowerRightX, canvasWidth),
            lowerRightY: absoluteCoordsToPercentage(absLowerRightY, canvasHeight),
          }

          tablesContext.updateTableCoordinates(rectId, percentageNewCoords)
        }
      }
    });

    fabricRef.current = canvas;
    activeCanvasRegistry.registerCanvas(pdfPageNumber, canvas);

    // Cleanup on unmount
    return () => {
      canvas.off('selection:created', handleObjectSelected);
      canvas.off('selection:updated', handleObjectSelected);
      activeCanvasRegistry.unregisterCanvas(pdfPageNumber);
      canvas.dispose();
    };
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) {
      return;
    }

    if (drawingContext.isDrawingEnabled) {
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

  }, [drawingContext.isDrawingEnabled, drawingContext.isDrawingLocked])
  

  const handleObjectSelected = (e: any) => {
    const selectedObject = e.selected?.[0] as RectWithData;
    
    if (selectedObject && selectedObject.data?.rectangleId) {
      // Set this canvas as active
      activeCanvasRegistry.setActiveCanvas(pdfPageNumber);
      tablesContext.setSelectedRectangle(selectedObject.data.rectangleId);
    }
  };

  const handleMouseDown = (eventData: TPointerEventInfo<TPointerEvent>) => {
    if (!drawingContext.isDrawingEnabled || !fabricRef.current) {
      return;
    }

    // Set this canvas as active when drawing
    activeCanvasRegistry.setActiveCanvas(pdfPageNumber);

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

      const upperLeftX = left
      const upperLeftY = top
      const lowerRightX = left + width
      const lowerRightY = top + height
      
      const percentageTableCoordinates: TableBoundingBox = {
        upperLeftX: absoluteCoordsToPercentage(upperLeftX, canvasWidth),
        upperLeftY: absoluteCoordsToPercentage(upperLeftY, canvasHeight),
        lowerRightX: absoluteCoordsToPercentage(lowerRightX, canvasWidth),
        lowerRightY: absoluteCoordsToPercentage(lowerRightY, canvasHeight)
      };
      
      // Add the record to get a rectangleId with final dimensions
      const rectangleId = tablesContext.addTableRecord(pdfPageNumber, percentageTableCoordinates);
      
      // Assign the ID to the rectangle's data property
      rectRef.current.data = { rectangleId };

      if(!drawingContext.isDrawingLocked) {
        drawingContext.setIsDrawingEnabled(false)
      }
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
      {isSelectedRectOnPage && <RectangleMenu canvasWidth={canvasWidth} canvasHeight={canvasHeight} />}
    </div>
  );
};
