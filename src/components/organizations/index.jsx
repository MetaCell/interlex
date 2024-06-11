import React, { useEffect, useState } from "react";
import {Box, Typography, Button, Link, List, ListItem, ListItemText, CircularProgress} from "@mui/material";
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { vars } from "../../theme/variables";
import organizationss from '../../static/Organizations.json'
const { gray700, gray500, gray200, brand600 } = vars;

const URL = "https://raw.githubusercontent.com/MetaCell/interlex/feature/ILEX-41/src/static/Organizations.json"
const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true)
    fetch(URL)
      .then((response) => response.json())
      .then((jsonData) => {
        setOrganizations(jsonData);
        setLoading(false)
      })
      .catch((error) => {
        setError(error)
        setLoading(false)
      });
  }, []);
  
  if (loading) {
    return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 1 }}>
      <CircularProgress />
    </Box>
  }
  
  if (error) {
    return <div>error</div>;
  }
  return (
    <Box p='2.25rem 5rem' flexGrow={1} overflow='auto'>
      <Typography fontSize='1.5rem' color={gray700} fontWeight={600} mb='1.5rem'>
        {organizations.length} Organizations
      </Typography>
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
          organizationss.map((organization, index) => (
            <ListItem key={index}>
              <Box display='flex' alignItems='center' justifyContent='space-between' width={1}>
                <img src={organization.logo} alt={organization.title} />
                <Button
                  variant="outlined"
                  className="join-button"
                  startIcon={<PersonAddOutlinedIcon />}
                  sx={{
                    display: 'none',
                  }}
                >
                  Join organization
                </Button>
              </Box>
              <ListItemText primary={
                <Box display='flex' alignItems='center' justifyContent='space-between'>
                  <Typography component='span'>{organization.title}</Typography>
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
    </Box>
  );
}

export default Organizations;
