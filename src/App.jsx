import { Box, CssBaseline, ThemeProvider } from '@mui/material'
import * as api from './endpoints/interLexURIStructureAPI.msw';
import theme from './theme'
import Header from './components/Header'
import FiltersSidebar from './components/Sidebar/FiltersSidebar'
import SearchResultsBox from './components/SearchResults'
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
      <Box sx={{display: 'flex', height: 'calc(100vh - 4rem)'}}>
          <FiltersSidebar filterOptions={initialFilterOptions}/>
          <SearchResultsBox searchTerm={"neuron"}/>
      </Box>
    </ThemeProvider>
  )
}

export default App;

const initialFilterOptions = [
  {
      category: 'Type',
      values: [
          {
              title: 'Term',
              count: '',
              isChecked: false,
          },
          {
              title: 'Predicate',
              count: '',
              isChecked: false,
          },
          {
              title: 'Ontology',
              count: '',
              isChecked: false,
          },
      ],
  },
  {
      category: 'Superclass',
      categoryInfo: 'Superclass',
      values: [
          {
              title: 'regional part of brain',
              count: '65',
              isChecked: false,
          },
          {
              title: 'neuron',
              count: '79',
              isChecked: false,
          },
          {
              title: 'molecular entity',
              count: '122',
              isChecked: false,
          },
          {
              title: 'diagnostic interview schedule for children version 2.3: anxiety disorders',
              count: '123',
              isChecked: false,
          },
          {
              title: 'white substance (ta98)',
              count: '123',
              isChecked: false,
          },
          {
              title: 'grey substance (ta98)',
              count: '794',
              isChecked: false,
          },
          {
              title: 'sulcus',
              count: '102',
              isChecked: false,
          },
          {
              title: 'cell layer',
              count: '709',
              isChecked: false,
          },
          {
              title: 'side effects',
              count: '334',
              isChecked: false,
          },
          {
              title: 'diagnostic interview scheduled for childer version 4.0: anxiety disorders',
              count: '102',
              isChecked: false,
          },
          {
              title: 'regional part brain',
              count: '65',
              isChecked: false,
          },
          {
              title: 'neuronA1',
              count: '79',
              isChecked: false,
          },
      ],
  },
  {
      category: 'Ancestor',
      values: [
          {
              title: 'regional part of brain',
              count: '65',
              isChecked: false,
          },
          {
              title: 'neuron',
              count: '79',
              isChecked: false,
          },
          {
              title: 'molecular entity',
              count: '122',
              isChecked: false,
          },
          {
              title: 'diagnostic interview schedule for children version 2.3: anxiety disorders',
              count: '123',
              isChecked: false,
          },
          {
              title: 'white substance (ta98)',
              count: '123',
              isChecked: false,
          },
          {
              title: 'grey substance (ta98)',
              count: '794',
              isChecked: false,
          },
          {
              title: 'sulcus',
              count: '102',
              isChecked: false,
          },
          {
              title: 'cell layer',
              count: '709',
              isChecked: false,
          },
          {
              title: 'side effects',
              count: '334',
              isChecked: false,
          },
          {
              title: 'diagnostic interview scheduled for childer version 4.0: anxiety disorders',
              count: '102',
              isChecked: false,
          },
          {
              title: 'Term',
              count: '',
              isChecked: false,
          },
          {
              title: 'Predicate',
              count: '',
              isChecked: false,
          },
      ],
  },
];

