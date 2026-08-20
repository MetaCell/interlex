import { alpha, createTheme } from "@mui/material/styles";
import { vars } from "./variables";

const {
	primaryFont,
	white,
	brand600,
	paperShadow,
	shadowSm,
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
	brand500,
	brand800,
	success25,
	warning25,
	error25
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
		// Widget/section title (Figma "Text md/Medium" + Gray/800) — the "Ontology hierarchy"
		// and "Terms" panel titles on the ontology Browse tab.
		sectionTitle: {
			color: gray800,
			fontSize: '1rem',
			fontWeight: 500,
			lineHeight: 1.5,
		},
		// An absent value in a Cell Card property row ("not specified"): body2, greyed and italic
		// (Figma "Biological properties item", empty state).
		notSpecified: {
			color: gray400,
			fontSize: '0.875rem',
			fontStyle: 'italic',
			lineHeight: 1.4285,
		},
		// The term the page is about, inside a hierarchy tree: body2 in brand, semibold, so it
		// reads as the anchor of the tree rather than as another row.
		currentTerm: {
			// brand600 is palette.primary.main — the tone the call-site `sx` used before this
			// became a variant, so the tree row keeps exactly its old colour.
			color: brand600,
			fontSize: '0.875rem',
			fontWeight: 600,
			lineHeight: 1.4285,
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
			defaultProps: {
				variantMapping: {
					sectionTitle: 'h2'
				}
			},
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
			// A bare Container is a full-bleed page section, not MUI's centred `lg` box. The
			// capped ones (Header banner, Footer, About, Partners) pass `maxWidth` explicitly.
			defaultProps: {
				maxWidth: false,
			},

			// Header band: title/breadcrumb/tabs above a divider, hence no bottom padding.
			// `variant` is not in Container's API; MUI matches it off ownerState anyway and
			// drops it before the DOM.
			variants: [
				{ props: { variant: "header" }, style: { paddingTop: "1.5rem" } },
			],

			styleOverrides: {
				// Page gutter. 5rem = (1920 - 1760) / 2, from the Figma frame's content column.
				//
				// On `maxWidthFalse` (the slot `maxWidth={false}` resolves to) and not `root`, so
				// the capped `maxWidth="xl"` containers keep MUI's gutters — for those, padding
				// adds to the centring offset instead of setting the margin.
				//
				// The `sm` restatement is required, not redundant: styleOverrides merge into
				// Container's style object, so a flat property lands in MUI's key position, ahead
				// of MUI's own `@media (min-width:600px)` gutter, which then wins from 600px up.
				//
				// Unconditional for now: docs/container-layout-migration.md.
				maxWidthFalse: {
					paddingLeft: "5rem",
					paddingRight: "5rem",
					"@media (min-width:600px)": {
						paddingLeft: "5rem",
						paddingRight: "5rem",
					},
				},

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
					// The design's badge is a pill (Figma "Badge", 9239:67792 — measured against a rendered
					// sweep, its corners match a radius of 10-11px on a 22px chip, which is what 1rem clamps
					// to). Every colour slot below has always declared 1rem; the `0.375rem !important` that
					// used to sit here overrode all of them, so no chip in the app was drawing its own radius.
					// `.green-glow-chip` still pins 6px on its own class, which beats this on specificity.
					borderRadius: "1rem",
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
				// An outlined chip is the design's badge without a hue (Figma "Badge", 9239:67792): a
				// 1px rule in the 200 tone over the 50 fill, flat. The colour slots below already draw
				// it that way, so this only has to stop overriding them with the heavier 300 rule and a
				// raised shadow, neither of which the badge has. `.greenChip` restates its own shadow
				// and still wins on specificity, so the one chip that is meant to lift keeps lifting.
				outlined: {
					borderColor: gray200,
					color: gray700,
					boxShadow: "none",
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
			// A full-width, two-line link tile that happens to be a Button, so the *whole* card is
			// one clickable target with real button/anchor semantics (focus ring, keyboard, middle
			// click) instead of a bordered Box with a link inside it.
			//
			// Here rather than in `sx` at the call site because it is a look, not layout: the fill,
			// border, radius, shadow and type all come from Figma tokens (9239:67808 — Base/White,
			// Gray/200, shadow-xs, Text sm Semibold/Regular in Gray/500).
			variants: [
				{
					props: { variant: "tile" },
					style: {
						width: "100%",
						height: "auto",
						padding: "1rem",
						gap: "1rem",
						justifyContent: "flex-start",
						textAlign: "left",
						background: white,
						border: `1px solid ${gray200}`,
						borderRadius: "0.5rem",
						boxShadow: "0rem 0.0625rem 0.125rem 0rem rgba(16, 24, 40, 0.05)",
						color: gray500,
						fontWeight: 400,
						"&:hover": {
							background: gray25,
							borderColor: gray300,
						},
						"&:focus-visible": {
							borderColor: brand600,
							boxShadow: `0rem 0rem 0rem 0.25rem ${alpha(brand500, 0.24)}`,
						},
						// The boxed glyph on the left (Figma "Featured icon", 40x40).
						"& .tileIcon": {
							flexShrink: 0,
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							width: "2.5rem",
							height: "2.5rem",
							border: `1px solid ${gray200}`,
							borderRadius: "0.5rem",
							color: gray500,
						},
						"& .tileTitle": {
							fontSize: "0.875rem",
							lineHeight: 1.4285,
							fontWeight: 600,
							color: gray500,
						},
						"& .tileSupporting": {
							fontSize: "0.875rem",
							lineHeight: 1.4285,
							fontWeight: 400,
							color: gray500,
						},
						// Trailing affordance: a plain glyph pushed to the right edge, no button chrome
						// of its own — the tile itself is the control.
						"& .tileAction": {
							flexShrink: 0,
							marginLeft: "auto",
							display: "inline-flex",
							color: gray500,
						},
					},
				},
			],
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
					// A 20px glyph sits 6px from its label on either side (Figma "Tertiary color"): the
					// root `gap` alone cannot produce that, because the icon slots' -4px/8px margins
					// override it and pull the glyph into the padding. `letterSpacing` goes for the same
					// reason — typography.button carries 0.02857em over from its uppercase default, which
					// the design does not have.
					gap: "0.375rem",
					letterSpacing: 0,
					"& .MuiButton-startIcon, & .MuiButton-endIcon": {
						marginLeft: 0,
						marginRight: 0,
					},
					// Hover darkens the label as well as tinting the ground (Figma 3287:429511).
					"&:hover": {
						background: brand50,
						color: brand800,
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

					// The Cell Card property rows' "filter grid view by" control, styled after the design
					// system's Buttons/Button, Hierarchy=Tertiary color, Icon=Only: resting Brand/700 (the
					// row's hover variant, 9535:92211), hovered Brand/800 on a Brand/50 fill (State=Hover,
					// 3287:429695). The root's 0.5rem radius above is already its rounded-8.
					"&.filterGridAction": {
						color: brand700,
						"&:hover": {
							background: brand50,
							color: brand800,
						},
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
			// The Cell Card widget tables (Figma "Table cell-editable", 9239:67836). The design
			// gives them the same metrics as the table above — 2.75rem header, 4.5rem rows,
			// 1.5rem gutters — so this carries only what it draws differently, and deliberately no
			// geometry of its own. Its surface is the outlined MuiTableContainer below.
			variants: [
				{
					props: { size: "small" },
					style: {
						// Column labels are Text xs/Medium in Gray/500, the same treatment a sortable
						// header already gets from MuiTableSortLabel above.
						"& .MuiTableHead-root .MuiTableCell-root": {
							fontSize: "0.75rem",
							color: gray500,
						},
						"& .MuiTableCell-root": {
							color: gray600,
							// These rows carry no action — the design has no hover state for them, and a
							// fill on the one cell under the pointer reads as a broken row highlight.
							"&:hover": {
								backgroundColor: "transparent",
							},
						},
						// The last row's rule is the container's bottom border; drawing both doubles it.
						"& .MuiTableBody-root .MuiTableRow-root:last-of-type .MuiTableCell-root": {
							borderBottom: 0,
						},
					},
				},
			],
		},
		MuiTableContainer: {
			// `<TableContainer component={Paper} variant="outlined">` is the design's table surface:
			// Paper brings the Gray/200 rule and the white fill, this adds the 12px corners and
			// shadow-sm. Scoped to the outlined variant because the tables that predate it supply
			// their own bordered Paper wrapper and would end up with two rules.
			variants: [
				{
					props: { variant: "outlined" },
					style: {
						// Beats MuiPaper's own 4px radius, which is a class of equal weight.
						"&.MuiPaper-root": {
							borderRadius: "0.75rem",
							boxShadow: shadowSm,
						},
					},
				},
			],
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
		// The Terms table on the ontology Browse tab. Column-header and cell metrics mirror the
		// MuiTable overrides above so the two table flavours read as one component.
		MuiDataGrid: {
			styleOverrides: {
				root: {
					// v7 paints this variable over the header and any pinned row, so the header fill
					// has to be set here rather than on the columnHeaders slot.
					"--DataGrid-containerBackground": gray50,
					borderColor: gray200,
					borderRadius: ".75rem",
					boxShadow: shadowSm,
					// The design has no vertical rules between columns.
					"& .MuiDataGrid-columnSeparator": {
						display: "none",
					},
				},
				columnHeaders: {
					borderTopLeftRadius: ".75rem",
					borderTopRightRadius: ".75rem",
				},
				columnHeaderTitle: {
					fontSize: "0.75rem",
					fontWeight: 500,
					color: gray600,
				},
				columnHeader: {
					padding: "0 1.5rem",
				},
				cell: {
					// 0.5rem of padding around two 1.25rem lines is exactly the 3.5rem row the grid
					// asks for, so a wrapped label or definition fits without changing the row.
					padding: "0.5rem 1.5rem",
					// flex is restated because a cell rendering an element rather than bare text
					// computes to display:block, which would leave alignItems inert and top-align
					// that column against its neighbours.
					display: "flex",
					alignItems: "center",
					whiteSpace: "normal",
					// The grid otherwise sets line-height to the whole row height to centre a single
					// line; flex does that job here, and a row-tall line-height would space wrapped
					// text by 3.5rem a line.
					lineHeight: "1.25rem",
					// Content taller than the row is clipped here rather than spilling over the
					// rows above and below it.
					overflow: "hidden",
					borderColor: gray200,
					color: gray600,
					// A centred column holds a control, not text: side padding would squeeze it and
					// trip the cell's own text-overflow ellipsis.
					"&.MuiDataGrid-cell--textCenter": {
						paddingLeft: 0,
						paddingRight: 0,
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
		// Components the Cell Card design leans on that had no override. Without these they render
		// as MUI defaults (MUI blue links, 4px radii, a shadowed Alert), and the only way to fix
		// that at the call site would be `sx` colours, which the project forbids. Kept to what the
		// design needs *everywhere*: per-instance choices (an Alert with no severity icon) belong
		// at the call site, and a look only one widget wants is scoped to a class.
		MuiAlert: {
			styleOverrides: {
				root: {
					borderRadius: "0.75rem",
					border: `1px solid ${gray200}`,
					padding: "0.75rem 1rem",
					fontSize: "0.875rem",
					lineHeight: 1.4285,
				},
				// Figma "Definition" banner: brand-tinted fill with a brand border.
				standardInfo: {
					backgroundColor: brand25,
					borderColor: brand300,
					color: gray700,
				},
				standardSuccess: {
					backgroundColor: success25,
					borderColor: success200,
				},
				standardWarning: {
					backgroundColor: warning25,
					borderColor: warning200,
				},
				standardError: {
					backgroundColor: error25,
					borderColor: error200,
				},
				message: {
					padding: 0,
					width: "100%",
				},
				action: {
					paddingTop: 0,
					marginRight: 0,
				},
			},
		},
		MuiAlertTitle: {
			styleOverrides: {
				root: {
					fontSize: "0.875rem",
					fontWeight: 600,
					color: gray800,
					marginBottom: "0.25rem",
				},
			},
		},
		MuiLink: {
			defaultProps: {
				underline: "hover",
			},
			styleOverrides: {
				root: {
					// Every value link in the Cell Card is brand-coloured and semibold, per the
					// design's teal property values.
					color: brand700,
					fontWeight: 500,
					cursor: "pointer",
					"&:hover": {
						color: brand800,
					},
				},
			},
		},
		MuiSkeleton: {
			defaultProps: {
				animation: "wave",
			},
			styleOverrides: {
				root: {
					backgroundColor: gray100,
					borderRadius: "0.375rem",
				},
			},
		},
		MuiList: {
			styleOverrides: {
				root: {
					paddingTop: 0,
					paddingBottom: 0,
				},
			},
		},
		MuiListItemButton: {
			styleOverrides: {
				root: {
					// "Other cells from this source" tiles: an outlined row, not a filled list item.
					// Scoped to the class rather than every ListItemButton in the app — the Header's
					// nav dropdown and the About page link lists are ListItemButtons too.
					"&.cellCardTile": {
						border: `1px solid ${gray200}`,
						borderRadius: "0.5rem",
						padding: "0.5rem 0.75rem",
						"&:hover": {
							backgroundColor: gray25,
							borderColor: gray300,
						},
					},
				},
			},
		},
		MuiListItemText: {
			styleOverrides: {
				primary: {
					fontSize: "0.875rem",
					fontWeight: 500,
					color: gray700,
				},
				secondary: {
					fontSize: "0.75rem",
					color: gray500,
				},
			},
		},
		MuiDialogTitle: {
			styleOverrides: {
				root: {
					fontSize: "1rem",
					fontWeight: 500,
					color: gray800,
					padding: "1rem 1.5rem",
					borderBottom: `1px solid ${gray200}`,
				},
			},
		},
		MuiDialogContent: {
			styleOverrides: {
				root: {
					padding: "1.5rem",
				},
			},
		},
		MuiPopover: {
			styleOverrides: {
				paper: {
					borderRadius: "0.75rem",
					border: `1px solid ${gray200}`,
					boxShadow: paperShadow,
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					// Relationship Graph frame (Figma 9478:72004): a 12px outlined surface with the
					// legend bar tucked inside it, so the corners have to clip.
					"&.graphFrame": {
						borderRadius: "0.75rem",
						overflow: "hidden",
					},
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
