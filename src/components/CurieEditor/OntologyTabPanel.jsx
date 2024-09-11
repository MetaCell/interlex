import React from "react"
import { Grid, Stack } from "@mui/material";
import CustomAutocompleteBox from "../common/CustomAutocompleteBox";
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined';
import { getOrganizationOntologies } from "../../api/endpoints";

const OntologyTabPanel = () => {
    
    return (<Grid container>
        <Grid item xs={12} lg={6}>
            <Stack direction="column" mb={1}>
                <CustomAutocompleteBox
                    label="Search for organization ontology"
                    placeholder="Look for an ontology"
                    isEndAdornmentVisible={true}
                    value={""}
                    // onChange={handleTermChange}
                    startAdornment={
                        <FolderSharedOutlinedIcon />
                    }
                />
            </Stack>
        </Grid>
    </Grid>)
}

export default OntologyTabPanel;