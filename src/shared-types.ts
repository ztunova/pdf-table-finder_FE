import { Rect } from "fabric";

// Extend the Fabric object type to include our custom data
interface RectWithData extends Rect {
    data?: {
      rectangleId: string;
      pdfPageNumber?: number;
    };
}
export default RectWithData;

export interface TableBoundingBoxResponse {
  upperLeftX: number;
  upperLeftY: number;
  lowerRightX: number;
  lowerRightY: number;
}

export interface TableDetectionResponse {
  allRectangles: Record<number, TableBoundingBoxResponse[]>;
}
