import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApiStatusMessage } from "@/api/errorMessages";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useDetailLogic } from "@/pages/detail/useDetailLogic";

function Detail() {
  const { hasValidRoute, cityName, country, momentLabel, forecastQuery, hourlySlots } =
    useDetailLogic();

  if (!hasValidRoute) {
    return (
      <section className="container py-8">
        <div className="mx-auto w-full max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Invalid detail URL</CardTitle>
              <CardDescription>
                Select a city and click one day moment from dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary">
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-8">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div>
          <h1 className="text-2xl font-semibold">
            {cityName}
            {country ? `, ${country}` : ""}
          </h1>
          <p className="text-muted-foreground text-sm">
            Hourly forecast for {momentLabel}
          </p>
        </div>

        {forecastQuery.isLoading && (
          <Card>
            <CardContent className="p-4">
              <p className="text-muted-foreground text-sm">Loading hourly forecast...</p>
            </CardContent>
          </Card>
        )}

        {forecastQuery.isError && (
          <Card className="border-destructive">
            <CardContent className="p-4">
              <p className="text-destructive text-sm">
                {getApiStatusMessage(
                  forecastQuery.error,
                  "Failed to load hourly forecast for this city",
                )}
              </p>
            </CardContent>
          </Card>
        )}

        {!forecastQuery.isLoading && !forecastQuery.isError && hourlySlots.length === 0 && (
          <Card>
            <CardContent className="p-4">
              <p className="text-muted-foreground text-sm">
                No hourly data available for this day moment.
              </p>
            </CardContent>
          </Card>
        )}

        {hourlySlots.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {hourlySlots.map((slot) => {
              const date = new Date(slot.timestamp * 1000);
              const timeLabel = date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              const dayLabel = date.toLocaleDateString([], {
                weekday: "short",
                day: "2-digit",
                month: "short",
              });

              return (
                <Card key={slot.timestamp}>
                  <CardHeader className="items-center p-4 pb-2">
                    <CardTitle className="text-base">{timeLabel}</CardTitle>
                    <CardDescription className="text-xs">{dayLabel}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-2 p-4 pt-0">
                    <img
                      src={`https://openweathermap.org/img/wn/${slot.icon}@2x.png`}
                      alt={slot.iconLabel}
                      className="h-12 w-12"
                    />
                    <p className="text-center text-sm text-muted-foreground capitalize">
                      {slot.iconLabel}
                    </p>
                    <p className="text-sm font-semibold">{Math.round(slot.temperature)}°C</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default Detail;
