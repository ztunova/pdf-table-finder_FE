import { Rect } from "fabric";

// Extend the Fabric object type to include our custom data
export interface RectWithData extends Rect {
    data?: {
      rectangleId: string;
      pdfPageNumber?: number;
    };
}

export interface TableBoundingBoxResponse {
  upperLeftX: number;
  upperLeftY: number;
  lowerRightX: number;
  lowerRightY: number;
}

export interface TableDetectionResponse {
  allRectangles: Record<number, TableBoundingBoxResponse[]>;
}

export interface TableData {
  id: string,
  title: string,
  coordinates: TableBoundingBoxResponse,
}
