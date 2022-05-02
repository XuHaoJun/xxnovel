import * as React from "react";
import _ from "lodash";
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
  Dialog,
  Button,
  DialogContent,
} from "@mui/material";
import type { JSONSchema7 } from "json-schema";

/**
 * Module not found: Can't resolve '@material-ui/???
 * @see https://github.com/rjsf-team/react-jsonschema-form/commit/b25cb60efdc3818bc5bf4a3789829fefc0083f60
 */
import { MuiForm5 as Form } from "@rjsf/material-ui";

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
import { IChangeEvent } from "@rjsf/core";
import produce from "immer";
import { PageNames } from "src/client/pageNames";
import { routerQueryToSearchBody } from "src/client/utils/search/routerQueryToSearchBody";

const BookItem = (props: { book: Book }) => {
  const { book } = props;
  const thumbSrc = BOOK_ROUTE_PATHS.getFullBookThumbUrl(book.esIndex, book.id);
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

interface IFormData {
  status: string;
  categories: Array<string>;
}

function getDefaultInitFormData(): IFormData {
  return {
    status: "不限",
    categories: ["any"],
  };
}

interface SearchFilterProps {
  onSubmit: (v: IFormData) => void;
  formData?: IFormData;
}

const SearchFilter = (props: SearchFilterProps) => {
  const { onSubmit } = props;
  const defaultInitFormData: IFormData = getDefaultInitFormData();
  const [formData, setFormData] = React.useState(
    props.formData || defaultInitFormData
  );

  React.useEffect(() => {
    if (props.formData) {
      setFormData(props.formData);
    }
  }, [props.formData]);

  const schema: JSONSchema7 = {
    title: "",
    description: "",
    type: "object",
    properties: {
      status: {
        type: "string",
        title: "狀態",
        enum: ["不限", "連載中", "已完結"],
      },

      categories: {
        type: "array",
        title: "類別",
        uniqueItems: true,
        items: {
          type: "string",
          anyOf: [
            {
              type: "string",
              const: "any",
              title: "所有",
            },
            {
              type: "string",
              const: "玄幻魔法",
              title: "玄幻魔法",
            },
            {
              type: "string",
              const: "武俠修真",
              title: "武俠修真",
            },
            {
              type: "string",
              const: "都市言情",
              title: "都市言情",
            },
            {
              type: "string",
              const: "曆史軍事",
              title: "曆史軍事",
            },
            {
              type: "string",
              const: "網遊競技",
              title: "網遊競技",
            },
            {
              type: "string",
              const: "科幻小說",
              title: "科幻小說",
            },
            {
              type: "string",
              const: "恐怖靈異",
              title: "恐怖靈異",
            },
            {
              type: "string",
              const: "同人漫畫",
              title: "同人漫畫",
            },
            {
              type: "string",
              const: "其他類型",
              title: "其他類型",
            },
          ],
        },
      },
    },
  };

  const log = (type: string) => console.log.bind(console, type);

  return (
    <Form
      schema={schema}
      uiSchema={{
        "ui:submitButtonOptions": {
          submitText: "搜尋",
        },
      }}
      formData={formData}
      onChange={({ formData: nextFormData }: IChangeEvent<IFormData>) => {
        const categoryAny = "any";
        const finalFormData = produce(nextFormData, (draft: IFormData) => {
          if (nextFormData.categories.length === 0) {
            draft.categories.push(categoryAny);
          } else if (_.nth(draft.categories, -1) === categoryAny) {
            draft.categories = [categoryAny];
          } else if (
            draft.categories.includes(categoryAny) &&
            draft.categories.length > 1
          ) {
            draft.categories = draft.categories.filter(
              (x) => x !== categoryAny
            );
          }
        });
        setFormData(finalFormData);
      }}
      onSubmit={() => {
        onSubmit(formData);
      }}
      onError={log("errors")}
    >
      <Box marginTop={1}>
        <Stack direction="row" spacing={2}>
          <Button
            onClick={() => {
              setFormData(defaultInitFormData);
            }}
          >
            重置
          </Button>
          <Button type="submit" variant="contained" color="primary">
            搜尋
          </Button>
        </Stack>
      </Box>
    </Form>
  );
};

const SearchFilterDialog = (props: { onClose: () => void; open: boolean }) => {
  const { onClose, open } = props;

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogContent></DialogContent>
    </Dialog>
  );
};

const filterFormDataToSearchBody = (
  formData: IFormData
): Pick<ISearchBookBody, "categories" | "status"> => {
  const categories = formData.categories.filter((x) => x !== "any") || [];
  const status = formData.status !== "不限" ? formData.status : undefined;
  return _.omitBy(
    {
      status,
      categories: categories.length > 0 ? categories : undefined,
    },
    _.isUndefined
  );
};

const SearchPage = () => {
  const router = useRouter();
  const searchBody = routerQueryToSearchBody(router.query);
  const { bookSearchResult, queryOthers: bookSearchQueryOthers } =
    useSearchBook(searchBody);

  return (
    <Container maxWidth="lg">
      <Stack spacing={2} divider={<Divider />}>
        <SearchFilter
          formData={_.defaults(
            _.cloneDeep(searchBody),
            getDefaultInitFormData()
          )}
          onSubmit={(v: IFormData) => {
            const searchBody0 = filterFormDataToSearchBody(v);
            router.replace(
              pageHrefs.search({ text: searchBody.text, ...searchBody0 }),
              undefined,
              { shallow: true }
            );
          }}
        />
        <Box>
          搜尋 "<Typography component="span">{searchBody.text}</Typography>"
          共查找到{" "}
          <Typography component="span" sx={{ fontWidth: "bold" }}>
            {bookSearchResult?.total}
          </Typography>{" "}
          項結果
        </Box>
        {bookSearchResult?.items.map((x) => {
          return <BookItem key={x.id} book={x} />;
        })}
      </Stack>
    </Container>
  );
};

SearchPage.getPageName = (): PageNames => {
  return PageNames.Search;
};

export default SearchPage;
