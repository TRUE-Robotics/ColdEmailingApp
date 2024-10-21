
import { initializeMsal } from './msal';
// Use Vuetify plugin

import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'

loadFonts()

const app = createApp(App)


// Ensure MSAL is initialized before mounting the app
initializeMsal()
    .then(() => {
        app.use(vuetify)
            .mount('#app')
    })
    .catch((error) => {
        console.error('Failed to initialize MSAL:', error);
    });
