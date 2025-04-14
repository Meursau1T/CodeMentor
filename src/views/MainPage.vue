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
    <div class="title-container">
      <h2 class="title">AI赋能编程学习，助你高效掌握代码艺术</h2>
      <div class="title-decoration"></div>
    </div>
    <div class="features">
      <div class="feature-item">
        <div class="feature-icon-container">
          <span class="feature-icon">📚</span>
        </div>
        <span class="feature-text">智能题库：覆盖C、Python、Java等多种语言</span>
      </div>
      <div class="feature-item">
        <div class="feature-icon-container">
          <span class="feature-icon">🔍</span>
        </div>
        <span class="feature-text">AI实时纠错：AI精准诊断代码问题</span>
      </div>
      <div class="feature-item">
        <div class="feature-icon-container">
          <span class="feature-icon">🤖</span>
        </div>
        <span class="feature-text">24小时在线的AI导师：随时提问，即时解答</span>
      </div>
    </div>
    <t-button theme="primary" class="start-btn" @click="goToQuestionBank">
      立即体验 >>
    </t-button>
  </div>
  <div class="card-decoration"></div>
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
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.1), 
              0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 32px;
  margin-right: 36px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.left-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.15), 
              0 5px 8px -2px rgba(0, 0, 0, 0.08);
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
  background: url('@/assets/AI-2.jpg') center/cover no-repeat;
  opacity: 0.25;
  z-index: 1;
  filter: grayscale(20%) brightness(1.05);
}

.card-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.title-container {
  position: relative;
  margin-bottom: 40px;
}

.title {
  font-size: 2.2rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 16px;
  line-height: 1.3;
  position: relative;
  z-index: 2;
}

.title-decoration {
  position: absolute;
  width: 120px;
  height: 8px;
  background: linear-gradient(90deg, #4299e1, #38b2ac);
  bottom: 0;
  left: 0;
  border-radius: 4px;
  z-index: 1;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: auto;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.feature-icon-container {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.feature-icon {
  font-size: 1.5rem;
}

.feature-text {
  font-size: 1.1rem;
  color: #4a5568;
  font-weight: 500;
}

.start-btn {
  align-self: flex-start;
  padding: 12px 24px;
  font-size: 1.1rem;
  font-weight: 500;
  border-radius: 8px;
  margin-top: auto;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.card-decoration {
  position: absolute;
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, rgba(66, 153, 225, 0.1), rgba(56, 178, 172, 0.1));
  border-radius: 50%;
  top: -50px;
  right: -50px;
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