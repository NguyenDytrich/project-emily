<template>
  <div class="absolute w-screen h-scren top-0 left-0">
    <div
      id="modal"
      class="absolute w-screen h-screen bg-black bg-opacity-10 top-0 left-0 z-30"
      @click="closeModal"
    ></div>
    <div class="relative z-40">
      <transition appear name="slide">
        <div
          v-if="!exiting"
          class="bg-white container mx-auto mt-10 w-1/2 p-5 shadow-md"
        >
          <slot></slot>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  created() {
    this.$emitter.on('start-close-modal', this.closeModal);
  },
  data() {
    const exiting = false;
    return {
      exiting,
    };
  },
  methods: {
    closeModal() {
      this.exiting = true;
      setTimeout(() => {
        this.$emitter.emit('close-modal');
      }, 250);
    },
  },
});
</script>

<style scoped>
.slide-enter-active {
  transition: transform 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
}
.slide-leave-active {
  transition: transform 0.5s ease-in;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-40em);
}
</style>
