<template>
  <div class="chat-dialog-overlay" v-if="visible" @click="handleOverlayClick">
    <div class="chat-dialog" @click.stop>
      <!-- 聊天消息容器 -->
      <div class="chat-messages" ref="messagesContainer">
        <div v-for="(message, index) in messages" 
             :key="index" 
             :class="['message', message.type === 'user' ? 'user-message' : 'ai-message']">
          {{ message.content }}
        </div>
      </div>

      <!-- 输入操作栏 -->
      <div class="chat-input-area">
        <textarea 
          v-model="inputMessage"
          class="message-input"
          placeholder="输入你的问题..."
          @keydown.ctrl.enter="sendMessage"
          @input="adjustTextareaHeight"
          ref="textarea"
        ></textarea>
        <button 
          class="send-button" 
          :disabled="!inputMessage.trim()"
          @click="sendMessage"
        >
          <i class="send-icon"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  visible: Boolean
});

const emit = defineEmits(['update:visible']);

const inputMessage = ref('');
const messages = ref([]);
const messagesContainer = ref(null);
const textarea = ref(null);

// 处理遮罩层点击
const handleOverlayClick = () => {
  emit('update:visible', false);
};

// 发送消息
const sendMessage = () => {
  if (!inputMessage.value.trim()) return;
  
  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: inputMessage.value
  });

  // 模拟AI回复
  setTimeout(() => {
    messages.value.push({
      type: 'ai',
      content: '这是一个模拟的AI回复消息。'
    });
    scrollToBottom();
  }, 1000);

  inputMessage.value = '';
  adjustTextareaHeight();
  scrollToBottom();
};

// 滚动到底部
const scrollToBottom = () => {
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  }, 100);
};

// 调整输入框高度
const adjustTextareaHeight = () => {
  const element = textarea.value;
  element.style.height = 'auto';
  element.style.height = `${element.scrollHeight}px`;
};
</script>

<style scoped>
.chat-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.chat-dialog {
  width: 80%;
  max-width: 600px;
  height: 80vh;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.message {
  max-width: 70%;
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  word-wrap: break-word;
}

.user-message {
  margin-left: auto;
  background-color: #1a73e8;
  color: white;
  border-top-right-radius: 12px;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.ai-message {
  margin-right: auto;
  background-color: #f5f5f5;
  color: #333333;
  border-top-left-radius: 12px;
  border-bottom-right-radius: 4px;
}

.chat-input-area {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.message-input {
  flex: 1;
  min-height: 40px;
  max-height: 120px;
  padding: 10px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  resize: none;
  outline: none;
  font-family: 'Roboto', sans-serif;
  font-size: 15px;
}

.send-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #1a73e8;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, background-color 0.2s;
}

.send-button:hover {
  background-color: #1557b0;
  transform: scale(1.05);
}

.send-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.send-icon {
  width: 20px;
  height: 20px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
}
</style> 