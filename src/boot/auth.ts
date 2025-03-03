// src/boot/auth.ts
import { boot } from "quasar/wrappers";
import { useUserStore } from "src/stores/user";
import { prepareRecommend } from "src/utils/axiosUtil";

export default boot(({ router }) => {
  // 初始化登录状态
  const $userStore = useUserStore();
  $userStore.initLoginState();
  console.log("登录信息:"+$userStore.isLogin)
  if($userStore.isLogin){
    prepareRecommend();
  }
  // 路由守卫
  router.beforeEach((to, from, next) => {
    next();
    // // 如果路径是根路径，直接放行
    // if (to.path === "/home") {
    //   next();
    //   return;
    // }

    // // 如果用户未登录
    // if (!$userStore.token) {
    //   // 弹出登录框,不放行
    //   $userStore.showLoginDialog(true);
    //   return;
    // }

    // next(); // 用户已登录，且HTTPOnly Cookie中的登录令牌存在，放行
  });
});
