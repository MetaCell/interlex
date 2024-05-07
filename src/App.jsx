import { Box, CssBaseline, ThemeProvider } from '@mui/material'
import theme from './theme'
import Header from './components/Header'
import FiltersSidebar from './components/Sidebar/FiltersSidebar'
import SearchResultsBox from './components/SearchResultsBox'

function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box>
        <Header />
      </Box>
      <Box sx={{ display: 'flex', height: 'calc(100vh - 4rem)'}}>
          <FiltersSidebar />
          <SearchResultsBox searchTerm={"neuron"}/>
      </Box>
    </ThemeProvider>
  )
}

export default App
