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
import { useScrollTrigger, Slide } from "@mui/material";

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
            sx={{ mr: 2, ...(open && { display: "none" }) }}
            onClick={openDrawer || NOTHING}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
        {/* <Container sx={{ display: "flex", alignItems: "center", minHeight: 56 }}>
        Title
        {mode !== null ? (
          <ThemeModeToggle
            checked={theme.palette.mode === "dark"}
            onChange={handleChangeThemeMode}
          />
        ) : null}
      </Container> */}
      </AppBar>
    </Slide>
  );
}
