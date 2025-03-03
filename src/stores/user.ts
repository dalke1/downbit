import { defineStore } from "pinia";
import { useCookies } from "vue3-cookies";
import { LocalStorage } from "quasar";

const { cookies } = useCookies();

export const useUserStore = defineStore("user", {
  state: () => ({
    avatar: "",
    username: LocalStorage.getItem("username") || "",
    token: cookies.get("token") || "",
    isLogin: false,
    isDialogVisible: false,
  }),

  getters: {},

  actions: {
    /**
     * 登录并保存 token到 Cookie
     * @param token
     */
    login(token: string, username: string) {
      this.isLogin = true;
      this.token = token;
      this.username = username;
      LocalStorage.setItem("username", username);
      cookies.set("token", token, "5d");
    },
    /**
     * 退出登录并清除 Cookie
     */
    logout() {
      this.isLogin = false;
      this.username = "";
      this.token = "";
      LocalStorage.removeItem("username");
      cookies.remove("token");
    },
    /**
     * 初始化登录状态从 Cookie 中
     */
    initLoginState() {
      this.isLogin = !!this.token && this.username !== "";
    },
    /**
     * 显示或隐藏登录对话框
     * @param isDisplay - 是否显示对话框
     */
    showLoginDialog(isDisplay: boolean) {
      this.isDialogVisible = isDisplay;
    },
    /**
     * 改变登录状态
     * @param isLogin
     */
    changeLoginState(isLogin: boolean) {
      this.isLogin = isLogin;
    },
  },
});
