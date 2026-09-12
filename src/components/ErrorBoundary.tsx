import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Flame, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 bg-white text-black">
          <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-gray-200 shadow-xl">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                <Flame className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-black tracking-tight">
                Something went wrong
              </h2>
              <p className="text-xs text-gray-600 font-medium">
                The page encountered an unexpected issue while loading. Don't worry, your cart and preferences are saved!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-10 shadow-sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Reload Page
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-gray-300 text-black hover:border-red-600 font-bold text-xs h-10"
                onClick={this.handleReset}
              >
                <Home className="h-3.5 w-3.5 mr-1.5" /> Return Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
