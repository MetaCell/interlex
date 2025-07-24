import { useState } from "react";
import { Box, Divider, Stack, Typography, Autocomplete, Chip, TextField } from "@mui/material";
import CustomSingleSelect from "../../common/CustomSingleSelect";
import CustomizedInput from "../../common/CustomizedInput";
import NewTermSidebar from "../NewTermSidebar";
import { HelpOutlinedIcon } from "../../../Icons";

const TYPES = ["Term", "Relationship", "Ontology"]

const FirstStepContent = ({
    openSidebar,
    loading,
    onToggle,
    termResults,
    isResultsEmpty,
    selectedType,
    onTypeChange
}) => {

    const [value, setValue] = useState([top100Films[0]]);

    return (
        <Box display="flex" height={1}>
            <Box sx={{
                px: '3.25rem',
                pt: '1.75rem',
                pb: '2.5rem',
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '2.75rem'
            }}>
                <Stack spacing={0.5}>
                    <Typography variant='h6'>How would you like to proceed?</Typography>
                    <Typography variant='body1' sx={{ color: "#515252" }}>
                        Link this term to an existing source, either by reusing an existing ID or by specifying an exact synonym.
                    </Typography>
                </Stack>
                <Stack spacing={3}>
                    <Stack>
                        <Typography variant='h6' sx={{ fontWeight: 500 }}>Exact synonyms</Typography>
                        <Typography variant='body1' sx={{ color: "#515252" }}>
                            Synonyms are especially useful when the term is known by different names.
                            Please enter the type, label and exact synonym(s) for your object.
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={3}>
                        <CustomSingleSelect
                            isFormControlFullWidth={true}
                            options={TYPES}
                            placeholder='Select object type'
                            value={selectedType}
                            onChange={onTypeChange}
                        />
                        <CustomizedInput
                            placeholder='Term label (i.e. Central Nervous System)'
                            endAdornment={<HelpOutlinedIcon />}
                        />
                    </Stack>
                    <Autocomplete
                        multiple
                        id="autocomplete-tags"
                        value={value}
                        onChange={(event, newValue) => {
                            setValue([
                                ...newValue,
                            ]);
                        }}
                        popupIcon={<HelpOutlinedIcon />}
                        options={top100Films}
                        getOptionLabel={(option) => option.title}
                        renderValue={(values, getItemProps) =>
                            values.map((option, index) => {
                                const { key, ...itemProps } = getItemProps({ index });
                                return (
                                    <Chip
                                        key={key}
                                        label={option.title}
                                        {...itemProps}
                                    />
                                );
                            })
                        }
                        fullWidth
                        renderInput={(params) => (
                            <TextField {...params} placeholder="Enter exact synonym(s)" />
                        )}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                background: "#fff",
                                borderColor: "#BDC2C1"
                            },
                            '& .MuiOutlinedInput-root .MuiAutocomplete-input': {
                                color: "#707574",
                                fontWeight: 400
                            },
                            '& .MuiAutocomplete-popupIndicator': {
                                transform: 'none !important',
                            }
                        }}
                    />
                </Stack>
                <Divider />
                <Box>
                    <Stack sx={{ mb: 3 }}>
                        <Typography variant='h6' sx={{ fontWeight: 500 }}>Existing IDs</Typography>
                        <Typography variant='body1' sx={{ color: "#515252" }}>
                            Synonyms are especially useful when the term is known by different names.
                        </Typography>
                    </Stack>
                    <CustomizedInput
                        placeholder='Type existing ID(s)'
                        endAdornment={<HelpOutlinedIcon />}
                    />
                </Box>
            </Box>
            <NewTermSidebar
                open={openSidebar}
                loading={loading}
                onToggle={onToggle}
                results={termResults}
                isResultsEmpty={isResultsEmpty}
            />
        </Box>
    )
};

export default FirstStepContent;

const top100Films = [
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'The Godfather', year: 1972 },
    { title: 'The Godfather: Part II', year: 1974 },
    { title: 'The Dark Knight', year: 2008 },
    { title: '12 Angry Men', year: 1957 },
    { title: "Schindler's List", year: 1993 },
    { title: 'Pulp Fiction', year: 1994 }
]