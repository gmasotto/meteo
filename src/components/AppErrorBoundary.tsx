import type { ReactNode } from "react";
import { Component } from "react";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Unhandled UI error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="container py-8">
          <div className="mx-auto w-full max-w-2xl rounded-md border border-destructive p-4">
            <h1 className="font-semibold text-destructive">
              Something went wrong
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Please refresh the page and try again.
            </p>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
