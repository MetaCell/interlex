import {Box} from "@mui/material";
import Banner from "./Banner";
import Partners from "./Partners";
import About from "./About";
import BG from "../Icons/svg/background.svg";

const HomePage = () => {
  return  <Box sx={{backgroundImage: `url(${BG})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right top'}}>
    <Banner />
    <Partners />
    <About />
  </Box>
}

export default HomePage