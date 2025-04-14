<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useAdminSettingsStore } from '@/stores/adminSettings';
import { storeToRefs } from 'pinia';

const adminStore = useAdminSettingsStore();
const { settings } = storeToRefs(adminStore);
const loading = ref(false);

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
</style>