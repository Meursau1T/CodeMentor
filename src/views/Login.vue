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

// 添加课程相关状态
const showCourseSelection = ref(false)
const courseOptions = ref<{ label: string; value: number }[]>([])
const selectedCourseId = ref<number>()

// 修改获取课程列表方法
const fetchCourses = async () => {
  try {
    const response = await fetch('http://47.119.38.174:8080/api/courses/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`
      }
    })
    const data = await response.json()
    if (data.result) {
      // 转换数据结构为Select需要的格式
      courseOptions.value = data.data.course_names.map((name: string, index: number) => ({
        label: name,
        value: index + 1
      }))
      showCourseSelection.value = true
    }
  } catch (error) {
    console.error('获取课程失败:', error)
    errorMessage.value = '获取课程列表失败'
  }
}

// 修改课程选择处理（仅存储课程ID）
const handleCourseSelection = (value: number) => {
  selectedCourseId.value = value
  const userInfo = {
    ...userStore.userInfo,
    courseId: value
  }
  userStore.setUserInfo(userInfo)
  Cookies.set('userInfo', JSON.stringify(userInfo))
}

// 新增确认课程方法
const confirmCourseSelection = () => {
  if (selectedCourseId.value) {
    router.push('/')
  }
}

const handleLogin = async () => {
  if (!studentId.value || !password.value) {
    errorMessage.value = '请输入账号和密码'  
    return
  }

  try {
    const response = await fetch('http://47.119.38.174:8080/api/users/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        student_id: studentId.value,
        password: password.value
      })
    })

    const data = await response.json()
    //区分教师、管理员、学生三种角色
    
    if (data.result) {
      const token = data.data.token
      Cookies.set('authToken', token)
      // 检查是否是管理员登录
      if (studentId.value === 'admin' && password.value === 'szu_admin') {
        const adminInfo = {
          name: 'Administrator',
          id: 'admin',
          role: 'admin'
        }
        userStore.setUserInfo(adminInfo)
        Cookies.set('userInfo', JSON.stringify(adminInfo))
        router.push('/admin/settings')
        return
      }else if(studentId.value === 'teacher' && password.value === 'teacher'){
        const teacherInfo = {
          name: 'Teacher',
          id: 'teacher',
          role: 'teacher'
        }
        userStore.setUserInfo(teacherInfo)
        Cookies.set('userInfo', JSON.stringify(teacherInfo))
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

      // 先获取课程列表而不是直接跳转
      await fetchCourses()
      userStore.setUserInfo(mockUserInfo)
      Cookies.set('userInfo', JSON.stringify(mockUserInfo))
    } else {
      errorMessage.value = '登录失败，请检查账号和密码'
    }
  } catch (error) {
    console.error('登录失败:', error)
    errorMessage.value = '登录失败，请重试'
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card" v-if="!showCourseSelection">
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

    <div class="login-card" v-else>
      <h1>选择课程</h1>
      <t-select
        v-model="selectedCourseId"
        :options="courseOptions"
        placeholder="请选择课程"
        size="large"
        class="course-select"
        @change="handleCourseSelection"
      >
        <template #prefixIcon>
          <t-icon name="bookmark" />
        </template>
      </t-select>
      
      <t-button
        theme="primary"
        block
        size="large"
        class="confirm-button"
        :disabled="!selectedCourseId"
        @click="confirmCourseSelection"
      >
        进入课程
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

/* 新增确认按钮样式 */
.confirm-button {
  margin-top: 24px;
}

/* 修改课程选择样式 */
.course-select {
  width: 100%;
  margin-top: 20px;
}
</style>
