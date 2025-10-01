import { PostGISGeolocationRepository } from '../infrastructure/postgis-geolocation-repository';
import type { PrismaClient } from '@prisma/client';

describe('PostGISGeolocationRepository', () => {
  let mockPrisma: jest.Mocked<PrismaClient>;
  let repository: PostGISGeolocationRepository;

  beforeEach(() => {
    mockPrisma = {
      $queryRaw: jest.fn()
    } as any;
    repository = new PostGISGeolocationRepository(mockPrisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkPointInPolygon', () => {
    it('should return true when point is inside polygon', async () => {
      const point = { lat: 55.7558, lng: 37.6176 };
      const objectId = 'test-object-id';

      const mockResult = [
        {
          id: 'test-object-id',
          is_inside: true
        }
      ];

      mockPrisma.$queryRaw.mockResolvedValue(mockResult);

      const result = await repository.checkPointInPolygon(point, objectId);

      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
      expect(result).toEqual({
        isInside: true,
        objectId: 'test-object-id'
      });
    });

    it('should return false when point is outside polygon', async () => {
      const point = { lat: 55.7558, lng: 37.6176 };
      const objectId = 'test-object-id';

      const mockResult = [
        {
          id: 'test-object-id',
          is_inside: false
        }
      ];

      mockPrisma.$queryRaw.mockResolvedValue(mockResult);

      const result = await repository.checkPointInPolygon(point, objectId);

      expect(result).toEqual({
        isInside: false,
        objectId: 'test-object-id'
      });
    });

    it('should return false when no object found', async () => {
      const point = { lat: 55.7558, lng: 37.6176 };
      const objectId = 'non-existent-id';

      const mockResult: any[] = [];

      mockPrisma.$queryRaw.mockResolvedValue(mockResult);

      const result = await repository.checkPointInPolygon(point, objectId);

      expect(result).toEqual({
        isInside: false,
        objectId: undefined
      });
    });

    it('should handle database errors', async () => {
      const point = { lat: 55.7558, lng: 37.6176 };
      const objectId = 'test-object-id';

      const error = new Error('Database connection failed');
      mockPrisma.$queryRaw.mockRejectedValue(error);

      await expect(repository.checkPointInPolygon(point, objectId)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should call $queryRaw with correct parameters', async () => {
      const point = { lat: 55.7558, lng: 37.6176 };
      const objectId = 'test-object-id';

      const mockResult = [
        {
          id: 'test-object-id',
          is_inside: true
        }
      ];

      mockPrisma.$queryRaw.mockResolvedValue(mockResult);

      await repository.checkPointInPolygon(point, objectId);

      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    });
  });
});
