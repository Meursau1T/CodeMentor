<script setup lang="ts">
/** 主页 */
import { useUserInfoStore } from '../stores/userInfo'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import Cookies from 'js-cookie'

const userStore = useUserInfoStore();
const router = useRouter();
const userStats = ref({
  learn_progress: 0,
  solved_problems: 0,
  username: ''
});

const goToQuestionBank = () => {
  router.push('/question');
}

const fetchUserStats = async () => {
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
}

onMounted(() => {
  if (userStore.isLogin()) {
    fetchUserStats();
  }
});
</script>

<template>
  <div class="container">
    <div class="left-card" :class="{ 'full-width': !userStore.isLogin() }">
      <div class="card-content">
        <h2 class="title">AI赋能编程学习，助你高效掌握代码艺术</h2>
        <div class="features">
          <div class="feature-item">
            <span class="feature-icon">📚</span>
            <span class="feature-text">智能题库：覆盖C、Python、Java等多种语言</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🔍</span>
            <span class="feature-text">实时纠错：AI精准诊断代码问题</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🤖</span>
            <span class="feature-text">24h AI导师：随时提问，即时解答</span>
          </div>
        </div>
        <t-button theme="primary" class="start-btn" @click="goToQuestionBank">
          开始练习 →
        </t-button>
      </div>
    </div>
    
    <div class="right-section" v-if="userStore.isLogin()">
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
  </div>
</template>

<style scoped>
.container {
  display: flex;
  width: 100%;
  padding: 72px;
}

.left-card {
  flex: 1;
  height: 580px;
  background-color: white;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.1);
  padding: 32px;
  margin-right: 36px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.left-card.full-width {
  margin-right: 0;
  width: 100%;
}

.left-card::before {
  content: '';
  position: absolute;
  height: 500px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('@/assets/ai.jpeg') center/cover no-repeat;
  opacity: 0.35;
  z-index: 1;
}

.right-section {
  width: 350px;
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

.card-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 48px;
  line-height: 1.4;
}

.features {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 18px;
  color: #333;
}

.feature-icon {
  font-size: 24px;
}

.feature-text {
  line-height: 1.6;
}

.start-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: fit-content;
  padding: 12px 32px;
  font-size: 18px;
  margin-top: 48px;
}
</style>