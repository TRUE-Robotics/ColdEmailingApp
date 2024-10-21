// src/main.js

import { createApp } from 'vue';
import App from './App.vue';
import { initializeMsal } from './msal';
import vuetify from './vuetify'; // Import Vuetify

const app = createApp(App);

// Use Vuetify plugin
app.use(vuetify);

// Ensure MSAL is initialized before mounting the app
initializeMsal()
    .then(() => {
        app.mount('#app');
    })
    .catch((error) => {
        console.error('Failed to initialize MSAL:', error);
    });
