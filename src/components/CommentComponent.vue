<template>
  <q-item class="q-mb-md column">
    <q-item-section avatar top>
      <div class="row items-end">
        <q-img :src="comment.avatar" spinner-size="15px" spinner-color="primary" class="comment-avatar q-mr-md"></q-img>

        <div class="text-weight-bold">
          {{ comment.nickname }}
          <span class="text-grey-6 text-caption q-mx-sm">
            {{ comment.commentTime }}
          </span>
          <span v-if="!isParent && comment.nickname !== comment.replyTo" class="text-grey-8">回复:{{ comment.replyTo
            }}</span>
        </div>
      </div>
    </q-item-section>

    <q-item-section>
      <q-item-label class="q-py-sm">
        {{ comment.commentText }}
      </q-item-label>

      <div class="row justify-end q-mr-md">
        <q-btn flat round dense :icon="comment.isLike ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'"
          :color="comment.isLike ? 'primary' : 'grey'" @click="toggleLike(comment)" size="md">
          <q-badge color="red" floating rounded transparent>{{ comment.likeCount }}</q-badge>
        </q-btn>

        <q-btn flat round dense color="grey" @click="showReplyInput()">回复</q-btn>

        <q-btn flat round dense icon="more_vert" color="grey">
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup @click="reportComment(comment)">
                <q-item-section>举报</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-item-section>

    <q-item-section>
      <!-- 回复列表 -->
      <div v-if="isParent && comment.replyCount" class="row justify-center q-mb-xs">
        <q-btn flat dense :icon="showReplies ? 'expand_less' : 'expand_more'" :label="`${comment.replyCount} 条回复`"
          @click="handleClickShowReplies()" />
      </div>
      <q-slide-transition>
        <div v-show="showReplies">
          <CommentComponent v-for="(reply, index) in comment.replies" :key="index" :comment="reply" :isParent="false"
            :parentId="comment.id" @refreshReplies="fetchtReplies" @submitCommentPop="handleReplyPop" />
        </div>
      </q-slide-transition>
    </q-item-section>
    <q-item-section
      v-if="isParent && showReplies && comment.replyCount > (comment.replies ? comment.replies.length : 0)">
      <q-btn flat dense color="primary" @click="fetchtReplies" label="查看更多回复" />
    </q-item-section>
    <q-item-section>
      <div v-show="showInput">
        <q-slide-transition>
          <q-item>
            <q-item-section avatar top>
              <q-avatar size="28px">
                <q-img :src="replyAvatar" spinner-size="20px" spinner-color="primary"></q-img>
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-input v-model="replyContent" dense outlined autogrow
                :placeholder="replyTo ? `回复 ${replyTo}:` : '添加回复...'" :rows="1" type="textarea">
                <template v-slot:after>
                  <q-btn round dense flat icon="send" @click="submitReply" :loading="replyLoading" />
                  <q-btn round dense flat icon="close" @click="cancelReply" />
                </template>
              </q-input>
            </q-item-section>
          </q-item>
        </q-slide-transition>
      </div>
    </q-item-section>
    <q-separator color="primary" v-if="isParent" />
    <q-separator v-else />
  </q-item>
</template>
<script setup lang="ts">
import { useQuasar } from 'quasar';
import { Comment, reply, likeComment, dislikeComment, getReplies } from 'src/utils/axiosUtil';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUserStore } from 'src/stores/user';
import { emitter } from 'src/utils/commonUtil';

const $q = useQuasar();
const $userStore = useUserStore();
const props = defineProps<{
  comment: Comment,
  isParent: boolean,
  index?: number,
  parentId?: string
}>()

const emit = defineEmits<{
  (event: 'repliesFetch', payload: { replies: Comment[], index: number | any }): void,
  (event: 'refreshReplies'): void,
  (event: 'sumbitComment'): void,
  (event: "submitCommentPop"): void
}>();

function toggleLike(comment: Comment) {
  comment.isLike = !comment.isLike;
  if (comment.isLike) {
    likeComment(comment.id, props.isParent);
    comment.likeCount++;
  } else {
    dislikeComment(comment.id, props.isParent);
    comment.likeCount--;
  }
}

function reportComment(comment: Comment) {
  $q.notify({
    type: 'positive',
    message: '举报成功'
  });
}

const showReplies = ref(false);
const showInput = ref(false);
const replyContent = ref('');
const replyTo = ref('');
const replyAvatar = computed(() => {
  if ($userStore.isLogin) {
    return $userStore.avatar;
  } else {
    return "https://cdn.quasar.dev/img/boy-avatar.png";
  }
});

async function handleClickShowReplies() {
  if (!showReplies.value && (props.comment.replies === undefined || props.comment.replies.length === 0)) {
    await fetchtReplies();
  }
  showReplies.value = !showReplies.value;
}

function showReplyInput() {
  if (showInput.value) {
    cancelReply();
    return;
  }
  emitter.emit('closeOtherReplies', props.comment.id);
  showInput.value = true;
  replyTo.value = props.comment.nickname;
}

function cancelReply() {
  showInput.value = false;
  replyContent.value = '';
  replyTo.value = '';
}

async function fetchtReplies() {
  let length = props.comment.replies ? props.comment.replies.length : 0;
  let replies: Comment[] = await getReplies(props.comment.id, length);
  if (!replies || replies.length === 0) {
    return;
  }
  console.log(replies);
  emit('repliesFetch', { replies, index: props.index });
}

const replyLoading = ref(false);

async function submitReply() {
  if (!$userStore.isLogin) {
    $q.notify({
      type: 'negative',
      message: '请先登录'
    });
    cancelReply();
    return;
  }
  if (!replyContent.value.trim()) {
    return;
  }
  replyLoading.value = true;
  let replyId = '';
  if (props.isParent) {
    replyId = props.comment.id;
  } else {
    replyId = props.parentId ? props.parentId : '';
  }
  await reply(props.comment.videoId, replyContent.value, replyTo.value, replyId);
  if (props.isParent) {
    fetchtReplies();
    emit('sumbitComment');
    props.comment.replyCount++;
  } else {
    emit('refreshReplies');
    emit('submitCommentPop');
  }
  // 清空输入框并隐藏
  replyLoading.value = false;
  cancelReply();
}

function handleReplyPop() {
  props.comment.replyCount++;
  emit('sumbitComment');
}


onMounted(() => {
  emitter.on('closeOtherReplies', (currentId) => {
    if (currentId !== props.comment.id) {
      cancelReply();
    }
  });
});

onUnmounted(() => {
  emitter.off('closeOtherReplies');
});
</script>
<style lang="scss">
.comment-avatar {
  display: inline-block !important;
  width: 30px;
  height: 30px;

  img {
    display: inline-block !important;
  }
}
</style>
