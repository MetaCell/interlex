import { createTheme } from "@mui/material/styles";
import { vars } from "./variables";

const {
    primaryFont,
    white,
    brand600,
    gray300,
    gray600,
    gray700,
    success50,
    success200,
    success500,
    success700,
    gray500,
    brand700,
    gray50,
    gray100,
    gray200,
    gray800,
    brand300,
    brand25,
    gray25,
    warning200,
    warning50,
    warning700,
    warning500,
    brand50,
    error50,
    error200,
    error700,
    gray400
} = vars

const theme = createTheme({
    typography: {
        allVariants: {
            fontFamily: primaryFont
        },
        h5: {
            color: gray600,
            fontWeight: 600
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
                    overflow: hidden;
                }
                *::-webkit-scrollbar {
                    width: 1rem;
                }
                
                *::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                *::-webkit-scrollbar-thumb {
                    background-color: ${gray200};
                    border-radius: 0.5rem;
                    background-clip: content-box;
                    border: 0.25rem solid transparent;
                }
            `
        },
        MuiRichTreeView: {
            styleOverrides: {
                backgroundColor: 'red',
                root: {
                    '& .MuiTreeItem-root': {
                        position: 'relative',
                        '&:before': {
                            position: 'absolute',
                            left: '-10px',
                            top: '0px',
                            borderLeft: `1px solid ${gray400}`,
                            borderBottom: `1px solid ${gray400}`,
                            content: '""',
                            width: '.5rem',
                            height: '1em',
                            borderBottomLeftRadius: "50%"
                        },
                        '&:after': {
                            position: 'absolute',
                            left: '-10px',
                            bottom: '0px',
                            borderLeft: `1px solid ${gray400}`,
                            content: '""',
                            width: '.5rem',
                            height: '100%'
                        },
                        '&:last-of-type': {
                            '&:after': {
                                display: 'none'
                            }
                        }
                    }
                }
            }
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
                    '@media screen and (min-width: 96rem)': {
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

                    '&.rounded': {
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
                    },

                    '&.green-glow-chip': {
                        borderRadius: '0.375rem',
                        background: brand25,
                        border: `1px solid ${brand300}`
                    },

                    '&.IDchip-outlined': {
                        padding: '0.125rem 0.5rem',
                        border: `1.5px solid ${gray600}`,
                        background: 'transparent',
                        color: gray700
                    },


                    '&.synonyms': {
                        background: gray50,
                        color: gray700,
                        borderColor: gray200,
                        padding: '0.125rem 0.625rem',

                        '& span': {
                            '& span': {
                                '& span': {
                                    color: gray500,
                                    fontWeight: 400
                                }
                            }
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
                    padding: '0.13rem 0.5rem',
                    display: 'flex',
                    gap: '0.25rem',
                    borderRadius: '1rem',
                    border: `1px solid ${success200}`,
                    background: success50,
                    color: success700,
                    '& .MuiSvgIcon-root': {
                        margin: 0,
                        width: '0.75rem',
                        height: '0.75rem'
                    }
                },
                colorError: {
                    padding: '0.13rem 0.5rem',
                    display: 'flex',
                    gap: '0.25rem',
                    borderRadius: '1rem',
                    border: `1px solid ${error200}`,
                    background: error50,
                    color: error700,
                    '& .MuiSvgIcon-root': {
                        margin: 0,
                        width: '0.75rem',
                        height: '0.75rem'
                    }
                },
                colorDefault: {
                    padding: '0.13rem 0.5rem',
                    display: 'flex',
                    gap: '0.25rem',
                    borderRadius: '1rem',
                    border: `1px solid ${gray200}`,
                    background: gray50,
                    color: gray700,
                    '& .MuiSvgIcon-root': {
                        margin: 0,
                        width: '0.75rem',
                        height: '0.75rem'
                    }
                }
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

                    '&:hover': {
                        background: brand50
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
                    height: '0.625rem',
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

        MuiFormControl: {
            styleOverrides: {
                root: {
                    '& .MuiFormLabel-root': {
                        lineHeight: '1.25rem',
                        color: gray600,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        '&.Mui-focused': {
                            color: gray600
                        }
                    },
                    '& .MuiFormControlLabel-root': {
                        margin: 0,
                        gap: '0.5rem',
                        '& .MuiCheckbox-root': {
                            padding: 0
                        }
                    },
                    '& .MuiFormControlLabel-label': {
                        color: gray700,
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        lineHeight: '1.25rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '12.5rem'
                    }
                }
            }
        },

        MuiButtonGroup: {
            styleOverrides: {
                outlined: {
                    borderRadius: '0.5rem',
                    boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',

                    '& .MuiButton-root': {
                        padding: '0.625rem 0.875rem'
                    },
                    '& .MuiButton-root:focus': {
                        boxShadow: 'none',
                        background: gray50
                    },
                    '& .MuiButtonGroup-firstButton:hover': {
                        borderRightColor: 'transparent'
                    }
                }
            }
        },

        MuiSvgIcon: {
            styleOverrides: {
                fontSizeSmall: {
                    width: '1rem',
                    height: '1rem',
                    fontSize: '1rem',
                },
                fontSizeMedium: {
                    width: '1.25rem',
                    height: '1.25rem',
                    fontSize: '1.25rem',
                }
            }
        },
        MuiAccordion: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    "&:before": {
                        display: 'none'
                    },
                    '& .MuiAccordionSummary-root': {
                        paddingLeft: 0,
                        gap: '.5rem',
                        flexDirection: 'row-reverse',
                        alignItems: 'center',
                        justifyContent: 'space-between',

                        '& .MuiTypography-root': {
                            fontSize: '0.875rem',
                            color: gray600,
                            fontWeight: 500,
                        },
                        '& .MuiSvgIcon-root': {
                            color: gray600,
                        },
                        '& .MuiAccordionSummary-expandIconWrapper': {
                            '& .MuiSvgIcon-root': {
                                color: gray500,
                            },
                        },
                        '& .MuiAccordionSummary-content': {
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            '& .MuiButtonGroup-root': {
                                '& .MuiButtonBase-root': {
                                    '& .MuiSvgIcon-root': {
                                        color: 'initial',
                                    }
                                }
                            }
                        },

                    },
                },
            }
        },
        MuiTable: {
            styleOverrides: {
                root: {
                    '& .MuiTableHead-root': {
                        '& .MuiTableCell-root': {
                            padding: '0.75rem 1.5rem !important',
                            background: gray50,
                            lineHeight: '1.25rem',
                            height: '2.75rem'
                        },
                        '& .MuiTableSortLabel-root': {
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.75rem',
                            color: gray600,
                            fontWeight: 500,
                            '&.Mui-active': {
                                color: gray600
                            },
                            '& .MuiSvgIcon-root': {
                                width: '1rem',
                                height: '1rem',
                                fill: gray600,
                                opacity: 1
                            },
                            '&:hover': {
                                color: gray700,
                                '& .MuiSvgIcon-root': {
                                    fill: gray700,
                                    opacity: 1
                                }
                            }
                        }
                    },
                    '& .MuiTableCell-root': {
                        padding: '1rem 1.5rem',
                        height: '4.5rem',
                        borderBottom: `1px solid ${gray200}`,
                        fontWeight: 500,
                        '&:hover': {
                            backgroundColor: gray50
                        }
                    }
                }
            }
        },
        MuiPagination: {
            styleOverrides: {
                root: {
                    padding: '1rem',
                    display: 'flex',
                    '& .MuiPaginationItem-root': {
                        color: gray600,
                        fontWeight: 500,
                        lineHeight: '1.25rem',
                        padding: '0.5rem',
                        border: '0.5rem',
                        gap: '0.375rem',
                        minWidth: '2.5rem',
                        minHeight: '2.5rem',
                        '&.Mui-selected, &.Mui-selected:hover': {
                            color: gray800,
                            background: gray50
                        },
                        '&:hover': {
                            color: gray800,
                            background: gray50
                        }
                    },
                    '& .MuiPagination-ul': {
                        flexWrap: 'nowrap',
                        width: '100%',
                        '& li': {
                            '&:first-child': {
                                flexBasis: '100%',
                                display: 'flex',
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                                '& .MuiPaginationItem-root': {
                                    fontWeight: 600,
                                    '&:hover': { background: 'transparent' }
                                }
                            },
                            '&:last-child': {
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                flexBasis: '100%',
                                display: 'flex',
                                '& .MuiPaginationItem-root': {
                                    fontWeight: 600,
                                    '&:hover': { background: 'transparent' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
});

export default theme;