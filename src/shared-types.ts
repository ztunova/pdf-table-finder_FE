import { Rect } from "fabric";

// Extend the Fabric object type to include our custom data
interface RectWithData extends Rect {
    data?: {
      rectangleId: string;
      pdfPageNumber?: number;
    };
}

export default RectWithData;