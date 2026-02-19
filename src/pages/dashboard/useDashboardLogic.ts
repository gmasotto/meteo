import {
  openWeatherQueries,
  type CitySuggestion,
  type DayMomentWeather,
} from "@/api/openWeather";
import { useDebounce } from "@/hooks/useDebounce";
import { useLastSearchedCity } from "@/hooks/useLastSearchedCity";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

type DetailRouteState = {
  cityName: string;
  country: string;
  momentLabel: string;
};

function cityLabel(city: CitySuggestion) {
  return `${city.name}${city.state ? `, ${city.state}` : ""}, ${city.country}`;
}

function detailHref(city: CitySuggestion, moment: DayMomentWeather["moment"]) {
  return `/detail/${city.lat}/${city.lon}/${moment}`;
}

export function useDashboardLogic() {
  const { lastCity, saveLastCity } = useLastSearchedCity();
  const [cityInput, setCityInput] = useState(() =>
    lastCity ? cityLabel(lastCity) : "",
  );
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CitySuggestion | null>(
    () => lastCity,
  );

  const debouncedCityInput = useDebounce(cityInput);

  const citySuggestionsQuery = useQuery(
    openWeatherQueries.citySuggestions(debouncedCityInput),
  );
  const selectedCityWeatherQuery = useQuery(
    openWeatherQueries.currentWeather(selectedCity),
  );
  const dayMomentsQuery = useQuery(openWeatherQueries.dayMoments(selectedCity));

  function handleInputFocus() {
    setIsSuggestionsOpen(!selectedCity);
  }

  function handleInputChange(value: string) {
    setCityInput(value);
    setSelectedCity(null);
    setIsSuggestionsOpen(true);
  }

  function handleCitySelect(city: CitySuggestion) {
    setSelectedCity(city);
    setCityInput(cityLabel(city));
    setIsSuggestionsOpen(false);
    saveLastCity(city);
  }

  function getDetailLink(
    moment: DayMomentWeather["moment"],
    momentLabel: string,
  ): { to: string; state: DetailRouteState } | null {
    if (!selectedCity) return null;

    return {
      to: detailHref(selectedCity, moment),
      state: {
        cityName: selectedCity.name,
        country: selectedCity.country,
        momentLabel,
      },
    };
  }

  return {
    cityInput,
    selectedCity,
    citySuggestionsQuery,
    selectedCityWeatherQuery,
    dayMomentsQuery,
    showSuggestions: isSuggestionsOpen && debouncedCityInput.trim().length >= 2,
    getCityLabel: cityLabel,
    handleInputFocus,
    handleInputChange,
    handleCitySelect,
    getDetailLink,
  };
}
