import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApiStatusMessage } from "@/api/errorMessages";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardLogic } from "@/pages/dashboard/useDashboardLogic";

function Dashboard() {
  const {
    cityInput,
    selectedCity,
    citySuggestionsQuery,
    selectedCityWeatherQuery,
    dayMomentsQuery,
    showSuggestions,
    getCityLabel,
    handleInputFocus,
    handleInputChange,
    handleCitySelect,
    getDetailLink,
  } = useDashboardLogic();

  return (
    <section className="container py-8">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold">Search City Weather</h1>

        <Label htmlFor="city-search" className="mb-2">
          Search city
        </Label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-3 left-3 h-5 w-5 text-muted-foreground" />
          <Input
            id="city-search"
            type="text"
            value={cityInput}
            placeholder="Search city (e.g. Milan, Rome, London)"
            className="h-11 pl-10"
            onFocus={handleInputFocus}
            onChange={(event) => handleInputChange(event.target.value)}
          />

          {showSuggestions && (
            <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-md border border-input bg-background shadow-sm">
              {citySuggestionsQuery.isLoading && (
                <p className="p-3 text-sm text-muted-foreground">
                  Loading suggestions...
                </p>
              )}

              {citySuggestionsQuery.isError && (
                <p className="p-3 text-sm text-destructive">
                  {getApiStatusMessage(
                    citySuggestionsQuery.error,
                    "Could not load cities",
                  )}
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
                  onClick={() => handleCitySelect(city)}
                >
                  {getCityLabel(city)}
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
              {getApiStatusMessage(
                selectedCityWeatherQuery.error,
                "Failed to fetch weather for selected city",
              )}
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

        {dayMomentsQuery.isLoading && (
          <p className="text-sm text-muted-foreground">
            Loading day moments forecast...
          </p>
        )}

        {dayMomentsQuery.data && selectedCity && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {dayMomentsQuery.data.map((moment) => {
              const detailLink = getDetailLink(moment.moment, moment.label);
              if (!detailLink) return null;

              return (
                <Link key={moment.moment} to={detailLink.to} state={detailLink.state}>
                  <Card className="bg-background shadow-none transition-colors hover:bg-accent/40">
                    <CardHeader className="items-center p-4 pb-2 text-center">
                      <CardDescription>{moment.label}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-2 p-4 pt-0">
                      <img
                        src={`https://openweathermap.org/img/wn/${moment.icon}@2x.png`}
                        alt={moment.label}
                        className="h-12 w-12"
                      />
                      <p className="text-sm text-muted-foreground capitalize">
                        {moment.iconLabel}
                      </p>

                      <p className="text-sm font-semibold">
                        {Math.round(moment.temperature)}°C
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default Dashboard;
