import request from 'supertest';
import express from 'express';
import { createGeolocationRoutes } from '../api/routes';
import { GeolocationUseCases } from '../application/use-cases';
import type { GeolocationRepository } from '../domain/repository';

describe('Geolocation API Routes', () => {
  let app: express.Application;
  let mockRepository: jest.Mocked<GeolocationRepository>;
  let useCases: GeolocationUseCases;

  beforeEach(() => {
    mockRepository = {
      checkPointInPolygon: jest.fn()
    };
    useCases = new GeolocationUseCases(mockRepository);

    app = express();
    app.use(express.json());
    app.use('/api/geolocation', createGeolocationRoutes(useCases));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/geolocation/check', () => {
    it('should return 200 with valid result when point is inside polygon', async () => {
      const requestData = {
        point: { lat: 55.7558, lng: 37.6176 },
        objectId: 'test-object-id'
      };

      const expectedResult = {
        isInside: true,
        objectId: 'test-object-id'
      };

      mockRepository.checkPointInPolygon.mockResolvedValue(expectedResult);

      const response = await request(app)
        .post('/api/geolocation/check')
        .send(requestData)
        .expect(200);

      expect(response.body).toEqual(expectedResult);
      expect(mockRepository.checkPointInPolygon).toHaveBeenCalledWith(
        requestData.point,
        requestData.objectId
      );
    });

    it('should return 200 with false result when point is outside polygon', async () => {
      const requestData = {
        point: { lat: 55.7558, lng: 37.6176 },
        objectId: 'test-object-id'
      };

      const expectedResult = {
        isInside: false
      };

      mockRepository.checkPointInPolygon.mockResolvedValue(expectedResult);

      const response = await request(app)
        .post('/api/geolocation/check')
        .send(requestData)
        .expect(200);

      expect(response.body).toEqual(expectedResult);
    });

    it('should return 400 for invalid request data - missing point', async () => {
      const requestData = {
        objectId: 'test-object-id'
      };

      const response = await request(app)
        .post('/api/geolocation/check')
        .send(requestData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Неверные данные');
      expect(response.body).toHaveProperty('details');
      expect(mockRepository.checkPointInPolygon).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid request data - missing objectId', async () => {
      const requestData = {
        point: { lat: 55.7558, lng: 37.6176 }
      };

      const response = await request(app)
        .post('/api/geolocation/check')
        .send(requestData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Неверные данные');
      expect(mockRepository.checkPointInPolygon).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid point coordinates', async () => {
      const requestData = {
        point: { lat: 'invalid', lng: 37.6176 },
        objectId: 'test-object-id'
      };

      const response = await request(app)
        .post('/api/geolocation/check')
        .send(requestData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Неверные данные');
      expect(mockRepository.checkPointInPolygon).not.toHaveBeenCalled();
    });

    it('should return 500 for internal server errors', async () => {
      const requestData = {
        point: { lat: 55.7558, lng: 37.6176 },
        objectId: 'test-object-id'
      };

      const error = new Error('Database connection failed');
      mockRepository.checkPointInPolygon.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/geolocation/check')
        .send(requestData)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Внутренняя ошибка сервера');
    });

    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/geolocation/check')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Неверные данные');
      expect(mockRepository.checkPointInPolygon).not.toHaveBeenCalled();
    });
  });
});
