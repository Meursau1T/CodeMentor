<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserInfoStore } from '../../stores/userInfo';
import Cookies from 'js-cookie';

const userStore = useUserInfoStore();
const router = useRouter();

// 难度选项
const difficulties = [
  { label: '全部', value: '' },
  { label: '简单', value: 'EASY', color: '#10B981' },
  { label: '中等', value: 'MEDIUM', color: '#F59E0B' },
  { label: '困难', value: 'HARD', color: '#EF4444' }
];

// 响应式状态
const questions = ref([]);
const knowledgePoints = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(20);

// 筛选条件
const filterForm = ref({
  difficulty: '',
  knowledgePointId: null as number | null
});

// 获取知识点列表
const fetchKnowledgePoints = async () => {
  const courseId = Number(userStore.userInfo?.courseId);
  try {
    const response = await fetch(
      `http://47.119.38.174:8080/api/courses/${courseId}/knowledge_points/`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Cookies.get('authToken')}`
        }
      }
    );

    if (!response.ok) throw new Error('获取知识点失败');

    const { result, data } = await response.json();
    if (result) {
      knowledgePoints.value = [
        { id: null, name: '全部' },
        ...data
      ];
    }
  } catch (error) {
    console.error('获取知识点失败:', error);
  }
};

// 获取题目列表
const fetchQuestions = async () => {
  loading.value = true;
  const courseId = Number(userStore.userInfo?.courseId);

  try {
    const body: Record<string, any> = {};
    
    if (filterForm.value.difficulty) {
      body.difficulty = filterForm.value.difficulty;
    }
    if (filterForm.value.knowledgePointId) {
      body.knowledge_point_id = filterForm.value.knowledgePointId;
    }

    const response = await fetch(
      `http://47.119.38.174:8080/api/courses/${courseId}/problems/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Cookies.get('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) throw new Error('获取题目失败');

    const { result, data } = await response.json();
    if (result) {
      // 重置数组以触发响应式更新
      questions.value = [];
      
      // 使用 Set 进行去重
      const questionSet = new Set(data.map(question => JSON.stringify({
        id: question.id,
        status: question.status,
        title: question.title_cn,
        difficulty: question.difficulty.toUpperCase(),
      })));
      
      questions.value = Array.from(questionSet).map(q => JSON.parse(q));
      
      // 重置分页
      currentPage.value = 1;
    }
  } catch (error) {
    console.error('获取题目列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 处理筛选变化
const handleFilterChange = async () => {
  await fetchQuestions();
};

// 前端搜索和分页
const filteredQuestions = computed(() => {
  if (!searchQuery.value) return questions.value;
  
  const query = searchQuery.value.toLowerCase();
  return questions.value.filter(q => 
    q.title.toLowerCase().includes(query)
  );
});

const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredQuestions.value.slice(start, end);
});

const total = computed(() => filteredQuestions.value.length);

// 处理分页变化
const handlePageChange = (pageInfo: { current: number, pageSize: number }) => {
  currentPage.value = pageInfo.current;
};

// 处理行点击
const handleQuestionClick = (data: { row: { id: string } }) => {
  if (data.row.id) {
    router.push({
      path: '/question/coding',
      query: {
        questionId: data.row.id
      }
    });
  }
};

// 状态和难度显示处理
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
      return '#67C23A';
    case 'TRIED':
      return '#E6A23C';
    case 'UNTRIED':
      return '#909399';
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

// 表格列定义
const columns = [
  {
    colKey: 'id',
    title: '编号',
    width: 80,
  },
  {
    colKey: 'title',
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

// 初始化
onMounted(() => {
  fetchKnowledgePoints();
  fetchQuestions();
});
</script>

<template>
  <div class="question-list">
    <!-- 筛选器区域 -->
    <div class="filters">
      <t-space direction="vertical" size="large">
        <t-space>
          <t-select
            v-model="filterForm.difficulty"
            placeholder="选择难度"
            :options="difficulties"
            @change="handleFilterChange"
            style="width: 200px"
          />
          <t-select
            v-model="filterForm.knowledgePointId"
            placeholder="选择知识点"
            :options="knowledgePoints"
            :keys="{label: 'name', value: 'id'}"
            @change="handleFilterChange"
            style="width: 200px"
          />
          <t-input
            v-model="searchQuery"
            placeholder="搜索题目"
            style="width: 200px"
          />
        </t-space>
      </t-space>
    </div>

    <!-- 表格区域 -->
    <t-table
      :data="paginatedQuestions"
      :columns="columns"
      :loading="loading"
      :pagination="{
        current: currentPage,
        pageSize: pageSize,
        total: total,
        onChange: handlePageChange
      }"
      hover
      @row-click="handleQuestionClick"
      :row-key="id"
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


