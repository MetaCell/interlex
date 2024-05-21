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
    gray500,
    brand700,
    gray50,
    gray100,
    gray200,
    brand300,
    brand25,
    gray25,
    warning200,
    warning50,
    warning700,
    warning500
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

        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: gray200,
                        }
                    },
                    '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: gray200,
                            borderWidth: '0.0625rem'
                        }
                    }
                },
                notchedOutline: {
                    borderColor: gray200
                }
            }
        },

        MuiContainer: {
            styleOverrides: {
                maxWidthXl: {
                    '@media screen and (min-width: 96rem)' : {
                        maxWidth: '104.5rem'
                    }
                }
            }
        },

        MuiChip: {
            styleOverrides: {
                root: {
                    height: '1.375rem',
                    padding: '0 0.375rem',
                    fontSize: '0.75rem',
                    borderRadius: '0.375rem',
                    fontWeight: 500,
                    
                    '&.status': {
                        padding: '0.125rem 0.5rem 0.125rem 0.375rem',
                        height: '1.5rem',
                        gap: '.25rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        
                        '& .MuiChip-icon': {
                            margin: 0,
                            width: '.5rem',
                            height: '.5rem'
                        }
                    },
                    
                    '&.not-merged': {
                        border: `1px solid ${warning200}`,
                        background: warning50,
                        color: warning700,
                        
                        '& .MuiChip-icon': {
                            color: warning500
                        }
                    }
                },
                label: {
                    padding: 0
                },
                outlined: {
                    borderColor: gray300,
                    color: gray700,
                    boxShadow: '0rem 0.0625rem 0.125rem 0rem rgba(16, 24, 40, 0.05)'
                },

                colorSuccess: {
                    borderColor: `${brand300} !important`,
                    background: brand25,
                    boxShadow: '0rem 0.0625rem 0.125rem 0rem rgba(16, 24, 40, 0.05) !important'
                },
                
               
            }
        },

        MuiAutocomplete: {
            styleOverrides: {
                listbox: {
                    padding: 0,

                    '& .MuiAutocomplete-option': {
                        padding: '0 0.625rem 0 0.5rem',
                        height: '2.625rem',
                        borderRadius: '0.375rem',

                        '&:not(:first-child)': {
                            marginTop: '0.375rem'
                        },

                        '&:hover': {
                            backgroundColor: gray50
                        },

                        '&[aria-selected="true"]': {
                            backgroundColor: gray50
                        }
                    }
                },
                paper: {
                    boxShadow: 'none',
                    borderRadius: '0 0 0.5rem 0.5rem',
                    border: `0.0625rem solid ${gray200}`,
                    borderTop: 'none'
                },
                root: {
                    '& .MuiOutlinedInput-root': {
                        padding: '0.5rem !important',
                        height: '2.5rem',
                        background: gray25,
                        borderRadius: '0.5rem',
                        '&.Mui-focused': {
                            background: white,
                        },
                        '& .MuiAutocomplete-input': {
                            padding: 0,
                            color: gray700,
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            lineHeight: '142.857%',
                            '&::placeholder': {
                                opacity: 1,
                                color: gray500,
                            }
                        }
                    }
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
                        background: brand700
                    },
                    '&:focus': {
                        background: brand600,
                        boxShadow: '0rem 0.0625rem 0.125rem 0rem rgba(16, 24, 40, 0.05), 0rem 0rem 0rem 0.25rem rgba(50, 129, 115, 0.24)'
                    }
                },
                outlinedPrimary: {
                    borderColor: gray300,
                    color: gray700,
                    background: white,
                    '&:hover': {
                        background: gray50,
                        borderColor: gray300
                    },
                    '&:focus': {
                        background: white,
                        borderColor: gray300,
                        boxShadow: "0rem 0.0625rem 0.125rem 0rem rgba(16, 24, 40, 0.05), 0rem 0rem 0rem 0.25rem rgba(152, 162, 179, 0.14)"
                    }
                },
                textPrimary: {
                    color: gray600,
                    background: white,
                    '&:hover': {
                        background: gray100,
                        color: gray700,
                    },
                    '&:focus': {
                        background: white,
                    }
                },
                textSecondary: {
                    color: brand700,
                    padding: '0.625rem 0.875rem',
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
        },
        MuiSvgIcon: {
            styleOverrides: {
                fontSizeSmall: {
                    fontSize: "1rem",
                    width: "1rem",
                    height: "1rem",
                },
                fontSizeMedium: {
                    fontSize: "1.25rem",
                    width: '1.25rem',
                    height: '1.25rem'
                },
            },
        },
    }
});

export default theme;