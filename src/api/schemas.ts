import { z } from "zod";

export const citySuggestionSchema = z.object({
  name: z.string(),
  local_names: z.record(z.string(), z.string()).optional(),
  lat: z.number(),
  lon: z.number(),
  country: z.string(),
  state: z.string().optional(),
});

export const citySuggestionsSchema = z.array(citySuggestionSchema);

export const weatherApiResponseSchema = z.object({
  name: z.string(),
  sys: z.object({ country: z.string().optional() }).optional(),
  main: z.object({
    temp: z.number(),
    feels_like: z.number(),
    humidity: z.number(),
  }),
  wind: z.object({ speed: z.number() }),
  weather: z.array(
    z.object({
      main: z.string(),
      icon: z.string(),
    }),
  ),
});

export const forecastApiResponseSchema = z.object({
  list: z.array(
    z.object({
      dt: z.number(),
      dt_txt: z.string(),
      main: z.object({
        temp: z.number(),
      }),
      weather: z.array(
        z.object({
          description: z.string(),
          icon: z.string(),
          id: z.number(),
          main: z.string(),
        }),
      ),
    }),
  ),
});

export type CitySuggestion = z.infer<typeof citySuggestionSchema>;
export type WeatherApiResponse = z.infer<typeof weatherApiResponseSchema>;
export type ForecastApiResponse = z.infer<typeof forecastApiResponseSchema>;
