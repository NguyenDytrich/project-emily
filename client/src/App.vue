<template>
  <div v-if="isAuth" class="app-container grid grid-cols-8 h-screen">
    <div id="topbar" class="flex justify-between">
      <div>Topbar</div>
      <div>
        <a @click="logout">Logout</a>
      </div>
    </div>
    <div id="sidebar">
      <ul>
        <li><router-link to="/">Feed</router-link></li>
        <li><router-link to="calendar">Calendar</router-link></li>
        <li><a>Gig Market</a></li>
        <li><a>Collaborate</a></li>
        <li><a>Groups</a></li>
      </ul>
      <br />
      <br />
      <a>Your saved links</a>
      <ul>
        <li><a>A Page</a></li>
        <li><a>Dogs</a></li>
        <li><a>Avante Garde</a></li>
        <li><a>Math Rock</a></li>
      </ul>
    </div>
    <div class="main-view">
      <router-view />
    </div>
    <div id="social">Social</div>
  </div>
  <Login v-else />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore, mapGetters } from 'vuex';
import { useRouter } from 'vue-router';
import { key } from './store';
import Login from './views/Login.vue';

export default defineComponent({
  setup() {
    const store = useStore(key);
    const router = useRouter();
    return { store, router };
  },
  components: {
    Login,
  },
  methods: {
    logout() {
      this.store.commit('logout');
      this.router.push('/');
    },
  },
  computed: {
    ...mapGetters(['isAuth']),
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.app-container {
  grid-template-rows: 4em auto auto;
}

#topbar {
  @apply col-span-full;
  @apply row-start-1;
  @apply shadow-md;
  @apply z-10;
}

#sidebar,
#social {
  @apply bg-white;
  @apply shadow-md;
  @apply border-t-2;
  @apply px-3;
  @apply py-3;
  @apply z-20;
  grid-row-start: 2;
  grid-row-end: last-line;
}

#social {
  grid-column-start: 8;
}

.main-view {
  @apply bg-gray-100;
  grid-column-start: 2;
  grid-column-end: 8;
  grid-row-start: 2;
  grid-row-end: last-line;
}

/* Global animations */
.fade-enter-active,
.fade-leave-active {
  @apply z-30;
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
