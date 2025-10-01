import { GeolocationUseCases } from '../application/use-cases';
import type { GeolocationRepository } from '../domain/repository';
import type { Point, PolygonCheckResult, CheckPointInPolygonData } from '../domain/types';

describe('GeolocationUseCases', () => {
  let mockRepository: jest.Mocked<GeolocationRepository>;
  let useCases: GeolocationUseCases;

  beforeEach(() => {
    mockRepository = {
      checkPointInPolygon: jest.fn()
    };
    useCases = new GeolocationUseCases(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkPointInPolygon', () => {
    it('should call repository with correct parameters', async () => {
      const inputData: CheckPointInPolygonData = {
        point: { lat: 55.7558, lng: 37.6176 },
        objectId: 'test-object-id'
      };

      const expectedResult: PolygonCheckResult = {
        isInside: true,
        objectId: 'test-object-id'
      };

      mockRepository.checkPointInPolygon.mockResolvedValue(expectedResult);

      const result = await useCases.checkPointInPolygon(inputData);

      expect(mockRepository.checkPointInPolygon).toHaveBeenCalledWith(
        inputData.point,
        inputData.objectId
      );
      expect(mockRepository.checkPointInPolygon).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should return result when point is inside polygon', async () => {
      const inputData: CheckPointInPolygonData = {
        point: { lat: 55.7558, lng: 37.6176 },
        objectId: 'test-object-id'
      };

      const expectedResult: PolygonCheckResult = {
        isInside: true,
        objectId: 'test-object-id'
      };

      mockRepository.checkPointInPolygon.mockResolvedValue(expectedResult);

      const result = await useCases.checkPointInPolygon(inputData);

      expect(result.isInside).toBe(true);
      expect(result.objectId).toBe('test-object-id');
    });

    it('should return result when point is outside polygon', async () => {
      const inputData: CheckPointInPolygonData = {
        point: { lat: 55.7558, lng: 37.6176 },
        objectId: 'test-object-id'
      };

      const expectedResult: PolygonCheckResult = {
        isInside: false
      };

      mockRepository.checkPointInPolygon.mockResolvedValue(expectedResult);

      const result = await useCases.checkPointInPolygon(inputData);

      expect(result.isInside).toBe(false);
      expect(result.objectId).toBeUndefined();
    });

    it('should propagate repository errors', async () => {
      const inputData: CheckPointInPolygonData = {
        point: { lat: 55.7558, lng: 37.6176 },
        objectId: 'test-object-id'
      };

      const error = new Error('Database connection failed');
      mockRepository.checkPointInPolygon.mockRejectedValue(error);

      await expect(useCases.checkPointInPolygon(inputData)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});
