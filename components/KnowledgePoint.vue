<template>
  <div class="knowledge-point">
    <h3>知识点讲解</h3>
    <button class="ask-ai-button" @click="showAIChat = true">
      ？有疑问点击请教AI老师
    </button>
    
    <AIChatDialog
      v-model:visible="showAIChat"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AIChatDialog from './AIChatDialog.vue';

const showAIChat = ref(false);
</script>

<style scoped>
.ask-ai-button {
  margin-left: 8px;
  padding: 6px 12px;
  border: none;
  background-color: #1a73e8;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.ask-ai-button:hover {
  background-color: #1557b0;
}
</style> 