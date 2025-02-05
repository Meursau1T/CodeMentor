import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface UserInfo {
  name: string;
  id: string;
  avatar?: string;
  email?: string;
  phone?: string;
  school?: string;
  major?: string;
  grade?: string;
  class?: string;
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
