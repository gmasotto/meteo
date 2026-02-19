import { fetchJson } from "@/api/client";
import {
  citySuggestionsSchema,
  forecastApiResponseSchema,
  weatherApiResponseSchema,
  type CitySuggestion,
  type ForecastApiResponse,
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

export type DayMomentKey = "morning" | "afternoon" | "evening" | "night";

export type DayMomentWeather = {
  moment: DayMomentKey;
  label: string;
  iconLabel: string;
  temperature: number;
  icon: string;
};

export type ForecastSlot = {
  timestamp: number;
  temperature: number;
  iconLabel: string;
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

async function fetchForecastRaw(lat: number, lon: number) {
  const url = new URL(`${WEATHER_BASE_URL}/forecast`);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("units", "metric");

  return fetchJson(withApiKey(url), forecastApiResponseSchema);
}

const DAY_MOMENT_ORDER: DayMomentKey[] = [
  "morning",
  "afternoon",
  "evening",
  "night",
];

const DAY_MOMENT_LABELS: Record<DayMomentKey, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  night: "Night",
};

export function getMomentByHour(hour: number): DayMomentKey {
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 23) return "evening";
  return "night";
}

function toForecastSlots(data: ForecastApiResponse): ForecastSlot[] {
  return data.list.map((slot) => ({
    timestamp: slot.dt,
    temperature: slot.main.temp,
    iconLabel: slot.weather[0]?.description ?? "No description",
    icon: slot.weather[0]?.icon ?? "01d",
  }));
}

export function mapDayMomentsFromSlots(slots: ForecastSlot[]): DayMomentWeather[] {
  const byMoment = new Map<DayMomentKey, DayMomentWeather>();

  for (const slot of slots) {
    const date = new Date(slot.timestamp * 1000);
    const moment = getMomentByHour(date.getHours());

    if (byMoment.has(moment)) {
      continue;
    }

    byMoment.set(moment, {
      iconLabel: slot.iconLabel,
      moment,
      label: DAY_MOMENT_LABELS[moment],
      temperature: slot.temperature,
      icon: slot.icon,
    });

    if (byMoment.size === DAY_MOMENT_ORDER.length) {
      break;
    }
  }

  return DAY_MOMENT_ORDER.map((moment) => {
    const value = byMoment.get(moment);
    if (value) {
      return value;
    }

    return {
      iconLabel: "No description",
      moment,
      label: DAY_MOMENT_LABELS[moment],
      temperature: 0,
      icon: "01d",
    };
  });
}

export function filterSlotsByMoment(
  slots: ForecastSlot[],
  moment: DayMomentKey,
): ForecastSlot[] {
  return slots.filter((slot) => {
    const hour = new Date(slot.timestamp * 1000).getHours();
    return getMomentByHour(hour) === moment;
  });
}

export async function searchCities(query: string): Promise<CitySuggestion[]> {
  const term = query.trim();

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

export async function fetchForecastSlots(
  selectedCity: Pick<CitySuggestion, "lat" | "lon">,
): Promise<ForecastSlot[]> {
  const data = await fetchForecastRaw(selectedCity.lat, selectedCity.lon);
  return toForecastSlots(data);
}

function forecastOptions(city: CitySuggestion | null) {
  return queryOptions({
    queryKey: openWeatherQueryKeys.forecast(city?.lat, city?.lon),
    queryFn: async () => {
      if (!city) {
        throw new Error("City is required");
      }

      return fetchForecastSlots(city);
    },
    enabled: Boolean(city),
  });
}

export const openWeatherQueryKeys = {
  citySuggestions: (query: string) => ["city-suggestions", query] as const,
  currentWeather: (lat?: number, lon?: number) =>
    ["city-weather", lat, lon] as const,
  forecast: (lat?: number, lon?: number) => ["city-forecast", lat, lon] as const,
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

  forecast: (city: CitySuggestion | null) => forecastOptions(city),

  dayMoments: (city: CitySuggestion | null) =>
    queryOptions({
      ...forecastOptions(city),
      select: mapDayMomentsFromSlots,
    }),
};
