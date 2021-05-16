import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store, { key } from "./store";
import mitt from "./plugins/mitt";
import "./index.css";

createApp(App).use(store, key).use(router).use(mitt).mount("#app");
