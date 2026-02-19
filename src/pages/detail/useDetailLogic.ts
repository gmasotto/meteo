import {
  type CitySuggestion,
  type DayMomentKey,
  filterSlotsByMoment,
  openWeatherQueries,
} from "@/api/openWeather";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "react-router-dom";

const MOMENTS: DayMomentKey[] = ["morning", "afternoon", "evening", "night"];

type LocationState = {
  cityName?: string;
  country?: string;
  momentLabel?: string;
};

function isMoment(value: string | undefined): value is DayMomentKey {
  return value ? MOMENTS.includes(value as DayMomentKey) : false;
}

export function useDetailLogic() {
  const { lat, lon, moment } = useParams();
  const { state } = useLocation();
  const locationState = (state ?? {}) as LocationState;

  const parsedLat = Number(lat);
  const parsedLon = Number(lon);

  const hasValidCoords = Number.isFinite(parsedLat) && Number.isFinite(parsedLon);
  const hasValidMoment = isMoment(moment);

  const selectedCity: CitySuggestion | null =
    hasValidCoords && hasValidMoment
      ? {
          name: locationState.cityName ?? "Selected city",
          country: locationState.country ?? "",
          lat: parsedLat,
          lon: parsedLon,
        }
      : null;

  const forecastQuery = useQuery(openWeatherQueries.forecast(selectedCity));

  const hourlySlots =
    forecastQuery.data && hasValidMoment
      ? filterSlotsByMoment(forecastQuery.data, moment).slice(0, 8)
      : [];

  return {
    hasValidRoute: hasValidCoords && hasValidMoment,
    cityName: locationState.cityName ?? "Selected city",
    country: locationState.country ?? "",
    momentLabel: locationState.momentLabel ?? moment ?? "",
    forecastQuery,
    hourlySlots,
  };
}
