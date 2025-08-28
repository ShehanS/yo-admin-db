import {useState} from 'react'
import './App.css'
import TicketingAdminDashboard from "./TicketingAdminDashboard";
import {ApolloProvider} from "@apollo/client";
import client from "./graphql/apploClient";

function App() {
    return (
        <>
            <ApolloProvider client={client}>
            <TicketingAdminDashboard/>
            </ApolloProvider>
        </>
    )
}

export default App
