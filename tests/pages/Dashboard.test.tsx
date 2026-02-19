import type { CitySuggestion } from "@/api/openWeather";
import Dashboard from "@/pages/Dashboard";
import { useDashboardLogic } from "@/pages/dashboard/useDashboardLogic";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/pages/dashboard/useDashboardLogic", () => ({
  useDashboardLogic: vi.fn(),
}));

const mockedUseDashboardLogic = vi.mocked(useDashboardLogic);
type DashboardLogic = ReturnType<typeof useDashboardLogic>;

describe("Dashboard page", () => {
  it("renders empty state for city suggestions", () => {
    const mockedLogic = {
      cityInput: "Mi",
      selectedCity: null,
      showSuggestions: true,
      citySuggestionsQuery: {
        isLoading: false,
        isError: false,
        data: [],
        error: null,
      },
      selectedCityWeatherQuery: {
        isLoading: false,
        isError: false,
        data: undefined,
        error: null,
      },
      dayMomentsQuery: {
        isLoading: false,
        data: undefined,
      },
      getCityLabel: (city: CitySuggestion) => city.name,
      handleInputFocus: vi.fn(),
      handleInputChange: vi.fn(),
      handleCitySelect: vi.fn(),
      getDetailLink: vi.fn(),
    } as unknown as DashboardLogic;

    mockedUseDashboardLogic.mockReturnValue(mockedLogic);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Search City Weather" }),
    ).toBeInTheDocument();
    expect(screen.getByText("City not found.")).toBeInTheDocument();
  });
});
