<template>
  <div class="">
    <h1>Create post</h1>
    <div ref="editor"></div>
    <div @click="submit">Create</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import Quill from "quill";
import Delta from "quill-delta";
import axios from "axios";
import { useStore } from "vuex";
import { key } from "@/store";

export default defineComponent({
  setup() {
    const store = useStore(key);
    return { quill: {} as Quill, store };
  },
  mounted() {
    this.quill = new Quill(this.$refs.editor as Element, {
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, 4, false] }],
          ["bold", "italic", "underline"],
        ],
      },
      theme: "snow",
      formats: ["bold", "underline", "header", "italic"],
    });

    this.quill.on("text-change", () => this.update());
  },
  data() {
    const delta = ref({} as Delta);
    return {
      delta,
    };
  },
  methods: {
    update() {
      // Emit input event
      this.$emit("input", this.quill.getText());
      this.delta = this.quill.getContents();
    },
    async submit() {
      if (this.delta == null) {
        console.log("Empty form");
        return;
      }
      try {
        const res = await axios({
          url: "http://localhost:4000/graphql",
          method: "post",
          data: {
            query: `
						mutation createPost($args:Delta!) {
							createPost(delta: $args) {
								id
								author {
									fname
								}
							}
						}
					`,
            variables: {
              args: JSON.stringify(this.delta),
            },
          },
          headers: {
            Authorization: this.store.getters.getAuth,
          },
        });
        if (!res.data.errors) {
          this.$emitter.emit("start-close-modal");
        } else {
          console.log(res.data);
        }
      } catch (err) {
        console.log(err);
      }
    },
  },
});
</script>

<style scoped>
@import "~quill/dist/quill.core.css";
@import "~quill/dist/quill.snow.css";
</style>
