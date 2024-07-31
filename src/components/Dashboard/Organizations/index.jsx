import {Box, Button, ButtonGroup, Divider, Typography} from "@mui/material";
import { useState } from "react";
import { vars } from "../../../theme/variables";
import { ListIcon, TableChartIcon } from "../../../Icons";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import organizationss from "../../../static/Organizations.json";
import OrganizationsList from "../../common/OrganizationsList";
import CustomViewButton from "../../common/CustomViewButton";

const { gray600, gray200 } = vars;
const Organizations = () => {
  const [listView, setListView] = useState('list');
 
  return (
    <Box p='2.5rem 5rem' sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem',
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography fontSize='1.5rem' color={gray600} fontWeight={600}>
          My Organizations
        </Typography>
        <Box display="flex" alignItems="center" gap={2} justifyContent="end">
          <ButtonGroup variant="outlined" aria-label="View mode">
            <CustomViewButton
              view="list"
              listView={listView}
              onClick={() => setListView('list')}
              icon={<ListIcon />}
            />
            <CustomViewButton
              view="table"
              listView={listView}
              disabled
              onClick={() => setListView('table')}
              icon={<TableChartIcon />}
            />
          </ButtonGroup>
          <Divider orientation="vertical" flexItem sx={{ borderColor: gray200 }} />
          <Button type="string" color="secondary" startIcon={<AddOutlinedIcon />}>
            Create a new organization
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddOutlinedIcon />}
          >
            Join an organization
          </Button>
        </Box>
      </Box>
      <OrganizationsList organizations={organizationss} viewJoinButton={false} />
    </Box>
  );
};

export default Organizations;
