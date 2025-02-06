import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

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

  function setUserInfo(info: UserInfo) {
    userInfo.value = info;
  }

  function isLogin() {
    return userInfo.value.name;
  }

  return { userInfo, setUserInfo, isLogin }
})
