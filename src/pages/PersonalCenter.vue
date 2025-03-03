<template>

  <div class="header-banner row items-center q-pa-md">
    <q-avatar size="120px">
      <q-img :src="avatar">
        <template v-slot:loading>
          <q-spinner-dots color="primary" size="25px" />
        </template>
      </q-img>
    </q-avatar>

    <!-- 用户信息与统计 -->
    <div class="column q-ml-md q-mt-lg">
      <div class="text-h6 text-bold">用户名</div>
      <div class="text-subtitle2 text-grey-3">个性签名或简介...</div>

      <!-- 统计区 -->
      <div class="row q-mt-sm text-center">
        <div>
          <div class="text-h6 text-bold">256</div>
          <div class="text-caption text-grey-1">关注</div>
        </div>
        <q-separator vertical class="q-mx-md" />
        <div>
          <div class="text-h6 text-bold">658</div>
          <div class="text-caption text-grey-1">粉丝</div>
        </div>
        <q-separator vertical class="q-mx-md" size="2px" />
        <div>
          <div class="text-h6 text-bold">1.2k</div>
          <div class="text-caption text-grey-1">获赞</div>
        </div>
      </div>
    </div>

    <!-- 编辑资料按钮 -->
    <q-btn color="primary" label="编辑资料" class="q-ml-auto" />
  </div>



  <!-- 选项卡区域 -->
  <q-tabs v-model="currentTab" inline-label class="bg-grey-2 text-blue-4 shadow-1 q-my-xs" align="justify"
    active-color="primary">
    <q-tab name="works" label="作品" icon="mdi-video" />
    <q-tab name="histories" label="历史记录" icon="history" />
    <q-tab name="likes" label="喜欢" icon="mdi-heart" />
    <q-tab name="favorites" label="收藏" icon="mdi-star" />
  </q-tabs>

  <q-scroll-area style="height: calc(100vh - 280px); width: 100%;">
    <q-tab-panels v-model="currentTab" animated class="bg-grey-2" swipeable>
      <!-- 作品 -->
      <q-tab-panel name="works" class="row q-gutter-x-md q-gutter-y-xl no-wrap">
        <q-card v-for="(work, index) in details.works" :key="index" class="bg-grey-2" bordered>
          <q-card-section horizontal>
            <q-item clickable>
              <q-img :src="work.coverUrl" fit="fill">
                <template v-slot:loading>
                  <q-spinner-dots color="primary" size="25px" />
                </template>
              </q-img>
            </q-item>
          </q-card-section>

          <q-card-section class="bg-grey-2">
            <q-item dense>
              <q-item-section>
                <q-item-label lines="1" class="text-center">
                  {{ work.title }}
                  <q-tooltip>{{ work.title }}</q-tooltip>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-card-section>

          <q-card-actions align="right" class="bg-grey-2" horizontal>
            <q-btn flat label="编辑" color="primary" />
            <q-btn flat label="删除" color="negative" />
          </q-card-actions>

        </q-card>
      </q-tab-panel>

      <!-- 历史记录 -->
      <q-tab-panel name="histories" class="row q-gutter-x-md q-gutter-y-md no-wrap">
        <q-card v-for="(history, index) in details.histories" :key="index" class="bg-grey-2" bordered>
          <q-card-section horizontal>
            <q-item clickable>
              <q-img :src="history.coverUrl" fit="fill">
                <template v-slot:loading>
                  <q-spinner-dots color="primary" size="25px" />
                </template>
              </q-img>
            </q-item>
          </q-card-section>

          <q-card-section class="bg-grey-2">
            <q-item dense>
              <q-item-section>
                <q-item-label lines="1" class="text-center">
                  {{ history.title }}
                  <q-tooltip>{{ history.title }}</q-tooltip>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- 喜欢 -->
      <q-tab-panel name="likes" class="row q-gutter-x-md q-gutter-y-md no-wrap">
        <q-card v-for="(like, index) in details.likes" :key="index" class="bg-grey-2" bordered>
          <q-card-section horizontal>
            <q-item clickable>
              <q-img :src="like.coverUrl" fit="fill">
                <template v-slot:loading>
                  <q-spinner-dots color="primary" size="25px" />
                </template>
              </q-img>
              <q-btn class="absolute-bottom-right text-pink" :icon="like.isLike ? 'mdi-heart' : 'mdi-heart-outline'"
                @click="handleClickLike(like.title, index)" flat>
              </q-btn>
            </q-item>
          </q-card-section>

          <q-card-section class="bg-grey-2">
            <q-item dense>
              <q-item-section>
                <q-item-label lines="1" class="text-center">
                  {{ like.title }}
                  <q-tooltip>{{ like.title }}</q-tooltip>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- 收藏 -->
      <q-tab-panel name="favorites">
        <!-- 左侧收藏夹列表区域 -->
        <div class="row">
          <div class="col-3">
            <q-scroll-area class="favorite-folder shadow-3">
              <q-list bordered class="bg-grey-1">
                <!-- 列表项：收藏夹 -->
                <q-item v-for="(folder, idx) in favoriteFolders" :key="folder.id" clickable
                  class="bg-primary text-grey-3 shadow-4" @click="showFolderVideos(folder.name)">
                  <q-item-section>{{ folder.name }}</q-item-section>
                  <q-item-section side>
                    <q-btn icon="mdi-delete" color="negative" flat @click.stop="deleteFolder(folder.id, folder.name)" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>

            <!-- 固定在底部的新增按钮 -->
            <div class="q-pa-sm">
              <q-btn color="primary" label="新增收藏夹" class="full-width" icon="add" @click="showFolderDialog = true" />
            </div>
          </div>

          <!-- 右侧收藏夹视频展示 -->
          <div class="col-9 row q-gutter-x-md q-gutter-y-md q-pl-lg">
            <q-card v-for="(video, index) in selectedFolderVideos" :key="index" class="bg-grey-2" bordered>
              <q-card-section horizontal>
                <q-item clickable>
                  <q-img :src="video.coverUrl" fit="fill">
                    <template #loading>
                      <q-spinner-dots color="primary" size="25px" />
                    </template>
                  </q-img>
                </q-item>
              </q-card-section>

              <q-card-section class="bg-grey-2">
                <q-item dense>
                  <q-item-section>
                    <q-item-label lines="1" class="text-center">
                      {{ video.title }}
                      <q-tooltip>{{ video.title }}</q-tooltip>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- 新增收藏夹对话框 -->
        <q-dialog v-model="showFolderDialog" persistent>
          <q-card style="height: 100px;">
            <q-card-section class="q-mt-xs q-mx-xs">
              <q-input v-model="folderName" label="收藏夹名称" outlined />
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="取消" @click="showFolderDialog = false" />
              <q-btn flat label="确定" @click="confirmCreateFolder" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-tab-panel>
    </q-tab-panels>
  </q-scroll-area>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { getUserWorks, Video, getHistory, like, dislike, getLikes, getAvatar, addFavorite, removeFavorite, getFavorites, getFavoriteVideos } from 'src/utils/axiosUtil';
import video from 'src/boot/video';

interface Folder {
  id: number;
  name: string;
}

const favoriteFolders = ref<Folder[]>([]);

// 当前选中的收藏夹视频，实际可根据选中返回对应文件夹数据
const selectedFolderVideos = ref<Video[]>([]);

const showFolderDialog = ref(false);
const folderName = ref('');

async function showFolderVideos(folderName: string) {
  selectedFolderVideos.value = await getFavoriteVideos(folderName);
}


function deleteFolder(id: number, name: string) {
  favoriteFolders.value = favoriteFolders.value.filter(folder => folder.id !== id);
  removeFavorite(name);
}

// 点击“确定”按钮时创建新收藏夹
function confirmCreateFolder() {
  if (!folderName.value.trim()) {
    showFolderDialog.value = false;
    return;
  }

  favoriteFolders.value.push({
    id: favoriteFolders.value.length,
    name: folderName.value
  });
  addFavorite(folderName.value);
  folderName.value = '';
  showFolderDialog.value = false;
}

const avatar = ref('');
const currentTab = ref('works');
const details = ref({
  works: [] as Video[],
  histories: [] as Video[],
  likes: [] as Video[],
});

function handleClickLike(title: string, index: number) {
  console.log(title, index);
  if (details.value.histories[index].isLike) {
    dislike(title, details.value.likes[index].tags);
  } else {
    like(title, details.value.likes[index].tags);
  }
  details.value.histories[index].isLike = !details.value.histories[index].isLike
}


watch(
  () => currentTab.value,
  async (newTab) => {
    switch (newTab) {
      case 'works':
        details.value.works = await getUserWorks();
        break;
      case 'histories':
        details.value.histories = await getHistory();
        console.log(details.value.histories);
        break;
      case 'likes':
        details.value.likes = await getLikes();
        break;
      case 'favorites':
        let favorites: Array<string> = await getFavorites();
        favoriteFolders.value = favorites.map((name, index) => ({ id: index, name }));
        break;
    }
  }
)

onMounted(async () => {
  avatar.value = await getAvatar();
  switch (currentTab.value) {
    case 'works':
      details.value.works = await getUserWorks();
      break;
    case 'histories':
      details.value.histories = await getHistory();
      break;
    case 'likes':
      details.value.likes = await getLikes();
      break;
    case 'favorites':
      let favorites: Array<string> = await getFavorites();
      favoriteFolders.value = favorites.map((name, index) => ({ id: index, name }));
      break;
  }
});

</script>

<style lang="scss" scoped>
.header-banner {
  background: url("../assets/background.jpg") no-repeat center center;
  background-size: cover;
}

.stats-bar {
  border-radius: 4px;
  padding: 8px;
}

.q-tab-panels {
  min-height: 550px;
  width: 100%;
}

.q-tab-panel {
  min-height: 550px;

  .q-img {
    border-radius: 17.5px;
    width: 290px;
    height: 170px;
  }
}

.text-bold {
  font-weight: 600;
}

.q-tab {
  max-width: 100px;
}

.q-card {
  width: 290px;
  height: 200px;
  border-radius: 17.5px;
  box-shadow: none !important;

  .q-item {
    border-radius: 17.5px !important;
  }

  .q-card__section,
  .q-item,
  .q-card__actions {
    padding: 0 !important;
  }
}

.q-card--bordered {
  border: 0 !important;
}

.favorite-folder {
  height: 417px;
  // border: 1px solid black;
  border-radius: 12.5px;
}
</style>
