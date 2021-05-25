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
import axios from "axios";
import { useStore } from "vuex";
import { key } from "@/store";

export default defineComponent({
  setup() {
    const store = useStore(key);
    return { editor: null, store };
  },
  mounted() {
    this.editor = new Quill(this.$refs.editor, {
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, 4, false] }],
          ["bold", "italic", "underline"],
        ],
      },
      theme: "snow",
      formats: ["bold", "underline", "header", "italic"],
    });

    this.editor.on("text-change", (delta) => this.update(delta));
  },
  data() {
    const delta = ref(null);
    return {
      delta,
    };
  },
  methods: {
    update() {
      // Emit input event
      this.$emit("input", this.editor.getText() ? this.editor.rootHTML : "");
      this.delta = this.editor.getContents();
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
