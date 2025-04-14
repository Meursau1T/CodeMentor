import { defineStore } from 'pinia'

interface Settings {
  ai_assistance: {
    hint_enabled: boolean;
    analyze_enabled: boolean;
    code_correction_enabled: boolean;
    ai_chat_enabled: boolean;
  };
  custom_questions: {
    teacher_custom_enabled: boolean;
  };
}

const DEFAULT_SETTINGS: Settings = {
  ai_assistance: {
    hint_enabled: true,
    analyze_enabled: true,
    code_correction_enabled: true,
    ai_chat_enabled: true
  },
  custom_questions: {
    teacher_custom_enabled: true
  }
};

export const useAdminSettingsStore = defineStore('adminSettings', {
  state: () => ({
    settings: { ...DEFAULT_SETTINGS }
  }),

  actions: {
    // 初始化设置
    initSettings() {
      const savedSettings = localStorage.getItem('adminSettings');
      if (savedSettings) {
        this.settings = JSON.parse(savedSettings);
      }
    },

    // 更新设置
    updateSettings(newSettings: Settings) {
      this.settings = newSettings;
      localStorage.setItem('adminSettings', JSON.stringify(newSettings));
    },

    // 重置设置
    resetSettings() {
      this.settings = { ...DEFAULT_SETTINGS };
      localStorage.setItem('adminSettings', JSON.stringify(DEFAULT_SETTINGS));
    }
  }
}); 