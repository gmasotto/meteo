import { fetchJson } from "@/api/client";
import {
  citySuggestionsSchema,
  weatherApiResponseSchema,
  type CitySuggestion,
} from "@/api/schemas";
import { queryOptions } from "@tanstack/react-query";
export type { CitySuggestion } from "@/api/schemas";

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const GEOCODING_BASE_URL = "https://api.openweathermap.org/geo/1.0";
const WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

export type CurrentWeather = {
  cityName: string;
  country?: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
};

function ensureApiKey() {
  if (!OPENWEATHER_API_KEY) {
    throw new Error("Missing OpenWeather API key in VITE_OPENWEATHER_API_KEY");
  }
}

function withApiKey(url: URL): string {
  ensureApiKey();
  url.searchParams.set("appid", OPENWEATHER_API_KEY);
  return url.toString();
}

function toCurrentWeather(
  data: Awaited<ReturnType<typeof fetchWeatherRaw>>,
  city: Pick<CitySuggestion, "country">,
): CurrentWeather {
  const primaryWeather = data.weather[0];

  return {
    cityName: data.name,
    country: data.sys?.country ?? city.country,
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    condition: primaryWeather?.main ?? "Unknown",
    icon: primaryWeather?.icon ?? "01d",
  };
}

async function fetchWeatherRaw(lat: number, lon: number) {
  const url = new URL(`${WEATHER_BASE_URL}/weather`);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("units", "metric");

  return fetchJson(withApiKey(url), weatherApiResponseSchema);
}

export async function searchCities(query: string): Promise<CitySuggestion[]> {
  const term = query.trim(); // in caso ci fossero degli spazi, cosi evito refetch per query differente

  if (term.length < 2) {
    return [];
  }

  const url = new URL(`${GEOCODING_BASE_URL}/direct`);
  url.searchParams.set("q", term);
  url.searchParams.set("limit", "5");

  return fetchJson(withApiKey(url), citySuggestionsSchema);
}

export async function fetchCurrentWeather(
  selectedCity: Pick<CitySuggestion, "lat" | "lon" | "country">,
): Promise<CurrentWeather> {
  const data = await fetchWeatherRaw(selectedCity.lat, selectedCity.lon);
  return toCurrentWeather(data, selectedCity);
}

export const openWeatherQueryKeys = {
  // potrei mettere le key direttamente dentro alla query,
  // ma se le estraggo ho un maggiore controllo nel caso mi servisse
  citySuggestions: (query: string) => ["city-suggestions", query] as const,
  currentWeather: (lat?: number, lon?: number) =>
    ["city-weather", lat, lon] as const,
};

export const openWeatherQueries = {
  citySuggestions: (query: string) =>
    queryOptions({
      queryKey: openWeatherQueryKeys.citySuggestions(query),
      queryFn: () => searchCities(query),
      enabled: query.trim().length >= 2,
    }),

  currentWeather: (city: CitySuggestion | null) =>
    queryOptions({
      queryKey: openWeatherQueryKeys.currentWeather(city?.lat, city?.lon),
      queryFn: async () => {
        if (!city) {
          throw new Error("City is required");
        }
        return fetchCurrentWeather(city);
      },
      enabled: Boolean(city),
    }),
};
