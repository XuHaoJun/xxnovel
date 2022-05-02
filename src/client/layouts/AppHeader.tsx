import * as React from "react";
import { useTheme, styled, alpha } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import GitHubIcon from "@mui/icons-material/GitHub";
import MenuIcon from "@mui/icons-material/Menu";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";

import { useChangeTheme } from "../themes/DefaultThemeProvider";
import ThemeModeToggle from "../components/header/ThemeModeToggle";
import { setCookies } from "cookies-next";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import {
  useScrollTrigger,
  Slide,
  Button,
  InputBase,
  Paper,
  Autocomplete,
  TextField,
  createFilterOptions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Link from "../components/Link/Link";
import NextLink from "next/link";
import suggestParse from "autosuggest-highlight/parse";
import suggestMatch from "autosuggest-highlight/match";
import { useBookTitleSuggests } from "../queries/book";
import { useDebounce } from "ahooks";
import BookIcon from "@mui/icons-material/Book";
import HistoryIcon from "@mui/icons-material/History";
import * as pageHrefs from "src/client/pageHrefs";
import { useRouter } from "next/router";
import { Book } from "src/shared/types/models";
import { QueryConstructor, useRxCollection, useRxData } from "rxdb-hooks";
import { COLLECTION_NAMES } from "../db/collectionNames";
import {
  ISearchHistoryData,
  ISearchHistoryDocument,
} from "src/shared/schemas/SearchHistoryJSchema";
import { SearchHistoryModel } from "../db/models/SearchHistoryModel";
import ClearIcon from "@mui/icons-material/Clear";
import { usePageName } from "../hooks/usePageName";
import { PageNames } from "../pageNames";
import { routerQueryToSearchBody } from "src/client/utils/search/routerQueryToSearchBody";
import { ISearchBookBody } from "../services/book";

const Header = styled("header")(({ theme }) => ({
  position: "sticky",
  top: 0,
  transition: theme.transitions.create("top"),
  zIndex: theme.zIndex.appBar,
  backdropFilter: "blur(20px)",
  boxShadow: `inset 0px -1px 1px ${
    theme.palette.mode === "dark"
      ? theme.palette.primaryDark[700]
      : theme.palette.grey[100]
  }`,
  backgroundColor:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.primaryDark[900], 0.72)
      : "rgba(255,255,255,0.72)",
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backdropFilter: "blur(20px)",
  boxShadow: `inset 0px -1px 1px ${
    theme.palette.mode === "dark"
      ? theme.palette.primaryDark[700]
      : theme.palette.grey[100]
  }`,
  backgroundColor:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.primaryDark[900], 0.72)
      : "rgba(255,255,255,0.72)",
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const NOTHING = () => {};

type IAcOption = IAcTitleSuggestOption | IAcSearchHistoryOption;

interface IAcOptionBase {
  text: string;
}

enum AcType {
  titleSuggest = "titleSuggest",
  searchHistory = "searchHistory",
}

interface IAcTitleSuggestOption extends IAcOptionBase {
  type: AcType.titleSuggest;
  payload: Book;
}

interface IAcSearchHistoryOption extends IAcOptionBase {
  type: AcType.searchHistory;
  payload: ISearchHistoryDocument;
}

export default function AppHeader({
  open,
  openDrawer,
  autoHideHeader,
}: {
  open: boolean;
  openDrawer?: () => void;
  autoHideHeader?: boolean;
}) {
  const changeTheme = useChangeTheme();
  const theme = useTheme();

  const router = useRouter();

  const [mode, setMode] = React.useState<string | null>(null);
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  React.useEffect(() => {
    const initialMode = "system";
    setMode(initialMode);
    if (prefersDarkMode && theme.palette.mode !== "dark" && mode === "system") {
      const nextPaletteMode = "dark";
      changeTheme({ paletteMode: nextPaletteMode });
    }
  }, []);

  const trigger = useScrollTrigger();

  const [acInputValue, setAcInputValue] = React.useState("");

  const pageName = usePageName();
  React.useEffect(() => {
    if (
      pageName === PageNames.Search &&
      typeof router.query.text === "string" &&
      router.query.text.length > 0
    ) {
      setAcInputValue(router.query.text);
    }
  }, [router.query.text, pageName]);

  const debounceAcInputValue = useDebounce(acInputValue, {
    wait: 300,
    trailing: true,
    leading: true,
  });
  const { bookTitleSuggests } = useBookTitleSuggests(debounceAcInputValue);
  const shCollection = useRxCollection<ISearchHistoryData>(
    COLLECTION_NAMES.searchHistory
  );
  const shQuery = React.useCallback<QueryConstructor<ISearchHistoryDocument>>(
    (collection) => {
      return collection.find({
        selector: {},
        sort: [
          {
            createdAt: "desc",
          },
        ],
        limit: 5,
      });
    },
    []
  );
  const { result: searchHistoryDocs } = useRxData<ISearchHistoryDocument>(
    COLLECTION_NAMES.searchHistory,
    shQuery
  );
  const acOptions = React.useMemo<IAcOption[]>(() => {
    const tss: IAcTitleSuggestOption[] =
      bookTitleSuggests?.map((x) => ({
        payload: x,
        text: x.title || "",
        type: AcType.titleSuggest,
      })) || [];
    const sss: IAcSearchHistoryOption[] =
      searchHistoryDocs?.map((x) => ({
        payload: x,
        text: x.text || "",
        type: AcType.searchHistory,
      })) || [];
    return [...tss, ...sss];
  }, [bookTitleSuggests, searchHistoryDocs]);

  return (
    <Slide
      appear={false}
      direction="down"
      in={autoHideHeader ? !trigger : true}
    >
      <AppBar position="sticky" open={open} color="inherit">
        <Toolbar>
          <IconButton
            aria-label="open drawer"
            edge="start"
            sx={{ ...(open && { display: "none" }) }}
            onClick={openDrawer || NOTHING}
          >
            <MenuIcon />
          </IconButton>
          <Button
            LinkComponent={Link}
            href="/"
            sx={{ ...(open && { display: "none" }) }}
          >
            xxbook
          </Button>
          <Autocomplete
            id="asynchronous-demo"
            size="small"
            disableClearable
            freeSolo
            blurOnSelect
            filterOptions={(xs, state) => {
              const defaultFilter = createFilterOptions<IAcOption>();
              return xs.filter((x) => {
                if (x.type === AcType.searchHistory) {
                  return defaultFilter([x], state)[0];
                } else {
                  return x;
                }
              });
            }}
            onChange={async (
              e: React.SyntheticEvent,
              option: IAcOption | string
            ) => {
              e.preventDefault();
              if (typeof option === "string") {
                if (option.length > 0) {
                  const newDoc = await SearchHistoryModel.createData(option);
                  if (shCollection) {
                    SearchHistoryModel.addOne(shCollection, newDoc);
                  }
                  await router.push(pageHrefs.search({ text: option }));
                  setAcInputValue(option);
                }
              } else if (option.type === AcType.titleSuggest) {
                // const newDoc = await SearchHistoryModel.createData(option.text);
                // if (ashCollection) {
                //   SearchHistoryModel.addOne(ashCollection, newDoc);
                // }
                await router.push(pageHrefs.book(option.payload));
                setAcInputValue("");
              } else {
                SearchHistoryModel.updateCreatedAt(option.payload);
                await router.push(pageHrefs.search({ text: option.text }));
                setAcInputValue(option.text);
              }
            }}
            options={acOptions}
            onInputChange={(event, newAcInputValue) => {
              setAcInputValue(newAcInputValue);
            }}
            inputValue={acInputValue}
            getOptionLabel={(option: IAcOption | string) => {
              if (typeof option === "string") {
                return option;
              } else {
                return option.text;
              }
            }}
            sx={{ width: 400 }}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  margin="normal"
                  placeholder="搜尋小說..."
                  InputProps={{
                    ...params.InputProps,
                    type: "search",
                  }}
                />
              );
            }}
            renderOption={(props, option, { inputValue }) => {
              const matches = suggestMatch(option.text || "", inputValue);
              const parts = suggestParse(option.text || "", matches);

              const OptionTypeIcon = ({ acType }: { acType: AcType }) => {
                const iconMapping = {
                  [AcType.searchHistory]: HistoryIcon,
                  [AcType.titleSuggest]: BookIcon,
                };
                const component = iconMapping[acType] || BookIcon;
                return (
                  <Box
                    component={component}
                    sx={{
                      flexShrink: 0,
                      mr: 1,
                      mt: "2px",
                    }}
                  />
                );
              };

              const liKey = `${option.type}-${option.text}-${option.payload.id}`;

              return (
                <li {...props} key={liKey}>
                  <OptionTypeIcon acType={option.type} />
                  {parts.map((part, index) => (
                    <Typography
                      key={`${liKey}-${index}`}
                      variant="subtitle1"
                      sx={{
                        fontWeight: part.highlight ? 900 : 400,
                      }}
                    >
                      {part.text}
                    </Typography>
                  ))}
                  {option.type === AcType.titleSuggest && (
                    <Typography
                      variant="caption"
                      sx={{ marginLeft: 1, marginRight: 1 }}
                    >
                      {option.payload.authorName}
                    </Typography>
                  )}
                  {option.type === AcType.searchHistory && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        flex: "1 0 auto",
                      }}
                    >
                      <IconButton
                        component="span"
                        onClick={(e: React.MouseEvent<HTMLElement>) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (shCollection && option.payload.id) {
                            SearchHistoryModel.removeOne(
                              shCollection,
                              option.payload.id
                            );
                          }
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </Box>
                  )}
                </li>
              );
            }}
          />
        </Toolbar>
      </AppBar>
    </Slide>
  );
}
