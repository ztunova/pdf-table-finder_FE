import { Rect } from "fabric";

// Extend the Fabric object type to include our custom data
export interface RectWithData extends Rect {
    data?: {
      rectangleId?: string;
    };
}

export interface TableBoundingBox {
  upperLeftX: number;
  upperLeftY: number;
  lowerRightX: number;
  lowerRightY: number;
}

export interface TableDetectionResponse {
  allRectangles: Record<number, TableBoundingBox[]>;
}

export interface TableData {
  id: string,
  title: string,
  pdfPageNumber: number,
  coordinates: TableBoundingBox,
  extractedData: string[][] | null,
  chatgptPrompt: string | null,
  useCustomPrompt: boolean,
}

export const absoluteCoordsToPercentage = (value: number, total: number) => ((value / total) * 100);
export const percentageCoordsToAbsolute = (percentage: number, total: number) => ((percentage * total) / 100); 
