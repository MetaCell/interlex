import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import theme from './theme';
import Header from './components/Header';
import FiltersSidebar from './components/Sidebar/FiltersSidebar';
import SearchResultsBox from './components/SearchResults';
import SingleTermView from './components/SingleTermView';
import HomePage from "./components/HomePage";
import Footer from "./components/Footer";
import Organizations from "./components/organizations";

function MainContent() {
    const location = useLocation();
    
    // Determine whether to show the footer based on the current route
    const showFooter = location.pathname !== '/';
    
    return (
      <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh'
      }}>
          <Header />
          <Box sx={{ flex: 1 }}>
              <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search/:searchTerm" element={
                      <Box sx={{ display: 'flex', height: 'calc(100vh - 7.5rem)' }}>
                          <FiltersSidebar filterOptions={initialFilterOptions} />
                          <SearchResultsBox />
                      </Box>
                  } />
                  <Route path="/view/:term" element={<SingleTermView />} />
                  <Route path="/organizations" element={<Box sx={{ display: 'flex', height: 'calc(100vh - 7.5rem)' }}><Organizations /></Box>} />
              </Routes>
          </Box>
          {showFooter && <Footer />}
      </Box>
    );
}

function App() {
    return (
      <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
              <MainContent />
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
