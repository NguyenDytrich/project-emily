import type { mitt } from 'mitt';

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $emitter: typeof mitt;
  }
}
