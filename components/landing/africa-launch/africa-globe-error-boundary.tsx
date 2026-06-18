"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { failed: boolean };

export class AfricaGlobeErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[AfricaGlobe]", error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="absolute inset-0 flex items-end justify-center pb-[8%]">
          <div className="h-[min(68vw,780px)] w-[min(68vw,780px)] rounded-full border border-[#FF7A1A]/30 bg-[radial-gradient(circle_at_30%_30%,#1a2840,#0a0e18)] shadow-[0_0_80px_rgba(255,122,26,0.15)]" />
        </div>
      );
    }
    return this.props.children;
  }
}
