<script setup lang="ts">
import { useUserInfoStore } from '../stores/userInfo'

const userStore = useUserInfoStore();
</script>

<template>
  <div class="container">
    <div class="left-card">
    </div>
    
    <div class="right-section">
      <template v-if="userStore.isLogin()">
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
      <template v-else>
        <div class="user-info">
          <span class="username">请先登录</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  width: 100%;
}

.left-card {
  margin-left: 72px;
  margin-top: 72px;
  flex: 1;
  height: 620px;
  background-color: white;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.1);
}

.right-section {
  margin-right: 72px;
  margin-top: 72px;
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
</style>