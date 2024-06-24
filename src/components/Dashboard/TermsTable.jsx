import * as React from 'react';
import {
  DataGrid,
  GridToolbar,
  GridToolbarColumnsButton,
  GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport,
  GridToolbarFilterButton
} from '@mui/x-data-grid';
import {Box, Checkbox} from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import {vars} from "../../theme/variables";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

const { brand600, gray50, gray300 } = vars

const columns = [
  { field: 'label', headerName: 'Label', width: 200 },
  { field: 'description', headerName: 'Description', width: 600 }
];

const rows = [
  { id: 1, label: 'Central nervous system', description: 'Presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.' },
  { id: 2, label: 'Central nervous system', description: 'For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords.' },
  { id: 3, label: 'Central nervous system', description: 'The central nervous system (CNS) is the part of the nervous system which includes the brain, spinal cord, and nerve cell layer of the retina.' },
  { id: 4, label: 'Central nervous system', description: 'However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.' },
  { id: 5, label: 'Brain', description: 'In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.' },
  { id: 6, label: 'Cerebrospinal axis', description: 'The central nervous system (CNS) is the part of the nervous system which includes the brain, spinal cord, and nerve cell layer of the retina.' },
  { id: 7, label: 'somatic nervous system', description: 'However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.' },
  { id: 8, label: 'Brain', description: 'In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.' },
  { id: 9, label: 'Cerebrospinal axis', description: 'The central nervous system (CNS) is the part of the nervous system which includes the brain, spinal cord, and nerve cell layer of the retina.' },
  { id: 10, label: 'somatic nervous system', description: 'In animals with bilateral symmetry, it is a topographic division that is a condensation of the nervous system in the longitudinal plane, lying on or near the median plane. For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords.' },
  { id: 11, label: 'Central nervous system', description: 'The central nervous system (CNS) is the part of the nervous system which includes the brain, spinal cord, and nerve cell layer of the retina.' },
];
function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 1,
    }}>
      <GridToolbarColumnsButton slotProps={{
        button: { startIcon: <AddOutlinedIcon />, sx: {
            padding: '0.5rem',
            minWidth: 'auto',
            borderRadius: '0.5rem',
            border: `1px solid ${gray300}`,
            boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
            backgroundColor: '#fff !important',
              '& .MuiButton-icon': {
                margin: 0
              }
          }
          },
      }} />
    </GridToolbarContainer>
  );
}

const TermsTable = () => {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      pageSize={10}
      rowsPerPageOptions={[5, 10, 20]}
      disableRowSelectionOnClick
      slots={{
        toolbar: CustomToolbar,
      }}
      slotProps={{
        columnMenu: { background: 'red', counter: rows.length },
        toolbar: { printOptions: { disableToolbarButton: true }, csvOptions: { disableToolbarButton: true} },
        columnsManagement: {
          disableShowHideToggle: true,
          disableResetButton: true,
        },
        basePopper: {
          sx: {
            right: '10rem !important',
            left: 'auto !important',
            
            '& .MuiDataGrid-paper': {
              '& .MuiDataGrid-panelWrapper': {
                '& .MuiDataGrid-columnsManagementHeader': {
                  display: 'none !important',
                },
                '& .MuiDataGrid-columnsManagement': {
                  padding: '.312rem 0.375rem 0',
                  '& .MuiFormControlLabel-root': {
                    margin: 0,
                    flexDirection: 'row-reverse',
                    width: '100%',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.625rem 0.5rem',
                    borderRadius: '0.375rem',
                    marginBottom: '.312rem',
                    
                    '&:has(.Mui-checked)': {
                      backgroundColor: gray50,
                    }
                  }
                }
              }
            }
          },
        },
      }}
      localeText={{
        toolbarExport: '',
        toolbarColumns: ''
      }}
      sx={{
        '& .MuiBox-root': {
          display: 'none',
        },
        '& .MuiButtonBase-root': {
          backgroundColor: 'transparent',
          
          '&:hover': {
            backgroundColor: 'transparent',
          }
        }
      }}
    />
  );
}

export default TermsTable