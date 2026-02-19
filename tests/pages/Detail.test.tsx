import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Detail from "@/pages/Detail";
import { useDetailLogic } from "@/pages/detail/useDetailLogic";

vi.mock("@/pages/detail/useDetailLogic", () => ({
  useDetailLogic: vi.fn(),
}));

const mockedUseDetailLogic = vi.mocked(useDetailLogic);
type DetailLogic = ReturnType<typeof useDetailLogic>;

describe("Detail page", () => {
  it("renders invalid route state when url params are invalid", () => {
    const mockedLogic = {
      hasValidRoute: false,
      cityName: "",
      country: "",
      momentLabel: "",
      forecastQuery: {
        isLoading: false,
        isError: false,
        error: null,
      },
      hourlySlots: [],
    } as unknown as DetailLogic;

    mockedUseDetailLogic.mockReturnValue(mockedLogic);

    render(
      <MemoryRouter>
        <Detail />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Invalid detail URL" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to dashboard/i })).toBeInTheDocument();
  });
});
