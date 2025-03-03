<template>
  <div class="container">
    <div class="video-box" :class="{ 'slide-left': showComments }" v-if="videos.length > 0">
      <video-player :options="options" id="myPlayer" playsinline :class="videoAnimation"
        class="video-content animation">
        <transition name="fadeTitle">
          <span class="text-bold text-h6 absolute-top text-white text-left q-mx-lg" v-show="showTitle">
            {{ videos[videoIndex].title }}</span>
        </transition>
        <transition name="fade">
          <div class="video-actions-box" :class="fullscreenStyle" v-show="showingVideoActions">
            <q-btn size="lg" color="white" text-color="primary" :icon="showLike" @click="handleClickLike()" round flat
              dense>
              <q-badge color="red" floating>{{ videos[videoIndex].likeCount }}</q-badge>
            </q-btn>
            <q-btn size="lg" color="white" text-color="primary" icon="mdi-comment-processing-outline"
              @click="handleClickComment()" round flat dense>
              <q-badge color="positive" floating>{{ videos[videoIndex].commentCount }}</q-badge>
            </q-btn>
            <q-btn size="lg" color="white" text-color="primary" :icon="showStar" @click="handleClickStar()" flat dense
              round>
            </q-btn>
          </div>
        </transition>
      </video-player>
      <q-inner-loading :showing="videoLoading">
        <q-spinner-audio color="primary" size="70px" />
      </q-inner-loading>
    </div>

    <!-- 评论区域 -->
    <transition name="fadeComment">
      <div v-if="showComments" class="comments-box">
        <div class="comments-header">
          <span class="text-h6">评论区</span>
          <q-btn flat round icon="close" @click="handleClickComment" />
        </div>
        <!-- 评论列表内容 -->
        <div class="comments-content relative-position">

          <q-scroll-area style="height: 500px;">
            <div v-if="showEmptyTips" class="text-center text-h6">暂无评论</div>
            <CommentComponent v-for="(comment, index) in comments" :key="index" :comment="comment" :isParent="true"
              :index="index" @repliesFetch="handleFetchReplies">
            </CommentComponent>
          </q-scroll-area>
          <!-- 评论输入框 -->
          <q-item>
            <q-item-section avatar>
              <q-btn icon="mdi-emoticon-happy-outline" round color="primary"></q-btn>
            </q-item-section>
            <q-item-section>
              <q-input v-model="newComment" dense outlined placeholder="添加评论...">
                <template v-slot:after>
                  <q-btn round dense flat icon="send" @click="addComment" :loading="commentLoading" />
                </template>
              </q-input>
            </q-item-section>
          </q-item>
          <q-inner-loading :showing="commentBoxLoading">
            <q-spinner-bars color="primary" size="50px" />
          </q-inner-loading>
        </div>
      </div>
    </transition>

    <div class="switch-actions-box">
      <q-btn @click="prevVideo" size="lg" color="primary" :disable="diableSwitch || disableTopSwitch"
        icon="mdi-arrow-up" round outline dense>
      </q-btn>
      <q-btn @click="nextVideo" size="lg" color="primary" :disable="diableSwitch" icon="mdi-arrow-down" round outline
        dense>
      </q-btn>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import lang_zhcn from "video.js/dist/lang/zh-CN.json"
import videojs from 'video.js'
import { Video, Comment, addHistory, like, dislike, recommend, removeVideoFromFavorite, addVideoToFavorite, getHotComments, getNewComments, addNewComment } from 'src/utils/axiosUtil';
import Player from 'video.js/dist/types/player';
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user';
import CommentComponent from './CommentComponent.vue';

videojs.addLanguage('zh-CN', lang_zhcn);

const $q = useQuasar();
const $userStore = useUserStore();
let player: Player;
const videoIndex = ref(0);
let videoTotal = 0;

const videoAnimation = ref('');
const diableSwitch = ref(false);
const disableTopSwitch = ref(true);
const showTitle = ref(true);
const showingVideoActions = ref(true);
const fullscreenStyle = ref('')

const showLike = computed(() => videos.value[videoIndex.value].isLike ? 'mdi-thumb-up' : 'mdi-thumb-up-outline')
const showComments = ref(false)
const showStar = computed(() => videos.value[videoIndex.value].isFavorite ? 'mdi-star' : 'mdi-star-outline')
const favoriteName = ref('默认收藏夹')


const videos = ref<Video[]>([]);
const videoLoading = ref(false);
interface source {
  type: string;
  src: string;
}

const options = ref({
  height: "670px",
  width: "400px",
  autoplay: false,
  muted: true,
  language: 'zh-CN',
  preload: 'auto',
  // playbackRates: [0.5, 1, 1.5, 2], // 播放速度
  sources: [] as source[],
  controls: true, // 是否显示控制条
  controlBar: {
    timeDivider: true,
    durationDisplay: true,
    fullscreenToggle: true, // 全屏按钮
    remainingTimeDisplay: false, // 隐藏剩余时间
    playToggle: true, // 暂停和播放键
    progressControl: true,  // 进度条
    // playbackRateMenuButton: true
  }
})

function handleClickLike() {
  if (!$userStore.isLogin) {
    $q.notify({
      type: "warning",
      message: "请先登录"
    })
    return;
  }
  if (videos.value[videoIndex.value].isLike) {
    videos.value[videoIndex.value].likeCount--;
    dislike(videos.value[videoIndex.value].videoId)
  } else {
    videos.value[videoIndex.value].likeCount++;
    like(videos.value[videoIndex.value].videoId)
  }
  videos.value[videoIndex.value].isLike = !videos.value[videoIndex.value].isLike;
}


const comments = ref<Comment[]>([]);
const showEmptyTips = ref(false);
const commentBoxLoading = ref(false);

async function handleClickComment() {
  showComments.value = !showComments.value;
  if (showComments.value) {
    await fetchComments();
  }
}

async function fetchComments() {
  commentBoxLoading.value = true;
  comments.value = await getHotComments(videos.value[videoIndex.value].videoId, 0);
  console.log(comments.value);
  showEmptyTips.value = comments.value === null || comments.value?.length === 0;
  commentBoxLoading.value = false;
}

const newComment = ref<string>('');
const commentLoading = ref(false);

async function addComment() {
  if (!newComment.value.trim()) {
    return;
  }
  commentLoading.value = true;
  await addNewComment(videos.value[videoIndex.value].videoId, newComment.value)
  newComment.value = '';
  commentLoading.value = false;
}

function handleFetchReplies(payload: { replies: Comment[], index: number }) {
  comments.value[payload.index].replies = payload.replies;
}

function handleClickStar() {
  if (!$userStore.isLogin) {
    $q.notify({
      type: "warning",
      message: "请先登录"
    })
    return;
  }
  if (videos.value[videoIndex.value].isFavorite) {
    removeVideoFromFavorite(favoriteName.value, videos.value[videoIndex.value].videoId)
  } else {
    addVideoToFavorite(favoriteName.value, videos.value[videoIndex.value].videoId)
  }
  videos.value[videoIndex.value].isFavorite = !videos.value[videoIndex.value].isFavorite;
}


async function getRecommend() {
  videoLoading.value = true;
  try {
    let video: Video = await recommend() as Video;
    videos.value.push(video);
    options.value.sources.push({
      src: video.videoUrl,
      type: video.videoType
    });

    videoTotal = videoTotal + 1;
  } catch (error) {
    console.log(error);
    $q.notify({
      type: 'negative',
      message: '视频加载失败',
    });
    throw error;
  } finally {
    videoLoading.value = false;
  }
}

async function nextVideo() {
  await getRecommend();
  videoAnimation.value = 'animate__slideInUp';
  diableSwitch.value = true;
  // 等待动画结束后移除类名
  setTimeout(() => {
    videoAnimation.value = '';
    diableSwitch.value = false;
  }, 1000);

  videoIndex.value++;
  player.src(options.value.sources[videoIndex.value].src);
  disableTopSwitch.value = false;
  if (showComments.value) {
    await fetchComments();
  }
}

async function prevVideo() {
  videoAnimation.value = 'animate__slideInDown';
  diableSwitch.value = true;
  setTimeout(() => {
    videoAnimation.value = '';
    diableSwitch.value = false;
  }, 1000);

  if (videoIndex.value > 0) {
    videoIndex.value--;
  } else {
    disableTopSwitch.value = true;
  }
  player.src(options.value.sources[videoIndex.value].src);
  if(showComments.value){
    await fetchComments();
  }
}



async function initPlayer() {
  await getRecommend();
  // 初始化 Video.js 播放器
  player = videojs("myPlayer");
  let controlBar = player.getChild('ControlBar')
  controlBar?.getChild('PictureInPictureToggle')?.dispose()
  player.on('play', () => {
    if ($userStore.isLogin) {
      addHistory(videos.value[videoIndex.value].videoId)
    }
  })
  player.on('userinactive', () => {
    showTitle.value = false;
    showingVideoActions.value = false;
  })
  player.on('useractive', () => {
    showTitle.value = true;
    showingVideoActions.value = true;
  })
  player.on('fullscreenchange', () => {
    if (player.isFullscreen()) {
      fullscreenStyle.value = 'fullscreen-video-actions'
    }
    else {
      fullscreenStyle.value = ''
    }
  })
  player.src(options.value.sources[videoIndex.value].src);
}

onMounted(async () => {
  await initPlayer();
});

onUnmounted(() => {
  if (player) {
    player.dispose();
  }
});
</script>

<style lang="scss">
.container {
  height: 750px;
}

.video-box {
  position: relative;
  width: 400px;
  margin: 0 auto;
  padding-top: 20px;
  overflow: hidden;
  transition: transform 0.3s ease-in-out;

  &.slide-left {
    transform: translateX(-300px);
  }
}

.comments-box {
  position: absolute;
  bottom: 8.5%;
  left: 50%;
  width: 500px;
  height: 650px;
  background: #ffffff;
  border-radius: 4px; // 常用的圆角值
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);

  &:hover {
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16); // 悬停时加深阴影
  }

  .comments-header {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
  }

  .comments-content {
    padding: 16px;
    height: calc(100% - 60px);
    overflow-y: auto;
  }
}

.video-content {
  position: relative;
}

.video-actions-box {
  width: fit-content;
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 85%;
  bottom: 20%;

  .q-btn {
    margin-bottom: 10px;
  }
}

.fullscreen-video-actions {
  left: 95%;
  bottom: 20%;
}

.switch-actions-box {
  position: fixed;
  left: 95%;
  bottom: 45%;
  display: flex;
  flex-direction: column;
  width: fit-content;
  height: fit-content;

  .q-btn {
    margin-bottom: 10px;
  }

}

.animation {
  animation-duration: 1s;
}

.fade-enter-active,
.fade-leave-active {
  animation-duration: 0.5s;
  animation-fill-mode: both;
}

.fade-enter-from {
  opacity: 0;
  animation-name: fadeInRight;
}

.fade-enter-to {
  opacity: 1;
  animation-name: fadeInRight;
}

.fade-leave-from {
  opacity: 1;
  animation-name: fadeOut;
}

.fade-leave-to {
  opacity: 0;
  animation-name: fadeOut;
}



.fadeTitle-enter-active,
.fadeTitle-leave-active {
  animation-duration: 0.5s;
  animation-fill-mode: both;
}

.fadeTitle-enter-from {
  opacity: 0;
  animation-name: fadeInDown;
}

.fadeTitle-enter-to {
  opacity: 1;
  animation-name: fadeInDown;
}

.fadeTitle-leave-from {
  opacity: 1;
  animation-name: fadeOut;
}

.fadeTitle-leave-to {
  opacity: 0;
  animation-name: fadeOut;
}



// 评论区动画
.fadeComment-enter-active,
.fadeComment-leave-active {
  animation-duration: 0.5s;
  animation-fill-mode: both;
}

.fadeComment-enter-from {
  opacity: 0;
  animation-name: fadeIn;
}

.fadeComment-enter-to {
  opacity: 1;
  animation-name: fadeIn;
}

.fadeComment-leave-from {
  opacity: 1;
  animation-name: fadeOut;
}

.fadeComment-leave-to {
  opacity: 0;
  animation-name: fadeOut;
}


.video-js {
  width: 400px;
  border-radius: 17.5px;

  video {
    border-radius: 17.5px;
    object-fit: fill;
  }
}

.video-js .vjs-control-bar {
  flex-wrap: wrap !important;
  background: transparent !important;
  bottom: 30px;
  color: $primary;

  .vjs-play-progress {
    background-color: $primary !important;
  }
}

.video-js .vjs-control-bar .vjs-progress-control {
  flex-basis: 100% !important;
  order: 1;
}

.video-js .vjs-control-bar .vjs-play-control,
.video-js .vjs-control-bar .vjs-volume-panel,
.video-js .vjs-control-bar .vjs-fullscreen-control {
  order: 2;
  flex: 0 1 auto;
}

.video-js .vjs-control-bar .vjs-fullscreen-control {
  margin-left: auto;
}
</style>
