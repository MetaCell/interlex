import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import {Box, Typography, Button, Link, List, ListItem, ListItemText} from "@mui/material";

import { vars } from "../../theme/variables";
const { gray700, gray500, gray200, brand600 } = vars;

const OrganizationsList = ({organizations, viewJoinButton = true}) => {
  const navigate = useNavigate();
  return (
    <List sx={{
      width: '100%',
      padding: 0,
      '& .MuiListItem-root': {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '1.5rem',
        gap: '1rem',
        borderBottom: `1px solid ${gray200}`,
        position: 'relative',
        '&:hover': {
          cursor: 'pointer',
          '& .join-button': {
            display: 'inline-flex',
          },
          '& .MuiListItemText-root': {
            position: 'relative',
            '&::before': {
              display: 'block',
              width: '0.125rem',
              height: '1.5rem',
              backgroundColor: brand600,
              content: "''",
              position: 'absolute',
              left: '-1.5rem',
              top: '2px'
            },
          },
          '& .MuiListItemText-primary': {
            '& .MuiTypography-root': {
              '&:not(.MuiLink-root)': {
                color: brand600
              }
            }
          }
        }
      },
      '& .MuiListItemText-root': {
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%',
        '& .MuiListItemText-primary': {
          '& .MuiTypography-root': {
            color: gray700,
            fontSize: '1.25rem',
            fontWeight: 500
          },
          '& .MuiLink-root': {
            textDecoration: 'none',
            color: gray500,
            fontSize: '1.125rem',
            fontWeight: 500,
          }
        },
        '& .MuiListItemText-secondary': {
          color: gray500,
          fontSize: '0.875rem',
          fontWeight: 400,
        }
      }
    }}>
      {
        organizations?.map((organization, index) => (
          <ListItem key={index} onClick={() => navigate(`/organizations/${organization.name}`)}>
            <Box display='flex' alignItems='center' justifyContent='space-between' width={1}>
              <img src={organization.logo} alt={organization.name} />
              {
                viewJoinButton && <Button
                  variant="outlined"
                  className="join-button"
                  onClick={() => navigate(`/organizations/${organization.name}`)}
                  startIcon={<PersonAddOutlinedIcon />}
                  sx={{
                    display: 'none',
                  }}
                >
                  Join organization
                </Button>
              }
            </Box>
            <ListItemText primary={
              <Box display='flex' alignItems='center' justifyContent='space-between'>
                <Typography component='span'>{organization.name}</Typography>
                {organization.link && (
                  <Link href={organization.link} display='flex'>
                    {organization.link}
                  </Link>
                )}
              </Box>
            } secondary={organization.description} />
          </ListItem>
        ))
      }
    </List>
  );
}

OrganizationsList.propTypes = {
  organizations: PropTypes.array.isRequired,
  viewJoinButton: PropTypes.bool
};

export default OrganizationsList;
