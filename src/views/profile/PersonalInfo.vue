<script setup lang="ts">
import { ref } from 'vue';
import { useUserInfoStore } from '../../stores/userInfo';
import { MessagePlugin } from 'tdesign-vue-next';

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
    // TODO: 调用API修改密码
    await userStore.changePassword(formData.value);
    MessagePlugin.success('密码修改成功，请重新登录');
    userStore.logout();
  } catch (error) {
    MessagePlugin.error('密码修改失败');
  }
};
</script>

<template>
  <div class="personal-info">
    <t-card title="个人信息" :bordered="true">
      <t-space direction="vertical" size="large">
        <t-avatar size="large">{{ userStore.userInfo.name }}</t-avatar>
        
        <t-form>
          <t-form-item label="用户ID">
            <span>{{ userStore.userInfo.id }}</span>
          </t-form-item>
          
          <t-form-item label="密码">
            <t-input
              type="password"
              readonly
              :value="'********'"
              :suffix="passwordVisible ? 'visibility' : 'visibility-off'"
              @click:suffix="passwordVisible = !passwordVisible"
            />
          </t-form-item>
        </t-form>
        
        <t-button theme="primary" @click="handleChangePassword">
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
</style> 