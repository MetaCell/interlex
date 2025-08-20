import React from "react"
import { useState } from "react"
import { Box, Grid, Typography, FormControl, Autocomplete, Chip, TextField, Divider, Button } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import CustomFormField from "../../common/CustomFormField"
import PredicateGroupInput from "../../SingleTermView/OverView/PredicateGroupInput"
import { HelpOutlinedIcon } from "../../../Icons"
import { vars } from "../../../theme/variables"

const { white, gray300, gray500, gray600, gray800 } = vars

const URI_PREFIX = "http://uri.interlex.org/Interlex/uris/"

const AUTOCOMPLETE_STYLES = {
    "& .MuiOutlinedInput-root": {
        background: white,
        borderColor: gray300,
    },
    "& .MuiOutlinedInput-root .MuiAutocomplete-input": {
        color: gray500,
        fontWeight: 400,
    },
    "& .MuiAutocomplete-popupIndicator": {
        transform: "none !important",
    },
}

const URI_PREFIX_BOX_STYLES = {
    fontSize: "1rem",
    border: `1px solid ${gray300}`,
    borderRadius: "0.5rem",
    borderRight: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    height: "2.5rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: gray600,
    padding: "0.5rem 0.75rem",
}

const SecondStepContent = () => {
    const [superclass, setSuperclass] = useState("")
    const [subclassOf, setSubclassOf] = useState("")
    const [definitionUrls, setDefinitionUrls] = useState([])
    const [transitiveProperty, setTransitiveProperty] = useState("")
    const [definition, setDefinition] = useState("")
    const [comment, setComment] = useState("")
    const [searchTerm] = useState("Central Nervous System")

    const [predicates, setPredicates] = useState([
        {
            subject: "",
            predicate: "",
            object: { type: "Object", value: "", isLink: false },
        },
    ])

    const [urlOptions] = useState([])

    const handleDefinitionUrlsChange = (event, newValue) => {
        setDefinitionUrls(newValue)
    }

    const handleAddPredicate = () => {
        setPredicates([
            ...predicates,
            {
                subject: searchTerm,
                predicate: "",
                object: { type: "Object", value: "", isLink: false },
            },
        ])
    }

    const handlePredicateChange = (index, field, value) => {
        const newPredicates = [...predicates]
        newPredicates[index] = { ...newPredicates[index], [field]: value }
        setPredicates(newPredicates)
    }

    const handleRemovePredicate = (index) => {
        if (predicates.length > 1) {
            setPredicates(predicates.filter((_, i) => i !== index))
        }
    }

    return (
        <Box
            sx={{
                px: "3.25rem",
                pt: "1.75rem",
                pb: "2.5rem",
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "2.75rem",
                height: 1,
            }}
        >
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <Typography variant="h6">Term metadata overview</Typography>
                </Grid>

                <Grid item xs={6}>
                    <CustomFormField
                        label="Superclass"
                        placeholder="Regional part of nervous system"
                        value={superclass}
                        onChange={(value) => setSuperclass(value)}
                        isEndAdornmentVisible
                        textFontSize="body1"
                        labelColor={gray800}
                    />
                </Grid>

                <Grid item xs={6}>
                    <Typography variant="body1" sx={{ color: gray800, fontWeight: 500, mb: "0.375rem" }}>Subclass of</Typography>
                    <Box display="flex" sx={{ "& .MuiBox-root": { width: "auto", flex: 1 } }}>
                        <FormControl sx={{ minWidth: "6.375rem", height: "2.5rem" }}>
                            <Box sx={URI_PREFIX_BOX_STYLES}>{URI_PREFIX}</Box>
                        </FormControl>
                        <CustomFormField
                            placeholder="Regional part of nervous system"
                            value={subclassOf}
                            onChange={(e) => setSubclassOf(e.target.value)}
                            sx={{
                                "& .MuiInputBase-input": {
                                    borderTopLeftRadius: 0,
                                    borderBottomLeftRadius: 0
                                }
                            }}
                            isEndAdornmentVisible
                        />
                    </Box>
                </Grid>

                <Grid item xs={6}>
                    <Typography variant="body1" sx={{ color: gray800, fontWeight: 500, mb: "0.375rem" }}>Is Defined by</Typography>
                    <Autocomplete
                        multiple
                        id="definition-urls-autocomplete"
                        value={definitionUrls}
                        onChange={handleDefinitionUrlsChange}
                        popupIcon={<HelpOutlinedIcon />}
                        options={urlOptions}
                        freeSolo
                        getOptionLabel={(option) => (typeof option === "string" ? option : option.title)}
                        renderTags={(values, getTagProps) =>
                            values.map((option, index) => (
                                <Chip
                                    key={index}
                                    label={typeof option === "string" ? option : option.title}
                                    {...getTagProps({ index })}
                                />
                            ))
                        }
                        fullWidth
                        renderInput={(params) => <TextField {...params} placeholder="Search for an URL" />}
                        sx={AUTOCOMPLETE_STYLES}
                    />
                </Grid>

                <Grid item xs={6}>
                    <CustomFormField
                        label="Transitive Property"
                        placeholder="i.e. owl:TransitiveProperty"
                        value={transitiveProperty}
                        onChange={(value) => setTransitiveProperty(value)}
                        isEndAdornmentVisible
                        textFontSize="body1"
                        labelColor={gray800}
                    />
                </Grid>

                <Grid item xs={12}>
                    <CustomFormField
                        multiline
                        fullWidth
                        minRows={4}
                        value={definition}
                        label="Definition"
                        onChange={(e) => setDefinition(e.target.value)}
                        placeholder="Enter definition..."
                        textFontSize="body1"
                        labelColor={gray800}
                    />
                </Grid>

                <Grid item xs={12}>
                    <CustomFormField
                        multiline
                        fullWidth
                        minRows={4}
                        value={comment}
                        label="Comment"
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Enter comment..."
                        textFontSize="body1"
                        labelColor={gray800}
                    />
                </Grid>
            </Grid>

            <Divider />

            <Grid container spacing={5.5}>
                <Grid item xs={12}>
                    <Typography variant="h6">Add new predicate(s) to {searchTerm}</Typography>
                    <Typography sx={{ color: gray600 }}>
                        Add more predicates to further define this term. This is optional and can be done later.
                    </Typography>
                </Grid>

                {predicates.map((predicate, index) => (
                    <React.Fragment key={index}>
                        <Grid item xs={4}>
                            <CustomFormField
                                label="Subject"
                                placeholder="Subject term"
                                value={predicate.subject}
                                onChange={(e) => handlePredicateChange(index, "subject", e.target.value)}
                                helperText="The subject is prefilled."
                                textFontSize="body1"
                                labelColor={gray800}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <CustomFormField
                                label="Predicate"
                                placeholder="Enter predicate"
                                value={predicate.predicate}
                                onInputChange={(e) => handlePredicateChange(index, "predicate", e.target.value)}
                                helperText="This is a hint text to help user."
                                textFontSize="body1"
                                labelColor={gray800}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <PredicateGroupInput
                                predicate={predicate}
                                onChange={(value) => handlePredicateChange(index, "object", value)}
                                onRemove={predicates.length > 1 ? () => handleRemovePredicate(index) : undefined}
                            />
                        </Grid>
                    </React.Fragment>
                ))}

                <Grid item xs={12}>
                    <Button
                        variant="outlined"
                        onClick={handleAddPredicate}
                        startIcon={<AddIcon />}
                        sx={{ textTransform: "none" }}
                    >
                        Add a new predicate
                    </Button>
                </Grid>
            </Grid>
        </Box>
    )
}

export default SecondStepContent;
