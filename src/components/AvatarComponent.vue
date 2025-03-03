<template>
  <div v-if="$userStore.isLogin" class="avatar-style">
    <teleport to="body">
      <q-btn id="avatar" class="avatar-btn absolute-top-right animate__animated"
        :class="[{ 'menu-showing': menuShowing }, avatarAnimation]" round flat>
        <q-avatar :size="avatarSize" @mouseenter="handleAvatarEnter" @mouseleave="handleAvatarLeave">
          <q-img :src="avatar">
            <template v-slot:loading>
              <q-spinner-dots color="primary" size="25px" />
            </template>
          </q-img>
        </q-avatar>
      </q-btn>
    </teleport>

    <q-menu max-width="170px" v-model="menuShowing" anchor="bottom middle" self="top left" transition-show="jump-down"
      transition-hide="jump-up" @mouseenter="handleMenuEnter" @mouseleave="handleMenuLeave" :offset="[0, 5]">

      <q-list style="margin-top: 40px;">
        <q-item class="text-primary" clickable v-ripple to="personal">
          <q-item-section side>
            <q-icon name="mdi-account-details" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>个人中心</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" color="primary" />
          </q-item-section>
        </q-item>
        <q-item class="text-primary" clickable v-ripple>
          <q-item-section side>
            <q-icon name="history" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>历史记录</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" color="primary" />
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item class="text-primary" clickable v-ripple @click="logout()">
          <q-item-section side>
            <q-icon name="mdi-account-cancel" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>退出登录</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>

  <q-btn v-else="$userStore.isLogin" @click="$userStore.showLoginDialog(true)"
    class="q-mt-xs animate__animated animate__fadeIn" style="height: 45px;margin-right: 140px;" round flat>
    <q-avatar size="45px" color="primary" text-color="white">
      <q-icon name="account_circle" size="45px" />
      <q-tooltip>点击登录</q-tooltip>
    </q-avatar>
  </q-btn>
</template>

<script setup lang="ts">
import { ref, onMounted, computed,watch } from 'vue';
import { useUserStore } from 'src/stores/user';
import { getAvatar } from 'src/utils/axiosUtil';
import { useQuasar } from 'quasar';
import { logoutUser } from 'src/utils/axiosUtil';

const $q = useQuasar();
const $userStore = useUserStore();

const avatar = ref('');
const avatarSize = computed(() => menuShowing.value ? '67px' : '43px');
const menuShowing = ref(false);
const avatarAnimation = computed(() => menuShowing.value ? 'animate__bounceIn' : 'animate__fadeIn');
const isInMenu = ref(false);
const isInAvatar = ref(false);
let avatarLeaveTimeout: NodeJS.Timeout | null | any = null;
let menuLeaveTimeout: NodeJS.Timeout | null | any = null;

function handleAvatarEnter() {
  if (avatarLeaveTimeout) {
    clearTimeout(avatarLeaveTimeout);
    avatarLeaveTimeout = null;
  }
  isInAvatar.value = true;
  menuShowing.value = true;
}

function handleAvatarLeave() {
  avatarLeaveTimeout = setTimeout(() => {
    if (!isInMenu.value) {
      menuShowing.value = false;
    }
  }, 100);
  isInAvatar.value = false;
}

function handleMenuEnter() {
  if (menuLeaveTimeout) {
    clearTimeout(menuLeaveTimeout);
    menuLeaveTimeout = null;
  }
  isInMenu.value = true;
}

function handleMenuLeave() {
  menuLeaveTimeout = setTimeout(() => {
    if (!isInAvatar.value) {
      menuShowing.value = false;
    }
  }, 100);
  isInMenu.value = false;
}

function logout() {
  logoutUser();
  $userStore.logout();
}

onMounted(async () => {
  if ($userStore.isLogin) {
    avatar.value = await getAvatar()
    $userStore.avatar = avatar.value;
  }
});

watch(() => $userStore.isLogin, async (newVal) => {
  if (newVal) {
    avatar.value = await getAvatar()
    $userStore.avatar = avatar.value;
  }
});
</script>

<style lang="scss" scoped>
.avatar-style {
  margin-right: 80px;
}

.avatar-btn {
  top: 3px;
  right: 140px;
  height: 45px;
  border: 1px solid $primary;
  z-index: 9999;
}

.menu-showing {
  top: 10px;
  height: 70px;
}
</style>
