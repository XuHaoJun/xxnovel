import * as React from "react";
import { GetServerSideProps } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { FC } from "react";
import { dehydrate, QueryClient } from "react-query";
import produce from "immer";

import {
  Container,
  styled,
  Radio,
  FormControlLabel,
  Grid,
  Button,
  Box,
} from "@mui/material";

import Accordion, { AccordionProps } from "@mui/material/Accordion";
import AccordionSummary, {
  AccordionSummaryProps,
} from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";

import Link from "src/client/components/Link";
import { useBook } from "src/client/queries/book";
import { BOOK_QKEYS, getBook } from "src/client/services/book";
import { Book } from "src/shared/types/models";
import * as pageHrefs from "src/client/pageHrefs";

const MyAccordion = styled((props: AccordionProps) => (
  <Accordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
}));

const MyAccordionSummary = styled((props: AccordionSummaryProps) => (
  <AccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, .05)"
      : "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
  },
}));

const MyAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

function BookAccordions({ book }: { book?: Book }) {
  const latestPanelName = "latestPanel";
  const tocPanelName = "tocPanel";
  const [expandeds, setExpanded] = React.useState<Set<string>>(
    () => new Set([latestPanelName, tocPanelName])
  );

  const [chunkExpandMores, setChunkExpandMores] = React.useState<Set<string>>(
    () => new Set([])
  );

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      if (newExpanded) {
        const nextExs = produce(expandeds, (draft: Set<string>) => {
          draft.add(panel);
        });
        setExpanded(nextExs);
      } else {
        const nextExs = produce(expandeds, (draft: Set<string>) => {
          draft.delete(panel);
        });
        setExpanded(nextExs);
      }
    };

  const numLimitChunks = 6;
  const showMore = (book?.chunks?.length || 0) > numLimitChunks;
  const numMores = showMore ? (book?.chunks?.length || 0) - numLimitChunks : 0;

  const chunksSortByLatest = React.useMemo(() => {
    return produce(book?.chunks || [], (draft) => {
      draft.reverse();
      if (!chunkExpandMores.has(latestPanelName)) {
        draft.splice(numLimitChunks);
      }
    });
  }, [book?.chunks, chunkExpandMores, numLimitChunks]);

  const chunks = React.useMemo(() => {
    return produce(book?.chunks || [], (draft) => {
      if (!chunkExpandMores.has(tocPanelName)) {
        draft.splice(numLimitChunks);
      }
    });
  }, [book?.chunks, chunkExpandMores, numLimitChunks]);

  const handleMoreChange =
    (panelName: string) => (event: React.SyntheticEvent) => {
      const next = produce(chunkExpandMores, (draft: Set<string>) => {
        if (draft.has(panelName)) {
          draft.delete(panelName);
        } else {
          draft.add(panelName);
        }
      });
      setChunkExpandMores(next);
    };

  return (
    <>
      <MyAccordion
        expanded={expandeds.has(latestPanelName)}
        onChange={handleChange(latestPanelName)}
      >
        <MyAccordionSummary aria-controls="panel1a-content" id="panel1a-header">
          <Typography>最新章節</Typography>
        </MyAccordionSummary>
        <MyAccordionDetails>
          <FormControlLabel value="top" control={<Radio />} label="自動更新" />
          <Grid container spacing={3}>
            {chunksSortByLatest.map((c) => {
              return (
                <Grid key={c.id} item xs={12} md={4}>
                  {c.sectionName}
                </Grid>
              );
            })}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                {showMore && (
                  <Button onClick={handleMoreChange(latestPanelName)}>
                    展開 {numMores} 筆章節
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </MyAccordionDetails>
      </MyAccordion>
      <MyAccordion
        expanded={expandeds.has(tocPanelName)}
        onChange={handleChange(tocPanelName)}
      >
        <MyAccordionSummary aria-controls="panel2a-content" id="panel2a-header">
          <Typography>目錄</Typography>
        </MyAccordionSummary>
        <MyAccordionDetails>
          <FormControlLabel
            value="top"
            control={<Radio />}
            label="預設隱藏目錄"
          />
          <Grid container spacing={3}>
            {chunks.map((c) => {
              return (
                <Grid key={c.id} item xs={12} md={4}>
                  <Link
                    href={pageHrefs.bookChunk({ book, simpleBookChunk: c })}
                  >
                    {c.sectionName}
                  </Link>
                </Grid>
              );
            })}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                {showMore && (
                  <Button onClick={handleMoreChange(tocPanelName)}>
                    展開 {numMores} 筆章節
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </MyAccordionDetails>
      </MyAccordion>
    </>
  );
}

const BookPage: FC<any> = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [bookIndex, bookId] = (slug as string[]) || [];
  const { book } = useBook(bookIndex, bookId);
  return (
    <Container maxWidth="lg">
      <BookAccordions book={book} />
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx: any) => {
  const queryClient = new QueryClient();
  queryClient.setDefaultOptions({
    queries: {
      staleTime: 1000 * 60,
    },
  });

  const [bookIndex, bookId] = ctx.query.slug || [];
  const qkey = BOOK_QKEYS.getBook(bookIndex, bookId);
  await queryClient.prefetchQuery(qkey, () => getBook(bookIndex, bookId));
  const book = queryClient.getQueryData(qkey);

  if (!book) {
    return {
      notFound: true,
    };
  } else {
    return {
      props: {
        dehydratedState: dehydrate(queryClient),
      },
    };
  }
};

export default BookPage;
