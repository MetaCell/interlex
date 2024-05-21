import { Box, CssBaseline, ThemeProvider } from '@mui/material'
import theme from './theme'
import Header from './components/Header'
import Partners from './components/Partners'
import Footer from './components/Footer'
import About from './components/About'
import Banner from './components/Banner'
import BG from "./Icons/svg/background.svg"

const style = {backgroundImage: `url(${BG})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right top'}


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={window.location.pathname === "/" ? style : {}}>
        <Header />
        <Banner />
        <Partners />
        <About />
        <Footer />
      </Box>
    </ThemeProvider>
  )
}

export default App
