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

app.use(GoogleSignInPlugin, {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
});

app.mount('#app')
