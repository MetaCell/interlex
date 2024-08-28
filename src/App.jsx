import CssBaseline from "@mui/material/CssBaseline";
import { Box, ThemeProvider } from "@mui/material";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation,
} from "react-router-dom";
import theme from "./theme";
import Header from "./components/Header";
import SearchResults from "./components/SearchResults";
import SingleTermView from "./components/SingleTermView";
import HomePage from "./components/HomePage";
import Footer from "./components/Footer";
import Organizations from "./components/organizations";
import CurieEditor from "./components/CurieEditor";
import TermActivity from "./components/term_activity/TermActivity";
import { GlobalDataProvider } from "./contexts/DataContext";
import Dashboard from "./components/Dashboard";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";
import SingleOrganization from "./components/SingleOrganization";
import OrganizationsCurieEditor from "./components/CurieEditor/OrganizationCurieEditor";

const PageContainer = ({ children }) => {
	return (
		<Box sx={{ display: "flex", height: "calc(100vh - 7.5rem)" }}>
			{children}
		</Box>
	);
};
function MainContent() {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
			}}
		>
			<Layout>
				<Routes>
					<Route
						path="/"
						element={
							<Box sx={{ flex: 1 }}>
								<HomePage />
							</Box>
						}
					/>
					<Route
						path="/search"
						element={
							<PageContainer>
								<SearchResults />
							</PageContainer>
						}
					/>
					<Route
						path="/view"
						element={
							<PageContainer>
								<SingleTermView />
							</PageContainer>
						}
					/>
					<Route
						path="/organizations"
						element={
							<PageContainer>
								<Organizations />
							</PageContainer>
						}
					/>
					<Route
						path="/curie-editor"
						element={
							<PageContainer>
								<CurieEditor />
							</PageContainer>
						}
					/>
					<Route
						path="/term-activity"
						element={
							<PageContainer>
								<TermActivity />
							</PageContainer>
						}
					/>
					<Route
						path="/dashboard"
						element={
							<PageContainer>
								<Dashboard />
							</PageContainer>
						}
					/>
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/forgot" element={<ForgotPassword />} />
					<Route path="/reset" element={<ResetPassword />} />
					<Route path="/organizations/:title" element={<PageContainer><SingleOrganization /></PageContainer>} />
					<Route path="/organizations/:title/curie-editor" element={<PageContainer><OrganizationsCurieEditor /></PageContainer>} />
				</Routes>
			</Layout>
		</Box>
	);
}

const Layout = ({ children }) => {
	const authPaths = ["/login", "/register", "/forgot", "/reset"];
	const location = useLocation();
	const isAuthPath = authPaths.includes(location.pathname);
	// Determine whether to show the footer based on the current route
	const showFooter = location.pathname !== "/";
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
			}}
		>
			{!isAuthPath && <Header />}
			{children}
			{!isAuthPath && showFooter && <Footer />}
		</Box>
	);
};

function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<GlobalDataProvider>
				<Router>
					<MainContent />
				</Router>
			</GlobalDataProvider>
		</ThemeProvider>
	);
}

export default App;
