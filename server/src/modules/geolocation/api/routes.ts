import { Router } from 'express';
import { z } from 'zod';
import type { GeolocationUseCases } from '../application/use-cases';

const checkPointSchema = z.object({
  point: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  objectId: z.string()
});

export function createGeolocationRoutes(geolocationUseCases: GeolocationUseCases): Router {
  const router = Router();

  router.post('/check', async (req, res) => {
    try {
      const data = checkPointSchema.parse(req.body);
      const result = await geolocationUseCases.checkPointInPolygon(data);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Неверные данные', details: error.errors });
        return;
      }
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  });

  return router;
}
    