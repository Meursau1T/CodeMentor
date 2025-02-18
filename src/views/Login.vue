<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserInfoStore } from '../stores/userInfo'
import Cookies from 'js-cookie'

const router = useRouter()
const userStore = useUserInfoStore()

const studentId = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = () => {
  if (!studentId.value || !password.value) {
    errorMessage.value = '请输入账号和密码'
    return
  }

  // 检查是否是管理员登录
  if (studentId.value === 'admin' && password.value === 'admin') {
    const adminInfo = {
      name: 'Administrator',
      id: 'admin',
      role: 'admin'
    }
    userStore.setUserInfo(adminInfo)
    Cookies.set('userInfo', JSON.stringify(adminInfo))
    router.push('/teacher-dashboard')
    return
  }

  // 学生登录逻辑
  const mockUserInfo = {
    name: studentId.value,
    id: studentId.value,
    role: 'student',
    learningStatus: {
      knowledge: 30,
      exercise: 5,
      note: 2
    }
  }

  userStore.setUserInfo(mockUserInfo)
  Cookies.set('userInfo', JSON.stringify(mockUserInfo))
  router.push('/')
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1>登录</h1>
      <div class="form-item">
        <t-input
          v-model="studentId"
          placeholder="请输入学号"
          size="large"
        />
      </div>
      <div class="form-item">
        <t-input
          v-model="password"
          type="password"
          placeholder="请输入密码"
          size="large"
        />
      </div>
      <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>
      <t-button theme="primary" block size="large" @click="handleLogin">
        登录
      </t-button>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 64px);
  background-color: #f5f5f5;
}

.login-card {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.login-card h1 {
  text-align: center;
  margin-bottom: 32px;
  color: #333;
}

.form-item {
  margin-bottom: 24px;
}

.error-message {
  color: #e34d59;
  margin-bottom: 16px;
  font-size: 14px;
}
</style>
