import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router';
import Cookies from 'js-cookie';
import { ROUTE_PATH } from '@/constants';

export interface UserInfo {
  name: string;
  id: string;
  avatar?: string;
  learningStatus: {
    /** 知识点学习 */
    knowledge?: number;
    /** 题目练习 */
    exercise?: number;
    /** 笔记记录 */
    note?: number;
  };
}

export const useUserInfoStore = defineStore('user', () => {
  const userInfo = ref({} as UserInfo);
  const router = useRouter();

  function setUserInfo(info: UserInfo) {
    userInfo.value = info;
  }

  function isLogin() {
    return userInfo.value.name;
  }

  function logout() { 
    userInfo.value = {} as UserInfo;
    // 清除 cookie
    Cookies.remove('userInfo');
    // 跳转到登录页
    router.push(ROUTE_PATH.LOGIN);
  }

  return { userInfo, setUserInfo, isLogin, logout }
})
