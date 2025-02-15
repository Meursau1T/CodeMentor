<script setup lang="ts">
/** 主页 */
import { useUserInfoStore } from '../stores/userInfo'
import { useRouter } from 'vue-router'

const userStore = useUserInfoStore();
const router = useRouter();

const goToQuestionBank = () => {
  router.push('/question');
}
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
      <div class="user-info">
        <t-avatar size="large">{{ userStore.userInfo.name }}</t-avatar>
        <span class="username">{{ userStore.userInfo.name }}</span>
      </div>
      
      <div class="data-item">
        <span class="data-label">知识点学习</span>
        <t-progress :percentage="userStore.userInfo.learningStatus?.knowledge || 0" />
      </div>
      
      <div class="data-item">
        <span class="data-label">题目练习</span>
        <span class="data-value">{{ userStore.userInfo.learningStatus?.exercise || 0 }}</span>
      </div>
      
      <div class="data-item">
        <span class="data-label">笔记记录</span>
        <span class="data-value">{{ userStore.userInfo.learningStatus?.note || 0 }}</span>
      </div>
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
  margin-left: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 36px;
}

.username {
  margin-left: 40px;
  font-size: 16px;
  color: #333;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.data-label {
  color: #666;
  font-size: 14px;
}

.data-value {
  color: #333;
  font-size: 14px;
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