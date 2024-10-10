// src/msal.js

import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
    auth: {
        clientId: 'da9f02d8-2020-4987-a81b-af67443eb3b3', // Replace with your Application ID
        redirectUri: 'http://localhost:8080',
    },
    cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
    },
};

const loginRequest = {
    scopes: ['User.Read', 'Files.Read'],
};

const msalInstance = new PublicClientApplication(msalConfig);

// Initialize the MSAL instance
async function initializeMsal() {
    try {
        await msalInstance.initialize();
        console.log('MSAL initialized');
    } catch (error) {
        console.error('Error initializing MSAL:', error);
    }
}

export { msalInstance, loginRequest, initializeMsal };
