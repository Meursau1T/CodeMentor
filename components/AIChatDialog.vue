<template>
  <div class="chat-dialog-overlay" v-if="visible" @click="handleOverlayClick">
    <div class="chat-dialog" @click.stop>
      <!-- 聊天消息容器 -->
      <div class="chat-messages" ref="messagesContainer">
        <div v-for="(message, index) in messages" 
             :key="index" 
             :class="['message', message.type === 'user' ? 'user-message' : 'ai-message']">
          <div class="message-header" v-if="message.type === 'ai'">
            <span class="ai-model">{{ message.model === 'qwen' ? '千问' : 'Deepseek' }} AI</span>
          </div>
          <div class="markdown-content" v-html="formatMessage(message.content)"></div>
        </div>
      </div>

      <!-- 底部操作区域 -->
      <div class="chat-footer">
        <!-- 模型选择器 -->
        <div class="model-selector">
          <t-radio-group v-model="selectedModel" variant="default-filled">
            <t-radio-button value="qwen">
              <template #default>
                <t-space>
                  <t-icon name="chat" />
                  千问
                </t-space>
              </template>
            </t-radio-button>
            <t-radio-button value="deepseek">
              <template #default>
                <t-space>
                  <t-icon name="explore" />
                  Deepseek
                </t-space>
              </template>
            </t-radio-button>
          </t-radio-group>
        </div>

        <!-- 输入区域 -->
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Cookies from 'js-cookie';
import { MessagePlugin } from 'tdesign-vue-next';

const props = defineProps({
  visible: Boolean,
  problemId: Number,
  typedCode: String
});

const emit = defineEmits(['update:visible']);

const inputMessage = ref('');
const messages = ref([]);
const messagesContainer = ref(null);
const textarea = ref(null);
const selectedModel = ref('qwen'); // 默认使用千问模型

// 处理遮罩层点击
const handleOverlayClick = () => {
  emit('update:visible', false);
};

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return;
  
  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: inputMessage.value
  });

  const loadingMessage = {
    type: 'ai',
    content: 'AI正在思考中...',
    loading: true,
    model: selectedModel.value
  };
  messages.value.push(loadingMessage);
  scrollToBottom();

  try {
    const response = await fetch('http://47.119.38.174:8080/api/ai/chat/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        problem_id: props.problemId,
        question: inputMessage.value,
        typed_code: props.typedCode,
        model_type: selectedModel.value
      })
    });

    const data = await response.json();
    // 移除加载中的消息
    messages.value = messages.value.filter(m => !m.loading);
    
    if (data.result) {
      messages.value.push({
        type: 'ai',
        content: data.data.message.replace(/\n/g, '<br>'),
        model: selectedModel.value
      });
    } else {
      MessagePlugin.error('获取回答失败，请稍后再试');
    }
  } catch (error) {
    console.error('请求失败:', error);
    messages.value = messages.value.filter(m => !m.loading);
    MessagePlugin.error('网络请求失败，请检查连接');
  }
  
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

// 格式化消息内容
const formatMessage = (content) => {
  return content
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')  // 代码块优先处理
    .replace(/###\s+(.*)/g, '<h3>$1</h3>')                      // 三级标题
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')          // 加粗文本
    .replace(/(^|\n)([-*])\s+(.*)/g, '$1<li>$3</li>')          // 列表项
    .replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>')                // 包裹无序列表
    .replace(/\n/g, '<br>')                                    // 普通换行处理
    .replace(/<h3>/g, '<h3>🔹 ');                              // 为标题添加装饰符号
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
  /* max-width: 600px; */
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

.chat-footer {
  border-top: 1px solid #e0e0e0;
  padding: 12px 16px;
  background: #f8f9fa;
}

.model-selector {
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
}

.message-header {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.ai-model {
  background: #e8f0fe;
  padding: 2px 8px;
  border-radius: 12px;
  color: #1a73e8;
  font-weight: 500;
}

.chat-input-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: white;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.message-input {
  flex: 1;
  min-height: 40px;
  max-height: 120px;
  padding: 10px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  resize: none;
  outline: none;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 15px;
  transition: border-color 0.2s;
}

.message-input:focus {
  border-color: #1a73e8;
}

.send-button {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #1a73e8;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.send-button:hover {
  background-color: #1557b0;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.send-button:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.send-icon {
  width: 20px;
  height: 20px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
}

.markdown-content {
  line-height: 1.6;
  white-space: pre-wrap;
}

.markdown-content ul {
  list-style-type: disc;
  padding-left: 24px;
  margin: 12px 0;
}

.markdown-content li {
  margin: 6px 0;
  line-height: 1.5;
  color: #666;
}

.markdown-content h3 {
  color: #1a73e8;
  margin: 20px 0 12px;
  font-size: 1.2em;
  border-left: 4px solid #1a73e8;
  padding-left: 8px;
}

.markdown-content pre {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin: 12px 0;
  border: 1px solid #e9ecef;
}

.markdown-content strong {
  color: #1a73e8;
  font-weight: 600;
  padding: 2px 4px;
  background-color: #f3f8ff;
  border-radius: 4px;
}

.ai-message .markdown-content pre {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.t-radio-group) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

:deep(.t-radio-button) {
  min-width: 120px;
  transition: all 0.2s ease;
}

:deep(.t-radio-button.t-is-checked) {
  background-color: #1a73e8;
  color: white;
}
</style> 