<template>
  <div id="posts" class="bg-gray-100">
    <a>Everyone</a>
    <a>Friends</a>
    <a>Groups</a>
    <ul>
      <li>
        <div id="new-post" class="post new-post">
          <div class="text-center" @click="toggleModal">
            <a>Post Something New</a>
          </div>
        </div>
      </li>
      <li v-for="p in posts" :key="p.postId">
        <div class="post">
          <span class="flex items-baseline"
            ><h2 class="text-lg">{{ p.author }}</h2>
            <a class="text-xs text-gray-400 ml-2">{{ fdate(p.timestamp) }}</a>
          </span>
          <p class="px-5 py-2">{{ p.post }}</p>
        </div>
      </li>
    </ul>
    <transition name="fade">
      <ModalBase v-if="showModal" @close-modal="closeModal">
        <CreatePostForm />
      </ModalBase>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ModalBase from './ModalBase.vue';
import CreatePostForm from './CreatePostForm.vue';

export default defineComponent({
  components: {
    ModalBase,
    CreatePostForm,
  },
  created() {
    this.$emitter.on('close-modal', this.closeModal);
  },
  data() {
    const showModal = ref(false);
    const posts = [
      {
        author: 'Abc Defg',
        post: 'Hello world',
        postId: 0,
        timestamp: Date.now(),
      },
      {
        author: 'Abc Defg',
        post: 'Test post please ignore',
        postId: 1,
        timestamp: Date.now(),
      },
      {
        author: 'Abc Defg',
        post: 'Test post 2 please ignore',
        postId: 2,
        timestamp: Date.now(),
      },
    ];
    return { posts, showModal };
  },
  methods: {
    fdate(_date: number) {
      const date = new Date(_date);
      return `at ${date.getHours()}:${date.getMinutes()} on ${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
    },
    closeModal() {
      this.showModal = false;
    },
    toggleModal() {
      this.showModal = !this.showModal;
    },
  },
});
</script>

<style scoped>
.post {
  @apply bg-white;
  @apply rounded-xl;
  @apply shadow;
  @apply my-6;
  @apply mx-6;
  @apply p-2;
}

.post.new-post {
  @apply text-white;
  @apply bg-green-400;
  transition: background-color 0.15s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.post.new-post:hover {
  @apply bg-green-500;
  transition: background-color 0.15s;
}
</style>
