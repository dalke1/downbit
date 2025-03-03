<template>
  <q-list padding>
    <q-item
    class="nav q-mx-xs"
    active-class="active-nav"
    v-for="link in links"
    :key="link.text"
    :to='link.to'
    clickable
    v-ripple>
      <q-item-section avatar>
        <q-icon :name="link.icon" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ link.text }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const links = ref([
  {
    icon: "mdi-home",
    text: "首页",
    to: 'home',
  },
  {
    icon: "mdi-fire",
    text: "推荐",
    to: 'recommend',
  },
  {
    icon: "mdi-cogs",
    text: "设置",
    to: 'home'
  },
  {
    icon: "mdi-help",
    text: "帮助",
    to: 'home'
  }
])
</script>

<style lang="scss" scoped>
.nav {
  border-radius: 12px;
  color: rgb(100, 100, 100)
}

.active-nav {
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-color: #E6E6E6;
  color: $primary;
  border: 1px dotted $primary;
}
</style>
