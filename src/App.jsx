import { Box, CssBaseline, ThemeProvider } from '@mui/material'
import { useEffect, useState } from 'react';
import * as uriAPI from './api/endpoints/interLexURIStructureAPI';
import * as mockApi from './api/endpoints/swaggerMockMissingEndpoints.msw';
import theme from './theme'
import Header from './components/Header'
import Partners from './components/Partners'
import Footer from './components/Footer'
import About from './components/About'
import Banner from './components/Banner'
import BG from "./Icons/svg/background.svg"
import { useAuthDispatch } from './api/mutator/auth.context';

const style = {backgroundImage: `url(${BG})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right top'}
const useMockApi = () => mockApi;
const uriMockApi = () => uriAPI;

function App() {
  const dispatch = useAuthDispatch();
  const {  getGetMatchTermsResponseMock } = useMockApi();
  const { getEndpointsIlx } = uriMockApi();

  const [terms, setTerms] = useState([]);
  const [ilx, setIlx] = useState([]);

  useEffect(() => {
    dispatch('token');

    setTimeout(() => {
      getEndpointsIlx("base", "ilx_0101431").then(setIlx);
      console.log("ILX  ", ilx)

      setTerms(getGetMatchTermsResponseMock());
      console.log("Terms  ", terms)
    }, 1000);
  }, []);

  console.log("Terms ", terms)
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
