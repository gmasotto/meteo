import { type CitySuggestion } from "@/api/openWeather";
import { citySuggestionSchema } from "@/api/schemas";

const LAST_CITY_STORAGE_KEY = "last-city";

function readLastCity(): CitySuggestion | null {
  const raw = localStorage.getItem(LAST_CITY_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const result = citySuggestionSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function saveLastCity(city: CitySuggestion) {
  localStorage.setItem(LAST_CITY_STORAGE_KEY, JSON.stringify(city));
}

export function useLastSearchedCity() {
  return {
    lastCity: readLastCity(),
    saveLastCity,
  };
}
