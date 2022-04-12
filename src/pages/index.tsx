import * as React from "react";
import errToJSON from "@stdlib/error-to-json";

import type { NextPage } from "next";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "../components/Link";

import {
  fetchBookContent,
  BookContent,
  fetchBookChunks,
} from "../utils/fetchBookHelper";

const Home: NextPage = () => {
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
        </Typography>
        <Link href="/about" color="secondary">
          Go to the about page
        </Link>
      </Box>
    </Container>
  );
};

export async function getServerSideProps(...args: any) {
  try {
    const list = await fetchBookChunks(`https://www.ptwxz.com/html/0/48`);
    const fetchNovelResult = await fetchBookContent(
      `https://www.ptwxz.com/html/0/48/192727.html`
    );
    return {
      props: { fetchNovelResult },
    };
  } catch (err: any) {
    return { props: { err: { message: errToJSON(err)?.message } } };
  }
}

export default Home;
