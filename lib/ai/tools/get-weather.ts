import { tool } from 'ai';
import { z } from 'zod';
import { logger } from '@/lib/logger';

export const getWeather = tool({
  description: 'Get the current weather at a location',
  parameters: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  execute: async ({ latitude, longitude }) => {
    logger.info({ latitude, longitude }, 'Executing getWeather tool');
    try {
      logger.info({ latitude, longitude }, 'Fetching weather data');
      let response: Response;
      response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
      );
      logger.info({ status: response.status }, 'Received weather data response');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const weatherData = await response.json();
      logger.info({ latitude, longitude, weatherData }, 'Weather data fetched successfully');
      return weatherData;
    } catch (error: any) {
      logger.error({ latitude, longitude, error: error.message, stack: error.stack }, 'Error executing getWeather tool');
      throw error; // Re-throw the error
    }
  },
});
