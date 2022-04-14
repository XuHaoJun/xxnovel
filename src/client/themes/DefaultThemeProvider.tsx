import * as React from "react";
import PropTypes from "prop-types";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme as createLegacyModeTheme,
  unstable_createMuiStrictModeTheme as createStrictModeTheme,
  Theme,
  ThemeOptions,
  Direction,
} from "@mui/material/styles";
import { deepmerge } from "@mui/utils";
import { unstable_useEnhancedEffect as useEnhancedEffect } from "@mui/material/utils";

import {
  getDesignTokens,
  getThemedComponents,
  getMetaThemeColor,
} from "./brandingTheme";
import { useMediaQuery } from "@mui/material";

interface MyThemeOptions {
  dense: boolean;
  direction: Direction;
  paletteColors: Record<string, any>;
  spacing: number;
  paletteMode: "light" | "dark";
}

const themeInitialOptions: MyThemeOptions = {
  dense: false,
  direction: "ltr",
  paletteColors: {},
  spacing: 8, // spacing unit
  paletteMode: "light",
};

export const highDensity = {
  components: {
    MuiButton: {
      defaultProps: {
        size: "small",
      },
    },
    MuiFilledInput: {
      defaultProps: {
        margin: "dense",
      },
    },
    MuiFormControl: {
      defaultProps: {
        margin: "dense",
      },
    },
    MuiFormHelperText: {
      defaultProps: {
        margin: "dense",
      },
    },
    MuiIconButton: {
      defaultProps: {
        size: "small",
      },
    },
    MuiInputBase: {
      defaultProps: {
        margin: "dense",
      },
    },
    MuiInputLabel: {
      defaultProps: {
        margin: "dense",
      },
    },
    MuiListItem: {
      defaultProps: {
        dense: true,
      },
    },
    MuiOutlinedInput: {
      defaultProps: {
        margin: "dense",
      },
    },
    MuiFab: {
      defaultProps: {
        size: "small",
      },
    },
    MuiTable: {
      defaultProps: {
        size: "small",
      },
    },
    MuiTextField: {
      defaultProps: {
        margin: "dense",
      },
    },
    MuiToolbar: {
      defaultProps: {
        variant: "dense",
      },
    },
  },
};

export const DispatchContext = React.createContext<any>(() => {
  throw new Error("Forgot to wrap component in `ThemeProvider`");
});

if (process?.env.NODE_ENV !== "production") {
  DispatchContext.displayName = "ThemeDispatchContext";
}

let createTheme: (options?: ThemeOptions, ...args: object[]) => Theme;
createTheme = createLegacyModeTheme;
if (process?.env.REACT_STRICT_MODE) {
  createTheme = createStrictModeTheme;
} else {
  createTheme = createLegacyModeTheme;
}

interface ThemeAction {
  type: "CHANGE";
  payload: Partial<MyThemeOptions>;
}

export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") {
    throw new Error(
      "getCookie() is not supported on the server. Fallback to a different value when rendering on the server."
    );
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts[1].split(";").shift();
  }

  return undefined;
}

export function DefaultThemeProvider(props: any) {
  const { children } = props;
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const preferredMode = prefersDarkMode ? "dark" : "light";

  const [themeOptions, dispatch] = React.useReducer(
    (state: MyThemeOptions, action: ThemeAction) => {
      switch (action.type) {
        case "CHANGE":
          return {
            ...state,
            paletteMode: action.payload.paletteMode || state.paletteMode,
            direction: action.payload.direction || state.direction,
            paletteColors: action.payload.paletteColors || state.paletteColors,
          } as MyThemeOptions;
        default:
          throw new Error(`Unrecognized type ${action.type}`);
      }
    },
    { ...themeInitialOptions, paletteMode: preferredMode }
  );

  const { dense, direction, paletteColors, paletteMode, spacing } =
    themeOptions;

  useEnhancedEffect(() => {
    document.body.dir = direction;
  }, [direction]);

  React.useEffect(() => {
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach((meta) => {
      meta.setAttribute("content", getMetaThemeColor(paletteMode));
    });
  }, [paletteMode]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const nextPaletteColors = JSON.parse(
        getCookie("paletteColors") || "null"
      );
      const nextPaletteMode = (getCookie("paletteMode") || preferredMode) as
        | "dark"
        | "light";

      dispatch({
        type: "CHANGE",
        payload: {
          paletteColors: nextPaletteColors,
          paletteMode: nextPaletteMode,
        },
      });
    }
  }, [preferredMode]);

  const theme = React.useMemo(() => {
    const brandingDesignTokens = getDesignTokens(paletteMode);
    const nextPalette = deepmerge(brandingDesignTokens.palette, paletteColors);
    let nextTheme = createTheme(
      {
        direction,
        ...brandingDesignTokens,
        // nprogress: {
        //   color: brandingDesignTokens.palette.primary.main,
        // },
        palette: {
          ...nextPalette,
          mode: paletteMode,
        },
        // v5 migration
        // props: {
        //   MuiBadge: {
        //     overlap: "rectangular",
        //   },
        // },
        spacing,
      },
      dense ? highDensity : {},
      {
        components: {
          MuiCssBaseline: {
            defaultProps: {
              enableColorScheme: true,
            },
          },
        },
      }
    );

    nextTheme = deepmerge(nextTheme, getThemedComponents(nextTheme));

    return nextTheme;
  }, [dense, direction, paletteColors, paletteMode, spacing]);

  // useEnhancedEffect(() => {
  //   if (theme.palette.mode === "dark") {
  //     document.body.classList.remove("mode-light");
  //     document.body.classList.add("mode-dark");
  //   } else {
  //     document.body.classList.remove("mode-dark");
  //     document.body.classList.add("mode-light");
  //   }
  // }, [theme.palette.mode]);

  return (
    <MuiThemeProvider theme={theme}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </MuiThemeProvider>
  );
}

DefaultThemeProvider.propTypes = {
  children: PropTypes.node,
};

/**
 * @returns {(nextOptions: Partial<typeof themeInitialOptions>) => void}
 */
export function useChangeTheme() {
  const dispatch = React.useContext(DispatchContext);
  return React.useCallback(
    (options: any) => dispatch({ type: "CHANGE", payload: options }),
    [dispatch]
  );
}
