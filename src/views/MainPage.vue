<script setup lang="ts">
import { useUserInfoStore } from '../stores/userInfo'

const userStore = useUserInfoStore();
</script>

<template>
  <div class="container">
    <div class="left-card" :class="{ 'full-width': !userStore.isLogin() }">
      <h1 class="title">Empower Your Coding Journey with AI</h1>
      <div class="intro-card">
        <div>
          <span class="intro-text">从掌握基础到解决高难度问题，CodeMentor AI 将为每个学者提供</span>
          <span class="intro-text-bold">个性化学习计划、智能问答和实时错误分析</span>
          <span class="intro-text">，助力你的编程目标。</span>
        </div>
        <p class="cta-text">加入我们，让你的编程技能更上一层楼！</p>
      </div>
    </div>
    
    <div class="right-section" v-if="userStore.isLogin()">
      <template>
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
      </template>
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
  height: 620px;
  background-color: white;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.1);
  padding: 32px;
  margin-right: 36px;
  display: flex;
  flex-direction: column;
}

.left-card.full-width {
  margin-right: 0;
  width: 100%;
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

.title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 36px;
}

.intro-card {
  background: white;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.1);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
}

.intro-text {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
}

.intro-text-bold {
  font-weight: bold;
}

.cta-text {
  color: #ff0000;
  font-size: 18px;
  font-weight: bold;
  margin-top: 24px;
    }
</style>