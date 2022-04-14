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
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <DefaultThemeProvider>
        <BrandingProvider>
          <QueryClientProvider client={queryClient}>
            <Hydrate state={pageProps.dehydratedState}>
              <Component {...pageProps} />
            </Hydrate>
          </QueryClientProvider>
        </BrandingProvider>
      </DefaultThemeProvider>
    </CacheProvider>
  );
}
