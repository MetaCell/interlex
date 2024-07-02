import { useState } from "react";
import { Box, Stack, Typography, FormControl, Divider } from "@mui/material";
import CustomizedInput from "../common/CustomizedInput";
import ImportFile from "./ImportFile";
import Checkbox from "../common/CustomCheckbox";
import { CSVIcon } from "../../Icons";
import { vars } from "../../theme/variables";

const { gray300, gray800, gray600, gray700, gray200 } = vars;


const ImportFileTab = () => {
    const [files, setFiles] = useState([]);
    const [url, setUrl] = useState('');

    const handleChangeUrl = (event) => {
        setUrl(event.target.value);
    }

    return (
        <Box sx={{ width: '100%', mt: '2.75rem', display: 'flex', flexDirection: 'column', gap: '2.75rem' }}>
            <Stack direction="column" spacing={1.5}>
                <Typography sx={{ color: gray800, fontWeight: 500 }}>Import by URL</Typography>
                <Box display='flex'>
                    <FormControl sx={{
                        minWidth: '6.375rem',
                    }}>
                        <Box
                            sx={{
                                fontSize: '1rem',
                                border: `1px solid ${gray300}`,
                                borderRadius: '0.5rem',
                                borderRight: 0,
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                                height: '2.5rem',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: gray600
                            }}
                        >
                            https://
                        </Box>
                    </FormControl>
                    <CustomizedInput value={url} onChange={handleChangeUrl} placeholder='Enter object string' sx={{
                        width: 'auto',
                        flex: 1,
                        height: '2.5rem',
                        '& .MuiInputBase-input': {
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0
                        }
                    }} />
                </Box>
            </Stack>
            <Divider sx={{ borderColor: gray200, '& .MuiDivider-wrapper': { fontSize: '0.75rem', color: gray600 } }}>or</Divider>
            <Box>
                <ImportFile onFilesSelected={setFiles} />
                <Box mt={2.5}>
                    <Box sx={{ border: `1px solid ${gray300}`, borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1rem' }}>
                        <Box display="flex" gap={1.5}>
                            <CSVIcon />
                            <Stack>
                                <Typography variant="body2" sx={{ color: gray700, fontWeight: 500 }}>listOfTerms.csv</Typography>
                                <Typography variant="body2" sx={{ color: gray600 }}>85 KB – 100% uploaded</Typography>
                            </Stack>
                        </Box>
                        <Checkbox />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default ImportFileTab;