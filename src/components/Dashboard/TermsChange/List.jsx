import { Box, List } from "@mui/material";
import { vars } from "../../../theme/variables";
import ListItem from "./ListItem";


const { gray50 } = vars;
const ListTerms = ({entries}) => {
    const onRequestClick = (e, entry) => {
        console.log('Opening change request + ', entry)
    }
    return <List disablePadding width={1} sx={{ maxWidth: '80%' }}>
        {entries.map((entry, index) => (
          <Box key={`${entry.author}_${index}`} sx={{
              paddingLeft: '1rem',
              borderRadius: '0.375rem',
              '&:hover': {
                  backgroundColor: gray50,
                  '& .MuiIconButton-root': {
                      display: 'flex'
                  }
              }
          }}>
              <ListItem entry={entry} onRequestClick={onRequestClick} />
          </Box>
        ))}
    </List>
};

export default ListTerms;
