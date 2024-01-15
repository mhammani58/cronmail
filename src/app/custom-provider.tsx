"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SessionProvider } from "next-auth/react"

interface CustomProviderProps {
  children: React.ReactNode;
}

export const CustomProvider: React.FC<CustomProviderProps> = ({ children }) => {
  const [client] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </SessionProvider>
  )
};
