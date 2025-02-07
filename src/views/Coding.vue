<style scoped>
.container {
  display: flex;
  padding: 32px;
  gap: 24px;
}

.left-card {
  flex: 1;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.right-card {
  flex: 1;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #000;
  margin-bottom: 16px;
}

.question-content {
  margin-top: 16px;
  line-height: 1.6;
}

.code-input {
  flex: 1;
  margin: 16px 0;
}

.button-area {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 16px;
}
</style>

<template>
  <div class="container">
    <div class="left-card">
      <div class="title">题目描述</div>
      <div class="question-content">
        {{ questionDescription }}
      </div>
    </div>
    <div class="right-card">
      <t-textarea
        class="code-input"
        placeholder="请输入你的代码..."
        :autosize="{ minRows: 10, maxRows: 20 }"
      />
      <div class="button-area">
        <t-button theme="default" variant="base">下一题</t-button>
        <t-button theme="primary">提交代码</t-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const questionDescription = ref('');

// Mock API function
const fetchQuestion = async (id: string) => {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 模拟返回数据
  return {
    id,
    description: '编写一个函数，接收一个整数数组 nums 和一个目标值 target，在该数组中找出和为目标值 target 的两个整数，并返回它们的数组下标。\n\n你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。\n\n示例:\n给定 nums = [2, 7, 11, 15], target = 9\n因为 nums[0] + nums[1] = 2 + 7 = 9\n所以返回 [0, 1]'
  };
};

onMounted(async () => {
  const questionId = route.params.id as string;
  try {
    const question = await fetchQuestion(questionId);
    questionDescription.value = question.description;
  } catch (error) {
    console.error('获取题目失败:', error);
  }
});
</script>