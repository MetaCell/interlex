import PropTypes from 'prop-types';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import {vars} from "../../theme/variables";
const {gray500, gray300, gray600, brand700, gray700} = vars

const CustomBreadcrumbs = ({breadcrumbItems}) => {
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
      {breadcrumbItems.map((item, index) => (
        index < breadcrumbItems.length - 1 ? (
          <Link key={index} color="inherit" underline="none" href={item.href} display="flex">
            {item.icon && <item.icon fontSize="medium" htmlColor={gray500} />}
            {item.label}
          </Link>
        ) : (
          <Typography key={index} color={brand700}>
            {item.label}
          </Typography>
        )
      ))}
    </Breadcrumbs>
  );
}

CustomBreadcrumbs.propTypes = {
  breadcrumbItems: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    href: PropTypes.string,
    icon: PropTypes.elementType
  })).isRequired
}

export default CustomBreadcrumbs
