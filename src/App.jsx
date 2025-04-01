import { useEffect, useRef } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, ThemeProvider } from "@mui/material";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation,
} from "react-router-dom";
import theme from "./theme";
import PropTypes from 'prop-types';
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./components/Auth/Login";
import HomePage from "./components/HomePage";
import Dashboard from "./components/Dashboard";
import Register from "./components/Auth/Register";
import CurieEditor from "./components/CurieEditor";
import SearchResults from "./components/SearchResults";
import Organizations from "./components/organizations";
import SingleTermView from "./components/SingleTermView";
import { GlobalDataProvider } from "./contexts/DataContext";
import ResetPassword from "./components/Auth/ResetPassword";
import ForgotPassword from "./components/Auth/ForgotPassword";
import SingleOrganization from "./components/SingleOrganization";
import TermActivity from "./components/term_activity/TermActivity";
import OrganizationsCurieEditor from "./components/CurieEditor/OrganizationCurieEditor";
import { handleOrcidLogin } from "./api/endpoints";

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

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const code = params.get("code");
		if (code) {(async () => {
			try {
				const response = await handleOrcidLogin(code);
				localStorage.setItem("token", response.token);
			} catch (error) {
				console.log("error: ", error)
			}})();
		}
	}, [location]);

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
	const initialized = useRef(false);

	useEffect(() => {
		if (initialized.current) return
		initialized.current = true

		const script = document.createElement("script")
		script.id = "orcid-widget-script"
		script.src = "/orcid-widget.js"
		script.async = true
		document.body.appendChild(script)
	}, [])

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

PageContainer.propTypes = {
	children: PropTypes.node.isRequired,
};

Layout.propTypes = {
	children: PropTypes.node.isRequired,
};

export default App;
