<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useAdminSettingsStore } from '@/stores/adminSettings';
import { storeToRefs } from 'pinia';
import Cookies from 'js-cookie'

const adminStore = useAdminSettingsStore();
const { settings } = storeToRefs(adminStore);
const loading = ref(false);
const teacherName = ref('');
const teacherPassword = ref('');
const teacherUserName = ref('');
const errorMessage = ref('');
const showCreateTeacher = ref(false);

// 保存设置
const saveSettings = async () => {
  loading.value = true;
  try {
    adminStore.updateSettings(settings.value);
    MessagePlugin.success('保存成功');
  } catch (error) {
    console.error('保存设置失败:', error);
    MessagePlugin.error('保存设置失败');
  } finally {
    loading.value = false;
  }
};

const createTeacher = () => {
  showCreateTeacher.value = true;
}

const registerTeacher = async () => {
  try {
    const response = await fetch('http://47.119.38.174:8080/api/users/register_teacher/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: teacherName.value,
        username: teacherUserName.value,
        password: teacherPassword.value,
      })
    })
    const data = await response.json()
    if (data.result) {
      showCreateTeacher.value = false;
    } else {
      errorMessage.value = data.message || '创建老师失败';
    }
  } catch (error) {
    console.error('老师注册失败:', error)
    errorMessage.value = '老师注册失败'
  }
}

// 重置设置
const resetSettings = () => {
  adminStore.resetSettings();
  MessagePlugin.success('已重置为默认设置');
};

onMounted(() => {
  adminStore.initSettings();
});
</script>

<template>
  <div class="admin-settings">
    <t-card title="系统设置">
      <t-loading :loading="loading">
        <div class="settings-section">
          <div class="section-header">
            <h4 class="section-title">
              <span class="decorative-line"></span>
              AI 辅助功能设置
            </h4>
          </div>
          <t-form class="settings-form">
            <t-form-item label="AI 解题提示" class="form-item">
              <div class="form-item-content">
                <t-tooltip content="开启后将在作答页中提供AI解题步骤提示">
                  <t-icon name="help-circle" class="help-icon" />
                </t-tooltip>
                <t-switch
                  v-model="settings.ai_assistance.hint_enabled"
                  size="large"
                />
              </div>
            </t-form-item>

            <t-form-item label="AI 代码纠错" class="form-item">
              <div class="form-item-content">
                <t-tooltip content="开启后将在作答后提供AI代码纠错">
                  <t-icon name="help-circle" class="help-icon" />
                </t-tooltip>
                <t-switch
                  v-model="settings.ai_assistance.code_correction_enabled"
                  size="large"
                />
              </div>
            </t-form-item>

            <t-form-item label="AI 对话功能" class="form-item">
              <div class="form-item-content">
                <t-tooltip content="开启后将在作答后提供AI对话答疑功能">
                  <t-icon name="help-circle" class="help-icon" />
                </t-tooltip>
                <t-switch
                  v-model="settings.ai_assistance.ai_chat_enabled"
                  size="large"
                />
              </div>
            </t-form-item>

            <t-form-item label="AI 知识点讲解" class="form-item">
              <div class="form-item-content">
                <t-tooltip content="开启后将在作答后提供AI知识点讲解">
                  <t-icon name="help-circle" class="help-icon" />
                </t-tooltip>
                <t-switch
                  v-model="settings.ai_assistance.analyze_enabled"
                  size="large"
                />
              </div>
            </t-form-item>
            <t-form-item></t-form-item>
          </t-form>
        </div>

        <div class="settings-section">
          <div class="section-header">
            <h4 class="section-title">
              <span class="decorative-line"></span>
              教师端功能设置
            </h4>
          </div>
          <t-form class="settings-form">
            <t-form-item label="教师自定义题目" class="form-item">
              <div class="form-item-content">
                <t-tooltip content="开启后教师可以在教师端自定义题目">
                  <t-icon name="help-circle" class="help-icon" />
                </t-tooltip>
                <t-switch
                  v-model="settings.custom_questions.teacher_custom_enabled"
                  size="large"
                />
              </div>
            </t-form-item>
            <t-form-item label="新增教师账号" class="form-item">
              <div class="form-item-content">
                <t-button theme="primary" @click="createTeacher">
                  创建
                </t-button>
              </div>
            </t-form-item>
            <t-form-item></t-form-item>
          </t-form>
        </div>

        <div class="button-section">
          <t-space>
            <t-button theme="default" @click="resetSettings">
              重置为默认设置
            </t-button>
            <t-button theme="primary" @click="saveSettings" :loading="loading">
              保存设置
            </t-button>
          </t-space>
        </div>
      </t-loading>
    </t-card>
  </div>
  <t-dialog v-model:visible="showCreateTeacher" header="新增账号" theme="default" :style="{ minHeight: '400px' }">
    <div>
      <div class="teacher-input">
        <t-input
          v-model="teacherName"
          placeholder="请输入昵称"
          size="large"
        />
      </div>
      <div class="teacher-input">
        <t-input
          v-model="teacherUserName"
          placeholder="请输入用户名"
          size="large"
        />
      </div>
      <div class="teacher-input">
        <t-input
          v-model="teacherPassword"
          type="password"
          placeholder="请输入密码"
          size="large"
        />
      </div>
      <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>
    </div>
    <template #footer>
      <div class="button-section">
        <t-space>
          <t-button theme="primary" @click="registerTeacher" :loading="loading">
            创建账号
          </t-button>
        </t-space>
      </div>
    </template>
  </t-dialog>
</template>

<style scoped>
.admin-settings {
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
}

.settings-section {
  margin-bottom: 32px;
}

.section-header {
  position: relative;
  margin-bottom: 24px;
}

.decorative-line {
  display: inline-block;
  width: 4px;
  height: 18px;
  background: var(--td-brand-color);
  margin-right: 8px;
  vertical-align: text-top;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.settings-form {
  width: 100%;
}

.form-item {
  margin-bottom: 20px;
  width: 100%;
  margin-left: 20px;
}

.form-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  justify-content: flex-end;
  margin-right: 20px;
}

.help-icon {
  font-size: 16px;
  color: var(--td-text-color-secondary);
  cursor: pointer;
  transition: color 0.2s;
}

.help-icon:hover {
  color: var(--td-brand-color);
}

.button-section {
  margin-top: 24px;
  text-align: right;
}

/* 调整标签和内容的布局 */
:deep(.t-form__item) {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.t-form__label) {
  margin-right: 16px;
  flex-shrink: 0;
}

.teacher-input {
  margin-bottom: 8px;
}
</style>
