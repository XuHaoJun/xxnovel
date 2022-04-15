import * as React from "react";
import Head from "next/head";
import { AppProps } from "next/app";
import { CacheProvider, EmotionCache } from "@emotion/react";

import { Hydrate, QueryClient, QueryClientProvider } from "react-query";

import BrandingProvider from "../client/themes/BrandingProvider";
import createEmotionCache from "../client/utils/mui/createEmotionCache";
import { DefaultThemeProvider } from "src/client/themes/DefaultThemeProvider";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  let queryClient: QueryClient;
  if (typeof window !== "undefined") {
    const [qc] = React.useState(() => new QueryClient());
    queryClient = qc;
  } else {
    queryClient = new QueryClient();
    queryClient.setDefaultOptions({
      queries: {
        staleTime: 1000 * 10,
      },
    });
  }

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <DefaultThemeProvider>
            <BrandingProvider>
              <Component {...pageProps} />
            </BrandingProvider>
          </DefaultThemeProvider>
        </Hydrate>
      </QueryClientProvider>
    </CacheProvider>
  );
}
