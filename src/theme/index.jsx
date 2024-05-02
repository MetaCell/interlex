import { createTheme } from "@mui/material/styles";
import { vars } from "./variables";

const { 
    primaryFont,
    white,
    brand600,
    gray300,
    gray600,
    gray700,
    success500,
    gray500
} = vars

const theme = createTheme({
    typography: {
        allVariants: {
            fontFamily: primaryFont
        }
    },

    components: {
        MuiCssBaseline: {
            styleOverrides: `
                * {
                    box-sizing: border-box !important;
                    margin: 0;
                    font-family: ${primaryFont};
                    padding: 0;
                }
                body {
                    background: ${white};
                    font-optical-sizing: auto;
                    font-weight: 400;
                    font-style: normal;
                    font-variation-settings: "slnt" 0;
                }
            `
        },

        MuiTabs: {
            styleOverrides: {
                flexContainer: {
                    gap: '2.25rem'
                },
                scrollableY: {
                    '& .MuiTabs-indicator': {
                        right: 'auto',
                        left: 0,
                        background: brand600,
                        borderRadius: '3.125rem'
                    }
                }
            }
        },

        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    padding: '0rem 0.75rem',
                    fontSize: '1.125rem',
                    fontWeight: 500,
                    lineHeight: '155.556%',
                    letterSpacing: 'normal',
                    textAlign: 'left',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    minHeight: '0.0625rem',
                    color: gray500,

                    '&.Mui-selected': {
                        color: brand600,
                    }
                }
            }
        },

        MuiTouchRipple: {
            styleOverrides: {
                ripple: {
                    display: 'none'
                }
            }
        },

        MuiButton: {
            defaultProps: {
                disableElevation: true
            },
            styleOverrides: {
                root: {
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '0.5rem',
                    height: '2.5rem',
                    padding: '0 1rem',
                    gap: '0.25rem',
                    display: 'inline-flex',
                    alignItems: 'center'
                },
                containedPrimary: {
                    background: brand600,
                    '&:hover': {
                        background: brand600
                    }
                },
                outlinedPrimary: {
                    borderColor: gray300,
                    color: gray700,
                    background: white,
                    '&:hover': {
                        background: white,
                        borderColor: gray300
                    }
                },
                textPrimary: {
                    color: gray600,
                    background: white,
                    '&:hover': {
                        background: white,
                    }
                }
            }
        },

        MuiBadge: {
            styleOverrides: {
                dot: {
                    width: '0.625rem',
                    borderRadius: '50%',
                    bottom: '0.3125rem',
                    right: '0.3125rem',
                    height: '0.625rem' ,
                },
                colorSuccess: {
                    background: success500
                }
            }
        },

        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: '0.5rem',
                    background: white,

                    '&:hover': {
                        background: white,
                    },

                    '&.outlined': {
                        border: `0.0625rem solid #CCD0D9`
                    }
                }
            }
        }
    }
});

export default theme;