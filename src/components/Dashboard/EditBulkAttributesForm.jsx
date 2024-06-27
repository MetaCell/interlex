import {
  Button,
  Grid,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Box
} from "@mui/material";
import { vars } from "../../theme/variables";
import CustomizedInput from "../common/CustomizedInput";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

const { gray800, gray700, gray300 } = vars;

const EditBulkAttributesForm = ({columns, attributes, setAttributes}) => {
  const handleAttributesChange = (index, field, value) => {
    let newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };
  
  const handleDeletePredicate = (index) => {
    const newAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(newAttributes);
  };
  
  const handleAddPredicate = () => {
    setAttributes([...attributes, { attribute: '', condition: 'add', value: '' }]);
  };
  
  const handleClearAllPredicate = () => {
    setAttributes([{ attribute: '', condition: 'add', value: '' }]);
  };
  
  return (
    <Box>
      <Typography sx={{
        fontSize: '1rem',
        fontWeight: '500',
        color: gray800,
        mb: '.75rem'
      }}>
        Search for attribute
      </Typography>
      {attributes.map((predicate, index) => (
        <Grid container spacing='1.25rem' key={index} alignItems='stretch' mb='1.25rem'>
          <Grid item xs={12} lg={attributes.length > 1 ? 11 : 12}>
            <Grid container spacing='1.25rem'>
              <Grid item xs={12} lg={8}>
                <FormControl fullWidth>
                  <Select
                    value={attributes[index].attribute}
                    displayEmpty
                    placeholder='Select'
                    onChange={(e) => handleAttributesChange(index, 'attribute', e.target.value)}
                    sx={{
                      color: gray700,
                      borderRadius: '0.5rem !important',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      '& .MuiOutlinedInput-input': {
                        padding: '0.625rem 0.875rem'
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: gray300
                      },
                      '& .MuiSvgIcon-root': {
                        color: gray700,
                        fontSize: '1.25rem',
                        right: '0.875rem !important'
                      }
                    }}
                  >
                    {columns.map((attribute) => (
                      <MenuItem key={attribute.id} value={attribute.id}>{attribute.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} lg={4} display='flex' alignItems='end'>
                <FormControl fullWidth>
                  <Select
                    value={attributes[index].condition}
                    displayEmpty
                    placeholder='Select'
                    onChange={(e) => handleAttributesChange(index, 'condition', e.target.value)}
                    sx={{
                      color: gray700,
                      borderRadius: '0.5rem !important',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      '& .MuiOutlinedInput-input': {
                        padding: '0.625rem 0.875rem'
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: gray300
                      },
                      '& .MuiSvgIcon-root': {
                        color: gray700,
                        fontSize: '1.25rem',
                        right: '0.875rem !important'
                      }
                    }}
                  >
                    <MenuItem value={'replace'}>Replace With</MenuItem>
                    <MenuItem value={'add'}>Add</MenuItem>
                    <MenuItem value={'delete'}>Delete</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} lg={12}>
                <CustomizedInput
                  value={attributes[index].value}
                  placeholder='Type a value'
                  onChange={(e) => handleAttributesChange(index, 'value', e.target.value)}
                />
              </Grid>
            </Grid>
          </Grid>
          {attributes.length > 1 && (
            <Grid item xs={12} lg={1} sx={{ display: 'flex', alignItems: 'stretch' }}>
              <Button
                sx={{
                  padding: '.625rem',
                  minWidth: 'auto',
                  flexGrow: 1,
                  height: '100%'
                }}
                variant='outlined'
                onClick={() => handleDeletePredicate(index)}
              >
                <DeleteOutlineIcon />
              </Button>
            </Grid>
          )}
        </Grid>
      ))}
      <Box display='flex' alignItems='center' justifyContent='space-between'>
        <Button
          startIcon={<AddOutlinedIcon />}
          type="string"
          color="secondary"
          onClick={handleAddPredicate}
        >
          Call for another attribute
        </Button>
        <Button
          type="string"
          onClick={handleClearAllPredicate}
        >
          Clear all
        </Button>
      </Box>
     
    </Box>
  );
}

export default EditBulkAttributesForm;
