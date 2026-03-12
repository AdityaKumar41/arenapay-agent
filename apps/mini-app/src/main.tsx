import React from "react";
import ReactDOM from "react-dom/client";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
    },
  },
});

const manifestUrl =
  import.meta.env.VITE_TON_CONNECT_MANIFEST ||
  "http://localhost:5173/tonconnect-manifest.json";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </TonConnectUIProvider>
  </React.StrictMode>,
);
