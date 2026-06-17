import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import Groups from '@mui/icons-material/Groups';
import {Box, Typography, Button, List, ListItem, ListItemText} from "@mui/material";

import { vars } from "../../theme/variables";
const { gray50, gray700, gray200, brand600 } = vars;

const OrganizationsList = ({organizations, viewJoinButton = true}) => {
  const navigate = useNavigate();

  return (
    <List sx={{
      width: '100%',
      padding: 0,
      '& .MuiListItem-root': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem',
        padding: '1.5rem',
        borderBottom: `1px solid ${gray200}`,
        position: 'relative',
        borderRadius: "0.5rem",
        '&:hover': {
          cursor: 'pointer',
          backgroundColor: gray50,
          '& .join-button': {
            visibility: 'visible'
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
        '& .MuiListItemText-primary': {
          '& .MuiTypography-root': {
            color: gray700,
            fontSize: '1.25rem',
            fontWeight: 500,
            lineHeight: "1.875rem"
          }
        }
      }
    }}>
      {organizations.length > 0 ? (
        organizations?.map((organization, index) => {
          const orgName = typeof organization === 'string' ? organization : organization.name;
          const userRole = typeof organization === 'object' ? organization.role : null;
          
          return (
            <ListItem key={index} onClick={() => navigate(`/${orgName}`)}>
              <ListItemText 
                primary={
                  <Box display='flex' alignItems='center' justifyContent='space-between'>
                    <Typography component='span'>{orgName}</Typography>
                    {userRole && (
                      <Typography 
                        component='span' 
                        sx={{ 
                          fontSize: '0.75rem', 
                          backgroundColor: 'primary.main', 
                          color: 'white', 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1,
                          textTransform: 'capitalize'
                        }}
                      >
                        {userRole}
                      </Typography>
                    )}
                  </Box>
                } 
              />
              <Box display='flex' alignItems='center' justifyContent='space-between'>
                {
                  viewJoinButton && <Button
                    variant="outlined"
                    className="join-button"
                    onClick={() => navigate(`/${orgName}`)}
                    startIcon={<Groups />}
                    sx={{
                      visibility: 'hidden',
                      width: 1
                    }}
                  >
                    View organization
                  </Button>
                }
              </Box>
            </ListItem>
          );
        })
      ) : (
        <Typography>There are no organizations</Typography>
      )}
    </List>
  );
}

OrganizationsList.propTypes = {
  organizations: PropTypes.array.isRequired,
  viewJoinButton: PropTypes.bool
};

export default OrganizationsList;
