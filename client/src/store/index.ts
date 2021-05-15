import { InjectionKey } from "vue";
import { createStore, Store, Module } from "vuex";

export interface UserState {
  userId: number;
  username: string;
  auth: string;
  isAuth: boolean;
}

export interface RootState {
  user: UserState;
}

const userModule: Module<UserState, RootState> = {
  state: {
    userId: -1,
    username: "",
    auth: "",
    isAuth: false,
  },
};

export const key: InjectionKey<Store<RootState>> = Symbol();

export default createStore<RootState>({
  modules: {
    user: userModule,
  },
});
