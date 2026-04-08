import { alpha, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#155EEF",
      light: "#5B8CFF",
      dark: "#0040C1",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#0F766E",
      light: "#14B8A6",
      dark: "#115E59",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#067647",
    },
    warning: {
      main: "#B54708",
    },
    error: {
      main: "#B42318",
    },
    info: {
      main: "#175CD3",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#101828",
      secondary: "#475467",
    },
    divider: "#EAECF0",
  },

  shape: {
    borderRadius: 16,
  },

  typography: {
    fontFamily: ['"Inter"', '"Segoe UI"', "Roboto", "Arial", "sans-serif"].join(","),
    h3: {
      fontWeight: 800,
      letterSpacing: "-0.03em",
    },
    h4: {
      fontWeight: 800,
      letterSpacing: "-0.03em",
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    subtitle1: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: "linear-gradient(180deg, #F8FAFC 0%, #F4F7FB 100%)",
          color: "#101828",
        },
        "*": {
          boxSizing: "border-box",
        },
        a: {
          color: "inherit",
          textDecoration: "none",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 22,
          border: "1px solid #EAECF0",
          boxShadow: "0 10px 30px rgba(16, 24, 40, 0.06)",
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
          minHeight: 44,
          paddingInline: 18,
        },
        containedPrimary: {
          boxShadow: `0 8px 18px ${alpha("#155EEF", 0.24)}`,
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: "#FFFFFF",
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        fullWidth: true,
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        head: {
          color: "#475467",
          fontWeight: 700,
          backgroundColor: "#F8FAFC",
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 10,
          borderRadius: 999,
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255,255,255,0.86)",
          backdropFilter: "blur(14px)",
          boxShadow: "none",
          borderBottom: "1px solid rgba(16,24,40,0.06)",
          color: "#101828",
        },
      },
    },
  },
});

export default theme;