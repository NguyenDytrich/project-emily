<template>
  <div class="absolute w-screen h-scren top-0 left-0">
    <div
      id="modal"
      class="absolute w-screen h-screen bg-black bg-opacity-10 top-0 left-0 z-30"
      @click="$emit('closeModal')"
    ></div>
    <div class="relative z-40">
      <slot></slot>
    </div>
  </div>
</template>
