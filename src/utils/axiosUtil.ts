// src/utils/axios.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { Notify } from 'quasar';
import { useUserStore } from 'src/stores/user';

const $userStore = useUserStore();
// 创建 Axios 实例
export const client: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8081/api', // 请求的基础 URL
  timeout: 10000, // 请求超时设置（毫秒）
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ResponseData {
  code: number;
  message: string;
  result: any;
}

export interface Video {
  videoId: string;
  title: string;
  videoUrl: string;
  coverUrl: string;
  videoType: string;
  likeCount: number;
  commentCount: number;
  watchCount: number;
  favoriteCount: number;
  uploader: string;
  uploadTime: string;
  isLike: boolean;
  isFavorite: boolean;
  tags: Array<string>;
}

// 评论接口定义
export interface Comment {
  id: string;
  videoId: string;
  avatar: string;
  nickname: string;
  commentText: string;
  likeCount: number;
  isLike: boolean;
  commentTime: string;
  replies?: Comment[];
  replyTo: string;
  replyCount: number;
}

// 请求拦截器
client.interceptors.request.use(
  (config) => {
    const token = $userStore.token;
    if (token) {
      config.headers.Authorization = `token:${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
client.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const res = error.response.data as ResponseData;
      // 根据不同状态码进行处理
      switch (status) {
        case 400:
          Notify.create({
            type: 'warning',
            message: res.result,
          });
          break;
        case 401:
          Notify.create({
            type: 'warning',
            message: "请先登录。",
          });
          break;
        case 403:
          Notify.create({
            type: 'warning',
            message: res.result,
          });
          break;
        case 404:
          Notify.create({
            type: 'warning',
            message: res.result,
          });
          break;
        case 500:
          Notify.create({
            type: 'negative',
            message: res.result,
          });
          break;
        case 503:
          Notify.create({
            type: 'negative',
            message: "服务器异常，请稍后再试。",
          });
          break;
        default:
          Notify.create({
            type: 'negative',
            message: `发生错误: ${error.response.statusText}`,
          });
      }
      console.log(res.result);
    } else if (error.request) {
      Notify.create({
        type: 'negative',
        message: '未收到服务器响应。',
      });
    } else {
      Notify.create({
        type: 'negative',
        message: `请求错误: ${error.message}`,
      });
    }

    return Promise.reject(error);
  }
);

export function logoutUser(){
  if($userStore.isLogin){
    client.post("/auth/logout");
  }
}


export async function getAvatar(): Promise<string> {
  if ($userStore.isLogin) {
    try {
      const response = await client.get("/user/get_avatar");
      return response.data.result.imgUrl;
    } catch (error) {
      Notify.create({
        type: 'warning',
        color: 'warning',
        message: '获取头像失败',
      });
    }
  }
  return '';
}


export async function getUserWorks(): Promise<Array<Video>> {
  try {
    const response = await client.get("/video/get_user_works");
    return response.data.result;
  } catch (error) {
    console.error("获取用户视频失败:", error);
    throw error;
  }
}

export function addHistory(videoId: string) {
  client.post("/video/add_history", {
    videoId: videoId
  })
}

export async function getHistory(): Promise<Array<Video>> {
  try {
    const response = await client.get("/video/get_history");
    console.log(response.data)
    return response.data.result;
  } catch (error) {
    console.error("获取历史视频失败:", error);
    throw error;
  }
}

export function like(videoId: string) {
  console.log(videoId)
  client.post("/video/like", {
    videoId: videoId
  })
}

export function dislike(videoId: string) {
  client.post("/video/dislike", {
    videoId: videoId
  })
}

export async function getLikes(): Promise<Array<Video>> {
  try {
    const response = await client.get("/video/get_likes");
    console.log(response.data)
    return response.data.result;
  } catch (error) {
    console.error("获取点赞视频失败:", error);
    throw error;
  }
}

export function addFavorite(favoriteName: string) {
  client.put("/favorite/add_favorite?favoriteName=" + favoriteName)
}

export function removeFavorite(favoriteName: string) {
  client.delete("/favorite/remove_favorite?favoriteName=" + favoriteName)
}

export function addVideoToFavorite(favoriteName: string, videoId: string) {
  client.put("/favorite/add_video_to_favorite", {
    favoriteName: favoriteName,
    videoId: videoId
  })
}

export function removeVideoFromFavorite(favoriteName: string, videoId: string) {
  client.delete("/favorite/remove_video_from_favorite", {
    data: {
      favoriteName: favoriteName,
      videoId: videoId
    }
  })
}

export async function getFavorites(): Promise<Array<string>> {
  try {
    const response = await client.get("/favorite/get_favorites");
    return response.data.result;
  } catch (error) {
    console.error("获取收藏夹失败:", error);
    throw error;
  }
}

export async function getFavoriteVideos(favoriteName: string): Promise<Array<Video>> {
  try {
    const response = await client.get("/favorite/get_favorite_videos?favoriteName=" + favoriteName);
    return response.data.result;
  } catch (error) {
    console.error("获取收藏夹视频失败:", error);
    throw error;
  }
}

export async function recommend(): Promise<Video> {
  try {
    const response = await client.get("/video/recommend");
    console.log(response.data.result)
    return response.data.result;
  } catch (error) {
    console.error("获取推荐视频失败:", error);
    throw error;
  }
}

export function prepareRecommend(){
  client.post("/video/prepare_recommend")
}

export async function getHotComments(videoId: string, startIndex: number): Promise<Array<Comment>> {
  try {
    const response = await client.get("/comment/hot/" + videoId + "?startIndex=" + startIndex);
    console.log(response.data.result)
    return response.data.result;
  } catch (error) {
    console.error("获取热门评论失败:", error);
    throw error;
  }
}

export async function getNewComments(videoId: string, startIndex: number): Promise<Array<Comment>> {
  try {
    const response = await client.get("/comment/new/" + videoId + "?startIndex=" + startIndex);
    return response.data.result;
  } catch (error) {
    console.error("获取最新评论失败:", error);
    throw error;
  }
}

export async function getReplies(parentId: string): Promise<Array<Comment>> {
  try {
    const response = await client.get("/comment/replies/" + parentId);
    return response.data.result;
  } catch (error) {
    console.error("获取回复失败:", error);
    throw error;
  }
}

export async function addNewComment(videoId: string, content: string) {
  client.post("/comment/add_comment", {
    videoId: videoId,
    commentText: content
  })
}

export async function reply(videoId: string, content: string, replyTo: string, parentId: string | any) {
  client.post("/comment/reply", {
    videoId: videoId,
    commentText: content,
    replyTo: replyTo,
    parentId: parentId
  })
}

export function likeComment(commentId: string, isParent: boolean) {
  client.post("/comment/like_comment/" + commentId + "?isParent=" + isParent)
}

export function dislikeComment(commentId: string, isParent: boolean) {
  client.post("/comment/dislike_comment/" + commentId + "?isParent=" + isParent)
}



export default client;
