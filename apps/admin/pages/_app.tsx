import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider, theme } from "@reusejs/react";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider value={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
