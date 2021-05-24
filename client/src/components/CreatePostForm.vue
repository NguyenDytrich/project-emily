<template>
  <div class="">
    <h1>Create post</h1>
    <div ref="editor" v-html="value"></div>
    <div>Create</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import Quill from "quill";
export default defineComponent({
  setup() {
    return { editor: null };
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

    this.editor.root.innerHTML = this.value;
    this.editor.on("text-change", (delta) => this.update(delta));
  },
  data() {
    const value = ref("");
    return {
      value,
    };
  },
  methods: {
    update(delta) {
      this.$emit("input", this.editor.getText() ? this.editor.rootHTML : "");
      console.log(delta);
    },
  },
});
</script>

<style scoped>
@import "~quill/dist/quill.core.css";
@import "~quill/dist/quill.snow.css";
</style>
