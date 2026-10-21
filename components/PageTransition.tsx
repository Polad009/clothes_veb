import React from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="flex-grow flex flex-col w-full">{children}</div>;
}
