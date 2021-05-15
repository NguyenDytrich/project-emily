import { InjectionKey } from "vue";
import { createStore, Store, Module } from "vuex";

export interface UserState {
  userId: number;
  username: string;
  token: string;
}

export interface RootState {
  user: UserState;
}

const userModule: Module<UserState, RootState> = {
  state: {
    userId: -1,
    username: "",
    token: "",
  },
  mutations: {
    setAuth(state, token: string) {
      state.token = token;
    },
  },
  getters: {
    isAuth: (state) => {
      return state.token !== "" ? true : false;
    }
  }
};

export const key: InjectionKey<Store<RootState>> = Symbol();

export default createStore<RootState>({
  modules: {
    user: userModule,
  },
});
