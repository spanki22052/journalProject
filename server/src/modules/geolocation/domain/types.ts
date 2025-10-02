export interface Point {
  lat: number;
  lng: number;
}

export interface PolygonCheckResult {
  isInside: boolean;
  objectId?: string;
}

export interface CheckPointInPolygonData {
  point: Point;
  objectId: string;
}