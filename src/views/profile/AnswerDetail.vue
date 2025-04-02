<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserInfoStore } from '../../stores/userInfo'
import Cookies from 'js-cookie';
const route = useRoute();
const router = useRouter();
const answerId = Number(route.params.id);
const userStore = useUserInfoStore()
const courseId = userStore.userInfo?.courseId
// 用于存储答题记录的数据
const answerRecord = ref({
  question: {
    title_cn: '',
    difficulty: '',
    content_cn: ''
  },
  userAnswer: {
    code: ''
  },
  aiCorrection: {
    analysis: ''
  },
  solution: {
    code: ''
  }
});

onMounted(async () => {
  try {
    // TODO: 调用API获取答题记录详情

  const url = `http://47.119.38.174:8080/api/courses/${courseId}/records/${answerId}/`;
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
    // 数据结构映射
    answerRecord.value = {
      question: {
        title_cn: data.title_cn,
        difficulty: data.difficulty,
        content_cn: data.content_cn
      },
      userAnswer: {
        code: data.typed_code
      },
      aiCorrection: {
        analysis: data.wrong_reason_and_analyze
      },
      solution: {
        code: data.corrected_code
      }
    };
  } catch (error) {
    console.error('获取题目详情失败:', error);
  }
   
  } catch (error) {
    console.error('Failed to fetch answer detail:', error);
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
        <h1>{{ answerRecord.question.title_cn }}</h1>
        <span :class="['difficulty-tag', answerRecord.question.difficulty]">
          {{ answerRecord.question.difficulty }}
        </span>
      </div>

      <div class="description"v-html="answerRecord.question.content_cn">
      </div>

      <!-- <div class="examples">
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
      </div> -->

      <!-- <div class="hints">
        <div class="hint-title">提示：</div>
        <ul>
          <li v-for="(hint, index) in answerRecord.question.hints" :key="index">
            {{ hint }}
          </li>
        </ul>
      </div> -->
    </div>

    <!-- 用户答案区域 -->
    <div class="answer-section">
      <div class="section-card">
        <h3>我的提交</h3>
        <div class="submission-info">
          <!-- <t-tag :theme="answerRecord.userAnswer.status === '已通过' ? 'success' : 'danger'">
            {{ answerRecord.userAnswer.status }}
          </t-tag> -->
          <!-- <span class="submit-time">提交时间：{{ answerRecord.userAnswer.submitTime }}</span> -->
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
            <!-- <pre class="code-block">{{ answerRecord.aiCorrection.code }}</pre> -->
            <div class="explanation-text" v-html="processBoldText(answerRecord.aiCorrection.analysis)"></div>
            <!-- <p class="explanation-text">{{ answerRecord.aiCorrection.analysis }}</p> -->
          </t-space>
        </t-card>
      </div>

      <!-- 标准解答 -->
      <!-- <div class="section-card">
        <h3>参考解答</h3>
        <t-card :bordered="true" theme="default">
          <pre class="code-block">{{ answerRecord.solution.code }}</pre>
        </t-card>
      </div> -->

      <!-- 知识点讲解 -->
      <!-- <div class="section-card">
        <h3>知识点讲解</h3>
        <t-card :bordered="true" theme="default">
          <div class="explanation-text" style="white-space: pre-line">
            {{ answerRecord.solution.explanation }}
          </div>
        </t-card>
      </div> -->
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
.explanation-text {
  font-size: 14px;
  line-height: 1.8;
  color: #4B5563;
  white-space: pre-line; /* 保留换行符 */
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

.difficulty-tag.Easy {
  background-color: #10B981;
}

.difficulty-tag.Medium {
  background-color: #F59E0B;
}

.difficulty-tag.Hard {
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