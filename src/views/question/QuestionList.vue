<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Cookies from 'js-cookie';

// Mock data
const difficulties = [
  { label: '全部', value: 'ALL' },
  { label: '简单', value: 'EASY', color: '#10B981' },
  { label: '中等', value: 'MEDIUM', color: '#F59E0B' },
  { label: '困难', value: 'HARD', color: '#EF4444' }
];



// Reactive states
const questions = ref([]);
const selectedDifficulties = ref([]);
const selectedTopics = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const searchQuery = ref('');
const total = ref(0);
const loading = ref(false);

const route = useRoute();

// 获取题目列表
const fetchQuestions = async () => {
  loading.value = true;
  const token = Cookies.get('authToken');
  
  const courseId = Number(route.query.courseId);
  const knowledgePointId = Number(route.query.knowledgePointId);

  try {
    let url;
    if (courseId && knowledgePointId) {
      url = `http://47.119.38.174:8080/api/courses/${courseId}/knowledge_points/${knowledgePointId}/problems/`;
    } else {
      url = `http://47.119.38.174:8080/api/courses/${courseId}/problems/`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const { data } = await response.json(); // 直接解构出data字段

    questions.value = data.map(question => ({
      id: question.id,
      status: question.status,
      title_cn: question.title_cn,
      difficulty: question.difficulty.toUpperCase(),
      // 其他必要字段或默认值
      
    }));
    
    total.value = data.length; // 直接使用数组长度

  } catch (error) {
    console.error('获取题目列表失败:', error);
  } finally {
    loading.value = false;
  }
};
// 在组件挂载时获取数据
onMounted(() => {
  fetchQuestions();
});

// Computed properties
const filteredQuestions = computed(() => {
  let result = [...questions.value];
  console.log(result)
  // 仅当不是课程练习时应用难度过滤  !route.query.courseId &&
  
  if ( selectedDifficulties.value.length) {
    result = result.filter(q => selectedDifficulties.value.includes(q.difficulty));
  }
  
  // if (selectedTopics.value.length) {
  //   result = result.filter(q => 
  //     q.topics.some(topic => selectedTopics.value.includes(topic))
  //   );
  // }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(q => 
      q.title_cn.toLowerCase().includes(query)
    );
  }
  
  return result;
});

const totalPages = computed(() => Math.ceil(filteredQuestions.value.length / pageSize.value));

const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredQuestions.value.slice(start, end);
});

// Methods
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'SOLVED':
      return '已解答';
    case 'TRIED':
      return '尝试过';
    case 'UNTRIED':
      return '未开始';
    default:
      return '未开始';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'SOLVED':
      return '#67C23A';  // 绿色
    case 'TRIED':
      return '#E6A23C';  // 橙色
    case 'UNTRIED':
      return '#909399';  // 灰色
    default:
      return '#909399';
  }
};

const getDifficultyLabel = (difficulty: string) => {
  const diff = difficulties.find(d => d.value === difficulty);
  return diff ? diff.label : '';
};

const getDifficultyColor = (difficulty: string) => {
  const diff = difficulties.find(d => d.value === difficulty);
  return diff ? diff.color : '#9CA3AF';
};

const getTopicLabels = (topicValues: string[]) => {
  return topicValues
    .map(value => topics.find(t => t.value === value)?.label)
    .filter(Boolean)
    .join(', ');
};

const handlePageChange = (pageInfo: { current: number, pageSize: number }) => {
  currentPage.value = pageInfo.current;
  fetchQuestions();
};

const handleFilterChange = () => {
  currentPage.value = 1;
};

const router = useRouter();

const handleQuestionClick = (data: { row: { id: string}}) => {
  
  if (data.row.id) {
    const knowledgePointId = Number(route.query.knowledgePointId);
    const questionId  = data.row.id
    router.push({
    path: '/question/coding',
    query: {
      questionId,
      knowledgePointId  // 使用原始知识点ID而不是索引
    }
  })

    //router.push(`/question/coding/${data.row.id}`);
  }
};

// Define table columns
const columns = [
  {
    colKey: 'id',
    title: '编号',
    width: 80,
  },
  {
    colKey: 'title_cn',
    title: '题目',
    width: 200,
  },
  {
    colKey: 'difficulty',
    title: '难度',
    width: 100,
    cell: (h: any, { row }: { row: any }) => {
      return h('span', {
        style: { color: getDifficultyColor(row.difficulty) },
        innerHTML: getDifficultyLabel(row.difficulty)
      });
    },
  },
  {
    colKey: 'status',
    title: '状态',
    width: 100,
    cell: (h: any, { row }: { row: any }) => {
      return h('span', {
        style: { color: getStatusColor(row.status) },
        innerHTML: getStatusLabel(row.status)
      });
    },
  },
];
</script>

<template>
  <div class="question-list">
    <!-- 过滤器区域 -->
    <div class="filters">
      <t-space direction="vertical" size="large">
        <t-space>
          <t-select
            v-model="selectedDifficulties"
            multiple
            placeholder="选择难度"
            :options="difficulties"
            @change="handleFilterChange"
          />
          <t-input
            v-model="searchQuery"
            placeholder="搜索题目"
            @change="handleFilterChange"
          />
        </t-space>
      </t-space>
    </div>

    <!-- 表格区域 -->
    <t-table
      :data="paginatedQuestions"
      :columns="columns"
      class="question-table"
      @row-click="handleQuestionClick"
      :loading="loading"
      :pagination="{
        current: currentPage,
        pageSize: 20,
        total: total,
        onChange: handlePageChange
      }"
      hover
    >
      <template #pagination-right>
        <div>共 {{ total }} 条数据</div>
      </template>
    </t-table>
  </div>
</template>

<style scoped>
.question-list {
  padding: 20px;
}

.filters {
  margin-bottom: 20px;
}

:deep(.question-table tbody tr) {
  cursor: pointer;
}

:deep(.t-table__pagination) {
  justify-content: center;
  margin-top: 20px;
}
</style>


