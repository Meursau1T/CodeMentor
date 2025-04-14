<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AIChatDialog from '../../../components/AIChatDialog.vue';
import Cookies from 'js-cookie';
import { useAdminSettingsStore } from '@/stores/adminSettings';
import { storeToRefs } from 'pinia';

const route = useRoute();
const router = useRouter();
const questionId = ref(Number(route.query.questionId));
const adminStore = useAdminSettingsStore();
const { settings } = storeToRefs(adminStore);

// Interface for the API response
interface ProblemDetail {
  content_cn: string;
  difficulty: string;
  id: number;
  is_custom: boolean;
  knowledge_point_info: any;
  sample_cases: string;
  tags: Array<{
    ID: number;
    name: string;
    problems: any;
    knowledge_point_id: number;
  }>;
  title_cn: string;
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

const hintLoading = ref(false);
const showHint = ref(false);
const hint = ref({
  qwen: '',
  deepseek: ''
});
const selectedHintModel = ref('qwen');

// 修改获取提示的方法
const getHint = async () => {
  showHint.value = true;
  hintLoading.value = true;
  const url = 'http://47.119.38.174:8080/api/ai/generate_hint/';
  const token = Cookies.get('authToken');

  try {
    // 并行请求两个模型的结果
    const [qwenResponse, deepseekResponse] = await Promise.all([
      fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: question.value.title_cn,
          content: question.value.content_cn,
          sample_testcases: question.value.sample_cases,
          model_type: "qwen"
        })
      }),
      fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: question.value.title_cn,
          content: question.value.content_cn,
          sample_testcases: question.value.sample_cases,
          model_type: "deepseek"
        })
      })
    ]);

    const [qwenData, deepseekData] = await Promise.all([
      qwenResponse.json(),
      deepseekResponse.json()
    ]);

    if (qwenData.result && deepseekData.result) {
      hint.value = {
        qwen: processHint(qwenData.data.code),
        deepseek: processHint(deepseekData.data.code)
      };
    }
  } catch (error) {
    console.error('获取提示失败:', error);
    hint.value = {
      qwen: '获取提示失败，请稍后重试',
      deepseek: '获取提示失败，请稍后重试'
    };
  } finally {
    hintLoading.value = false;
  }
}

// Load question details on mount and when ID changes
onMounted(() => {
  fetchQuestionDetail(questionId.value);
  adminStore.initSettings();
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

const aiCorrection = ref({
  qwen: '',
  deepseek: ''
});

// 添加编程语言选项
const programmingLanguages = [
  { value: 'python3', label: 'Python3' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'golang', label: 'Go' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'swift', label: 'Swift' },
  { value: 'typescript', label: 'TypeScript' },
  
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
const checkResult = async (id: number, flag: boolean = false) => {
  // 如果是自定义题目，直接调用 AI judge 接口
  if (question.value?.is_custom) {
    const url = `http://47.119.38.174:8080/api/ai/judge/`;
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
          code: userCode.value,
          test: flag
        })
      });

      const data = await response.json();
      if (data.result) {
        // 转换返回格式以匹配原有接口
        const result: JudgeResult = {
          status_runtime: `${data.data.time_used} ms`,
          status_memory: `${data.data.memory_used} MB`,
          status_msg: data.data.status,
          total_correct: data.data.test_results.filter(r => r.status === 'SUCCESS').length,
          total_testcases: data.data.test_results.length,
          run_success: data.data.status === 'SUCCESS',
          state: 'FINISHED',
          display_runtime: `${data.data.time_used}`,
          memory_percentile: null,
          runtime_percentile: null,
          code_answer: data.data.test_results.map(r => r.actual_output),
          expected_code_answer: data.data.test_results.map(r => r.expected_output)
        };
        return result;
      }
      throw new Error('Failed to get judge result');
    } catch (error) {
      console.error('获取判题结果失败:', error);
      return null;
    }
  }

  // 非自定义题目的原有逻辑
  const url = `http://47.119.38.174:8080/api/leetcode/check/`;
  const token = Cookies.get('authToken');
  
  const MAX_RETRIES = 50;
  const POLLING_INTERVAL = 1000;
  let retryCount = 0;

  const poll = async (): Promise<any> => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          run_code_id: id.toString(),
          test: flag
        })
      });

      const data = await response.json();
      
      if (data.result && data.data) {
        if ((data.data.state === 'PENDING' || data.data.state === 'STARTED') && retryCount < MAX_RETRIES) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
          return poll();
        }

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
  // 如果是自定义题目，直接使用 checkResult 函数，因为它已经包含了对自定义题目的处理
  if (question.value?.is_custom) {
    try {
      const result = await checkResult(0, true);
      if (result) {
        testResult.value = {
          show: true,
          status: result.status_msg === 'SUCCESS',
          message: result.status_msg === 'SUCCESS'
            ? '太棒了！测试用例全部通过，你的代码运行得很好！' 
            : `测试未通过: ${result.status_msg}。再检查一下代码逻辑吧！`,
          details: result
        };
      }
    } catch (error) {
      console.error('运行测试失败:', error);
      testResult.value = {
        show: true,
        status: false,
        message: '运行测试失败，请重试',
        details: null
      };
    }
    return;
  }

  // 非自定义题目的原有逻辑
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
      const result = await checkResult(data.data.interpret_id, true);
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
  } catch (error) {
    console.error('运行测试失败:', error);
    testResult.value = {
      show: true,
      status: false,
      message: '运行测试失败，请重试',
      details: null
    };
  }

  // 3秒后自动关闭提示
  setTimeout(() => {
    testResult.value.show = false;
  }, 3000);
};

// 添加新的响应式变量
const aiAnalysis = ref({
  qwen: {
    errorAnalysis: '',
    teacherAnalysis: ''
  },
  deepseek: {
    errorAnalysis: '',
    teacherAnalysis: ''
  }
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

//处理Hint样式函数
const processHint = (text: string) =>{
  const lines = text.split('\n');
  
  // 2. 每行用 <p> 包裹，数字开头的行加粗
  return lines.map(line => {
    if (/^\d+\./.test(line.trim())) {
      return `<p><strong>${line}</strong></p>`;
    }
    return `<p>${line}</p>`;
  }).join('');

}


// 修改提交答案函数
const submitAnswer = async () => {
  isSubmitting.value = true;
  const knowledgePointId = Number(route.query.knowledgePointId);

  try {
    // 如果是自定义题目，直接使用 checkResult
    if (question.value?.is_custom) {
      const result = await checkResult(0, false); // 传入 false 表示这是一次提交而不是测试
      if (result) {
        isSubmitted.value = true;
        isCorrect.value = result.status_msg === 'SUCCESS';
        submitResult.value = {
          show: true,
          status: result.status_msg === 'SUCCESS',
          message: result.status_msg === 'SUCCESS'
            ? '恭喜你！成功解决了这道题目，你的编程能力又提升了！' 
            : `提交未通过: ${result.status_msg}。继续努力，你一定能解决这个问题！`,
          details: result
        };

        // 分析代码并获取纠错建议
        await analyzeCode(0); // 对于自定义题目，我们传入 0 作为 record_id
        if (!isCorrect.value) {
          await correctCode(0);
        }
      }
      return;
    }

    // 非自定义题目的原有逻辑
    const url = 'http://47.119.38.174:8080/api/leetcode/submit/';
    const token = Cookies.get('authToken');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lang: selectedLanguage.value,
        leetcode_question_id: questionId.value,
        typed_code: userCode.value,
        knowledge_point_id: knowledgePointId
      })
    });

    const data = await response.json();
    if (data.result && data.data && data.data.submission_id && data.data.record_id) {
      const result = await checkResult(data.data.submission_id, false);
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

        await analyzeCode(data.data.record_id);
        if (result.status_msg !== 'Accepted') {
          await correctCode(data.data.record_id);
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

const selectedAnalysisModel = ref('qwen'); // 用于知识点讲解的模型选择
const selectedCorrectionModel = ref('qwen'); // 用于代码纠错的模型选择

// 添加模型选项
const modelOptions = [
  { value: 'qwen', label: '千问' },
  { value: 'deepseek', label: 'Deepseek' }
];

// 分析代码
const analyzeCode = async (recordId: number) => {
  isAnalyzing.value = true;
  try {
    const response = await fetch(`http://47.119.38.174:8080/api/ai/analyze_code/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        problem_id: questionId.value,
        language: selectedLanguage.value,
        typed_code: userCode.value,
        record_id: recordId
      })
    });

    const data = await response.json();
    if (data.result) {
      // 处理千问模型返回
      const qwenMessage = data.data.qwen_wrong_reason_and_analyze;
      const qwenParts = qwenMessage.split('**AI讲师分析**');
      const qwenErrorPart = qwenParts[0].replace('**错误分析**：', '').trim();
      const qwenTeacherPart = qwenParts[1]?.replace('：', '').trim() || '';

      // 处理Deepseek模型返回
      const deepseekMessage = data.data.deepseek_wrong_reason_and_analyze;
      const deepseekParts = deepseekMessage.split('**AI讲师分析**');
      const deepseekErrorPart = deepseekParts[0].replace('**错误分析**：', '').trim();
      const deepseekTeacherPart = deepseekParts[1]?.replace('：', '').trim() || '';

      // 提取花括号中的内容
      const extractContent = (text: string) => {
        const match = text.match(/\{([^}]+)\}/);
        return match ? match[1].trim() : text.trim();
      };

      aiAnalysis.value = {
        qwen: {
          errorAnalysis: extractContent(qwenErrorPart),
          teacherAnalysis: extractContent(qwenTeacherPart)
        },
        deepseek: {
          errorAnalysis: extractContent(deepseekErrorPart),
          teacherAnalysis: extractContent(deepseekTeacherPart)
        }
      };
    }
  } catch (error) {
    console.error('获取代码分析失败:', error);
  } finally {
    isAnalyzing.value = false;
  }
};

// 纠错代码
const correctCode = async (recordId: number) => {
  isCorrecting.value = true;
  try {
    const response = await fetch(`http://47.119.38.174:8080/api/ai/correct_code/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        problem_id: questionId.value,
        language: selectedLanguage.value,
        typed_code: userCode.value,
        record_id: recordId
      })
    });

    const data = await response.json();
    if (data.result) {
      aiCorrection.value = {
        qwen: data.data.qwen_corrected_code,
        deepseek: data.data.deepseek_corrected_code
      };
    }
  } catch (error) {
    console.error('获取代码纠错失败:', error);
  } finally {
    isCorrecting.value = false;
  }
};
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
        <!-- <t-button theme="primary" @click="goToNextQuestion">
          下一题
          <template #suffix><t-icon name="chevron-right" /></template>
        </t-button> -->
      </div>

      <div class="content">
        <div class="title-section">
          <h1>{{ question.title_cn }}</h1>
          <span :class="['difficulty-tag', question.difficulty.toLowerCase()]">
            {{ question.difficulty }}
          </span>
          <t-button 
            v-if="settings.ai_assistance.hint_enabled"
            theme="primary" 
            @click="getHint"
          >
            提示
          </t-button>

          <!-- 添加提示弹窗 -->
          <t-dialog v-model:visible="showHint" header="提示" theme="default" :style="{ minHeight: '400px' }">
            
            <div class="hint-content">
              <t-loading :loading="hintLoading" :style="{ height: '300px' }">
                <div v-if="!hintLoading" v-html="hint[selectedHintModel]" class="hint-text"></div>
              </t-loading>
            </div>
            <template #footer>
              <div class="hint-dialog-header">
                
                <t-radio-group v-model="selectedHintModel" variant="default-filled">
                  <t-radio-button value="qwen">千问</t-radio-button>
                  <t-radio-button value="deepseek">Deepseek</t-radio-button>
                </t-radio-group>
              </div>
            </template>
          </t-dialog>
        </div>

        <div class="description" v-html="question.content_cn">
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
          label="语言："
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
        <div 
          v-if="!isCorrect && settings.ai_assistance.code_correction_enabled" 
          class="result-section"
        >
          <div class="section-header">
            <h3>AI 代码纠错</h3>
            <t-select
              label="模型："
              v-model="selectedCorrectionModel"
              :options="modelOptions"
              :style="{ width: '160px' }"
            />
          </div>
          <t-card :bordered="true" theme="default">
            <template v-if="isCorrecting || isAnalyzing">
              <div class="loading-container">
                <t-loading />
                <p>AI 正在分析您的代码，请稍候...</p>
              </div>
            </template>
            <t-space v-else direction="vertical">
              <div class="explanation-text" v-html="processBoldText(aiAnalysis[selectedCorrectionModel].errorAnalysis)"></div>
              <pre class="code-block">{{ aiCorrection[selectedCorrectionModel] }}</pre>
            </t-space>
          </t-card>
        </div>

        <!-- 知识点讲解 -->
        <div 
          v-if="settings.ai_assistance.analyze_enabled"
          class="knowledge-section"
        >
          <div class="section-header">
            <h3>AI知识点讲解</h3>
            <t-select
              label="模型："
              v-model="selectedAnalysisModel"
              :options="modelOptions"
              :style="{ width: '160px' }"
            />
            <button 
              v-if="settings.ai_assistance.ai_chat_enabled"
              class="ask-ai-button" 
              @click="showAIChat = true"
            >
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
            <div v-else class="explanation-text" v-html="processBoldText(aiAnalysis[selectedAnalysisModel].teacherAnalysis)">
            </div>
          </t-card>
        </div>
      </template>
    </div>

    <AIChatDialog
      v-if="settings.ai_assistance.ai_chat_enabled"
      v-model:visible="showAIChat"
      :problem-id="questionId"
      :typed-code="userCode"
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
  gap: 16px;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  flex-shrink: 0;
}

:deep(.t-select) {
  flex-shrink: 0;
}

.ask-ai-button {
  padding: 6px 12px;
  border: none;
  background-color:#1a73e8;
  color: white;
  border-radius:4px;
  cursor: pointer;
  transition:background-color 0.2s;font-size: 14px;
  margin-left:0px
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

.hint-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 16px;
}

.hint-content {
  min-height: 300px;
  padding: 16px;
}

.hint-text {
  font-size: 14px;
  line-height: 1.6;
}

:deep(.t-dialog__body) {
  padding: 0;
}

:deep(.t-loading) {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.t-loading__parent) {
  min-height: 300px;
}

:deep(.t-loading__spinner) {
  font-size: 24px;
}
</style>
