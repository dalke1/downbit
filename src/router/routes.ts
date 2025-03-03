import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path:'/',
    redirect:'/home'
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'home',
        component: () => import('pages/Home.vue')
      },
      {
        path: 'recommend',
        component: () => import('pages/Recommend.vue')
      },
      {
        path: 'personal',
        component: () => import('pages/PersonalCenter.vue')
      }
    ],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
