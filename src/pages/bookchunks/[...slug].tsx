import "intersection-observer";

import * as React from "react";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC } from "react";
import { dehydrate, QueryClient } from "react-query";
import produce from "immer";
import _ from "lodash";
import { getCookie, getCookies, setCookies } from "cookies-next";
import { InView, useInView } from "react-intersection-observer";
import { VariantType, useSnackbar } from "notistack";

import {
  Container,
  styled,
  Radio,
  FormControlLabel,
  Grid,
  Button,
  Box,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  useFormControl,
  Breakpoint,
  CircularProgress,
  Skeleton,
  Stack,
  useTheme,
} from "@mui/material";

import Accordion, { AccordionProps } from "@mui/material/Accordion";
import AccordionSummary, {
  AccordionSummaryProps,
} from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";

import {
  useBook,
  useBookChunk,
  useInfiniteBookChunks,
} from "src/client/queries/book";
import { BOOK_QKEYS, getBook, getBookChunk } from "src/client/services/book";
import { Book } from "src/shared/types/models";
import { useChangeLayout } from "src/client/layouts/DefaultLayout";
import * as pageHrefs from "src/client/pageHrefs";
import { deleteScrollPos } from "src/client/hooks/useScrollRestoration";

function slugParser(slug?: Array<string> | string) {
  if (_.isArray(slug)) {
    const [bookIndex, bookId, _idxByCreatedAt] = slug || [];
    const idxByCreatedAt = parseInt(_idxByCreatedAt, 10);
    return { bookIndex, bookId, idxByCreatedAt };
  } else {
    return {};
  }
}

interface BookChunkPageProps {
  textSize?: string;
}

const COOKIE_NAMES: { TEXT_SIZE: string } = {
  TEXT_SIZE: "bookchunk-text-size",
};

const BookChunkPage: FC<BookChunkPageProps> = (props: BookChunkPageProps) => {
  const theme = useTheme();
  const router = useRouter();
  const { slug } = router.query;
  const { bookIndex, bookId, idxByCreatedAt } = slugParser(slug);
  if (!bookIndex || !bookId || typeof idxByCreatedAt !== "number") {
    router.push("/");
    return <div>incorrect slug redirect to home</div>;
  } else {
    const { book } = useBook(bookIndex, bookId);
    const { bookChunks, infiniteBookChunksQueryOthers } = useInfiniteBookChunks(
      bookId,
      idxByCreatedAt,
      book
    );

    const changeLayout = useChangeLayout();
    React.useEffect(() => {
      changeLayout({ autoHideHeader: true });
      return () => {
        changeLayout({ autoHideHeader: false });
      };
    }, [changeLayout]);

    const [textSize, setTextSize] = React.useState<string>(
      () => props.textSize || "text-md"
    );
    const handleChangeTextSize = (
      event: React.ChangeEvent<HTMLInputElement>,
      value: string
    ) => {
      setTextSize(value);
      setCookies(COOKIE_NAMES.TEXT_SIZE, value, {
        path: "/",
        maxAge: 60 * 24 * 7,
      });
    };

    React.useEffect(() => {
      const v = getCookie(COOKIE_NAMES.TEXT_SIZE) as string;
      if (v) {
        setTextSize(v);
      }
    }, [setTextSize, getCookie]);

    const textSizeRemMap: Record<string, number> = {
      "text-md": 1,
      "text-lg": 2,
    };
    const textRem = textSizeRemMap[textSize] || 1;

    const maxWidthMap: Record<string, Breakpoint> = {
      "text-md": "md",
      "text-lg": "lg",
    };
    const maxWidth: Breakpoint = maxWidthMap[textSize] || "md";

    const { ref: loadMoreRef, inView: loadMoreInView } = useInView({
      fallbackInView: true,
      threshold: 0.4,
    });
    const { enqueueSnackbar } = useSnackbar();
    React.useEffect(() => {
      const fetchData = async () => {
        if (loadMoreInView) {
          if (
            !infiniteBookChunksQueryOthers.isFetchingNextPage &&
            infiniteBookChunksQueryOthers.hasNextPage
          ) {
            const fetchResult =
              await infiniteBookChunksQueryOthers.fetchNextPage();
            if (fetchResult.isError) {
              const idx = _.last(fetchResult.data?.pageParams) as number;
              const sectionName = book?.chunks?.[idx + 1]?.sectionName;
              enqueueSnackbar(`${sectionName} | 章節未匯入`, {
                variant: "info",
              });
            }
          } else if (!infiniteBookChunksQueryOthers.hasNextPage) {
              enqueueSnackbar(`無最新章節(TODO-增加更新 button 在 skelton)`, {
                variant: "info",
              });
          }
        }
      };
      fetchData();
    }, [loadMoreInView, infiniteBookChunksQueryOthers, book]);

    const [cursor, setCursor] = React.useState(idxByCreatedAt);
    React.useEffect(() => {
      const onBeforeUnload = (event: BeforeUnloadEvent) => {
        if (cursor !== idxByCreatedAt) {
          const asPath = pageHrefs.bookChunk({
            book,
            simpleBookChunk: book?.chunks?.[cursor],
          });
          deleteScrollPos(asPath);
        }
        delete event["returnValue"];
      };
      window.addEventListener("beforeunload", onBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", onBeforeUnload);
      };
    }, [cursor]);

    return (
      <Container maxWidth={maxWidth} disableGutters>
        <FormControl>
          <FormLabel id="text-size-label">文字大小</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            onChange={handleChangeTextSize}
            value={textSize}
          >
            <FormControlLabel value="text-lg" control={<Radio />} label="大" />
            <FormControlLabel value="text-md" control={<Radio />} label="中" />
          </RadioGroup>
        </FormControl>
        <Stack spacing={2}>
          {bookChunks?.map((bookChunk, i) => {
            return (
              <Paper
                key={`bookchunk-${i}`}
                variant="outlined"
                elevation={0}
                sx={{
                  padding: "3rem",
                  [theme.breakpoints.down("md")]: {
                    padding: "1rem",
                  },
                }}
              >
                <InView
                  as="div"
                  onChange={(titleInView, entry) => {
                    if (
                      titleInView &&
                      typeof bookChunk.idxByCreatedAtAsc === "number" &&
                      idxByCreatedAt !== bookChunk.idxByCreatedAtAsc
                    ) {
                      setCursor(bookChunk.idxByCreatedAtAsc);
                      const asPath = pageHrefs.bookChunk({
                        book,
                        simpleBookChunk: bookChunk,
                      });
                      router.replace(asPath, asPath, {
                        shallow: true,
                        scroll: false,
                      });
                      deleteScrollPos(asPath);
                    }
                  }}
                >
                  <Typography variant="h5" sx={{ marginBottom: "2rem" }}>
                    {bookChunk?.sectionName}
                  </Typography>
                </InView>
                {bookChunk?.contentLines?.map((x, i) => {
                  return (
                    <Typography
                      key={`contentLines-${i}`}
                      variant="body1"
                      sx={{ marginBottom: "2rem", fontSize: `${textRem}rem` }}
                    >
                      {x}
                    </Typography>
                  );
                })}
              </Paper>
            );
          })}
        </Stack>

        <Paper
          ref={
            !infiniteBookChunksQueryOthers.isFetchingNextPage
              ? loadMoreRef
              : undefined
          }
          variant="outlined"
          sx={{ padding: "3rem" }}
        >
          <Typography variant="h1" sx={{ marginBottom: "2rem", width: "50%" }}>
            <Skeleton />
          </Typography>
          {Array.from(Array(5).keys()).map((x, i) => {
            return (
              <Typography
                key={`contentLines-skeleton-${i}`}
                variant="body1"
                sx={{
                  marginBottom: "2rem",
                  fontSize: `${textRem}rem`,
                  marginLeft: i % 2 === 0 ? 3 : 0,
                }}
              >
                <Skeleton />
              </Typography>
            );
          })}
        </Paper>
      </Container>
    );
  }
};

export const getServerSideProps = async (
  ctx: GetServerSidePropsContext<any>
): Promise<GetServerSidePropsResult<any>> => {
  const queryClient = new QueryClient();
  queryClient.setDefaultOptions({
    queries: {
      staleTime: 1000 * 60,
    },
  });

  const { bookIndex, bookId, idxByCreatedAt } = slugParser(ctx.query.slug);
  if (!bookIndex || !bookId || typeof idxByCreatedAt !== "number") {
    return {
      notFound: true,
    };
  } else {
    const qkey = BOOK_QKEYS.getBook(bookIndex, bookId);
    await queryClient.prefetchQuery(qkey, () => getBook(bookIndex, bookId));
    const book = queryClient.getQueryData(qkey);

    const chunkQKey = BOOK_QKEYS.getInfiniteBookChunks();
    await queryClient.prefetchInfiniteQuery(
      chunkQKey,
      ({ pageParam = idxByCreatedAt }) => getBookChunk(bookId, pageParam),
      {
        getNextPageParam: (lastPage, pages) => {
          if (typeof lastPage.idxByCreatedAtAsc !== "number") {
            return undefined;
          } else {
            return lastPage.idxByCreatedAtAsc;
          }
        },
      }
    );
    // fix pageParams: [undefined]
    // @see https://github.com/tannerlinsley/react-query/issues/1458
    queryClient.setQueryData(chunkQKey, (data: any) => ({
      ...data,
      pageParams: [idxByCreatedAt],
    }));
    const bookChunks = queryClient.getQueryData(chunkQKey);

    if (!bookChunks || !book) {
      return {
        notFound: true,
      };
    } else {
      const textSize = ctx.req.cookies[COOKIE_NAMES.TEXT_SIZE] || null;
      const dehydratedState = dehydrate(queryClient);
      return {
        props: {
          textSize,
          dehydratedState,
        },
      };
    }
  }
};

export default BookChunkPage;
