import {Box} from "@mui/material";
import Banner from "./Banner";
import Partners from "./Partners";
import About from "./About";
import BG from "../Icons/svg/background.svg";

// TODO: check the localstorage for the user information and if set, then update the header and the context with the user info

const HomePage = () => {
  return  <Box sx={{backgroundImage: `url(${BG})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right top'}}>
    <Banner />
    <Partners />
    <About />
  </Box>
}

export default HomePage
