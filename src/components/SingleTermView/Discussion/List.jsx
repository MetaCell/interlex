import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { vars } from "../../../theme/variables";
import { Box, Chip, Typography } from "@mui/material";

const { gray200, brand600, gray50, gray700, gray500 } = vars;

const DiscussionList = () => {
  return (
    <Box sx={{
        height: '100%',
        overflow: 'auto',
        paddingTop: 0,
        scrollbarWidth: 'none'
      }}>
      <List sx={{
        '& .MuiListItem-root': {
          padding: '1.375rem 2.75rem 1.375rem 5rem',
          borderBottom: `1px solid ${gray200}`,
          
          '&:hover': {
            borderBottom: `2px solid ${brand600}`,
            background: gray50
          }
        },
        '& .MuiListItemText-root': {
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
        },
        '& .MuiListItemText-primary': {
          marginBottom: '1rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          '& .MuiTypography-root': {
            color: gray700,
            fontSize: '1.25rem',
            fontWeight: 500,
          }
        },
        '& .MuiListItemText-secondary': {
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: gray500,
          fontSize: '0.875rem',
          maxWidth: '30rem',
        }
      }}>
        <ListItem alignItems="flex-start">
          <ListItemText
            primary={
              <Box display='flex' alignItems='center' flexWrap='wrap' gap='0.375rem'>
                <Typography>Central nervous system</Typography>
                <Chip label="Curated" variant="outlined" />
                <Chip label="Spark Anatomical Working Group" variant='outlined' color='success' />
              </Box>
            }
            secondary={"The peripheral nervous system (PNS) is the part of the nervous system connected to the CNS which contains cranial nerves III - XII, spinal, peripheral and autonomic nerves. (CUMBO)"}
          />
        </ListItem>
        <ListItem alignItems="flex-start">
          <ListItemText
            primary={
              <Box display='flex' alignItems='center' flexWrap='wrap' gap='0.375rem'>
                <Typography>Central nervous system</Typography>
                <Chip label="Curated" variant="outlined" />
                <Chip label="Spark Anatomical Working Group" variant='outlined' color='success' />
              </Box>
            }
            secondary={"The peripheral nervous system (PNS) is the part of the nervous system connected to the CNS which contains cranial nerves III - XII, spinal, peripheral and autonomic nerves. (CUMBO)"}
          />
        </ListItem>
        <ListItem alignItems="flex-start">
          <ListItemText
            primary={
              <Box display='flex' alignItems='center' flexWrap='wrap' gap='0.375rem'>
                <Typography>Central nervous system</Typography>
                <Chip label="Curated" variant="outlined" />
                <Chip label="Spark Anatomical Working Group" variant='outlined' color='success' />
              </Box>
            }
            secondary={"The peripheral nervous system (PNS) is the part of the nervous system connected to the CNS which contains cranial nerves III - XII, spinal, peripheral and autonomic nerves. (CUMBO)"}
          />
        </ListItem>
        <ListItem alignItems="flex-start">
          <ListItemText
            primary={
              <Box display='flex' alignItems='center' flexWrap='wrap' gap='0.375rem'>
                <Typography>Central nervous system</Typography>
                <Chip label="Curated" variant="outlined" />
                <Chip label="Spark Anatomical Working Group" variant='outlined' color='success' />
              </Box>
            }
            secondary={"The peripheral nervous system (PNS) is the part of the nervous system connected to the CNS which contains cranial nerves III - XII, spinal, peripheral and autonomic nerves. (CUMBO)"}
          />
        </ListItem>
        <ListItem alignItems="flex-start">
          <ListItemText
            primary={
              <Box display='flex' alignItems='center' flexWrap='wrap' gap='0.375rem'>
                <Typography>Central nervous system</Typography>
                <Chip label="Curated" variant="outlined" />
                <Chip label="Spark Anatomical Working Group" variant='outlined' color='success' />
              </Box>
            }
            secondary={"The peripheral nervous system (PNS) is the part of the nervous system connected to the CNS which contains cranial nerves III - XII, spinal, peripheral and autonomic nerves. (CUMBO)"}
          />
        </ListItem>
      </List>
    </Box>
  );
}

export default DiscussionList;
