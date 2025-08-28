import {ApolloClient, ApolloLink, createHttpLink, InMemoryCache, split} from '@apollo/client';
import {getMainDefinition} from '@apollo/client/utilities';
import {GraphQLWsLink} from '@apollo/client/link/subscriptions';
import {createClient} from 'graphql-ws';
import {setContext} from '@apollo/client/link/context';
import {removeTypenameFromVariables} from '@apollo/client/link/remove-typename';



const httpLink = createHttpLink({
    uri: 'backend/admin/service',
    fetchOptions: {
        compress: true
    }
});

const isChromeiOS = /CriOS/.test(navigator.userAgent);
const isSafariIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent) && !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);
const isOldDevice = /iPhone OS [89]_/.test(navigator.userAgent) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);

const authLink = setContext((_, {headers}) => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        }
    };
});

const httpAuthLink = authLink.concat(httpLink);

const wsLink = new GraphQLWsLink(
    createClient({
        url: `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/backend/ticketing/ws`,
        connectionParams: async () => {
            const token = localStorage.getItem("token");
            return {
                authToken: token ? `Bearer ${token}` : null,
                userAgent: navigator.userAgent,
                timestamp: Date.now(),
                clientType: isChromeiOS ? 'chrome-ios' : 'other'
            };
        },
        lazy: true,
        keepAlive: isSafariIOS ? 10000 : (isOldDevice ? 20000 : 15000),
        retryAttempts: isSafariIOS ? 20 : (isChromeiOS ? 15 : 10),
        retryWait: async (retries: number) => {
            const baseDelay = isSafariIOS ? 200 : (isChromeiOS ? 300 : 500);
            const maxDelay = isSafariIOS ? 2000 : (isOldDevice ? 3000 : 5000);
            const delay = Math.min(baseDelay * Math.pow(1.5, retries), maxDelay);
            console.log(`Retry attempt ${retries}, waiting ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
        },
        shouldRetry: (error: any) => {
            console.error("WebSocket error occurred:", error);
            if (error?.code === 4401 || error?.message?.includes('401')) {
                return false;
            }
            return true;
        },
        on: {
            connecting: () => {
                console.log("🔌 Connecting to WebSocket...");

            },
            connected: () => {
                console.log("✅ WebSocket connected");

            },
            closed: (event: any) => {
                console.warn("❌ WebSocket closed:", event?.code, event?.reason);

            },
        },
    })
);

if (isSafariIOS || isChromeiOS) {
    let reconnectTimeout: any | null = null;

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            console.log("Page hidden - WebSocket will be suspended");
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
        } else {
            console.log("Page visible - checking WebSocket connection");
            const delay = isSafariIOS ? 100 : 500;
            reconnectTimeout = setTimeout(() => {
                console.log("Attempting reconnection after visibility change");
                try {
                    wsLink.client.dispose();
                } catch (e) {
                    console.warn("Error disposing WebSocket:", e);
                }
            }, delay);
        }
    });

    window.addEventListener('pageshow', (event) => {
        if (event.persisted && isSafariIOS) {
            console.log("Safari page restored from cache - reconnecting");
            setTimeout(() => {
                try {
                    wsLink.client.dispose();
                } catch (e) {
                    console.warn("Error disposing WebSocket on pageshow:", e);
                }
            }, 100);
        }
    });
}

wsLink.client.on('error', (err) => {
    console.error("WebSocket error:", err);

});

const splitLink = split(
    ({query}) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    wsLink,
    httpAuthLink
);

const removeTypenameLink = removeTypenameFromVariables();

const cache = new InMemoryCache();

const combinedLink = ApolloLink.from([removeTypenameLink, splitLink]);

const client = new ApolloClient({
    link: combinedLink,
    cache: cache,
    connectToDevTools: true,
});

export default client;
