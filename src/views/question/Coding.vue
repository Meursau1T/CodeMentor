<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AIChatDialog from '../../../components/AIChatDialog.vue';

const route = useRoute();
const questionId = route.params.id; // 获取路由参数

// Mock data for the question
const question = {
  title: "两数之和",
  difficulty: "简单", // 简单、中等、困难
  description: `给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值的那两个整数，并返回它们的数组下标。
你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。`,
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "因为 nums[0] + nums[1] == 9 ，返回 [0, 1]"
    }
  ],
  testCases: [
    {
      input: "[3,2,4], 6",
      expectedOutput: "[1,2]"
    }
  ],
  hints: ["可以使用哈希表来优化时间复杂度"]
};

const userCode = ref('');
const testInput = ref('');
const testResult = ref({
  status: '', // 'success' or 'error'
  message: ''
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

const aiCorrection = {
  code: `// 您的代码可以通过以下方式优化：
function twoSum(nums, target) {
  const map = new Map();  // 使用哈希表存储已遍历的数字
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
  explanation: "您的解法时间复杂度较高，建议使用哈希表优化查找过程。"
};

const runTest = () => {
  // Mock test running logic
  setTimeout(() => {
    if (testInput.value.includes('[3,2,4], 6')) {
      testResult.value = {
        status: 'success',
        message: '测试通过'
      };
    } else {
      testResult.value = {
        status: 'error',
        message: '测试失败：输出结果与预期不符'
      };
    }
  }, 500);
};

const submitAnswer = () => {
  isSubmitted.value = true;
  // Mock submission logic - assuming the answer is incorrect for this example
  isCorrect.value = false;
};

const goToNextQuestion = () => {
  // Mock navigation logic
  console.log('跳转到下一题');
};

const showAIChat = ref(false);
</script>

<template>
  <div class="question-detail">
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
          <span :class="['difficulty-tag', question.difficulty]">
            {{ question.difficulty }}
          </span>
        </div>

        <div class="description">
          {{ question.description }}
        </div>

        <div class="examples">
          <div v-for="(example, index) in question.examples" :key="index" class="example-card">
            <div class="example-title">示例 {{ index + 1}}：</div>
            <div class="code-block">输入：{{ example.input }}</div>
            <div class="code-block">输出：{{ example.output }}</div>
            <div v-if="example.explanation" class="explanation">
              解释：{{ example.explanation }}
            </div>
          </div>
        </div>

        <div class="hints">
          <div class="hint-title">提示：</div>
          <ul>
            <li v-for="(hint, index) in question.hints" :key="index">
              {{ hint }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 分割线 -->
    <div class="divider"></div>

    <!-- 作答区域 -->
    <div class="answer-section">
      <div class="answer-header">
        <h2>用户作答</h2>
      </div>

      <div class="code-editor">
        <t-textarea
          v-model="userCode"
          :autosize="{ minRows: 10, maxRows: 15 }"
          placeholder="请输入你的代码..."
          :readonly="isSubmitted"
        />
      </div>

      <!-- 测试区域，提交后隐藏 -->
      <div v-if="!isSubmitted" class="test-area">
        <t-textarea
          v-model="testInput"
          :autosize="{ minRows: 3, maxRows: 5 }"
          placeholder="输入测试用例..."
        />
        <t-button theme="default" @click="runTest">运行</t-button>
      </div>

      <div v-if="testResult.status" 
           :class="['test-result', testResult.status]">
        {{ testResult.message }}
      </div>

      <t-button v-if="!isSubmitted" theme="primary" block @click="submitAnswer">
        确认提交
      </t-button>

      <!-- 提交后显示的内容 -->
      <template v-if="isSubmitted">
        <!-- 如果答案错误，显示AI纠错 -->
        <div v-if="!isCorrect" class="result-section">
          <h3>AI 代码优化建议</h3>
          <t-card :bordered="true" theme="default">
            <t-space direction="vertical">
              <pre class="code-block">{{ aiCorrection.code }}</pre>
              <p class="explanation-text">{{ aiCorrection.explanation }}</p>
            </t-space>
          </t-card>
        </div>

        <!-- 标准解答 -->
        <div class="result-section">
          <h3>参考解答</h3>
          <t-card :bordered="true" theme="default">
            <pre class="code-block">{{ solution.code }}</pre>
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
          <div class="explanation-text" style="white-space: pre-line">
            {{ solution.explanation }}
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

.difficulty-tag.简单 {
  background-color: #10B981;
}

.difficulty-tag.中等 {
  background-color: #F59E0B;
}

.difficulty-tag.困难 {
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

.test-result {
  margin: 16px 0;
  padding: 12px;
  border-radius: 4px;
  animation: fadeIn 0.3s ease-in;
}

.test-result.success {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10B981;
  border-left: 4px solid #10B981;
}

.test-result.error {
  background-color: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  border-left: 4px solid #EF4444;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

.code-block {
  font-family: Monaco, Consolas, monospace;
  background-color: #F3F4F6;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre;
}

.explanation-text {
  font-size: 14px;
  line-height: 1.6;
  color: #4B5563;
}

.knowledge-section {
  margin-top: 24px;
}

.knowledge-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  /**margin-bottom: 16px;*/
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
</style>
