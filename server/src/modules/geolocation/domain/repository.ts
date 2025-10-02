import type { Point, PolygonCheckResult } from "./types";

export interface GeolocationRepository {
  checkPointInPolygon(point: Point, objectId: string): Promise<PolygonCheckResult>;
}
