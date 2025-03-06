<template>
  <q-dialog v-model="$userStore.isDialogVisible" persistent>
    <q-card class="login-dialog">

      <q-card-section class="row justify-center q-pb-none">
        <q-btn-toggle class="toggle-border" v-model="loginMethod" :options="loginOptions" unelevated rounded />
        <q-btn icon="close" class="absolute-top-right" flat round dense v-close-popup />
      </q-card-section>

      <q-form>
        <q-card-section>
          <div v-if="loginMethod === 'password'">
            <q-input v-model="user.username" ref="usernameRef" label="用户名" debounce="500" clearable :rules="rules[0]"
              lazy-rules counter>
              <template v-slot:before>
                <q-icon name="mdi-account" />
              </template>
            </q-input>
            <q-input v-model="user.password" ref="passwordRef" :type="changePwdType" label="密码" debounce="500"
              :rules="rules[1]" lazy-rules counter>
              <template v-slot:append>
                <q-icon :name="changeEyes" class="cursor-pointer" @click="isPwd = !isPwd" v-show="showEyes" />
              </template>
              <template v-slot:before>
                <q-icon name="lock" />
              </template>
            </q-input>
          </div>
          <div v-else-if="loginMethod === 'register'">
            <q-input v-model="user.username" ref="usernameRef" label="用户名" debounce="500" clearable :rules="rules[0]"
              lazy-rules counter>
              <template v-slot:before>
                <q-icon name="mdi-account" />
              </template>
            </q-input>
            <q-input v-model="user.nickname" ref="nicknameRef" label="昵称" debounce="500" clearable :rules="rules[5]"
              lazy-rules counter>
              <template v-slot:before>
                <q-icon name="mdi-account" />
              </template>
            </q-input>
            <q-input v-model="user.phone" ref="phoneRef" label="手机号" type="tel" debounce="500" clearable
              :rules="rules[2]" lazy-rules mask="###########" hint="输入11位手机号">
              <template v-slot:before>
                <q-icon name="mdi-cellphone" />
              </template>
            </q-input>
            <q-input v-model="user.password" ref="passwordRef" :type="changePwdType" label="密码" debounce="500"
              :rules="rules[1]" lazy-rules counter>
              <template v-slot:append>
                <q-icon :name="changeEyes" class="cursor-pointer" @click="isPwd = !isPwd" v-show="showEyes" />
              </template>
              <template v-slot:before>
                <q-icon name="lock" />
              </template>
            </q-input>
          </div>
          <div v-else>
            <q-input v-model="user.phone" ref="phoneRef" label="手机号" type="tel" debounce="500" clearable
              :rules="rules[2]" lazy-rules mask="###########" hint="输入11位手机号">
              <template v-slot:before>
                <q-icon name="mdi-cellphone" />
              </template>
            </q-input>
            <q-input v-model="user.smsCode" ref="smsCodeRef" label="短信验证码" debounce="500" clearable :rules="rules[3]"
              lazy-rules mask="####" hint="输入4位数字验证码">
              <template v-slot:append>
                <q-btn flat label="发送验证码" @click="sendSmsCode" :disable="smsCountdown > 0" />
              </template>
            </q-input>
            <div v-if="smsCountdown > 0" class="text-negative">
              {{ smsCountdown }} 秒后可重新发送
            </div>
          </div>
          <!-- 图形验证码部分 -->
          <div class="captcha-section">
            <q-img :src="captchaImage" alt="图形验证码" @click="getCaptcha" class="captcha-image q-mb-md">
              <template v-slot:loading>
                <div class="text-subtitle1 text-white">
                  加载中...
                </div>
              </template>
              <template v-slot:error>
                <div class="bg-negative text-white">
                  无法获取图片
                </div>
              </template>
            </q-img>
            <q-input class="captcha-input" v-model="user.captcha" ref="captchaRef" label="图形验证码" clearable dense filled
              :rules="rules[4]" lazy-rules mask="NNNN" />
          </div>

        </q-card-section>
        <q-card-actions align="center">
          <div v-if="loginMethod === 'password'">
            <q-btn class="q-mr-md" label="注册" style="width:180px" :loading="registerLoading"
              @click="loginMethod = 'register'" rounded />
            <q-btn label="登录" color="primary" style="width:180px;" :loading="loginLoading" @click="login('')" rounded />
          </div>
          <div v-else-if="loginMethod === 'register'">
            <q-btn class="q-mr-md" label="注册" style="width:180px" :loading="registerLoading" @click="register()"
              rounded />
            <q-btn label="登录" color="primary" style="width:180px;" :loading="loginLoading"
              @click="loginMethod = 'password'" rounded />
          </div>
          <div v-else>
            <q-btn label="登录/注册" color="primary" style="width:200px" :loading="smsLoginLoading" @click="smsLogin()"
              rounded />
          </div>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useUserStore } from 'src/stores/user';
import { computed, ref, watch, onUnmounted } from 'vue';
import { QInput, useQuasar } from 'quasar';
import client from 'src/utils/axiosUtil';
import { generateUUID } from 'src/utils/commonUtil';

const $q = useQuasar();
const $userStore = useUserStore();
// 用户信息
interface User {
  nickname: string | any;
  username: string | any;
  password: string | any;
  phone: string | any;
  smsCode: string | any;
  captcha: string | any;
  captchaKey: string | any;
}

const user = ref<User>({
  nickname: '',
  username: '',
  password: '',
  phone: '',
  smsCode: '',
  captcha: '',
  captchaKey: ''
})


// 登陆方式选项
const loginOptions = [
  { label: '密码登录', value: 'password' },
  { label: '验证码登录', value: 'sms' }
]
// 登陆方式状态
const loginMethod = ref<'password' | 'sms' | 'register'>('password');
// 密码是否可见状态
const isPwd = ref(false)
const changePwdType = computed(() => isPwd.value ? 'text' : 'password')
const showEyes = computed(() => user.value.password.length > 0)
const changeEyes = computed(() => isPwd.value ? 'visibility_off' : 'visibility')
// 短信验证码倒计时
const smsCountdown = ref(0);
let timer: number | null = null;
// 图形验证码
const captchaImage = ref('');
// 加载状态
const registerLoading = ref(false);
const loginLoading = ref(false);
const smsLoginLoading = ref(false);

// 输入框ref
const usernameRef = ref<InstanceType<typeof QInput> | null>(null);
const nicknameRef = ref<InstanceType<typeof QInput> | null>(null);
const passwordRef = ref<InstanceType<typeof QInput> | null>(null);
const phoneRef = ref<InstanceType<typeof QInput> | null>(null);
const smsCodeRef = ref<InstanceType<typeof QInput> | null>(null);
const captchaRef = ref<InstanceType<typeof QInput> | null>(null);
// 表单校验规则
const rules = ref([
  [
    (val: any) => !!val || '用户名不能为空',
    (val: any) => ((val || '').length <= 20 && (val || '').length >= 2) || '用户名最小长度2,最大长度20',
    (val: any) => /^[a-zA-Z0-9_]{2,10}$/.test(val) || '用户名仅可为字母、数字、下划线的组合',
  ],
  [
    (val: any) => !!val || '密码不能为空',
    (val: any) => ((val || '').length <= 12 && (val || '').length >= 4) || '密码最小长度4,最大长度12',
    (val: any) => /^[a-zA-Z0-9_@]{4,12}$/.test(val) || '密码仅可为字母、数字、下划线、@的组合'
  ],
  [
    (val: any) => !!val || '手机号不能为空',
    (val: any) => /^1[3-9]\d{9}$/.test(val) || '手机号格式不正确'
  ],
  [(val: any) => !!val || '短信验证码不能为空'],
  [(val: any) => !!val || '图形验证码不能为空'],
  [
    (val: any) => !!val || '昵称不能为空',
    (val: any) => ((val || '').length <= 12 && (val || '').length >= 2) || '昵称最小长度2,最大长度12',
    (val: any) => /^[\u4E00-\u9FA5a-zA-Z0-9_]{2,10}$/.test(val) || '昵称仅可为中文、字母、数字、下划线的组合',
  ],
])


// 获取图形验证码
function getCaptcha() {
  client.get("/auth/captcha", { responseType: 'arraybuffer' })
    .then((res) => {
      // 将图片数据转换为 Base64 格式
      const base64Image = btoa(
        new Uint8Array(res.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      captchaImage.value = `data:image/png;base64,${base64Image}`;
      // 获取响应头中的 captcha-key 字段
      user.value.captchaKey = res.headers['captcha-key'];
      console.log(user.value.captchaKey)
    })
    .catch((err) => {
      console.error(err);
    })
};


// 发送短信验证码
function sendSmsCode() {
  // 表单校验逻辑

  // 假设发送短信验证码的逻辑
  console.log(`发送验证码到手机号: ${user.value.phone}`);

  // 启动倒计时
  smsCountdown.value = 60;
  timer = window.setInterval(() => {
    if (smsCountdown.value > 0) {
      smsCountdown.value--;
    }
  }, 1000);
};


const uuid = ref('')

// 登录
function login(loginKey: string) {
  usernameRef.value?.validate();
  passwordRef.value?.validate();
  let header = {};
  if (loginKey) {
    header = {
      'login-key': loginKey
    }
  }
  else {
    header = {
      'captcha-key': user.value.captchaKey
    }
    captchaRef.value?.validate();
  }
  if (usernameRef.value?.hasError || passwordRef.value?.hasError || captchaRef.value?.hasError) {
    return;
  }
  loginLoading.value = true;
  client.post("/auth/username_login", {
    username: user.value.username,
    password: user.value.password,
    captcha: user.value.captcha,
    uuid: uuid.value
  }, {
    headers: header
  })
    .then((res) => {
      $userStore.login(res.data.result, user.value.username);
      $userStore.showLoginDialog(false);
      user.value.username = '';
      user.value.password = '';
      user.value.captcha = '';
      $q.notify({
        type: 'positive',
        color: 'primary',
        message: '登录成功',
        actions: [
          { icon: 'close', color: 'white' }
        ]
      });
    })
    .catch((err) => {
      user.value.captcha = '';
      getCaptcha();
    })
    .finally(() => {
      loginLoading.value = false;
    })
}

// 注册
function register() {
  usernameRef.value?.validate();
  nicknameRef.value?.validate();
  phoneRef.value?.validate();
  passwordRef.value?.validate();
  captchaRef.value?.validate();
  if (usernameRef.value?.hasError || nicknameRef.value?.hasError || phoneRef.value?.hasError || passwordRef.value?.hasError || captchaRef.value?.hasError) {
    return;
  }

  registerLoading.value = true;
  client.post("/auth/register", {
    username: user.value.username,
    nickname: user.value.nickname,
    phone: user.value.password,
    password: user.value.password,
    captcha: user.value.captcha,
    uuid: uuid.value
  }, {
    headers: {
      'captcha-key': user.value.captchaKey
    }
  })
    .then((res) => {
      $userStore.showLoginDialog(false);
      $q.notify({
        timeout: 10000,
        type: 'positive',
        color: 'primary',
        message: '注册成功,请尝试登录',
        actions: [
          { label: '登录', color: "dark", handler: () => login(res.data.result) }
        ]
      });
    })
    .catch((err) => {

    })
    .finally(() => {
      registerLoading.value = false;
      user.value.captcha = '';
      getCaptcha();
    })
}

function clearAll() {
  user.value.username = ''
  user.value.nickname = ''
  user.value.phone = ''
  user.value.password = ''
  user.value.captcha = ''
}

function smsLogin() {

}

watch(loginMethod, (newVal) => {
  clearAll();
})


// 清理发送短信计时器
watch(smsCountdown, (newVal) => {
  if (newVal <= 0 && timer) {
    clearInterval(timer);
    timer = null;
  }
});

watch(() => $userStore.isDialogVisible, (newVal) => {
  if (newVal) {
    if (!$userStore.isLogin) {
      getCaptcha();
      uuid.value = generateUUID();
    }
  }
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});

</script>

<style>
.login-dialog {
  width: 500px;
  max-width: 90vw;
  border-radius: 17.5px !important;
}

.toggle-border {
  border: 1px solid #027be3;
}

/* 图形验证码样式 */
.captcha-section {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.captcha-image {
  width: 125px;
  height: 45px;
  cursor: pointer;
  margin-right: 10px;
}

.captcha-input {
  flex: 1;
}
</style>
