<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Cookies from 'js-cookie'
import { useUserInfoStore } from '../stores/userInfo'
import { useRouter } from 'vue-router'

const userStore = useUserInfoStore()
const router = useRouter()
const courseObj = ref<Array<{ title: string, subtopics: any[], id: string }>>([])
const loading = ref(false)
const userStats = ref({
  learn_progress: 0,
  solved_problems: 0,
  username: ''
})

// 获取知识点数据
onMounted(async () => {
  try {
    const courseId = userStore.userInfo?.courseId
    if (!courseId) return

    const response = await fetch(`http://47.119.38.174:8080/api/courses/${courseId}/knowledge_points/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${Cookies.get('authToken')}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    if (data.result) {
      courseObj.value = data.data.map(item => ({
        title: item.name,
        subtopics: [],
        id: item.id
      }))
    }
  } catch (error) {
    console.error('获取知识点失败:', error)
  }

  // 获取用户统计信息
  try {
    const response = await fetch('http://47.119.38.174:8080/api/users/', {
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`
      }
    });
    const data = await response.json();
    if (data.result) {
      userStats.value = data.data;
    }
  } catch (error) {
    console.error('获取用户统计信息失败:', error);
  }
})

const handlePractice = (id: string) => {
  const courseId = userStore.userInfo?.courseId
  if (!courseId) return

  router.push({
    path: `/course-practice/${courseId}/${id}`
  })
}
</script>

<template>
  <main class="container">
    <div class="left-card">
      <h2 class="title">知识图谱</h2>
      <t-divider style="margin: 8px 0"></t-divider>
      <t-tree
        :data="courseObj"
        expand-all
        hover
        activable
        line
        :keys="{
          value: 'title',
          label: 'title',
          children: 'subtopics'
        }"
        class="flat-tree"
      >
        <template #operations="{ node }">
          <span 
            class="operation-btn"
            @click="handlePractice(node.data.id)"
          >
            去练习
          </span>
        </template>
      </t-tree>
    </div>
    <div class="right-container">
      <t-card :bordered="true" class="stats-card">
        <template #title>
          <div class="user-header">
            <t-avatar>{{ userStats.username?.slice(0, 1) }}</t-avatar>
            <span class="username">{{ userStats.username }}</span>
          </div>
        </template>
        
        <div class="stats-content">
          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-label">学习进度</span>
              <span class="progress-value">{{ Math.round(userStats.learn_progress * 100) }}%</span>
            </div>
            <t-progress
              :percentage="Math.round(userStats.learn_progress * 100)"
              :color="{ from: '#0052D9', to: '#00A870' }"
              :track-color="'#E7E7E7'"
              :height="8"
            />
          </div>

          <div class="solved-section">
            <t-card :bordered="true" theme="light">
              <div class="solved-content">
                <t-icon name="check-circle" size="24px" style="color: #00A870"/>
                <div class="solved-info">
                  <div class="solved-count">{{ userStats.solved_problems }}</div>
                  <div class="solved-label">已解决题目</div>
                </div>
              </div>
            </t-card>
          </div>
        </div>
      </t-card>
    </div>
  </main>
</template>

<style scoped>
.container {
  display: flex;
  width: 100%;
  padding: 32px;
  gap: 24px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 64px);
}

.left-card {
  flex: 0 0 60%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  height: fit-content;
}

.right-container {
  flex: 1;
  height: fit-content;
}

.title {
  font-weight: 600;
  color: #0052d9;
  margin-bottom: 4px;
}

.flat-tree :deep(.t-tree__item) {
  font-size: 16px;
  color: #333;
  padding: 8px 0;
}

.flat-tree :deep(.t-tree__icon) {
  display: none;
}

.operation-btn {
  margin-left: 12px;
  font-size: 14px;
  color: #0052d9;
  cursor: pointer;
  transition: opacity 0.2s;
}

.operation-btn:hover {
  opacity: 0.8;
}

.stats-card {
  background: white;
  border-radius: 12px;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}

.username {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 0;
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 14px;
  color: #666;
}

.progress-value {
  font-size: 14px;
  color: #0052D9;
  font-weight: 500;
}

.solved-section :deep(.t-card) {
  background: #F9F9F9;
}

.solved-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px;
}

.solved-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.solved-count {
  font-size: 24px;
  font-weight: 600;
  color: #00A870;
}

.solved-label {
  font-size: 14px;
  color: #666;
}
</style>
