import * as React from "react";
import errToJSON from "@stdlib/error-to-json";
import { dehydrate, QueryClient } from "react-query";

import type { GetStaticProps, NextPage } from "next";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "../client/components/Link";

import { getGoodBookInfos } from "../client/services/book";
import {
  getGoodBookInfosQueryKey,
  useBookChunk,
  useGoodBookInfos,
} from "../client/queries/book";
import AppHeader from "../client/layouts/AppHeader";

const Home: NextPage = (props: any) => {
  const { goodBookInfos } = useGoodBookInfos();
  console.log(goodBookInfos);
  return (
    <>
      <AppHeader />
      <Container maxWidth="lg">
        <Box
          sx={{
            my: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            MUI v5 + Next.js with TypeScript example
            {props["now"]}
          </Typography>
          <Link href="/about" color="secondary">
            Go to the about page
          </Link>
        </Box>
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(getGoodBookInfosQueryKey(), getGoodBookInfos);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 60,
  };
};

export default Home;
