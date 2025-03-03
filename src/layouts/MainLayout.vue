<template>

  <q-layout view="hHh lpR lFf">

    <q-header elevated class="bg-white text-primary shadow-10 top" height-hint="98">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>
          <div class="row justify-between">
            <!--添加downbit.jpg的logo在此处-->
            <q-img :src="logo" class="q-mr-lg" style="height: 40px; width: 40px;" />
            <AvatarComponent class="q-mr-lg" />
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer class="bg-grey-2" show-if-above v-model="leftDrawerOpen" side="left" :width="150" bordered
      :breakpoint="500">
      <q-scroll-area class="fit">
        <LeftNavigationComponent />
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <!-- <q-scroll-area style="height: calc(100vh)"> -->
        <router-view />
      <!-- </q-scroll-area> -->
    </q-page-container>

    <Teleport to="body">
      <LoginDialogComponent />
    </Teleport>
  </q-layout>
</template>

<script setup lang="ts">
import AvatarComponent from "../components/AvatarComponent.vue";
import LoginDialogComponent from "../components/LoginDialogComponent.vue";
import LeftNavigationComponent from "../components/LeftNavigationComponent.vue";
import { ref } from "vue";
import logo from "src/assets/downbit.jpg";
import 'animate.css';

const leftDrawerOpen = ref(false);
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

<style lang="scss">
.top {
  line-height: 50px;
}
</style>
