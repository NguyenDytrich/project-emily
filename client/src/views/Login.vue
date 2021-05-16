<template>
  <div class="w-screen h-screen flex">
    <div class="w-7/12 p-4 flex">
      <div class="text-2xl mx-auto w-max"><h1>Welcome to Emily</h1></div>
    </div>
    <div class="w-5/12 bg-yellow-400 text-white p-4">
      <!-- Signup view -->
      <div v-if="view === 1" class="text-center w-4/6 mx-auto">
        <h1 class="text-2xl mb-10 mt-5">Sign up</h1>
        <p class="text-left">
          Project Emily is currently in closed beta testing. That means, you'll
          need a <i><u>beta key</u></i> to participate! Don't have one? Don't
          worry! Email [email] for info on how to get one!
        </p>
        <form v-on:submit.prevent="signupUser">
          <div class="flex fieldset">
            <input v-model="signup.fname" placeholder="First name" />
            <input v-model="signup.lname" placeholder="Last name" />
          </div>
          <input placeholder="Beta Key" />
          <input v-model="signup.email" placeholder="Email" />
          <input
            v-model="signup.password"
            placeholder="Password"
            type="password"
          />
          <input
            v-model="signup.passwordConf"
            placeholder="Password (again)"
            type="password"
          />
          <p class="mb-4">
            Already have an account? <a @click="setState(2)">Login here</a>
          </p>
          <div>
            <button id="signup-btn" type="submit">Signup</button>
          </div>
          <div>
            <button @click="setState()" id="back-btn" class="mt-5">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Login view -->
      <div v-else-if="view === 2" class="text-center w-4/6 mx-auto">
        <h1 class="text-2xl mb-10 mt-5">Login</h1>
        <form v-on:submit.prevent="loginUser">
          <input v-model="login.email" placeholder="Email" />
          <input
            v-model="login.password"
            placeholder="Password"
            type="password"
          />
          <p class="mb-4">
            Don't have an account? <a @click="setState(1)">Sign up here</a>
          </p>
          <div>
            <button id="login-btn">Login</button>
          </div>
          <div>
            <button @click="setState()" id="back-btn" class="mt-5">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- First view -->
      <div v-else class="flex flex-col text-center justify-center h-full">
        <button @click="setState(1)">Sign up</button>
        <span class="text-xl my-3 text-black">or</span>
        <button @click="setState(2)">Login</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { key } from "../store";
import axios from "axios";

export default defineComponent({
  setup() {
    const store = useStore(key);
    const router = useRouter();
    return { store, router };
  },
  data: () => {
    const view = ref(0);
    const signup = reactive({
      fname: "",
      lname: "",
      email: "",
      password: "",
      passwordConf: "",
    });

    const login = reactive({
      email: "",
      password: "",
    });

    return {
      view,
      signup,
      login,
    };
  },
  methods: {
    setState(val = 0) {
      this.view = val;
    },
    async signupUser() {
      try {
        const res = await axios({
          url: "http://localhost:4000/graphql",
          method: "post",
          data: {
            query: `
						mutation signup($args:UserSignupInput!){
							signup(user:$args) {
								fname
								lname
							}
						}
						`,
            variables: {
              args: {
                ...this.signup,
              },
            },
          },
        });
        if (!res.data.errors) {
          // TODO pop up a signup modal, automatically sign in or tell app to load welcome screen
          this.$router.push("/");
        } else {
          console.log(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    },
    async loginUser() {
      try {
        const res = await axios({
          url: "http://localhost:4000/graphql",
          method: "post",
          data: {
            query: `
						mutation login($email:String!, $password:String!) {
							login(email: $email, password: $password) {
							token
							}
						}`,
            variables: {
              ...this.login,
            },
          },
        });
        if (!res.data.errors) {
          this.store.commit("setAuth", res.data.data.login.token);
          this.router.push({ path: "/" });
        } else {
          console.log(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    },
  },
});
</script>

<style scoped>
a {
  text-decoration: underline;
  cursor: pointer;
}

button {
  @apply bg-white;
  @apply text-black;
  @apply rounded-full;
  @apply rounded-full;
  @apply w-1/2;
  @apply mx-auto;
  @apply py-1;
  @apply shadow-md;
  @apply cursor-pointer;
  @apply transform;
  @apply transition-transform;
  @apply delay-25;
  @apply hover:opacity-95;
  @apply hover:-translate-y-0.5;
  @apply hover:translate-x-0.5;
}

#back-btn {
  @apply bg-red-400;
  @apply text-white;
}

#signup-btn {
}

input {
  @apply inline-block;
  @apply py-2;
  @apply px-6;
  @apply w-full;
  @apply my-4;
  @apply rounded-full;
  @apply text-black;
  @apply shadow-md;
}

.fieldset {
  @apply rounded-full;
  @apply my-4;
  @apply shadow-md;
  @apply bg-white;
}

.fieldset input {
  @apply shadow-none;
}

.fieldset input:first-of-type {
  @apply my-0;
  @apply rounded-l-full;
  @apply rounded-r-none;
  margin-right: 1px;
}

.fieldset input:last-of-type {
  @apply rounded-r-full;
  @apply rounded-l-none;
  @apply my-0;
}
</style>
