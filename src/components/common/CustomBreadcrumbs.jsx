import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import {vars} from "../../theme/variables";

const {gray500, gray300, gray600, brand700, gray700} = vars
function handleClick(event) {
  event.preventDefault();
  console.info('You clicked a breadcrumb.');
}

const CustomBreadcrumbs = () => {
  const breadcrumbs = [
    <Link key="1" color="inherit" href="/" onClick={handleClick} display='flex'>
      <HomeOutlinedIcon fontSize='medium' htmlColor={gray500} />
    </Link>,
    <Link
      underline="none"
      key="2"
      color="inherit"
      href="#"
      onClick={handleClick}
    >
      Term search
    </Link>,
    <Link
      underline="none"
      key="3"
      color="inherit"
      href="#"
      onClick={handleClick}
    >
      My organization 1
    </Link>,
    <Typography key="4" color={brand700}>
      ILX:0101901
    </Typography>,
  ];
  
  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" htmlColor={gray300} />}
      aria-label="breadcrumb"
      sx={{
        '& .MuiTypography-root': {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: '1.25rem',
        },
        '& a':{
          color: gray600,
          '&:hover': {
            color: gray700
          }
        },
        
        '& .MuiBreadcrumbs-separator': {
          margin: '0 .75rem'
        }
      }}
    >
      {breadcrumbs}
    </Breadcrumbs>
  );
}

export default CustomBreadcrumbs