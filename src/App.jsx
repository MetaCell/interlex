import { useEffect, useContext } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, ThemeProvider, CircularProgress } from "@mui/material";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation,
	useNavigate
} from "react-router-dom";
import theme from "./theme";
import PropTypes from "prop-types";
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
import { GlobalDataContext } from "./contexts/DataContext";
import { API_CONFIG } from "./config";
import { requestUserSettings } from "./components/Auth/utils";
import { useCookies } from 'react-cookie';


const PageContainer = ({ children }) => {
	return (
		<Box sx={{ display: "flex", height: "calc(100vh - 7.5rem)" }}>
			{children}
		</Box>
	);
};

const ProtectedRoute = ({ children }) => {
	const { user } = useContext(GlobalDataContext);
	const navigate = useNavigate();

	useEffect(() => {
		if (!user) {
			navigate('/login');
		}
	}, [user, navigate]);

	return user ? children : null;
};

function MainContent() {

	const { setUserData, loading } = useContext(GlobalDataContext);
	const navigate = useNavigate();
	// eslint-disable-next-line no-unused-vars
	const [existingCookies, setCookie, removeCookie] = useCookies(['session']);

	useEffect(() => {
		(async () => {
			const userSettings = JSON.parse(localStorage.getItem(API_CONFIG.SESSION_DATA.SETTINGS));
			if (userSettings) {
				try {
					const userData = await requestUserSettings(userSettings?.groupname);
					setUserData({
						name: userData['groupname'],
						id: userData['orcid'],
						email: userData?.emails[0]?.email,
						role: userData['own-role'],
						groupname: userData['groupname'],
						settings: userData
					});
					navigate("/");
				} catch (error) {
					console.error("Error fetching user settings:", error);
					localStorage.removeItem(API_CONFIG.SESSION_DATA.SETTINGS);
					localStorage.removeItem(API_CONFIG.SESSION_DATA.COOKIE);
					removeCookie('session', { path: '/' });
					// setErrors((prev) => ({
					// 	...prev,
					// 	auth: "Session expired. Please log in again.",
					// }));
				}
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (loading) {
		return (
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					width: "100%",
					height: "100vh"
				}}
			>
				<CircularProgress />
			</div>
		)
	}

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
						path="/:group/search"
						element={
							<PageContainer>
								<SearchResults />
							</PageContainer>
						}
					/>
					<Route
						path="/organizations"
						element={
							<ProtectedRoute>
								<PageContainer>
									<Organizations />
								</PageContainer>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/curie-editor"
						element={
							<ProtectedRoute>
								<PageContainer>
									<CurieEditor />
								</PageContainer>
							</ProtectedRoute>
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
						path="/:group/dashboard"
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
					<Route
						path="/organizations/:title"
						element={
							<ProtectedRoute>
								<PageContainer>
									<SingleOrganization />
								</PageContainer>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/organizations/:title/curie-editor"
						element={
							<ProtectedRoute>
								<PageContainer>
									<OrganizationsCurieEditor />
								</PageContainer>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/:group/:term/:tab?"
						element={
							<PageContainer>
								<SingleTermView />
							</PageContainer>
						}
					/>
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
		if (code) {
			(async () => {
				try {
					const response = await handleOrcidLogin(code);
					localStorage.setItem("token", response.token);
				} catch (error) {
					console.log("error: ", error);
				}
			})();
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

ProtectedRoute.propTypes = {
	children: PropTypes.node.isRequired,
};

Layout.propTypes = {
	children: PropTypes.node.isRequired,
};

export default App;
