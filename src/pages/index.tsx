import * as React from "react";
import errToJSON from "@stdlib/error-to-json";

import type {
  GetStaticPaths,
  GetStaticProps,
  GetStaticPropsResult,
  NextPage,
} from "next";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "../client/components/Link";

const Home: NextPage = (props: any) => {
  console.log("foo", props);
  return (
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
  );
};

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      now: new Date().toISOString(),
    },
    revalidate: 60,
  };
};

export default Home;
