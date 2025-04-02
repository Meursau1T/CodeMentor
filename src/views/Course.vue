<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Cookies from 'js-cookie'
import { useUserInfoStore } from '../stores/userInfo'
import { useRouter } from 'vue-router'


const userStore = useUserInfoStore()
const router = useRouter()
const courseObj = ref<Array<{ title: string, subtopics: any[], id: string }>>([])
const loading = ref(false);
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
});

const statsList = [
  {
    icon: 'chart',
    title: '准确率',
    value: '85%'
  },
  {
    icon: 'error',
    title: '错题',
    value: '12'
  },
  {
    icon: 'star',
    title: '收藏',
    value: '8'
  },
  {
    icon: 'edit',
    title: '笔记',
    value: '5'
  }
]

const handlePractice = (id: string) => {
  const courseId = userStore.userInfo?.courseId
  if (!courseId) return

  // 直接使用知识点的真实ID
  router.push({
    path: '/problems',
    query: {
      courseId,
      knowledgePointId: id  // 使用原始知识点ID而不是索引
    }
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
      <div class="right-card">
        <h2 class="title">能力分析报告</h2>
        <t-divider style="margin: 8px 0"></t-divider>
      </div>
      <div class="bottom-card">
        <t-list>
          <t-list-item class="list-item" v-for="item in statsList" :key="item.title">
            <template #content>
              <span class="stats-item">
                <t-icon :name="item.icon" size="20px" style="color: #0052d9"/>
                <span>{{ item.title }}</span>
              </span>
            </template>
            <template #action>
              <span style="color: #0052d9; font-weight: 500">{{ item.value }}</span>
            </template>
          </t-list-item>
        </t-list>
      </div>
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
  flex: 0 0 60%; /* 固定宽度 */
  height: fit-content; /* 高度自适应内容 */
}

.right-container {
  flex: 1; /* 占据剩余空间 */
  display: flex;
  flex-direction: column;
  height: fit-content; /* 高度自适应内容 */
  gap: 24px;
}

.right-card {
  flex: 1; /* 占据上方空间 */
}

.bottom-card {
  height: fit-content; /* 高度自适应内容 */
}

.left-card, .right-card, .bottom-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  transition: all 0.3s ease;
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

.list-item {
  padding: 0;
  transition: background-color 0.2s ease;
}

.list-item:hover {
  background-color: #f5f5f5;
}

.stats-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
}

.stats-item span {
  margin-left: 12px;
  color: #333333;
  font-weight: 500;
}

</style>
