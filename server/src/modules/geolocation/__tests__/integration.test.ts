import { PrismaClient } from '@prisma/client';
import { PostGISGeolocationRepository } from '../infrastructure/postgis-geolocation-repository';

// Эти тесты требуют запущенный PostgreSQL с PostGIS расширением
// Раскомментируйте describe.skip -> describe для запуска
describe.skip('Geolocation Integration Tests', () => {
  let prisma: PrismaClient;
  let repository: PostGISGeolocationRepository;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new PostGISGeolocationRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('PostGIS Integration', () => {
    it('should handle non-existent object gracefully', async () => {
      const point = { lat: 55.7558, lng: 37.6176 };
      const nonExistentObjectId = 'non-existent-id';

      const result = await repository.checkPointInPolygon(point, nonExistentObjectId);

      expect(result).toEqual({
        isInside: false,
        objectId: undefined
      });
    });

    it('should handle object without polygon gracefully', async () => {
      // Создаем объект без полигона
      const testObject = await prisma.object.create({
        data: {
          name: 'Test Object Without Polygon',
          assignee: 'test-user',
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000), // +1 день
          type: 'PROJECT'
        }
      });

      const point = { lat: 55.7558, lng: 37.6176 };

      const result = await repository.checkPointInPolygon(point, testObject.id);

      expect(result).toEqual({
        isInside: false,
        objectId: undefined
      });

      // Очищаем тестовые данные
      await prisma.object.delete({
        where: { id: testObject.id }
      });
    });

    it('should work with valid polygon data', async () => {
      // Создаем объект с полигоном
      const polygonWKT = 'POLYGON((37.6176 55.7558, 37.6177 55.7558, 37.6177 55.7559, 37.6176 55.7559, 37.6176 55.7558))';
      
      const testObject = await prisma.object.create({
        data: {
          name: 'Test Object With Polygon',
          assignee: 'test-user',
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000),
          type: 'PROJECT',
          polygon: polygonWKT
        }
      });

      // Точка внутри полигона
      const pointInside = { lat: 55.75585, lng: 37.61765 };
      const resultInside = await repository.checkPointInPolygon(pointInside, testObject.id);

      expect(resultInside).toEqual({
        isInside: true,
        objectId: testObject.id
      });

      // Точка вне полигона
      const pointOutside = { lat: 55.7560, lng: 37.6180 };
      const resultOutside = await repository.checkPointInPolygon(pointOutside, testObject.id);

      expect(resultOutside).toEqual({
        isInside: false,
        objectId: testObject.id
      });

      // Очищаем тестовые данные
      await prisma.object.delete({
        where: { id: testObject.id }
      });
    });
  });
});
