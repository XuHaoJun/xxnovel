import "../client/styles/global/reactGridLayout.css";
import "../client/styles/global/reactResizable.css";

import { enableMapSet } from "immer";

enableMapSet();

import { SnackbarProvider } from "notistack";
import { Provider as RxDbProvider } from "rxdb-hooks";

import * as React from "react";
import Head from "next/head";
import type { AppProps } from "next/app";
import type { NextPage } from "next";
import { CacheProvider, EmotionCache } from "@emotion/react";

import { Hydrate, QueryClient, QueryClientProvider } from "react-query";

import BrandingProvider from "../client/themes/BrandingProvider";
import createEmotionCache from "../client/utils/mui/createEmotionCache";
import { DefaultThemeProvider } from "src/client/themes/DefaultThemeProvider";
import NextNProgress from "nextjs-progressbar";

import moment from "moment";
import "moment/locale/zh-tw"; // without this line it didn't work
import DefaultLayout from "src/client/layouts/DefaultLayout";
import { useScrollRestoration } from "src/client/hooks/useScrollRestoration";
import { createDb } from "src/client/db/createDb";
import { PromiseType } from "utility-types";
import { PageNames } from "src/client/pageNames";
import { PageNameContext } from "src/client/hooks/usePageName";
moment.locale("zh-tw");

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

type MyNextPage = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
  getPageName?: () => PageNames;
};

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
  Component: MyNextPage;
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

  const [mainDb, setMainDb] =
    React.useState<PromiseType<ReturnType<typeof createDb>>>(undefined);

  React.useEffect(() => {
    const initDB = async () => {
      const _db = await createDb();
      if (_db) {
        setMainDb(_db);
      }
    };
    initDB();
  }, []);

  useScrollRestoration(props.router);

  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  const getPageName = Component.getPageName ?? (() => PageNames.Unknown);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />
      </Head>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <DefaultThemeProvider>
            <BrandingProvider>
              <RxDbProvider db={mainDb}>
                <SnackbarProvider maxSnack={3}>
                  <PageNameContext.Provider value={getPageName()}>
                    <NextNProgress showOnShallow={false} />
                    {getLayout(<Component {...pageProps} />)}
                  </PageNameContext.Provider>
                </SnackbarProvider>
              </RxDbProvider>
            </BrandingProvider>
          </DefaultThemeProvider>
        </Hydrate>
      </QueryClientProvider>
    </CacheProvider>
  );
}
