import './assets/main.css'
import 'flag-icons/css/flag-icons.min.css';
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './stores'
import i18n from './utils/i18n'
import GoogleSignInPlugin from 'vue3-google-signin'

const app = createApp(App)
app.use(store)
app.use(router)
app.use(i18n)

// please create a .env file in the root of the project and add the following line
// VITE_GOOGLE_CLIENT_ID = 'client-id'
// VITE_GOOGLE_API_KEY = 'key'
// replace 'client-id' and 'key' with your own values if you want to test google sync, else leave it as it is
app.use(GoogleSignInPlugin, {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock-client-id'
});

app.mount('#app')
