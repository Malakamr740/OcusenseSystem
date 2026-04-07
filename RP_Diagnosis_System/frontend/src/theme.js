import { alpha, createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#155EEF" },
    secondary: { main: "#0F766E" },
    success: { main: "#067647" },
    warning: { main: "#B54708" },
    error: { main: "#B42318" },
    info: { main: "#175CD3" },
    text: {
      primary: "#101828",
      secondary: "#475467"
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF"
    },
    divider: "#EAECF0"
  },
  shape: {
    borderRadius: 18
  },
  typography: {
    fontFamily: ["Inter", "Segoe UI", "Roboto", "Arial", "sans-serif"].join(","),
    h2: { fontWeight: 800, letterSpacing: "-0.04em" },
    h3: { fontWeight: 800, letterSpacing: "-0.03em" },
    h4: { fontWeight: 750, letterSpacing: "-0.03em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 700 }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: "linear-gradient(180deg, #F8FAFC 0%, #F4F7FB 100%)"
        },
        a: {
          color: "inherit",
          textDecoration: "none"
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          border: "1px solid #EAECF0",
          boxShadow: "0 10px 30px rgba(16, 24, 40, 0.06)"
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none"
        }
      }
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 14,
          paddingInline: 18
        },
        containedPrimary: {
          boxShadow: `0 8px 18px ${alpha("#155EEF", 0.24)}`
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: "#FFFFFF"
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: "#475467",
          fontWeight: 700,
          backgroundColor: "#F8FAFC"
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 10,
          borderRadius: 999
        }
      }
    }
  }
});