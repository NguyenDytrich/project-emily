<template>
  <div class="bg-white w-3/4 mx-auto mt-5">
    <div id="controls" class="flex border-b-2 mx-5 pt-5 px-2 justify-between">
      <div class="flex">
        <h1 class="mr-10 pb-2">May 2020</h1>
        <span class="mr-5">prev</span><span>next</span>
      </div>
      <div>
        <a @click="toggleModal">+ create event</a>
      </div>
    </div>
    <div id="dates" class="p-5">
      <div class="grid grid-cols-7">
        <div v-for="h in dayHeaders" :key="h" class="h-10 text-gray-400 px-2">
          {{ h }}
        </div>
        <!-- Date squares -->
        <div class="date-square" v-for="d in dates" :key="d.date">
          <a class="date-content" :class="{ today: d.today }">{{
            d.date > 0 ? d.date : ""
          }}</a>
          <div v-if="d.events?.length > 0" class="events">
            <div v-for="e in d.events" :key="e.name" class="event">
              {{ e.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <transition name="fade">
      <ModalBase v-if="showModal" @close-modal="closeModal">
        <CreateEventForm />
      </ModalBase>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onBeforeMount } from "vue";
import ModalBase from "../components/ModalBase.vue";
import CreateEventForm from "../components/CreateEventForm.vue";

/**
 * Function that returns the number of dates
 * @param{number} month The 0-indexed month
 * @param{number} year The year to get
 */
function daysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

interface CalendarEvent {
  date: number;
  today?: boolean;
  events?: EventDetails[];
}

interface EventDetails {
  name: string;
}

export default defineComponent({
  components: {
    ModalBase,
    CreateEventForm,
  },
  data() {
    const dates = reactive([] as CalendarEvent[]);
    const dayHeaders = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const showModal = ref(false);
    onBeforeMount(async () => {
      const today = new Date();
      for (let i = 1; i < today.getDay(); i++) {
        dates.push({ date: -i, today: false });
      }
      for (
        let i = 0;
        i < daysInMonth(today.getMonth(), today.getFullYear());
        i++
      ) {
        dates.push({ date: i + 1, today: i + 1 == today.getDate() });
      }
      // TODO: API calls
      dates[8].events = [{ name: "Test event" }];
      dates[19].events = [{ name: "Test event 2" }, { name: "Test event 3" }];
    });
    return {
      dates,
      dayHeaders,
      showModal,
    };
  },
  methods: {
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
.date-square {
  padding-top: 100%;
  position: relative;
}

a.date-content {
  @apply text-center;

  padding: 0.3em 0;
  @apply px-2;
  position: absolute;
  top: 0;
}

.date-square .events {
  @apply text-xs;
  position: absolute;
  padding: 0.25em;
  top: 3em;
  width: 90%;
}

.events .event {
  @apply bg-yellow-400;
  @apply mb-1;
  @apply rounded;
}

.start {
  @apply rounded-l-full;
}

a.today {
  @apply bg-green-400;
  @apply rounded-full;
}

.fade-enter-active,
.fade-leave-active {
  @apply z-30;
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
