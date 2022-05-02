import * as React from "react";
import { css } from "@emotion/react";
import type { ParsedUrlQuery } from "querystring";

import {
  Container,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  BoxProps,
  Stack,
  Divider,
} from "@mui/material";

import { useRouter } from "next/router";
import { useSearchBook } from "src/client/queries/book";
import { BOOK_ROUTE_PATHS, ISearchBookBody } from "src/client/services/book";
import {
  getBookThumbDefaultProps,
  BookThumb,
} from "src/client/components/book/BookThumb";
import * as pageHrefs from "src/client/pageHrefs";
import Link from "../client/components/Link";
import { Book } from "src/shared/types/models";
import { SpliterDot } from "src/client/components/text/SpliterDot";

const BookItem = (props: { book: Book }) => {
  const { book } = props;
  const thumbSrc = BOOK_ROUTE_PATHS.getFullBookThumbUrl(book._index, book.id);
  const bookHref = pageHrefs.book(book);
  const MyCardMedia = (props: any) => {
    return (
      <Link href={bookHref}>
        <BookThumb {...props} placeholderSrc={thumbSrc} src={thumbSrc} />
      </Link>
    );
  };
  return (
    <Card sx={{ display: "flex", alignItems: "center" }} elevation={0} square>
      <CardMedia component={MyCardMedia} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardContent sx={{ flex: "1 0 auto" }}>
          <Typography variant="subtitle1" color="primary">
            <Link href={bookHref}>{book.title}</Link>
          </Typography>
          <Typography variant="caption" gutterBottom>
            {book.category}
            <SpliterDot />
            {book.authorName}
            <SpliterDot />
            {book.status}
          </Typography>
          {book.descriptionLines?.slice(0, 4).map((x: string, i: number) => {
            return (
              <Typography variant="subtitle2" key={i}>
                {x}
              </Typography>
            );
          })}
          <Typography variant="subtitle2">
            <Link
              href={pageHrefs.bookChunk({
                book,
                simpleBookChunk: book.latestChunk,
              })}
            >
              {book.latestChunk?.sectionName}
            </Link>
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );
};

function routerQueryToSearchBody(query: ParsedUrlQuery): ISearchBookBody {
  const parseText = (fieldName: string = "q"): string => {
    const v = query[fieldName];
    if (Array.isArray(v)) {
      return v.join(" ");
    } else if (typeof v === "string") {
      return v;
    } else {
      return "";
    }
  };
  const parseCategories = (
    fieldName: string = "categories"
  ): Array<string> | undefined => {
    const v = query[fieldName];
    if (Array.isArray(v)) {
      return v;
    } else if (typeof v === "string") {
      return [v];
    } else {
      return undefined;
    }
  };

  const text = parseText();
  const categories = parseCategories();
  return {
    text,
    ...{ categories },
  };
}

const SearchPage = () => {
  const router = useRouter();
  const searchBody = routerQueryToSearchBody(router.query);
  const { bookSearchResult, queryOthers: bookSearchQueryOthers } =
    useSearchBook(searchBody);
  return (
    <Container maxWidth="lg">
      <Stack spacing={1} divider={<Divider />}>
        {bookSearchResult?.items.map((x) => {
          return <BookItem key={x.id} book={x} />;
        })}
      </Stack>
    </Container>
  );
};

export default SearchPage;
