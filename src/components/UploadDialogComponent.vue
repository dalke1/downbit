<template>
  <q-dialog v-model="showDialog">
    <q-card style="min-width: 500px; min-height: 600px;">
      <q-card-section>
        <div class="text-h6 text-bold text-center">上传视频</div>
      </q-card-section>

      <q-separator color="primary" />

      <q-card-section>
        <q-form @submit="uploadVideo" class="q-gutter-sm">
          <!-- 视频标题 -->
          <q-input v-model="uploadForm.title" filled label="视频标题" :rules="[val => !!val || '标题不能为空']"
            ref="videoTitleRef" />

          <!-- 视频描述 -->
          <q-input v-model="uploadForm.description" filled type="textarea" label="视频描述"
            :rules="[val => !!val || '描述不能为空']" ref="videoDescRef" />

          <!-- 视频封面 -->
          <q-uploader label="上传封面" accept=".jpg,.jpeg" :max-files="1" flat bordered class="col" hide-upload-btn
            @added="getCoverUrl" />
          <span v-if="showCoverError" class="text-negative">请添加视频封面</span>

          <!-- 视频文件 -->
          <q-uploader label="上传视频" accept="video/mp4" :max-files="1" flat bordered hide-upload-btn
            @added="getVideorUrl" />
          <span v-if="showVideoError" class="text-negative">请添加视频文件</span>

          <!-- 视频标签 -->
          <multiselect id="tagging" v-model="uploadForm.tags" placeholder="添加标签" label="name" track-by="code"
            :options="tagOptions" :multiple="true" :taggable="true" :max="2" :disabled="uploadLoading"  @select="() => showTagError = false"
            class="q-mt-md">
            <template #maxElements="props">
              <span class="text-negative">最多只能选择2个标签</span>
            </template>
          </multiselect>
          <span v-if="showTagError" class="text-negative">请选择标签</span>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="取消" color="negative" v-close-popup />
        <q-btn flat label="上传" color="primary" @click="uploadVideo" :loading="uploadLoading"/>
      </q-card-actions>

      <q-inner-loading :showing="uploadLoading">
        <q-spinner-bars color="primary" size="50px" />
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getUploadUrl, uploadVideoDetails, uploadFile, Tag, getTags } from 'src/utils/axiosUtil';
import { QInput, useQuasar, QUploader } from 'quasar';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css';
import { values } from 'video.js/dist/types/utils/obj';
import { title } from 'process';

const $q = useQuasar();

const props = defineProps({
  showUploadDialog: Boolean
});

const emit = defineEmits(['update:showUploadDialog']);
const showDialog = computed({
  get: () => props.showUploadDialog,
  set: (value) => {
    emit('update:showUploadDialog', value);
  }
});

interface UploadForm {
  title: string;
  description: string;
  cover: File | null;
  video: File | null;
  tags: Tag[];
}

const uploadForm = ref<UploadForm>({
  title: '',
  description: '',
  cover: null,
  video: null,
  tags: []
});

const tagOptions = ref<Tag[]>([]);

const coverUrl = ref('');
const videoUrl = ref('');

const videoTitleRef = ref<InstanceType<typeof QInput> | null>(null);
const videoDescRef = ref<InstanceType<typeof QInput> | null>(null);

const showVideoError = ref(false);
const showCoverError = ref(false);
const showTagError = ref(false);

const uploadLoading = ref(false);

async function uploadVideo() {
  videoTitleRef.value?.validate();
  videoDescRef.value?.validate();
  if (videoTitleRef.value?.hasError || videoDescRef.value?.hasError) {
    return;
  }
  console.log("获取视频标题:" + uploadForm.value.title);
  console.log("获取视频描述:" + uploadForm.value.description);

  if (!uploadForm.value.cover) {
    showCoverError.value = true;
    return;
  }
  console.log("获取封面文件:" + uploadForm.value.cover.name);
  if (!uploadForm.value.video) {
    showVideoError.value = true;
    return;
  }
  console.log("获取视频文件:" + uploadForm.value.video.name);

  if (uploadForm.value.tags.length === 0) {
    showTagError.value = true;
    return;
  }
  console.log("获取上传视频的标签:" + uploadForm.value.tags);
  let tagNames = uploadForm.value.tags.map(tag => tag.name);
  uploadLoading.value = true;
  videoUrl.value = await getUploadUrl("video", uploadForm.value.video.name);
  coverUrl.value = await getUploadUrl("cover", uploadForm.value.cover.name);
  if (!videoUrl.value || !coverUrl.value) {
    console.log("获取上传链接失败");
    uploadLoading.value = false;
    return;
  }
  let videoUploadResult = await uploadFile(videoUrl.value, uploadForm.value.video);
  let coverUploadResult = await uploadFile(coverUrl.value, uploadForm.value.cover);
  let uploadResult = false;
  if (videoUploadResult && coverUploadResult) {
    console.log("上传视频成功");
    uploadResult = await uploadVideoDetails(uploadForm.value.title, uploadForm.value.description, uploadForm.value.video.name, uploadForm.value.cover.name, tagNames);
  }
  if (uploadResult) {
    $q.notify({
      type: 'positive',
      message: '上传视频成功'
    });
    clearAll()
    showDialog.value = false;
  } else {
    $q.notify({
      type: 'negative',
      message: '上传失败'
    });
  }
  uploadLoading.value = false;
}

function getCoverUrl(files: readonly any[]) {
  if (files && files.length > 0) {
    uploadForm.value.cover = files[0];
    console.log("获取封面文件:" + uploadForm.value.cover?.name);
    showCoverError.value = false;
  }
}

function getVideorUrl(files: readonly any[]) {
  if (files && files.length > 0) {
    uploadForm.value.video = files[0];
    console.log("获取视频文件:" + uploadForm.value.video?.name);
    showVideoError.value = false;
  }
}

function clearAll() {
  coverUrl.value = '';
  videoUrl.value = '';
  uploadForm.value.title = '';
  uploadForm.value.description = '';
  uploadForm.value.cover = null;
  uploadForm.value.video = null;
  uploadForm.value.tags = [];
}

onMounted(async () => {
  tagOptions.value = await getTags();
  console.log("获取所有标签:" + tagOptions.value);
});
</script>
<style lang="scss">
.upload-card {
  .q-img {
    border-radius: 8px;
  }

  .q-uploader {
    width: 100%;
  }
}

.multiselect__tag {
  background-color: $primary !important;
}

/* 修改选项的选中背景色 */
.multiselect__option--highlight {
  background-color: $primary !important;
}

.multiselect__option--highlight::after {
  content: '选择';
  background-color: $primary !important;
}

.multiselect__option--selected.multiselect__option--highlight::after {
  content: '取消选择';
  background-color: $primary !important;
}

.multiselect__option--selected::after {
  content: '已选择';
}
</style>
