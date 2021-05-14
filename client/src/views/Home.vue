<template>
  <div class="grid grid-cols-3 grid-rows-2 h-full">
    <div id="feed" class="bg-gray-100">
      <a>Everyone</a>
      <a>Friends</a>
      <a>Groups</a>
      <!-- Posts -->
      <ul>
        <li>
          <div id="new-post" class="post">
            <span class="flex items-baseline">Post Something</span>
            <input class="px-5 py-2 w-full" placeholder="Create a post..." />
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
    </div>
    <div id="jobs">
      <a>Jobs For You</a>
      <ul>
        <li v-for="g in gigs" :key="g.gigId" class="w-full">
          <div class="bg-white rounded-xl shadow my-6 mx-6">
            <h2 class="text-lg">{{ g.title }}</h2>
            <span>
              <ul class="flex text-sm space-x-3 my-2">
                <li
                  v-for="t in g.tags"
                  :key="t"
                  class="bg-gray-100 rounded-full px-1"
                >
                  {{ t }}
                </li>
              </ul>
            </span>
            <p class="text-xs">posted {{ fdate(g.timestamp) }}</p>
          </div>
        </li>
        <li>
          <div
            class="bg-green-300 text-white rounded-xl shadow my-6 mx-6 hover:opacity-80"
          >
            <h2 class="text-lg text-center">more jobs</h2>
          </div>
        </li>
      </ul>
    </div>
    <div id="events">
      <a>Upcoming Events</a>
      <ul>
        <li v-for="e in events" :key="e.id">
          <div class="bg-white rounded-xl shadow my-6 mx-6">
            <h2 class="text-lg">{{ e.title }}</h2>
            <p class="text-xs">by {{ e.organizer }}</p>
            <p>{{ fdate(e.date) }}</p>
            <span>
              <ul class="flex text-sm space-x-3 mt-2">
                <li
                  v-for="t in e.tags"
                  :key="t"
                  class="bg-gray-100 rounded-full px-1"
                >
                  {{ t }}
                </li>
              </ul>
            </span>
          </div>
        </li>
        <li>
          <div
            class="bg-green-300 text-white rounded-xl shadow my-6 mx-6 hover:opacity-80"
          >
            <h2 class="text-lg text-center">more events</h2>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

const posts = [
  {
    author: "Abc Defg",
    post: "Hello world",
    postId: 0,
    timestamp: Date.now(),
  },
  {
    author: "Abc Defg",
    post: "Test post please ignore",
    postId: 1,
    timestamp: Date.now(),
  },
  {
    author: "Abc Defg",
    post: "Test post 2 please ignore",
    postId: 2,
    timestamp: Date.now(),
  },
];

const gigs = [
  {
    title: "Musicians for wedding",
    tags: ["piano", "strings", "wedding", "music"],
    date: new Date(2021, 7, 20),
    timestamp: Date.now(),
    id: 1,
  },
  {
    title: "Designer for Website",
    tags: ["designer", "web"],
    date: new Date(2021, 7, 20),
    timestamp: Date.now(),
    id: 2,
  },
];

const events = [
  {
    title: "Senior Recital",
    tags: ["music", "piano"],
    organizer: "Lolo Wolo",
    date: new Date(2021, 7, 16, 10, 30),
    timestamp: Date.now(),
    id: 0,
  },
];

export default defineComponent({
  data() {
    return {
      events,
      posts,
      gigs,
    };
  },
  methods: {
    fdate(_date: number) {
      const date = new Date(_date);
      return `at ${date.getHours()}:${date.getMinutes()} on ${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
    },
  },
});
</script>

<style scoped>
#feed {
  @apply col-start-1;
  @apply col-end-3;
  grid-row-start: 1;
  grid-row-end: last-line;
}

#jobs {
  grid-column-start: 3;
  grid-column-end: 3;
	grid-row-start: 1;
	grid-row-end: 2;
}

#events {
  grid-column-start: 3;
  grid-row-start: 2;
  grid-row-end: last-line;
}

.post {
  @apply bg-white;
  @apply rounded-xl;
  @apply shadow;
  @apply my-6;
  @apply mx-6;
  @apply p-2;
}
</style>
