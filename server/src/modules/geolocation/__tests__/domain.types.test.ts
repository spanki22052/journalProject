import type { Point, PolygonCheckResult, CheckPointInPolygonData } from '../domain/types';

describe('Geolocation Domain Types', () => {
  describe('Point', () => {
    it('should create a valid Point object', () => {
      const point: Point = {
        lat: 55.7558,
        lng: 37.6176
      };

      expect(point.lat).toBe(55.7558);
      expect(point.lng).toBe(37.6176);
    });

    it('should accept negative coordinates', () => {
      const point: Point = {
        lat: -33.9249,
        lng: 18.4241
      };

      expect(point.lat).toBe(-33.9249);
      expect(point.lng).toBe(18.4241);
    });
  });

  describe('PolygonCheckResult', () => {
    it('should create a result when point is inside polygon', () => {
      const result: PolygonCheckResult = {
        isInside: true,
        objectId: 'test-object-id'
      };

      expect(result.isInside).toBe(true);
      expect(result.objectId).toBe('test-object-id');
    });

    it('should create a result when point is outside polygon', () => {
      const result: PolygonCheckResult = {
        isInside: false
      };

      expect(result.isInside).toBe(false);
      expect(result.objectId).toBeUndefined();
    });
  });

  describe('CheckPointInPolygonData', () => {
    it('should create valid input data', () => {
      const data: CheckPointInPolygonData = {
        point: {
          lat: 55.7558,
          lng: 37.6176
        },
        objectId: 'test-object-id'
      };

      expect(data.point.lat).toBe(55.7558);
      expect(data.point.lng).toBe(37.6176);
      expect(data.objectId).toBe('test-object-id');
    });
  });
});
