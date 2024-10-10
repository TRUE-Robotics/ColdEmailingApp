// src/main.js

import { createApp } from 'vue';
import App from './App.vue';
import { initializeMsal } from './msal';

const app = createApp(App);

// Ensure MSAL is initialized before mounting the app
initializeMsal()
    .then(() => {
        app.mount('#app');
    })
    .catch((error) => {
        console.error('Failed to initialize MSAL:', error);
    });
