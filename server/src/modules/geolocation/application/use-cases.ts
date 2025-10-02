import type { GeolocationRepository } from "../domain/repository";
import type { CheckPointInPolygonData, PolygonCheckResult } from "../domain/types";

export class GeolocationUseCases {
  constructor(private geolocationRepository: GeolocationRepository) {}

  async checkPointInPolygon(data: CheckPointInPolygonData): Promise<PolygonCheckResult> {
    return this.geolocationRepository.checkPointInPolygon(data.point, data.objectId);
  }
}
