import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally for Echo
window.Pusher = Pusher;

// Get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Create Echo instance for Reverb
const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/broadcasting/auth`,
    auth: {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            Accept: 'application/json',
        },
    },
});

// Update auth headers when token changes
export const updateEchoAuth = (token) => {
    if (echo?.connector?.pusher?.config?.auth?.headers) {
        echo.connector.pusher.config.auth.headers.Authorization = `Bearer ${token}`;
    }
};

// Disconnect Echo
export const disconnectEcho = () => {
    if (echo && echo.disconnect) {
        echo.disconnect();
    }
};

export default echo;
