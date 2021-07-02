import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import _Home from '../views/__Home.vue';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';

import store from '../store';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/_home',
    name: '_Home',
    component: _Home,
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { login: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/About.vue'),
    meta: { login: true },
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () =>
      import(/* webpackChunkName: "calendar" */ '../views/CalendarEvents.vue'),
    meta: { login: true },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.login) && !store.getters.isAuth) {
    next('/login');
  } else {
    next();
  }
});

export default router;
