import { PrismaClient } from "@prisma/client";
import type { GeolocationRepository } from "../domain/repository";
import type { Point, PolygonCheckResult } from "../domain/types";

export class PostGISGeolocationRepository implements GeolocationRepository {
  constructor(private prisma: PrismaClient) {}

  async checkPointInPolygon(point: Point, objectId: string): Promise<PolygonCheckResult> {
    const result = await this.prisma.$queryRaw<Array<{
      id: string;
      is_inside: boolean;
    }>>`
      SELECT
        o.id,
        ST_Contains(ST_GeomFromText(o.polygon, 4326), ST_GeomFromText(${`POINT(${point.lng} ${point.lat})`}, 4326)) as is_inside
      FROM objects o
      WHERE o.id = ${objectId} AND o.polygon IS NOT NULL
    `;

    const row = result[0];
    return {
      isInside: row?.is_inside || false,
      objectId: row?.id
    };
  }
}
