import './App.css'
import TicketingAdminDashboard from "./TicketingAdminDashboard";
import {ApolloProvider} from "@apollo/client";
import client from "./graphql/apploClient";
import {GoogleOAuthProvider} from "@react-oauth/google";
import Login from "./Login";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {LoginContextProvider} from "./context/login.context";

function App() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    return (
        <GoogleOAuthProvider clientId="655576593063-orvshrdu6korpj530n6nimvinocatq9h.apps.googleusercontent.com">
            <ApolloProvider client={client}>

                <Router>
                    <LoginContextProvider>
                        <Routes>
                            <Route path="/" element={<Login/>}/>
                            <Route path="/login" element={<Login/>}/>
                            <Route path="/dashboard" element={<TicketingAdminDashboard/>}/>
                        </Routes>
                    </LoginContextProvider>
                </Router>
            </ApolloProvider>
        </GoogleOAuthProvider>
    );
}

export default App;
