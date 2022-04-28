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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Link from "../components/Link/Link";
import NextLink from "next/link";
import suggestParse from "autosuggest-highlight/parse";
import suggestMatch from "autosuggest-highlight/match";
import { useBookTitleSuggests } from "../queries/book";
import { useDebounce } from "usehooks-ts";
import BookIcon from "@mui/icons-material/Book";
import * as pageHrefs from "src/client/pageHrefs";
import { useRouter } from "next/router";
import { Book } from "src/shared/types/models";

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
  const debounceAcInputValue = useDebounce(acInputValue, 250);
  const { bookTitleSuggests } = useBookTitleSuggests(debounceAcInputValue);

  return (
    <Slide
      appear={false}
      direction="down"
      in={autoHideHeader ? !trigger : true}
    >
      <AppBar position="sticky" open={open}>
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
            onChange={async (
              e: React.SyntheticEvent,
              option: Book | string
            ) => {
              e.preventDefault();
              if (typeof option !== "string") {
                await router.push(pageHrefs.book(option));
                setAcInputValue("");
              } else {
                console.log("option", option);
              }
            }}
            options={bookTitleSuggests}
            onInputChange={(event, newAcInputValue) => {
              setAcInputValue(newAcInputValue);
            }}
            inputValue={acInputValue}
            getOptionLabel={(option: Book | string) => {
              if (typeof option === "string") {
                return option;
              } else {
                return option.title || "";
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
              const matches = suggestMatch(option.title || "", inputValue);
              const parts = suggestParse(option.title || "", matches);

              return (
                <li {...props}>
                  <Box
                    component={BookIcon}
                    sx={{
                      flexShrink: 0,
                      mr: 1,
                      mt: "2px",
                    }}
                  />
                  {parts.map((part, index) => (
                    <Typography
                      variant="subtitle1"
                      key={index}
                      sx={{
                        fontWeight: part.highlight ? 900 : 400,
                      }}
                    >
                      {part.text}
                    </Typography>
                  ))}
                  <Typography
                    variant="caption"
                    sx={{ marginLeft: 1, marginRight: 1 }}
                  >
                    {option.authorName}
                  </Typography>
                </li>
              );
            }}
          />
        </Toolbar>
      </AppBar>
    </Slide>
  );
}
