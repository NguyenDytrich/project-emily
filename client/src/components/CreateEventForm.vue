<template>
  <div>
    <h1>New Calendar Event</h1>
    <div class="mt-5">
      <form @submit.prevent="createEvent">
        <div class="mb-2 flex justify-between">
          <input
            v-model="formState.title"
            class="border-b-2"
            type="text"
            placeholder="Event name..."
          />
          <div>
            <label for="date" class="sr-only">Date</label>
            <input
              v-model="formState.date"
              id="date"
              type="date"
              class="border-b-2"
            />
          </div>
        </div>
        <div>
          <textarea
            class="w-full"
            v-model="formState.description"
            placeholder="Event description..."
          ></textarea>
        </div>
        <div class="flex justify-end gap-4">
          <button class="bg-green-400" type="submit">Create</button>
          <!-- Modals are wrapped in a transition node, so we call the transition's parent, which is our ModalBase. -->
          <button class="bg-red-400" @click="startClose">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import { useStore } from 'vuex';
import { key } from '@/store';
import axios from 'axios';

export default defineComponent({
  setup() {
    const store = useStore(key);
    return { store };
  },
  data() {
    const formState = reactive({
      title: '',
      description: '',
      date: '',
    });
    return { formState };
  },
  methods: {
    startClose() {
      this.$emitter.emit('start-close-modal');
    },
    async createEvent() {
      console.log(this.formState.date);
      try {
        const res = await axios({
          url: 'http://localhost:4000/graphql',
          method: 'post',
          data: {
            query: `
						mutation createEvent($args:EventDetailsInput!) {
							createEvent(details: $args) {
								title
								description
								date
							}
						}
					`,
            variables: {
              args: {
                ...this.formState,
              },
            },
          },
          headers: {
            Authorization: this.store.getters.getAuth,
          },
        });
        if (!res.data.errors) {
          this.startClose();
        } else {
          console.error(res.data.errors);
        }
      } catch (err) {
        console.log(err);
      }
    },
  },
});
</script>

<style scoped>
button {
  @apply px-2;
  @apply rounded;
  @apply text-white;
}
</style>
