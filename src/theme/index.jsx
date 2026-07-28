import { alpha, createTheme } from "@mui/material/styles";
import { vars } from "./variables";

const {
	primaryFont,
	white,
	brand600,
	paperShadow,
	gray300,
	gray600,
	gray700,
	gray900,
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
	error300,
	error500,
	error700,
	gray400,
	brand200,
	errorInputBoxShadow,
	black,
	brand400,
	error400,
	warning400,
	success400,
	blue200,
	blue700,
	brand500
} = vars;

const theme = createTheme({
	// Semantic colour tokens. `vars` stays the source of truth and feeds this; call sites should
	// consume the palette (color="primary", sx={{ color: "text.secondary" }}) rather than importing
	// `vars` directly. Only `main` is given where the design has no verified token at the tone MUI
	// expects for light/dark, so MUI derives those via tonalOffset. contrastText is always computed.
	palette: {
		mode: "light",
		primary: {
			light: brand400,
			main: brand600,
			dark: brand700
		},
		// Blue accent, matching the shipped MuiChip.colorSecondary.
		secondary: {
			light: blue200,
			main: blue700
		},
		info: {
			light: blue200,
			main: blue700
		},
		error: {
			light: error400,
			main: error500,
			dark: error700
		},
		warning: {
			light: warning400,
			main: warning500,
			dark: warning700
		},
		success: {
			light: success400,
			main: success500,
			dark: success700
		},
		grey: {
			50: gray50,
			100: gray100,
			200: gray200,
			300: gray300,
			400: gray400,
			500: gray500,
			600: gray600,
			700: gray700,
			800: gray800,
			900: gray900
		},
		text: {
			primary: gray900,
			secondary: gray500,
			disabled: gray400
		},
		background: {
			default: white,
			paper: white
		},
		// Matches the MuiDivider override, which makes `variant="outlined"` borders correct by default.
		divider: gray200,
		common: {
			black: black,
			white: white
		}
	},

	typography: {
		allVariants: {
			fontFamily: primaryFont,
		},
		h5: {
			color: gray600,
			fontWeight: 600,
		},
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

                code span {
                    font-family: 'Roboto Mono', monospace;
                }

                code span:first-of-type {
                    padding-top: 1.5rem;
                    border-top-left-radius: 0.75rem;
                }
                .messageArea {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: calc(100vh - 6.875rem);
                    .MuiTypography-root {
                        font-weight: 600;
                        color: ${gray900};
                    }
                }
                .authArea {
                    background: ${brand50};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    padding: 1rem 0;
                }
				.custom-toolbar {
					padding: 2rem !important;
				}
            `,
		},
		MuiTypography: {
			styleOverrides: {
				h6: {
					fontSize: '1.125rem',
					fontWeight: 600
				}
			}
		},
		MuiDivider: {
			styleOverrides: {
				root: {
					borderColor: gray200
				}
			}
		},
		// `borderColor` here predates the palette and now merely restates `palette.divider`; the
		// radius still has to be pinned because `shape` is deliberately left per-component.
		MuiCard: {
			styleOverrides: {
				root: {
					borderColor: gray200,
					borderRadius: "0.75rem",
					transition:
						"background-color 150ms ease-in-out, border-color 150ms ease-in-out, box-shadow 150ms ease-in-out",
					// Hover state of the clickable CellCards tile (Figma "State=Hover"): fill only,
					// border and radius unchanged. The click target itself lives on the grid item.
					"&:hover": {
						backgroundColor: gray50
					},
					// Selected tile (Figma "State=Focus", which the design reuses for selection):
					// 2px brand border + the `ring-brand` focus ring, on a white fill that has to be
					// restated so a selected tile does not pick up the gray hover fill. Listed after
					// `:hover` so it wins at equal specificity.
					"&.Mui-selected": {
						backgroundColor: white,
						borderColor: brand600,
						borderWidth: "2px",
						boxShadow: `0 0 0 4px ${alpha(brand500, 0.24)}`
					}
				}
			}
		},
		MuiCardContent: {
			styleOverrides: {
				root: {
					padding: "1rem",
					// MUI pads the last CardContent to 24px; keep every section uniform instead.
					"&:last-child": {
						paddingBottom: "1rem"
					}
				}
			}
		},
		MuiRichTreeView: {
			styleOverrides: {
				backgroundColor: "red",
				root: {
					"& .MuiTreeItem-root": {
						position: "relative",
						"&:before": {
							position: "absolute",
							left: "-10px",
							top: "0px",
							borderLeft: `1px solid ${gray400}`,
							borderBottom: `1px solid ${gray400}`,
							content: '""',
							width: ".5rem",
							height: "1em",
							borderBottomLeftRadius: "50%",
						},
						"&:after": {
							position: "absolute",
							left: "-10px",
							bottom: "0px",
							borderLeft: `1px solid ${gray400}`,
							content: '""',
							width: ".5rem",
							height: "100%",
						},
						"&:last-of-type": {
							"&:after": {
								display: "none",
							},
						},
					},
				},
			},
		},
		MuiTabs: {
			styleOverrides: {
				flexContainer: {
					gap: "2.25rem",
				},
				scrollableY: {
					"& .MuiTabs-indicator": {
						right: "auto",
						left: 0,
						background: brand600,
						borderRadius: "3.125rem",
					},
				},
			},
		},

		MuiTab: {
			styleOverrides: {
				root: {
					textTransform: "none",
					padding: "0rem 0.75rem",
					fontSize: "1.125rem",
					fontWeight: 500,
					lineHeight: "155.556%",
					letterSpacing: "normal",
					textAlign: "left",
					alignItems: "flex-start",
					justifyContent: "flex-start",
					minHeight: "0.0625rem",
					color: gray500,

					"&.Mui-selected": {
						color: brand600,
					},
				},
			},
		},

		MuiTouchRipple: {
			styleOverrides: {
				ripple: {
					display: "none",
				},
			},
		},

		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					borderRadius: "0.5rem",
					"& .MuiOutlinedInput-notchedOutline": {
						borderColor: gray200,
					},
					"&:hover .MuiOutlinedInput-notchedOutline": {
						borderColor: gray200,
					},
					"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
						borderColor: gray200,
						borderWidth: "0.0625rem",
					},
					"&.Mui-error": {
						"& .MuiOutlinedInput-notchedOutline": {
							borderColor: error300,
						},
						"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
							boxShadow: errorInputBoxShadow,
						},
						"& .MuiInputAdornment-root": {
							color: error500
						},
						"& .MuiIconButton-root": {
							color: error500
						}
					},
					'&.Mui-disabled': {
						background: gray50,
						WebkitTextFillColor: `${gray500} !important`
					}
				},
				sizeSmall: {
					padding: '0.5rem 0.75rem',
					'& input': { padding: 0 }
				}
			},
		},

		MuiContainer: {
			styleOverrides: {
				maxWidthXl: {
					"@media screen and (min-width: 96rem)": {
						maxWidth: "104.5rem",
					},
				},
			},
		},

		MuiChip: {
			styleOverrides: {
				root: {
					height: "1.375rem",
					padding: "0 0.375rem",
					fontSize: "0.75rem",
					borderRadius: "0.375rem !important",
					fontWeight: 500,
					width: "fit-content",
					maxWidth: "100%",
					minWidth: 0,

					"&.rounded": {
						padding: "0.125rem 0.5rem 0.125rem 0.375rem",
						height: "1.5rem",
						gap: ".25rem",
						borderRadius: "1rem !important",
						fontSize: "0.75rem",

						"& .MuiChip-icon": {
							margin: 0,
							width: ".75rem",
							height: ".75rem",
							color: gray500,
						},
					},

					"&.not-merged": {
						border: `1px solid ${warning200}`,
						background: warning50,
						color: warning700,

						"& .MuiChip-icon": {
							color: warning500,
						},
					},

					"&.green-glow-chip": {
						borderRadius: "0.375rem",
						background: brand25,
						border: `1px solid ${brand300}`,
					},

					"&.IDchip-outlined": {
						padding: "0.125rem 0.5rem",
						border: `1.5px solid ${gray600}`,
						background: "transparent",
						color: gray700,
					},

					"&.dual-text-chip": {
						background: gray50,
						color: gray700,
						borderColor: gray200,
						padding: "0.125rem 0.625rem",

						"& span": {
							"& span": {
								"& span": {
									color: gray500,
									fontWeight: 400,
								},
							},
						},
					},

					"&.greenChip": {
						color: gray700,
						borderColor: brand300,
						boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
						background: brand25,
					},

					"&.darkGreen": {
						color: brand700,
						border: `1.5px solid ${brand600}`,
						background: "transparent",
					},
					"&: has(.MuiSvgIcon-root)": {
						flexDirection: "row-reverse",
					},
				},
				label: {
					padding: 0,
					// Chip text is often an ontology term of unbounded length, so cap every label and
					// ellipsize. 20ch resolves to 160px here, which is 23-29 characters depending on
					// letter widths. Chips whose label can exceed that should pass a `title` so the
					// full value stays readable on hover.
					maxWidth: "20ch",
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
				},
				outlined: {
					borderColor: gray300,
					color: gray700,
					boxShadow: "0rem 0.0625rem 0.125rem 0rem rgba(16, 24, 40, 0.05)",
				},
				colorPrimary: {
					padding: "0.13rem 0.5rem",
					display: "flex",
					gap: "0.25rem",
					borderRadius: "1rem",
					border: `1px solid ${brand200}`,
					background: brand50,
					color: brand700,
				},
				colorSecondary: {
					padding: "0.13rem 0.5rem",
					display: "flex",
					gap: "0.25rem",
					borderRadius: "1rem",
					border: `1px solid #B9E6FE`,
					background: "#F0F9FF",
					color: "#026AA2",
				},
				colorSuccess: {
					padding: "0.13rem 0.5rem",
					display: "flex",
					gap: "0.25rem",
					borderRadius: "1rem",
					border: `1px solid ${success200}`,
					background: success50,
					color: success700,
					"& .MuiSvgIcon-root": {
						margin: 0,
						width: "0.75rem",
						height: "0.75rem",
					},
				},
				colorError: {
					padding: "0.13rem 0.5rem",
					display: "flex",
					gap: "0.25rem",
					borderRadius: "1rem",
					border: `1px solid ${error200}`,
					background: error50,
					color: error700,
					"& .MuiSvgIcon-root": {
						margin: 0,
						width: "0.75rem",
						height: "0.75rem",
					},
				},
				colorWarning: {
					padding: "0.13rem 0.5rem",
					display: "flex",
					gap: "0.25rem",
					borderRadius: "1rem",
					border: `1px solid ${warning200}`,
					background: warning50,
					color: warning700,
				},
				colorDefault: {
					padding: "0.13rem 0.5rem",
					display: "flex",
					gap: "0.25rem",
					borderRadius: "1rem",
					border: `1px solid ${gray200}`,
					background: gray50,
					color: gray700,
					"& .MuiSvgIcon-root": {
						margin: 0,
						width: "0.75rem",
						height: "0.75rem",
					},
				},
			},
		},

		MuiAutocomplete: {
			styleOverrides: {
				listbox: {
					padding: 0,

					"& .MuiAutocomplete-option": {
						padding: "0 0.625rem 0 0.5rem",
						height: "2.625rem",
						borderRadius: "0.375rem",

						"&:not(:first-of-type)": {
							marginTop: "0.375rem",
						},

						"&:hover": {
							backgroundColor: gray50,
						},

						'&[aria-selected="true"]': {
							backgroundColor: gray50,
						},
					},
				},
				paper: {
					boxShadow: "none",
					borderRadius: "0 0 0.5rem 0.5rem",
					border: `0.0625rem solid ${gray200}`,
					borderTop: "none",
				},
				root: {
					"& .MuiOutlinedInput-root": {
						padding: "0.5rem !important",
						height: "2.5rem",
						background: gray25,
						borderRadius: "0.5rem",
						"&.Mui-focused": {
							background: white,
						},
						"& .MuiAutocomplete-input": {
							padding: 0,
							color: gray700,
							fontSize: "0.875rem",
							fontWeight: 500,
							lineHeight: "142.857%",
							"&::placeholder": {
								opacity: 1,
								color: gray500,
							},
						},
					},
				},
			},
		},

		MuiButton: {
			defaultProps: {
				disableElevation: true,
			},
			styleOverrides: {
				root: {
					fontSize: "0.875rem",
					textTransform: "none",
					fontWeight: 600,
					borderRadius: "0.5rem",
					height: "2.5rem",
					padding: "0 1rem",
					gap: "0.25rem",
					display: "inline-flex",
					alignItems: "center",
				},
				containedPrimary: {
					background: brand600,
					"&:hover": {
						background: brand700,
					},
					"&:focus": {
						background: brand600,
						boxShadow:
							"0rem 0.0625rem 0.125rem 0rem rgba(16, 24, 40, 0.05), 0rem 0rem 0rem 0.25rem rgba(50, 129, 115, 0.24)",
					},
				},
				outlinedPrimary: {
					borderColor: gray300,
					color: gray700,
					background: white,
					"&:hover": {
						background: gray50,
						borderColor: gray300,
					},
					"&:focus": {
						background: white,
						borderColor: gray300,
						boxShadow:
							"0rem 0.0625rem 0.125rem 0rem rgba(16, 24, 40, 0.05), 0rem 0rem 0rem 0.25rem rgba(152, 162, 179, 0.14)",
					},
				},
				textPrimary: {
					color: gray600,
					background: white,
					padding: "0.625rem 0.875rem",
					"&:hover": {
						background: gray100,
						color: gray700,
					},
					"&:focus": {
						background: white,
					},
				},
				textSecondary: {
					color: brand700,
					padding: "0.625rem 0.875rem",

					"&:hover": {
						background: brand50,
					},
				},
			},
		},

		MuiBadge: {
			styleOverrides: {
				dot: {
					width: "0.625rem",
					borderRadius: "50%",
					bottom: "0.3125rem",
					right: "0.3125rem",
					height: "0.625rem",
				},
				colorSuccess: {
					background: success500,
				},
			},
		},

		MuiIconButton: {
			styleOverrides: {
				root: {
					borderRadius: "0.5rem",
					background: white,

					"&:hover": {
						background: white,
					},

					"&.outlined": {
						border: `0.0625rem solid #CCD0D9`,
					},
				},
			},
		},
		MuiCheckbox: {
			styleOverrides: {
				colorPrimary: {
					"&.Mui-checked": {
						color: brand600,
					},
				},
			},
		},
		MuiFormControl: {
			styleOverrides: {
				root: {
					"& .MuiFormLabel-root": {
						lineHeight: "1.25rem",
						color: gray600,
						fontSize: "0.875rem",
						fontWeight: 500,
						"&.Mui-focused": {
							color: gray600,
						},
					},
					"& .MuiFormControlLabel-root": {
						margin: 0,
						gap: "0.5rem",
						"& .MuiCheckbox-root": {
							padding: 0,
						},
					},
					"& .MuiFormControlLabel-label": {
						color: gray700,
						fontWeight: 500,
						fontSize: "0.875rem",
						lineHeight: "1.25rem",
						whiteSpace: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis",
						width: "12.5rem",
					},
				},
			},
		},

		MuiButtonGroup: {
			styleOverrides: {
				root: {
					borderRadius: "0.5rem",

					"& .MuiButton-root": {
						padding: "0.625rem 0.875rem",
					}
				},
				outlined: {
					boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",

					"& .MuiButton-root:focus": {
						boxShadow: "none",
						background: gray50,
					},
					"& .MuiButtonGroup-firstButton:hover": {
						borderRightColor: "transparent",
					},
				},
				contained: {
					boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",

					"& .MuiButtonGroup-firstButton": {
						borderColor: white,
					}
				}
			},
		},

		MuiSvgIcon: {
			styleOverrides: {
				fontSizeSmall: {
					width: "1rem",
					height: "1rem",
					fontSize: "1rem",
				},
				fontSizeMedium: {
					width: "1.25rem",
					height: "1.25rem",
					fontSize: "1.25rem",
				},
				fontSizeLarge: {
					fontSize: '2rem'
				}
			},
		},
		MuiAccordion: {
			styleOverrides: {
				root: {
					boxShadow: "none",
					"&:before": {
						display: "none",
					},
					"& .MuiAccordionSummary-root": {
						paddingLeft: 0,
						gap: ".5rem",
						flexDirection: "row-reverse",
						alignItems: "center",
						justifyContent: "space-between",

						"& .MuiTypography-root": {
							fontSize: "0.875rem",
							color: gray600,
							fontWeight: 500,
						},
						"& .MuiSvgIcon-root": {
							color: gray600,
						},
						"& .MuiAccordionSummary-expandIconWrapper": {
							"& .MuiSvgIcon-root": {
								color: gray500,
							},
						},
						"& .MuiAccordionSummary-content": {
							alignItems: "center",
							justifyContent: "space-between",
							"& .MuiButtonGroup-root": {
								"& .MuiButtonBase-root": {
									"& .MuiSvgIcon-root": {
										color: "initial",
									},
								},
							},
						},
					},
				},
			},
		},

		MuiMenu: {
			styleOverrides: {
				root: {
					borderRadius: "0.5rem",
					boxShadow:
						"0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)",
					border: `1px solid ${gray200}`,
					"& .MuiList-root": {
						display: "flex",
						flexDirection: "column",
						gap: "1px",
						padding: "0.25rem 0.375rem",
					},
					"& .MuiMenuItem-root": {
						padding: "0.563rem 0.625rem",
						fontSize: "0.875rem",
						fontWeight: 500,
						color: "#3B403F",
						borderRadius: "0.375rem",
						"&:hover": {
							background: gray50,
						},
						"&.Mui-selected": {
							backgroundColor: gray50,
							"&:hover": {
								backgroundColor: gray50,
							},
						},
					},
				},
			},
		},

		MuiAvatar: {
			styleOverrides: {
				root: {
					backgroundColor: gray100,
					border: "0.5px solid rgba(0, 0, 0, 0.08)",
					fontSize: "0.75rem",
					fontWeight: 600,
					color: gray600,
					textTransform: "uppercase",
				},
			},
		},

		MuiTable: {
			styleOverrides: {
				root: {
					"& .MuiTableHead-root": {
						"& .MuiTableCell-root": {
							padding: "0.75rem 1.5rem",
							background: gray50,
							lineHeight: "1.25rem",
							height: "2.75rem",
						},
						"& .MuiTableSortLabel-root": {
							display: "flex",
							justifyContent: "space-between",
							fontSize: "0.75rem",
							color: gray600,
							fontWeight: 500,
							"&.Mui-active": {
								color: gray600,
							},
							"& .MuiSvgIcon-root": {
								width: "1rem",
								height: "1rem",
								fill: gray600,
								opacity: 1,
							},
							"&:hover": {
								color: gray700,
								"& .MuiSvgIcon-root": {
									fill: gray700,
									opacity: 1,
								},
							},
						},
					},
					"& .MuiTableCell-root": {
						padding: "1rem 1.5rem",
						height: "4.5rem",
						borderBottom: `1px solid ${gray200}`,
						fontWeight: 500,
						"&:hover": {
							backgroundColor: gray50,
						},
					},
				},
			},
		},
		MuiPagination: {
			styleOverrides: {
				root: {
					padding: "1rem",
					display: "flex",
					"& .MuiPaginationItem-root": {
						color: gray600,
						fontWeight: 500,
						lineHeight: "1.25rem",
						padding: "0.5rem",
						border: "0.5rem",
						gap: "0.375rem",
						minWidth: "2.5rem",
						minHeight: "2.5rem",
						"&.Mui-selected, &.Mui-selected:hover": {
							color: gray800,
							background: gray50,
						},
						"&:hover": {
							color: gray800,
							background: gray50,
						},
					},
					"& .MuiPagination-ul": {
						flexWrap: "nowrap",
						width: "100%",
						"& li": {
							"&:first-of-type": {
								flexBasis: "100%",
								display: "flex",
								justifyContent: "flex-start",
								alignItems: "center",
								"& .MuiPaginationItem-root": {
									fontWeight: 600,
									"&:hover": { background: "transparent" },
								},
							},
							"&:last-child": {
								justifyContent: "flex-end",
								alignItems: "center",
								flexBasis: "100%",
								display: "flex",
								"& .MuiPaginationItem-root": {
									fontWeight: 600,
									"&:hover": { background: "transparent" },
								},
							},
						},
					},
				},
			},
		},
		MuiTooltip: {
			styleOverrides: {
				tooltip: {
					padding: "0.5rem 0.75rem",
					borderRadius: "0.5rem",
					backgroundColor: "#111212 !important",
					color: "#fff",
					fontSize: "0.75rem",
					fontWeight: 600,
				},
			},
		},

		MuiMobileStepper: {
			styleOverrides: {
				dots: {
					gap: "0.75rem"
				},
				dot: {
					width: ".5rem",
					height: ".5rem",
					backgroundColor: gray200,
					margin: 0
				},
				dotActive: {
					backgroundColor: brand700,
				},
			},
		},
		MuiDataGrid: {
			styleOverrides: {
				root: {
					height: "90%",
					borderColor: gray200,
					borderRadius: ".75rem",
					boxShadow:
						"0px 1px 3px 0px rgba(16, 24, 40, 0.10), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)",

					"& .MuiDataGrid-columnHeaderRow": {
						backgroundColor: "red",
					},
				},
				columnHeaders: {
					width: "100% !important",
					'& [role="row"]': {
						backgroundColor: `${gray200} !important`,
						border: "0 !important",
					},
				},
			},
		},
		MuiToggleButtonGroup: {
			styleOverrides: {
				root: {
					"& .MuiButtonBase-root": {
						border: `1px solid ${gray300}`,
						fontSize: ".875rem",
						borderRadius: ".5rem",
						textTransform: "none",
						height: "2.5rem",

						"&.MuiToggleButtonGroup-firstButton": {
							borderTopRightRadius: 0,
							borderBottomRightRadius: 0,
						},

						"&.MuiToggleButtonGroup-lastButton": {
							borderTopLeftRadius: 0,
							borderBottomLeftRadius: 0,
						},

						'&[aria-pressed="true"]': {
							backgroundColor: gray50,
							color: gray800,
							"& .MuiSvgIcon-root": {
								color: gray800,
							},
						},
						color: gray700,
						"& .MuiSvgIcon-root": {
							color: gray700,
						},
					},
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					"&.authPaper": {
						borderRadius: "2rem",
						boxShadow: paperShadow,
						padding: "3rem 4rem",
						"& .authLink": {
							color: brand700,
							fontSize: "0.875rem",
							textDecoration: "none",
							fontWeight: 600,
							display: "flex",
							gap: "6px",
							marginBottom: "2rem",
						},
						"& .MuiButton-text": {
							padding: 0,
							marginBottom: "1rem",
							"&:hover": {
								background: "transparent",
							},
						},
						"& .authForm": {
							marginTop: "2rem",
							"& .MuiTypography-body1": {
								fontWeight: 400,
								color: gray600,
								fontSize: "1rem",
							},
							"& .authlightButton": {
								background: "transparent",
								border: `1px solid ${gray300}`,
								color: gray700,
							},
							"& #orcidAuthButton": {
								display: "flex",
								alignItems: "center", 
								justifyContent: "center",
								gap: "0.25rem",
								fontSize: "1rem", 
								fontWeight: 600,
								textDecoration: "none",
								borderRadius: "0.5rem",
								height: "100%"
							},
							"& .authOption": {
								borderTop: `1px solid ${gray200}`,
								textAlign: "center",
								margin: "0.25rem 0 0",
								"& .MuiTypography-root": {
									textAlign: "center",
									background: "white",
									position: "relative",
									top: "-0.925rem",
									fontSize: "0.75rem",
									padding: "0 0.5rem",
									color: gray600,
									display: "inline-block",
								},
							},
							"& .authRemember": {
								"& .authLink": {
									marginBottom: 0,
								},
								"& .MuiCheckbox-root": {
									padding: "0.5rem",
								},
								"& .MuiFormControlLabel-label": {
									color: gray700,
									fontWeight: 500,
									fontSize: "0.875rem",
								},
								"& .MuiButton-text": {
									padding: 0,
									marginBottom: 0,
									color: brand700,
									fontWeight: 600,
									"&:hover": {
										background: "transparent",
									},
								},
								"& .MuiFormGroup-root": {
									display: "flex",
									flexDirection: "row",
									alignItems: "center",
									gap: 5,
									"& .MuiFormControlLabel-root": {
										margin: 0,
									},
									"& a": {
										color: gray600,
										fontWeight: 500,
										fontSize: "0.875rem",
									},
								},
							},
							"& .authFooter": {
								marginTop: "2rem",
								"& .MuiTypography-root": {
									fontSize: "0.875rem",
									fontWeight: 400,
									color: gray600,
									"& a": {
										color: brand700,
										fontWeight: 600,
										textDecoration: "none",
									},
								},
							},
							"& .MuiButtonBase-root": {
								fontSize: "1rem",
								height: "2.75rem",
							},
						},
						"& .MuiTypography-h4": {
							fontSize: "1.875rem",
							fontWeight: 600,
							marginBottom: "0.5rem",
						},
						"& .MuiTypography-body1": {
							color: gray600,
						},
						"& .MuiFormControl-root": {
							width: "100%",
							"& .MuiInputBase-root": {
								borderRadius: "0.5rem",
							},
							"& .MuiInputBase-input": {
								height: "2.75rem",
							},
							"& label": {
								fontSize: "0.875em",
								margin: "0 0 0.1rem",
								fontWeight: 500,
								color: gray700,
							},
							"& .MuiFormHelperText-root": {
								fontSize: "0.875em",
								margin: "0 0 0.1rem",
								fontWeight: 400,
								color: gray600,
							},
						},
					},
				},
			},
		}
	},
});

export default theme;
