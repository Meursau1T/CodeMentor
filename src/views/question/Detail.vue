<script setup lang="ts">
import { ref } from 'vue';

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
  // Mock submission logic
  console.log('提交答案:', userCode.value);
};

const goToNextQuestion = () => {
  // Mock navigation logic
  console.log('跳转到下一题');
};
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
        />
      </div>

      <div class="test-area">
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

      <t-button theme="primary" block @click="submitAnswer">
        确认提交
      </t-button>
    </div>
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
</style>
