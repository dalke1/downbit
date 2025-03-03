<template>
  <router-view/>
</template>

<script setup lang="ts">
defineOptions({
  name: 'App'
});
</script>

<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
  overflow: hidden !important;
  /* 禁用默认滚动 */
  scrollbar-width: none;
  /* Firefox */
}

::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}
</style>
