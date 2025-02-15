
<template>
    <div class="ai-mentor">
      <!-- AI助手触发按钮 -->
      <t-button @click="showDialog = true">
        <template #icon>
          <t-icon name="chat" />
        </template>
        使用AI助手
      </t-button>
  
      <!-- AI对话弹窗 -->
      <t-dialog
        v-model:visible="showDialog"
        header="AI助手"
        width="60%"
        :close-on-overlay-click="false"
      >
        <!-- 对话历史区域 -->
        <div class="chat-container">
          <div class="chat-messages" ref="messageContainer">
            <div
              v-for="(message, index) in chatHistory"
              :key="index"
              :class="['message', message.role === 'user' ? 'user-message' : 'ai-message']"
            >
              <div class="message-content">
                {{ message.content }}
              </div>
            </div>
          </div>
        </div>
  
        <!-- 输入区域 -->
        <div class="input-area">
          <t-textarea
            v-model="userInput"
            :rows="3"
            placeholder="请输入您的问题..."
            @keyup.enter.ctrl="sendMessage"
          />
          <t-button theme="primary" @click="sendMessage" :loading="loading">
            发送
          </t-button>
        </div>
      </t-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { MessagePlugin } from 'tdesign-vue-next'
//   import { sendChatMessage } from '@/api/ai'
  
  // 响应式变量
  const showDialog = ref(false)
  const userInput = ref('')
  const chatHistory = ref([])
  const loading = ref(false)
  const messageContainer = ref(null)
  
  // 发送消息
  const sendMessage = async () => {
    if (!userInput.value.trim()) {
      MessagePlugin.warning('请输入内容')
      return
    }
    
    const userMessage = {
      role: 'user',
      content: userInput.value
    }
    
    // 添加用户消息到对话历史
    chatHistory.value.push(userMessage)
  
    // loading.value = true
    // try {
    //   // 准备发送给API的消息历史
    //   const messages = chatHistory.value.slice(-10) // 只发送最近10条消息
      
    //   // 调用API获取AI响应
    //   const aiResponse = await sendChatMessage(messages)
      
    //   // 添加AI响应到对话历史
    //   chatHistory.value.push({
    //     role: 'assistant',
    //     content: aiResponse
    //   })
    // } catch (error) {
    //   console.error('发送消息失败:', error)
    // } finally {
    //   loading.value = false
    //   userInput.value = ''
    //   scrollToBottom()
    // }
  }
  
  // 滚动到最新消息
//   const scrollToBottom = () => {
//     setTimeout(() => {
//       if (messageContainer.value) {
//         messageContainer.value.scrollTop = messageContainer.value.scrollHeight
//       }
//     }, 100)
//   }
  </script>
  
  <style scoped>
  .ai-mentor {
    padding: 20px;
  }
  
  .chat-container {
    height: 400px;
    overflow-y: auto;
    padding: 20px;
    background-color: var(--td-bg-color-container);
    border-radius: var(--td-radius-medium);
    margin-bottom: 20px;
  }
  
  .chat-messages {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .message {
    max-width: 80%;
    padding: 12px;
    border-radius: var(--td-radius-medium);
    margin: 4px 0;
  }
  
  .user-message {
    align-self: flex-end;
    background-color: var(--td-brand-color);
    color: white;
  }
  
  .ai-message {
    align-self: flex-start;
    background-color: var(--td-bg-color-container);
    border: 1px solid var(--td-component-border);
  }
  
  .input-area {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }
  
  .input-area :deep(.t-textarea) {
    flex: 1;
  }
  </style> 
  