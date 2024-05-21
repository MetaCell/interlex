import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import theme from './theme';
import Header from './components/Header';
import FiltersSidebar from './components/Sidebar/FiltersSidebar';
import SearchResultsBox from './components/SearchResults';
import SingleTermView from './components/SingleTermView';
import HomePage from "./components/HomePage";

function App() {
    return (
      <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
              <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '100vh'
              }}>
                  <Header />
                  <Box sx={{ flex: 1 }}>
                      <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/search" element={
                              <Box sx={{ display: 'flex', height: 'calc(100vh - 4rem)' }}>
                                  <FiltersSidebar filterOptions={initialFilterOptions} />
                                  <SearchResultsBox searchTerm={"neuron"} />
                              </Box>
                          } />
                          <Route path="/single-term" element={<SingleTermView />} />
                      </Routes>
                  </Box>
                  {/*<Footer />*/}
              </Box>
          </Router>
      </ThemeProvider>
    );
}

export default App;

const initialFilterOptions = [
    {
        category: 'Type',
        values: [
            { title: 'Term', count: '', isChecked: false },
            { title: 'Predicate', count: '', isChecked: false },
            { title: 'Ontology', count: '', isChecked: false },
        ],
    },
    {
        category: 'Superclass',
        categoryInfo: 'Superclass',
        values: [
            { title: 'regional part of brain', count: '65', isChecked: false },
            { title: 'neuron', count: '79', isChecked: false },
            { title: 'molecular entity', count: '122', isChecked: false },
            { title: 'diagnostic interview schedule for children version 2.3: anxiety disorders', count: '123', isChecked: false },
            { title: 'white substance (ta98)', count: '123', isChecked: false },
            { title: 'grey substance (ta98)', count: '794', isChecked: false },
            { title: 'sulcus', count: '102', isChecked: false },
            { title: 'cell layer', count: '709', isChecked: false },
            { title: 'side effects', count: '334', isChecked: false },
            { title: 'diagnostic interview scheduled for childer version 4.0: anxiety disorders', count: '102', isChecked: false },
            { title: 'regional part brain', count: '65', isChecked: false },
            { title: 'neuronA1', count: '79', isChecked: false },
        ],
    },
    {
        category: 'Ancestor',
        values: [
            { title: 'regional part of brain', count: '65', isChecked: false },
            { title: 'neuron', count: '79', isChecked: false },
            { title: 'molecular entity', count: '122', isChecked: false },
            { title: 'diagnostic interview schedule for children version 2.3: anxiety disorders', count: '123', isChecked: false },
            { title: 'white substance (ta98)', count: '123', isChecked: false },
            { title: 'grey substance (ta98)', count: '794', isChecked: false },
            { title: 'sulcus', count: '102', isChecked: false },
            { title: 'cell layer', count: '709', isChecked: false },
            { title: 'side effects', count: '334', isChecked: false },
            { title: 'diagnostic interview scheduled for childer version 4.0: anxiety disorders', count: '102', isChecked: false },
            { title: 'Term', count: '', isChecked: false },
            { title: 'Predicate', count: '', isChecked: false },
        ],
    },
];
