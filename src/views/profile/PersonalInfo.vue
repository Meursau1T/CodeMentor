<script setup lang="ts">
import { ref } from 'vue';
import { useUserInfoStore } from '../../stores/userInfo';
import { MessagePlugin } from 'tdesign-vue-next';
import Cookies from 'js-cookie';
import { useRouter } from 'vue-router'
const router = useRouter()
const userStore = useUserInfoStore();
const passwordVisible = ref(false);
const showPasswordDialog = ref(false);
const formData = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const handleChangePassword = () => {
  showPasswordDialog.value = true;
};

const handlePasswordSubmit = async () => {
  if (formData.value.newPassword !== formData.value.confirmPassword) {
    MessagePlugin.error('两次输入的密码不一致');
    return;
  }

  try {
    const token = Cookies.get('authToken');
    const response = await fetch('http://47.119.38.174:8080/api/users/reset_password/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('authToken')}`
      },
      body: JSON.stringify({
        password: formData.value.newPassword
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '密码重置失败');
    }

    alert('密码修改成功，请重新登录');
    // 清除用户状态和token
    userStore.logout();
    // 跳转到登录页
    router.push('/login');
  } catch (error) {
    console.error('密码重置错误:', error);
    alert('密码修改失败');
  }
};
</script>

<template>
  <div class="personal-info">
    <t-card title="个人信息" :bordered="true" class="user-profile-card">
      <t-space direction="vertical" size="28px" class="profile-content">
        <div class="avatar-section">
          <t-avatar size="large" class="user-avatar">{{ userStore.userInfo.name }}</t-avatar>
          <h3 class="user-name">{{ userStore.userInfo.name }}</h3>
        </div>
        
        <t-form class="profile-form">
          <t-form-item label="学号" class="form-item">
            <span class="form-value">{{ userStore.userInfo.id }}</span>
          </t-form-item>
          
          <t-form-item label="密码" class="form-item">
            <t-input
              type="password"
              readonly
              :value="'********'"
              :suffix="passwordVisible"
              @click:suffix="passwordVisible = !passwordVisible"
              class="password-input"
            />
          </t-form-item>
        </t-form>
        
        <t-button 
          theme="primary" 
          @click="handleChangePassword" 
          class="change-button"
          block
        >
          修改密码
        </t-button>
      </t-space>
    </t-card>

    <t-dialog
      v-model:visible="showPasswordDialog"
      header="修改密码"
      :confirm-btn="{ content: '确认', theme: 'primary' }"
      :cancel-btn="{ content: '取消' }"
      @confirm="handlePasswordSubmit"
    >
      <t-form :data="formData">
        <t-form-item label="原密码" name="oldPassword">
          <t-input
            v-model="formData.oldPassword"
            type="password"
            placeholder="请输入原密码"
          />
        </t-form-item>
        <t-form-item label="新密码" name="newPassword">
          <t-input
            v-model="formData.newPassword"
            type="password"
            placeholder="请输入新密码"
          />
        </t-form-item>
        <t-form-item label="确认密码" name="confirmPassword">
          <t-input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
          />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<style scoped>
.personal-info {
  max-width: 600px;
  margin: 0 auto;
}

.user-profile-card {
  max-width: 380px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.profile-content {
  padding: 16px 24px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  font-size: 24px;
  background-color: var(--td-brand-color);
  color: white;
  margin-bottom: 12px;
}

.user-name {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--td-text-color-primary);
}

.profile-form {
  width: 100%;
  margin: 20px 0;
}

.form-item {
  margin-bottom: 18px;
}

.form-item :deep(.t-form__label) {
  width: 80px;
  color: var(--td-text-color-secondary);
  font-size: 14px;
}

.form-value {
  color: var(--td-text-color-primary);
  font-size: 14px;
}

.password-input {
  max-width: 240px;
}

.change-button {
  height: 40px;
  border-radius: 4px;
  font-weight: 500;
  margin-top: 8px;
}

/* 悬停效果增强 */
.change-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

</style> 