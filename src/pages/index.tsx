import * as React from "react";
// import errToJSON from "@stdlib/error-to-json";
import { dehydrate, QueryClient } from "react-query";
import moment from "moment";
import { css } from "@emotion/react";
import Scroll from "react-scroll";

import type { GetStaticProps, NextPage } from "next";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "../client/components/Link";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";

import { useLatestBooks } from "../client/queries/book";
import DefaultLayout from "../client/layouts/DefaultLayout";
import { BOOK_QKEYS, getLatestBooks } from "src/client/services/book";
import * as pageHrefs from "src/client/pageHrefs";

function TitlebarBelowImageList() {
  return (
    <ImageList sx={{ width: 500, height: 450 }}>
      {itemData.map((item) => (
        <ImageListItem key={item.img}>
          <img
            src={`${item.img}?w=248&fit=crop&auto=format`}
            srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
            alt={item.title}
            loading="lazy"
          />
          <ImageListItemBar
            title={item.title}
            subtitle={<span>by: {item.author}</span>}
            position="below"
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
}

const itemData = [
  {
    img: "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e",
    title: "Breakfast",
    author: "@bkristastucchio",
  },
  {
    img: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d",
    title: "Burger",
    author: "@rollelflex_graphy726",
  },
  {
    img: "https://images.unsplash.com/photo-1522770179533-24471fcdba45",
    title: "Camera",
    author: "@helloimnik",
  },
  {
    img: "https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c",
    title: "Coffee",
    author: "@nolanissac",
  },
  {
    img: "https://images.unsplash.com/photo-1533827432537-70133748f5c8",
    title: "Hats",
    author: "@hjrc33",
  },
  {
    img: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62",
    title: "Honey",
    author: "@arwinneil",
  },
  {
    img: "https://images.unsplash.com/photo-1516802273409-68526ee1bdd6",
    title: "Basketball",
    author: "@tjdragotta",
  },
  {
    img: "https://images.unsplash.com/photo-1518756131217-31eb79b20e8f",
    title: "Fern",
    author: "@katie_wasserman",
  },
  {
    img: "https://images.unsplash.com/photo-1597645587822-e99fa5d45d25",
    title: "Mushrooms",
    author: "@silverdalex",
  },
  {
    img: "https://images.unsplash.com/photo-1567306301408-9b74779a11af",
    title: "Tomato basil",
    author: "@shelleypauls",
  },
  {
    img: "https://images.unsplash.com/photo-1471357674240-e1a485acb3e1",
    title: "Sea star",
    author: "@peterlaster",
  },
  {
    img: "https://images.unsplash.com/photo-1589118949245-7d38baf380d6",
    title: "Bike",
    author: "@southside_customs",
  },
];

const Home2: NextPage = (props: any) => {
  const { latestBooks } = useLatestBooks();
  return (
    <DefaultLayout>
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
          <TitlebarBelowImageList />
          <TitlebarBelowImageList />
          <TitlebarBelowImageList />
          <TitlebarBelowImageList />
          <TitlebarBelowImageList />
          <TitlebarBelowImageList />
          <TitlebarBelowImageList />
          <TitlebarBelowImageList />
          <TitlebarBelowImageList />
          <TitlebarBelowImageList />
          <TitlebarBelowImageList />
          <TitlebarBelowImageList />
        </Box>
      </Container>
    </DefaultLayout>
  );
};

import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import { Book } from "src/shared/types/models";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Button } from "@mui/material";

const TimeRowPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const BookItem = (props: { book: Book }) => {
  const { book } = props;
  const thumbHeight = 162;
  const thumbWidth = 122;
  const thumbSrc = `/api/books/indices/${book._index}/${book.id}/thumb`;
  const BookThumb = (props: any) => {
    return (
      <LazyLoadImage
        {...props}
        width={thumbWidth}
        height={thumbHeight}
        placeholderSrc={thumbSrc}
        loading="lazy"
        src={thumbSrc}
      />
    );
  };
  return (
    <Link href={pageHrefs.book(book)}>
      <Card
        sx={{ display: "flex", "&:hover": { boxShadow: 10 } }}
        elevation={0}
        square
      >
        <CardMedia component={BookThumb} />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardContent sx={{ flex: "1 0 auto", maxHeight: thumbHeight }}>
            <Typography variant="subtitle1" color="primary">
              {book.title}
            </Typography>
            <Typography variant="caption" gutterBottom>
              {book.category}
              <span
                css={css`
                  user-select: none;
                  margin: 0 4px;
                `}
              >
                •
              </span>
              {book.authorName}
            </Typography>
            <Typography variant="subtitle1">
              {book.latestChunk?.sectionName}
            </Typography>
          </CardContent>
        </Box>
      </Card>
    </Link>
  );
};

const Home: NextPage = (props: any) => {
  const { latestBooks } = useLatestBooks();
  return (
    <Container maxWidth="lg">
      <Grid container spacing={2}>
        {latestBooks?.items.map((book: Book, i: number, ary: Array<Book>) => {
          const prevBook = ary[i - 1];
          let timeRow: React.ReactElement<any> | null;
          if (
            !prevBook ||
            (prevBook &&
              book &&
              moment(prevBook.updatedAt).diff(moment(book.updatedAt), "days") >
                1)
          ) {
            timeRow = (
              <Grid item xs={12} key={moment(book.updatedAt)?.toISOString()}>
                <TimeRowPaper square elevation={1}>
                  <Grid container spacing={0} alignItems="center">
                    <Grid item xs={6} md={10}>
                      <Typography>
                        {moment(book.updatedAt).format("yyyy-MM-DD dddd")}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={6}
                      md={2}
                      sx={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      <Button
                        onClick={() =>
                          Scroll.animateScroll.scrollToTop({ duration: 350 })
                        }
                      >
                        to top
                      </Button>
                    </Grid>
                  </Grid>
                </TimeRowPaper>
              </Grid>
            );
          } else {
            timeRow = null;
          }
          return [
            timeRow,
            <Grid item xs={12} md={6} lg={4} key={book.id}>
              <BookItem book={book} />
            </Grid>,
          ];
        })}
      </Grid>
    </Container>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const queryClient = new QueryClient();
  queryClient.setDefaultOptions({
    queries: {
      staleTime: 1000 * 60,
    },
  });

  const pageParams = { offset: 0, limit: 50 };
  await queryClient.prefetchQuery(BOOK_QKEYS.getLatestBooks(pageParams), () =>
    getLatestBooks(pageParams)
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 60,
  };
};

export default Home;
