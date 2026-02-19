import { type CitySuggestion, openWeatherQueries } from "@/api/openWeather";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";

function cityLabel(city: CitySuggestion) {
  return `${city.name}${city.state ? `, ${city.state}` : ""}, ${city.country}`;
}

const Dashboard = () => {
  const [cityInput, setCityInput] = useState("");
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CitySuggestion | null>(null);

  const debouncedCityInput = useDebounce(cityInput);

  const citySuggestionsQuery = useQuery(
    openWeatherQueries.citySuggestions(debouncedCityInput),
  );

  const selectedCityWeatherQuery = useQuery(
    openWeatherQueries.currentWeather(selectedCity),
  );

  return (
    <section className="container py-8">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold">Search City Weather</h1>

        <div className="relative">
          <Search className="pointer-events-none absolute top-3 left-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            value={cityInput}
            placeholder="Search city (e.g. Milan, Rome, London)"
            className="h-11 pl-10"
            onFocus={() => setIsSuggestionsOpen(true)}
            onChange={(event) => {
              setCityInput(event.target.value);
              setSelectedCity(null);
              setIsSuggestionsOpen(true);
            }}
          />

          {isSuggestionsOpen && debouncedCityInput.trim().length >= 2 && (
            <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-md border border-input bg-background shadow-sm">
              {citySuggestionsQuery.isLoading && (
                <p className="p-3 text-sm text-muted-foreground">
                  Loading suggestions...
                </p>
              )}

              {citySuggestionsQuery.isError && (
                <p className="p-3 text-sm text-destructive">
                  Could not load cities. Check network/API key.
                </p>
              )}

              {!citySuggestionsQuery.isLoading &&
                !citySuggestionsQuery.isError &&
                citySuggestionsQuery.data?.length === 0 && (
                  <p className="p-3 text-sm text-muted-foreground">
                    City not found.
                  </p>
                )}

              {citySuggestionsQuery.data?.map((city) => (
                <button
                  key={`${city.name}-${city.lat}-${city.lon}-${city.country}`}
                  type="button"
                  className="block w-full cursor-pointer border-b border-input px-3 py-2 text-left text-sm last:border-b-0 hover:bg-accent"
                  onClick={() => {
                    setSelectedCity(city);
                    setCityInput(cityLabel(city));
                    setIsSuggestionsOpen(false);
                  }}
                >
                  {cityLabel(city)}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedCityWeatherQuery.isLoading && (
          <div className="rounded-md border border-input p-4">
            <p className="text-sm text-muted-foreground">
              Loading weather data...
            </p>
          </div>
        )}

        {selectedCityWeatherQuery.isError && (
          <div className="rounded-md border border-destructive p-4">
            <p className="text-sm text-destructive">
              Failed to fetch weather for selected city.
            </p>
          </div>
        )}

        {selectedCityWeatherQuery.data && (
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-xl">
                  {selectedCityWeatherQuery.data.cityName}
                  {selectedCityWeatherQuery.data.country
                    ? `, ${selectedCityWeatherQuery.data.country}`
                    : ""}
                </CardTitle>
                <CardDescription>
                  {selectedCityWeatherQuery.data.condition}
                </CardDescription>
              </div>
              <img
                // avrei voluto usare le icone di lucid, ma openweather
                // ha le sue che si collegano perfettamente, ho scelto le loro per questa parte
                src={`https://openweathermap.org/img/wn/${selectedCityWeatherQuery.data.icon}@2x.png`}
                alt={selectedCityWeatherQuery.data.condition}
                className="h-14 w-14"
              />
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <p>
                  <span className="text-muted-foreground">Temperature: </span>
                  {Math.round(selectedCityWeatherQuery.data.temperature)}°C
                </p>
                <p>
                  <span className="text-muted-foreground">Feels like: </span>
                  {Math.round(selectedCityWeatherQuery.data.feelsLike)}°C
                </p>
                <p>
                  <span className="text-muted-foreground">Humidity: </span>
                  {selectedCityWeatherQuery.data.humidity}%
                </p>
                <p>
                  <span className="text-muted-foreground">Wind: </span>
                  {selectedCityWeatherQuery.data.windSpeed} m/s
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
