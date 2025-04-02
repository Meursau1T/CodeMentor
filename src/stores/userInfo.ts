import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router';
import Cookies from 'js-cookie';
import { ROUTE_PATH } from '@/constants';
import type { UserInfo } from '../types'

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

export const useUserInfoStore = defineStore('userInfo', () => {
  const userInfo = ref<UserInfo | null>(null)
  const router = useRouter()

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
    Cookies.set('userInfo', JSON.stringify(info))
    console.log('userInfo', userInfo.value)
  }

  const isLogin = () => {
    return !!userInfo.value
  }

  const logout = () => {
    userInfo.value = null
    Cookies.remove('userInfo')
    router.push('/login')
  }

  const changePassword = async (passwordData: {
    oldPassword: string
    newPassword: string
  }) => {
    try {
      // TODO: 调用API修改密码
      // const response = await api.changePassword(passwordData)
      // if (response.success) {
      //   logout()
      //   return true
      // }
      // throw new Error(response.message)
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      logout()
      return true
    } catch (error) {
      throw error
    }
  }

  return {
    userInfo,
    setUserInfo,
    isLogin,
    logout,
    changePassword
  }
})
