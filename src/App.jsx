import { Box, CssBaseline, ThemeProvider } from '@mui/material'
import theme from './theme'
import Header from './components/Header'
import FiltersSidebar from './components/Sidebar/FiltersSidebar'

function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box>
        <Header />
      </Box>
      <Box sx={{ height: 'calc(100vh - 4rem)'}}>
          <FiltersSidebar />
      </Box>
    </ThemeProvider>
  )
}

export default App
