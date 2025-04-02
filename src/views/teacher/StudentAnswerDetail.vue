<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Cookies from 'js-cookie';

const route = useRoute();
const router = useRouter();
const answerId = Number(route.params.answerId);
const studentId = route.params.studentId;
const courseId = route.params.courseId;
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
    const url = `http://47.119.38.174:8080/api/courses/${courseId}/records/${answerId}/`;
    const token = Cookies.get('authToken');

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
    <div class="header">
      <t-button theme="default" variant="text" @click="router.back()">
        <template #icon><t-icon name="chevron-left" /></template>
        返回作答列表
      </t-button>
    </div>

    <div class="question-section">
      <div class="title-section">
        <h1>{{ answerRecord.question.title_cn }}</h1>
        <span :class="['difficulty-tag', answerRecord.question.difficulty]">
          {{ answerRecord.question.difficulty }}
        </span>
      </div>

      <div class="description" v-html="answerRecord.question.content_cn">
      </div>
    </div>

    <div class="answer-section">
      <div class="section-card">
        <h3>学生提交</h3>
        <t-card :bordered="true" theme="default">
          <pre class="code-block">{{ answerRecord.userAnswer.code }}</pre>
        </t-card>
      </div>

      <div class="section-card">
        <h3>AI 代码优化建议</h3>
        <t-card :bordered="true" theme="default">
          <t-space direction="vertical">
            <div class="explanation-text" v-html="processBoldText(answerRecord.aiCorrection.analysis)"></div>
          </t-space>
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

.explanation-text {
  font-size: 14px;
  line-height: 1.8;
  color: #4B5563;
  white-space: pre-line;
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

.section-card {
  margin-bottom: 24px;
}

.section-card h3 {
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
</style> 