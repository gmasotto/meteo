import { fetchJson } from "@/api/client";
import {
  citySuggestionsSchema,
  forecastApiResponseSchema,
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

export type DayMomentKey = "morning" | "afternoon" | "evening" | "night";

export type DayMomentWeather = {
  moment: DayMomentKey;
  label: string;
  iconLabel: string;
  temperature: number;
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

function getMomentByHour(hour: number): DayMomentKey {
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 23) return "evening";
  return "night";
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

export async function fetchDayMomentsWeather(
  selectedCity: Pick<CitySuggestion, "lat" | "lon">,
): Promise<DayMomentWeather[]> {
  const data = await fetchForecastRaw(selectedCity.lat, selectedCity.lon);
  const byMoment = new Map<DayMomentKey, DayMomentWeather>();

  for (const slot of data.list) {
    const date = new Date(slot.dt * 1000);
    const moment = getMomentByHour(date.getHours());

    if (byMoment.has(moment)) {
      continue;
    }

    byMoment.set(moment, {
      iconLabel: slot.weather[0]?.description ?? "No description",
      moment,
      label: DAY_MOMENT_LABELS[moment],
      temperature: slot.main.temp,
      icon: slot.weather[0]?.icon ?? "01d",
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

export const openWeatherQueryKeys = {
  // potrei mettere le key direttamente dentro alla query,
  // ma se le estraggo ho un maggiore controllo nel caso mi servisse
  citySuggestions: (query: string) => ["city-suggestions", query] as const,
  currentWeather: (lat?: number, lon?: number) =>
    ["city-weather", lat, lon] as const,
  dayMoments: (lat?: number, lon?: number) =>
    ["day-moments", lat, lon] as const,
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

  dayMoments: (city: CitySuggestion | null) =>
    queryOptions({
      queryKey: openWeatherQueryKeys.dayMoments(city?.lat, city?.lon),
      queryFn: async () => {
        if (!city) {
          throw new Error("City is required");
        }

        return fetchDayMomentsWeather(city);
      },
      enabled: Boolean(city),
    }),
};
