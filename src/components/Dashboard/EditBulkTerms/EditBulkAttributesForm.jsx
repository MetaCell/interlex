import {
  Button,
  Grid,
  Typography,
  Box
} from "@mui/material";
import PropTypes from 'prop-types';
import { vars } from "../../../theme/variables";
import CustomizedInput from "../../common/CustomizedInput";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CustomSingleSelect from "../../common/CustomSingleSelect";

const { gray800 } = vars;

const EditBulkAttributesForm = ({columns, attributes, setAttributes, initialAttributesValue}) => {
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
    setAttributes([...attributes, initialAttributesValue]);
  };
  
  const handleClearAllPredicate = () => {
    setAttributes([initialAttributesValue]);
  };
  
  const updatedColumnsArray = columns.map(item => ({
    ...item,
    value: item.id
  }));
  
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
                <CustomSingleSelect
                  isFormControlFullWidth={true}
                  value={attributes[index].attribute} onChange={(v) => handleAttributesChange(index, 'attribute', v)}
                  options={updatedColumnsArray}
                  placeholder='Choose an attribute'
                />
              </Grid>
              <Grid item xs={12} lg={4} display='flex' alignItems='end'>
                <CustomSingleSelect
                  isFormControlFullWidth={true}
                  value={attributes[index].condition} onChange={(v) => handleAttributesChange(index, 'condition', v)}
                  options={[
                    {
                      label: 'Replace With',
                      value: 'replace'
                    },
                    {
                      label: 'Add',
                      value: 'add'
                    },
                    {
                      label: 'Delete',
                      value: 'delete'
                    }
                  ]}
                  placeholder='Choose an attribute'
                />
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
EditBulkAttributesForm.propTypes = {
  columns: PropTypes.array.isRequired,
  attributes: PropTypes.array.isRequired,
  setAttributes: PropTypes.func.isRequired,
  initialAttributesValue: PropTypes.object.isRequired,
};

export default EditBulkAttributesForm;
