import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const Store = createPinia()
Store.use(piniaPluginPersistedstate)

export default Store
