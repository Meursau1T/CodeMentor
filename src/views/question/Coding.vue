<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AIChatDialog from '../../../components/AIChatDialog.vue';
import Cookies from 'js-cookie';

const route = useRoute();
const router = useRouter();
const questionId = ref(Number(route.params.id));

// Interface for the API response
interface ProblemDetail {
  content: string;
  difficulty: string;
  id: number;
  knowledge_point_info: any;
  sample_cases: string;
  tags: Array<{
    ID: number;
    name: string;
    problems: any;
    knowledge_point_id: number;
  }>;
  title: string;
  title_slug: string;
}

const question = ref<ProblemDetail | null>(null);

// Fetch question details
const fetchQuestionDetail = async (id: number) => {
  const url = `http://47.119.38.174:8080/api/problems/${id}/`;
  const token = Cookies.get('authToken');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }

    const { data } = await response.json();
    question.value = data;
  } catch (error) {
    console.error('获取题目详情失败:', error);
  }
};

// Load question details on mount and when ID changes
onMounted(() => {
  fetchQuestionDetail(questionId.value);
});

const userCode = ref('');
const testInput = ref('');

// 添加运行结果接口响应类型
interface JudgeResult {
  code_answer?: string[];
  expected_code_answer?: string[];
  status_runtime: string;
  status_memory: string;
  status_msg: string;
  total_correct: number;
  total_testcases: number;
  run_success: boolean;
  display_runtime?: string;
  memory_percentile?: number;
  runtime_percentile?: number;
  state: string;
}

const testResult = ref({
  show: false,
  status: false,
  message: '',
  details: null as JudgeResult | null
});

const isSubmitted = ref(false);
const isCorrect = ref(false);

const solution = {
  code: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
  explanation: `本题主要考察以下知识点：
1. 哈希表的使用
2. 时间复杂度优化
3. 数组遍历技巧`
};

const aiCorrection = ref('');

// 添加编程语言选项
const programmingLanguages = [
  { value: 'python3', label: 'Python3' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'golang', label: 'Go' },
];

const selectedLanguage = ref(programmingLanguages[0].value);
const isSubmitting = ref(false);
const submitResult = ref({
  show: false,
  status: false,
  message: '',
  details: null as JudgeResult | null
});

// 添加加载状态
const isAnalyzing = ref(false);
const isCorrecting = ref(false);

// 检查判题结果
const checkResult = async (id: Number) => {
  const url = `http://47.119.38.174:8080/api/leetcode/check/${id}/`;
  const token = Cookies.get('authToken');
  
  const MAX_RETRIES = 30;
  const POLLING_INTERVAL = 1000;
  let retryCount = 0;

  const poll = async (): Promise<any> => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.result && data.data) {
        // 如果状态是PENDING或STARTED，并且未超过最大重试次数，继续轮询
        if ((data.data.state === 'PENDING' || data.data.state === 'STARTED') && retryCount < MAX_RETRIES) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
          return poll();
        }

        // 标准化返回数据
        const result: JudgeResult = {
          status_runtime: data.data.status_runtime || '0 ms',
          status_memory: data.data.status_memory || '0 MB',
          status_msg: data.data.status_msg || 'Unknown',
          total_correct: data.data.total_correct || 0,
          total_testcases: data.data.total_testcases || 0,
          run_success: data.data.run_success || false,
          state: data.data.state || 'UNKNOWN',
          display_runtime: data.data.display_runtime,
          memory_percentile: data.data.memory_percentile,
          runtime_percentile: data.data.runtime_percentile
        };

        // 如果是解释器返回的结果，添加代码答案相关字段
        if (data.data.code_answer) {
          result.code_answer = data.data.code_answer;
          result.expected_code_answer = data.data.expected_code_answer;
        }

        return result;
      }
      
      throw new Error('Failed to get judge result');
    } catch (error) {
      console.error('获取判题结果失败:', error);
      return null;
    }
  };

  return poll();
};

// 运行测试用例
const runTest = async () => {
  const url = 'http://47.119.38.174:8080/api/leetcode/interpret_solution/';
  const token = Cookies.get('authToken');

  try {
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lang: selectedLanguage.value,
        leetcode_question_id: questionId.value,
        typed_code: userCode.value
      })
    });

    const data = await response.json();
    if (data.result && data.data && data.data.interpret_id) {
      // 等待并获取判题结果
      const result = await checkResult(data.data.interpret_id);
      if (result) {
        testResult.value = {
          show: true,
          status: result.status_msg === 'Accepted',
          message: result.status_msg === 'Accepted'
            ? '太棒了！测试用例全部通过，你的代码运行得很好！' 
            : `测试未通过: ${result.status_msg}。再检查一下代码逻辑吧！`,
          details: result
        };
      }
    }

    // 3秒后自动关闭提示
    setTimeout(() => {
      testResult.value.show = false;
    }, 3000);
  } catch (error) {
    console.error('运行测试失败:', error);
    testResult.value = {
      show: true,
      status: false,
      message: '运行测试失败，请重试',
      details: null
    };
  }
};

// 修改分析代码函数
const analyzeCode = async () => {
  isAnalyzing.value = true;
  const url = 'http://47.119.38.174:8080/api/ai/analyze_code/';
  const token = Cookies.get('authToken');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        problem_id: questionId.value,
        language: selectedLanguage.value,
        typed_code: userCode.value
      })
    });

    const data = await response.json();
    if (data.result && data.data && data.data.message) {
      const message = data.data.message;
      // 使用 "AI讲师分析" 分割消息
      const parts = message.split('**AI讲师分析**');
      
      // 提取错误分析和讲师分析的内容
      const errorPart = parts[0].replace('**错误分析**：', '').trim();
      const teacherPart = parts[1]?.replace('：', '').trim() || '';

      // 提取花括号中的内容
      const extractContent = (text: string) => {
        const match = text.match(/\{([^}]+)\}/);
        return match ? match[1].trim() : text.trim();
      };

      aiAnalysis.value = {
        errorAnalysis: extractContent(errorPart),
        teacherAnalysis: extractContent(teacherPart)
      };
    } else {
      aiAnalysis.value = {
        errorAnalysis: '',
        teacherAnalysis: '暂时无法获取分析结果，请稍后重试。'
      };
    }
  } catch (error) {
    console.error('分析代码失败:', error);
    aiAnalysis.value = {
      errorAnalysis: '',
      teacherAnalysis: '分析过程出现错误，请稍后重试。'
    };
  } finally {
    isAnalyzing.value = false;
  }
};

const correctCode = async () => {
  isCorrecting.value = true;
  const url = 'http://47.119.38.174:8080/api/ai/correct_code/';
  const token = Cookies.get('authToken');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        problem_id: questionId.value,
        language: selectedLanguage.value,
        typed_code: userCode.value
      })
    });

    const data = await response.json();
    if (data.result) {
      aiCorrection.value = data.data.code;
    }
  } catch (error) {
    console.error('获取纠错代码失败:', error);
  } finally {
    isCorrecting.value = false;
  }
};

// 新增响应式变量
const aiAnalysis = ref({
  errorAnalysis: '',
  teacherAnalysis: ''
});

// 处理加粗文本和数学公式的函数
const processBoldText = (text: string) => {
  // 首先处理数学公式
  text = text.replace(/\\\(([^\\]+)\\\)/g, '($1)');
  
  // 处理特殊的数学符号
  text = text.replace(/\\cdot/g, '·');
  
  // 处理加粗文本
  return text.replace(/\*\*([\d.]+|\S[^*]*?\S)\*\*/g, '<strong>$1</strong>');
};

// 修改提交答案函数
const submitAnswer = async () => {
  isSubmitting.value = true;
  const url = 'http://47.119.38.174:8080/api/leetcode/submit/';
  const token = Cookies.get('authToken');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lang: selectedLanguage.value,
        leetcode_question_id: questionId.value,
        typed_code: userCode.value
      })
    });

    const data = await response.json();
    if (data.result && data.data && data.data.submission_id) {
      // 等待并获取判题结果
      const result = await checkResult(data.data.submission_id);
      console.log(result);
      if (result) {
        isSubmitted.value = true;
        isCorrect.value = result.status_msg === 'Accepted';
        submitResult.value = {
          show: true,
          status: result.status_msg === 'Accepted',
          message: result.status_msg === 'Accepted'
            ? '恭喜你！成功解决了这道题目，你的编程能力又提升了！' 
            : `提交未通过: ${result.status_msg}。继续努力，你一定能解决这个问题！`,
          details: result
        };

        // 如果提交成功，只分析代码
        // 如果提交失败，分析代码并获取纠错建议
        await analyzeCode();
        if (!result.status_msg === 'Accepted') {
          await correctCode();
        }
      }
    }

    // 3秒后自动关闭提示
    setTimeout(() => {
      submitResult.value.show = false;
    }, 3000);
  } catch (error) {
    console.error('提交答案失败:', error);
    submitResult.value = {
      show: true,
      status: false,
      message: '提交失败，请重试',
      details: null
    };
  } finally {
    isSubmitting.value = false;
  }
};

const goToNextQuestion = () => {
  const nextId = questionId.value + 1;
  router.push(`/question/coding/${nextId}`);
  questionId.value = nextId;
  fetchQuestionDetail(nextId);
};

const showAIChat = ref(false);
</script>

<template>
  <div class="question-detail" v-if="question">
    <!-- Alert 提示区域 -->
    <t-alert
      v-if="testResult.show"
      :theme="testResult.status ? 'success' : 'error'"
      :message="testResult.message"
      class="alert-message"
    />
    <t-alert
      v-if="submitResult.show"
      :theme="submitResult.status ? 'success' : 'error'"
      :message="submitResult.message"
      class="alert-message"
    />

    <!-- 运行结果详情卡片 -->
    <t-card
      v-if="submitResult.details"
      :bordered="true"
      theme="default"
      class="result-details"
      title="运行详情"
    >
      <t-space direction="vertical">
        <t-row>
          <t-col :span="12">
            <div class="detail-item">
              <span class="label">执行用时：</span>
              <span class="value">{{ submitResult.details.display_runtime + ' ms' }}</span>
            </div>
          </t-col>
          <t-col :span="12">
            <div class="detail-item">
              <span class="label">内存消耗：</span>
              <span class="value">{{ submitResult.details.status_memory }}</span>
            </div>
          </t-col>
        </t-row>
        <t-row>
          <t-col :span="12">
            <div class="detail-item">
              <span class="label">测试用例：</span>
              <span class="value">通过 {{ submitResult.details.total_correct }}/{{ submitResult.details.total_testcases + ' 道'}}</span>
            </div>
          </t-col>
          <t-col :span="12">
            <div class="detail-item">
              <span class="label">状态：</span>
              <span class="value">{{ submitResult.details.status_msg }}</span>
            </div>
          </t-col>
        </t-row>
      </t-space>
    </t-card>

    <!-- 题目描述区域 -->
    <div class="question-section">
      <div class="nav-bar">
        <h2>题目描述</h2>
        <t-button theme="primary" @click="goToNextQuestion">
          下一题
          <template #suffix><t-icon name="chevron-right" /></template>
        </t-button>
      </div>

      <div class="content">
        <div class="title-section">
          <h1>{{ question.title }}</h1>
          <span :class="['difficulty-tag', question.difficulty.toLowerCase()]">
            {{ question.difficulty }}
          </span>
        </div>

        <div class="description" v-html="question.content">
        </div>

        <!-- Tags section -->
        <div class="tags-section">
          <t-tag v-for="tag in question.tags" :key="tag.ID" theme="primary" variant="light">
            {{ tag.name }}
          </t-tag>
        </div>

        <!-- Sample cases -->
        <div class="sample-cases" v-if="question.sample_cases">
          <h3>示例输入：</h3>
          <pre class="code-block">{{ question.sample_cases }}</pre>
        </div>
      </div>
    </div>

    <!-- 分割线 -->
    <div class="divider"></div>

    <!-- 作答区域 -->
    <div class="answer-section">
      <div class="answer-header">
        <h2>用户作答</h2>
        <t-select
          v-model="selectedLanguage"
          :options="programmingLanguages"
          :style="{ width: '150px' }"
        />
      </div>

      <div class="code-editor">
        <t-textarea
          v-model="userCode"
          :autosize="{ minRows: 10, maxRows: 15 }"
          placeholder="请输入你的代码..."
          :readonly="isSubmitted"
        />
      </div>

      <!-- 按钮区域 -->
      <div v-if="!isSubmitted" class="button-group">
        <div class="button-container">
          <t-button theme="default" @click="runTest" :loading="isSubmitting">
            运行测试用例
          </t-button>
          <t-button theme="primary" @click="submitAnswer" :loading="isSubmitting">
            提交代码
          </t-button>
        </div>
      </div>

      <!-- 提交后显示的内容 -->
      <template v-if="isSubmitted">
        <!-- 如果答案错误，显示AI纠错 -->
        <div v-if="!isCorrect" class="result-section">
          <h3>AI 代码纠错</h3>
          <t-card :bordered="true" theme="default">
            <template v-if="isCorrecting || isAnalyzing">
              <div class="loading-container">
                <t-loading />
                <p>AI 正在分析您的代码，请稍候...</p>
              </div>
            </template>
            <t-space v-else direction="vertical">
              <div class="explanation-text" v-html="processBoldText(aiAnalysis.errorAnalysis)"></div>
              <pre class="code-block">{{ aiCorrection }}</pre>
            </t-space>
          </t-card>
        </div>

        <!-- 知识点讲解 -->
        <div class="knowledge-section">
          <div class="section-header">
            <h3>知识点讲解</h3>
            <button class="ask-ai-button" @click="showAIChat = true">
              ？有疑问点击请教AI老师
            </button>
          </div>
          <t-card :bordered="true" theme="default">
            <template v-if="isAnalyzing">
              <div class="loading-container">
                <t-loading />
                <p>AI 正在总结知识点，请稍候...</p>
              </div>
            </template>
            <div v-else class="explanation-text" v-html="processBoldText(aiAnalysis.teacherAnalysis)">
            </div>
          </t-card>
        </div>
      </template>
    </div>

    <AIChatDialog
      v-model:visible="showAIChat"
    />
  </div>
</template>

<style scoped>
.question-detail {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #F3F4F6;
}

.question-section {
  flex: 1;
  padding: 24px;
  background: white;
}

.nav-bar {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid #E5E7EB;
}

.nav-bar h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1F2937;
}

.content {
  padding: 24px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.title-section h1 {
  font-size: 24px;
  font-weight: 700;
}

.difficulty-tag {
  padding: 4px 12px;
  border-radius: 4px;
  color: white;
}

.difficulty-tag.easy {
  background-color: #10B981;
}

.difficulty-tag.medium {
  background-color: #F59E0B;
}

.difficulty-tag.hard {
  background-color: #EF4444;
}

.description {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
}

.example-card {
  background-color: #F3F4F6;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.code-block {
  font-family: Monaco, Consolas, monospace;
  background-color: #E5E7EB;
  padding: 12px;
  border-radius: 4px;
  margin: 8px 0;
}

.divider {
  height: 1px;
  background-color: #E5E7EB;
}

.answer-section {
  flex: 1;
  padding: 24px;
  background: white;
}

.answer-header {
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.answer-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1F2937;
}

.test-area {
  margin: 16px 0;
  display: flex;
  gap: 16px;
}

.test-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 16px 0;
}

.test-status {
  font-weight: 500;
}

.test-status.success {
  color: #67C23A;
}

.test-status.error {
  color: #F56C6C;
}

.submit-area {
  margin-top: 20px;
}

.submit-message {
  margin-top: 12px;
  padding: 8px;
  border-radius: 4px;
  text-align: center;
}

.submit-message.success {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.submit-message.error {
  background-color: rgba(245, 108, 108, 0.1);
  color: #F56C6C;
}

@media (max-width: 768px) {
  .question-detail {
    height: auto;
  }
  
  .nav-bar, .content {
    padding: 16px;
  }
  
  .title-section h1 {
    font-size: 20px;
  }
}

.result-section {
  margin-top: 24px;
}

.result-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 16px;
}

.explanation-text {
  font-size: 14px;
  line-height: 1.8;
  color: #4B5563;
  white-space: pre-line; /* 保留换行符 */
}

.code-block {
  font-family: Monaco, Consolas, monospace;
  background-color: #F3F4F6;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre;
  margin-top: 12px;
}

.knowledge-section {
  margin-top: 24px;
}

.knowledge-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  justify-content: flex-start;
  gap: 20px;
}

.ask-ai-button {
  padding: 6px 12px;
  border: none;
  background-color: #1a73e8;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
}

.ask-ai-button:hover {
  background-color: #1557b0;
}

.tags-section {
  margin: 16px 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

:deep(.description) {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
}

:deep(.description code) {
  background-color: #f3f4f6;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: Monaco, Consolas, monospace;
}

:deep(.description pre) {
  background-color: #f3f4f6;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
}

:deep(.description ul) {
  padding-left: 24px;
  margin: 16px 0;
}

:deep(.description li) {
  margin: 8px 0;
}

.alert-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  min-width: 300px;
}

.button-group {
  margin-top: 20px;
  padding: 16px;
  border-top: 1px solid #E5E7EB;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.answer-section {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.code-editor {
  flex: 1;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  text-align: center;
}

.loading-container p {
  margin-top: 16px;
  color: #666;
  font-size: 14px;
}

:deep(.explanation-text) {
  font-size: 14px;
  line-height: 1.8;
  color: #4B5563;
  white-space: pre-line; /* 保留换行符 */
}

:deep(.explanation-text strong) {
  font-weight: 600;
  color: #1a73e8;
}

/* 添加数学公式样式 */
:deep(.explanation-text .math) {
  font-family: 'Times New Roman', serif;
  padding: 0 4px;
}

.code-block {
  font-family: Monaco, Consolas, monospace;
  background-color: #F3F4F6;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre;
  margin-top: 12px;
}

.result-details {
  margin: 16px 0;
}

.detail-item {
  padding: 8px 0;
}

.detail-item .label {
  color: #666;
  margin-right: 8px;
}

.detail-item .value {
  color: #1a73e8;
  font-weight: 500;
}
</style>
