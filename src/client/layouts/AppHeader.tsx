import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import GitHubIcon from "@mui/icons-material/GitHub";

import { useChangeTheme } from "../themes/DefaultThemeProvider";
import ThemeModeToggle from "../components/header/ThemeModeToggle";

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

export default function AppHeader() {
  const changeTheme = useChangeTheme();
  const [mode, setMode] = React.useState<string | null>(null);
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  React.useEffect(() => {
    const initialMode = "system";
    setMode(initialMode);
  }, []);

  const handleChangeThemeMode = (checked: boolean) => {
    const paletteMode = checked ? "dark" : "light";
    setMode(paletteMode);

    document.cookie = `paletteMode=${paletteMode};path=/;max-age=31536000`;
    console.log("???");
    changeTheme({ paletteMode });
  };

  return (
    <Header>
      <Container sx={{ display: "flex", alignItems: "center", minHeight: 56 }}>
        Title
        {mode !== null ? (
          <ThemeModeToggle
            checked={mode === "system" ? prefersDarkMode : mode === "dark"}
            onChange={handleChangeThemeMode}
          />
        ) : null}
      </Container>
    </Header>
  );
}
