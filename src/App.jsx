import { Box, CssBaseline, ThemeProvider } from '@mui/material'
import theme from './theme'
import Header from './components/Header'

function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box>
        <Header />
      </Box>
    </ThemeProvider>
  )
}

export default App
