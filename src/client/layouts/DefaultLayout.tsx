import * as React from "react";
import moment from "moment";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled, useTheme } from "@mui/material/styles";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListSubheader,
  ListItem,
  Button,
  ListItemIcon,
  ListItemButton,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import ArrowDownIcon from "@mui/icons-material/ArrowDownward";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { setCookies } from "cookies-next";

import AppHeader from "./AppHeader";
import ThemeModeToggle from "../components/header/ThemeModeToggle";
import { useChangeTheme } from "../themes/DefaultThemeProvider";
import Main from "./Main";
import NextLink from "next/link";
import MyLink from "src/client/components/Link";
import Link from "src/client/components/Link";
import { QueryConstructor, useRxCollection, useRxData } from "rxdb-hooks";
import { COLLECTION_NAMES } from "../db/collectionNames";
import {
  IViewBookChunkHistoryData,
  IViewBookChunkHistoryDocument,
} from "src/shared/schemas/ViewBookChunkHistoryJSchema";
import type { RxCollection } from "rxdb";
import type { IBookData, IBookDocument } from "src/shared/schemas/BookJSchema";

const drawerWidth = 240;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-start",
}));

export const DispatchContext = React.createContext<any>(() => {
  throw new Error("Forgot to wrap component in ``");
});

export interface DefaultLayoutState {
  autoHideHeader?: boolean;
}

export interface DefaultLayoutAction {
  type: "CHANGE";
  payload: DefaultLayoutState;
}

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const changeTheme = useChangeTheme();
  const theme = useTheme();

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

  const handleChangeThemeMode = (checked: boolean) => {
    const paletteMode = checked ? "dark" : "light";
    setMode(paletteMode);

    setCookies("paletteMode", paletteMode, { path: "/", maxAge: 31536000 });

    changeTheme({ paletteMode });
  };

  const [layoutState, dispatch] = React.useReducer(
    (state: DefaultLayoutState, action: DefaultLayoutAction) => {
      switch (action.type) {
        case "CHANGE":
          return {
            ...state,
            ...action.payload,
          };
        default:
          throw new Error(`Unrecognized type ${action.type}`);
      }
    },
    { autoHideHeader: false }
  );

  const smMatches = useMediaQuery(theme.breakpoints.up("sm"));

  const vbchQuery = React.useCallback<
    QueryConstructor<IViewBookChunkHistoryDocument>
  >((col) => {
    return col.find({
      selector: {},
      sort: [
        {
          createdAt: "desc",
        },
      ],
      limit: 5,
    });
  }, []);
  const { result: vbchDocs } = useRxData<IViewBookChunkHistoryDocument>(
    COLLECTION_NAMES.viewBookChunkHistory,
    vbchQuery
  );
  const bookCol = useRxCollection<IBookData>(COLLECTION_NAMES.book);
  const [rxBooks, setRxBooks] = React.useState<Map<string, IBookDocument>>(
    new Map()
  );
  React.useEffect(() => {
    const readRxBooks = async () => {
      if (bookCol && vbchDocs) {
        const bookIds = vbchDocs.map((x) => x.bookId);
        const xs = await bookCol.findByIds(bookIds as Array<string>);
        setRxBooks(xs);
      }
    };
    readRxBooks();
  }, [vbchDocs, bookCol, setRxBooks]);

  return (
    <DispatchContext.Provider value={dispatch}>
      <AppHeader
        open={open}
        openDrawer={handleDrawerOpen}
        autoHideHeader={layoutState.autoHideHeader}
      />
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        variant={smMatches ? "persistent" : "temporary"}
        anchor="left"
        onClose={handleDrawerClose}
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            <MenuIcon />
          </IconButton>
          <Button LinkComponent={Link} href="/">
            xxbook
          </Button>
          {mode !== null ? (
            <ThemeModeToggle
              checked={theme.palette.mode === "dark"}
              onChange={handleChangeThemeMode}
            />
          ) : null}
        </DrawerHeader>
        <Divider />
        <List>
          <NextLink href="/" passHref>
            <ListItemButton component="a">
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="首頁" />
            </ListItemButton>
          </NextLink>
        </List>
        <Divider />
        <List subheader={<ListSubheader>最近瀏覽</ListSubheader>}>
          {vbchDocs.map((x) => {
            const book = x.bookId ? rxBooks.get(x.bookId) : null;
            const idx =
              typeof x?.bookChunkIdxByCreatedAt === "number"
                ? x?.bookChunkIdxByCreatedAt
                : -1;
            const primary = book?.chunks?.[idx]?.sectionName;
            const secondary = `${book?.title} - ${moment(x.createdAt).format(
              "yyyy/MM/DD"
            )}`;
            return (
              <ListItem key={x.id} button>
                <ListItemText primary={primary} secondary={secondary} />
              </ListItem>
            );
          })}
          <ListItemButton>
            <ExpandMore />
            <ListItemText primary="顯示更多項目" />
          </ListItemButton>
        </List>
        <Divider />
        <List subheader={<ListSubheader>訂閱書籍(未完成)</ListSubheader>}>
          <ListItem button>
            <ListItemText
              primary="第四百八十五章 別苗頭"
              secondary="萬相之王 - 2022/04/20"
            />
          </ListItem>
          <ListItem button>
            <ListItemText
              primary="第3101章 人間，惹不起了"
              secondary="全職法師 - 2022/04/20"
            />
          </ListItem>
          <ListItemButton>
            <ExpandMore />
            <ListItemText primary="顯示另外xx個項目" />
          </ListItemButton>
        </List>
        <Divider />
        <List subheader={<ListSubheader>推薦書籍(未完成)</ListSubheader>}>
          <ListItem button>
            <ListItemText
              primary="永夜君王"
              secondary="類別: 玄幻魔法 | 作者: 煙雨江南"
            />
          </ListItem>
          <ListItemButton>
            <ExpandMore />
            <ListItemText primary="顯示更多" />
          </ListItemButton>
        </List>
      </Drawer>
      <Main open={open}>{children}</Main>
    </DispatchContext.Provider>
  );
}

export function useChangeLayout() {
  const dispatch = React.useContext(DispatchContext);
  return React.useCallback(
    (options: DefaultLayoutState) =>
      dispatch({ type: "CHANGE", payload: options }),
    [dispatch]
  );
}
