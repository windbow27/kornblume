import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './stores'
import i18n from './lang/i18n'

const app = createApp(App)
app.use(store)
app.use(router)
app.use(i18n)

app.mount('#app')
