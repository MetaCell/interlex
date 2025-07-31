import { useState } from "react"
import { Box, Grid, Typography, FormControl, Autocomplete, Chip, TextField, Divider, Button } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import CustomInputBox from "../../common/CustomInputBox"
import CustomizedInput from "../../common/CustomizedInput"
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

const URI_INPUT_STYLES = {
    width: "auto",
    flex: 1,
    height: "2.5rem",
    "& .MuiInputBase-input": {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
    },
}

const SecondStepContent = () => {
    const [superclass, setSuperclass] = useState("")
    const [subclassOf, setSubclassOf] = useState("")
    const [definitionUrls, setDefinitionUrls] = useState([])
    const [transitiveProperty, setTransitiveProperty] = useState("")
    const [definition, setDefinition] = useState("")
    const [comment, setComment] = useState("")
    const [searchTerm, setSearchTerm] = useState("Central Nervous System")

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
                    <CustomInputBox
                        id="superclass-field"
                        label="Superclass"
                        placeholder="Regional part of nervous system"
                        value={superclass}
                        onInputChange={(value) => setSuperclass(value)}
                        isEndAdornmentVisible
                    />
                </Grid>

                <Grid item xs={6}>
                    <Typography sx={{ color: gray800, fontWeight: 500, mb: 1.5 }}>Subclass of</Typography>
                    <Box display="flex">
                        <FormControl sx={{ minWidth: "6.375rem" }}>
                            <Box sx={URI_PREFIX_BOX_STYLES}>{URI_PREFIX}</Box>
                        </FormControl>
                        <CustomizedInput
                            placeholder="Regional part of nervous system"
                            value={subclassOf}
                            onChange={(e) => setSubclassOf(e.target.value)}
                            sx={URI_INPUT_STYLES}
                            isEndAdornmentVisible={true}
                        />
                    </Box>
                </Grid>

                <Grid item xs={6}>
                    <Typography sx={{ color: gray800, fontWeight: 500, mb: 1.5 }}>Is Defined by</Typography>
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
                    <CustomInputBox
                        id="transitive-property-field"
                        label="Transitive Property"
                        placeholder="i.e. owl:TransitiveProperty"
                        value={transitiveProperty}
                        onInputChange={(value) => setTransitiveProperty(value)}
                        isEndAdornmentVisible
                    />
                </Grid>

                <Grid item xs={12}>
                    <Typography sx={{ color: gray800, fontWeight: 500, mb: 1.5 }}>Definition</Typography>
                    <TextField
                        id="definition-textarea"
                        multiline
                        fullWidth
                        minRows={4}
                        value={definition}
                        onChange={(e) => setDefinition(e.target.value)}
                        placeholder="Enter definition..."
                    />
                </Grid>

                <Grid item xs={12}>
                    <Typography sx={{ color: gray800, fontWeight: 500, mb: 1.5 }}>Comment</Typography>
                    <TextField
                        id="comment-textarea"
                        multiline
                        fullWidth
                        minRows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Enter comment..."
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
                            <CustomizedInput
                                label="Subject"
                                placeholder="Subject term"
                                value={predicate.subject}
                                onChange={(e) => handlePredicateChange(index, "subject", e.target.value)}
                                helperText="The subject is prefilled."
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <CustomizedInput
                                label="Predicate"
                                placeholder="Enter predicate"
                                value={predicate.predicate}
                                onChange={(e) => handlePredicateChange(index, "predicate", e.target.value)}
                                helperText="This is a hint text to help user."
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
