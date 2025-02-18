<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const answerId = route.params.id;

// 用于存储答题记录的数据
const answerRecord = ref({
  question: {
    title: '',
    difficulty: '',
    description: '',
    examples: [],
    hints: []
  },
  userAnswer: {
    code: '',
    submitTime: '',
    status: ''
  },
  aiCorrection: {
    code: '',
    explanation: ''
  },
  solution: {
    code: '',
    explanation: ''
  }
});

onMounted(async () => {
  try {
    // TODO: 调用API获取答题记录详情
    // const response = await getAnswerDetail(answerId);
    // answerRecord.value = response.data;
    
    // Mock data
    answerRecord.value = {
      question: {
        title: "两数之和",
        difficulty: "简单",
        description: `给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值的那两个整数，并返回它们的数组下标。
你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。`,
        examples: [
          {
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]",
            explanation: "因为 nums[0] + nums[1] == 9 ，返回 [0, 1]"
          }
        ],
        hints: ["可以使用哈希表来优化时间复杂度"]
      },
      userAnswer: {
        code: `function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}`,
        submitTime: '2024-03-10 10:30:00',
        status: '已通过'
      },
      aiCorrection: {
        code: `// 优化后的代码：使用哈希表降低时间复杂度
function twoSum(nums, target) {
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
        explanation: "您的解法使用了嵌套循环，时间复杂度为O(n²)。建议使用哈希表优化查找过程，可以将时间复杂度降低到O(n)。"
      },
      solution: {
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
3. 数组遍历技巧

解题思路：
1. 使用哈希表存储已遍历过的数字及其下标
2. 对于当前数字，计算目标值与其的差值
3. 如果差值存在于哈希表中，说明找到了答案
4. 否则将当前数字及其下标存入哈希表`
      }
    };
  } catch (error) {
    console.error('Failed to fetch answer detail:', error);
  }
});
</script>

<template>
  <div class="answer-detail">
    <!-- 添加返回按钮 -->
    <div class="header">
      <t-button theme="default" variant="text" @click="router.back()">
        <template #icon><t-icon name="chevron-left" /></template>
        返回作答历史
      </t-button>
    </div>
    <!-- 题目描述区域 -->
    <div class="question-section">
      <div class="title-section">
        <h1>{{ answerRecord.question.title }}</h1>
        <span :class="['difficulty-tag', answerRecord.question.difficulty]">
          {{ answerRecord.question.difficulty }}
        </span>
      </div>

      <div class="description">
        {{ answerRecord.question.description }}
      </div>

      <div class="examples">
        <div v-for="(example, index) in answerRecord.question.examples" 
             :key="index" 
             class="example-card">
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
          <li v-for="(hint, index) in answerRecord.question.hints" :key="index">
            {{ hint }}
          </li>
        </ul>
      </div>
    </div>

    <!-- 用户答案区域 -->
    <div class="answer-section">
      <div class="section-card">
        <h3>我的提交</h3>
        <div class="submission-info">
          <t-tag :theme="answerRecord.userAnswer.status === '已通过' ? 'success' : 'danger'">
            {{ answerRecord.userAnswer.status }}
          </t-tag>
          <span class="submit-time">提交时间：{{ answerRecord.userAnswer.submitTime }}</span>
        </div>
        <t-card :bordered="true" theme="default">
          <pre class="code-block">{{ answerRecord.userAnswer.code }}</pre>
        </t-card>
      </div>

      <!-- AI优化建议 -->
      <div class="section-card">
        <h3>AI 代码优化建议</h3>
        <t-card :bordered="true" theme="default">
          <t-space direction="vertical">
            <pre class="code-block">{{ answerRecord.aiCorrection.code }}</pre>
            <p class="explanation-text">{{ answerRecord.aiCorrection.explanation }}</p>
          </t-space>
        </t-card>
      </div>

      <!-- 标准解答 -->
      <div class="section-card">
        <h3>参考解答</h3>
        <t-card :bordered="true" theme="default">
          <pre class="code-block">{{ answerRecord.solution.code }}</pre>
        </t-card>
      </div>

      <!-- 知识点讲解 -->
      <div class="section-card">
        <h3>知识点讲解</h3>
        <t-card :bordered="true" theme="default">
          <div class="explanation-text" style="white-space: pre-line">
            {{ answerRecord.solution.explanation }}
          </div>
        </t-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.answer-detail {
  padding: 24px;
  background-color: #F3F4F6;
}

.header {
  margin-bottom: 20px;
}

.question-section, .answer-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
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

.section-card {
  margin-bottom: 24px;
}

.section-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 16px;
}

.submission-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.submit-time {
  color: #6B7280;
  font-size: 14px;
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

.hints {
  margin-top: 24px;
}

.hint-title {
  font-weight: 600;
  margin-bottom: 8px;
}
</style> 