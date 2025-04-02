<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Cookies from 'js-cookie';
import { MessagePlugin } from 'tdesign-vue-next';
import type { PaginationProps } from 'tdesign-vue-next';

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
const currentPage = ref(1);
const pageSize = ref(20);
const searchQuery = ref('');
const total = ref(0);
const loading = ref(false);
const formData = ref({
  difficulty: '',
});

const route = useRoute();
const router = useRouter();
const courseId = Number(route.params.courseId);
const knowledgePointId = Number(route.params.knowledgePointId);

const pagination = ref<PaginationProps>({
  total: 0,
  pageSize: 10,
  current: 1,
});

// 获取题目列表
const fetchQuestions = async () => {
  loading.value = true;
  try {
    const response = await fetch(
      `http://47.119.38.174:8080/api/courses/${courseId}/knowledge_points/${knowledgePointId}/problems/`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('authToken')}`,
        }
      }
    );

    if (!response.ok) {
      throw new Error('获取题目失败');
    }

    const { data } = await response.json();
    questions.value = data.map(question => ({
      id: question.id,
      status: question.status,
      title: question.title_cn,
      difficulty: question.difficulty.toUpperCase(),
    }));
    
    // 初始化分页信息
    updatePagination();
  } catch (error) {
    MessagePlugin.error('获取题目失败');
    console.error('Error fetching questions:', error);
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
  
  // 按难度筛选
  if (formData.value.difficulty && formData.value.difficulty !== 'ALL') {
    result = result.filter(q => q.difficulty === formData.value.difficulty);
  }
  
  return result;
});

// 分页后的数据
const paginatedQuestions = computed(() => {
  const start = (pagination.value.current - 1) * pagination.value.pageSize;
  const end = start + pagination.value.pageSize;
  return filteredQuestions.value.slice(start, end);
});

// 更新总数
const updatePagination = () => {
  pagination.value.total = filteredQuestions.value.length;
};

// 处理分页变化
const onPageChange = (current: number) => {
  pagination.value.current = current;
};

// 处理筛选提交
const onSubmit = () => {
  pagination.value.current = 1;
  updatePagination();
};

// 处理重置
const onReset = () => {
  formData.value = {
    difficulty: '',
  };
  pagination.value.current = 1;
  updatePagination();
};

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

const handleQuestionClick = (data: { row: { id: string}}) => {
  if (data.row.id) {
    router.push({
      path: '/question/coding',
      query: {
        questionId: data.row.id,
        knowledgePointId
      }
    });
  }
};

const handleViewQuestion = (row: any) => {
  router.push(`/problem/${row.id}`);
};

const getStatusTheme = (status: string) => {
  switch (status) {
    case 'SOLVED':
      return 'success';
    case 'TRIED':
      return 'warning';
    default:
      return 'default';
  }
};

const getStatusVariant = (status: string) => {
  return status === 'SOLVED' ? 'light' : 'light';
};

// Define table columns
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
  {
    colKey: 'op',
    title: '操作',
    width: 100,
  },
];
</script>

<template>
  <div class="course-practice">
    <t-card title="知识点练习">
      <t-space direction="vertical" size="large" style="width: 100%">
        <t-form ref="form" :data="formData" @reset="onReset" @submit="onSubmit">
          <t-row :gutter="[16, 16]">
            <t-col :span="6">
              <t-form-item label="难度">
                <t-select v-model="formData.difficulty" clearable placeholder="选择难度">
                  <t-option v-for="item in difficulties" :key="item.value" :label="item.label" :value="item.value" />
                </t-select>
              </t-form-item>
            </t-col>
            <t-col :span="6">
              <t-form-item>
                <t-space>
                  <t-button theme="primary" type="submit">搜索</t-button>
                  <t-button theme="default" variant="base" type="reset">重置</t-button>
                </t-space>
              </t-form-item>
            </t-col>
          </t-row>
        </t-form>

        <t-table
          :data="paginatedQuestions"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          @page-change="onPageChange"
          @row-click="handleQuestionClick"
          hover
          stripe
        >
          <template #status="{ row }">
            <t-tag :theme="getStatusTheme(row.status)" :variant="getStatusVariant(row.status)">
              {{ getStatusLabel(row.status) }}
            </t-tag>
          </template>
          <template #op="{ row }">
            <t-space>
              <t-button
                theme="primary"
                variant="text"
                @click.stop="handleQuestionClick({ row })"
              >
                查看
              </t-button>
            </t-space>
          </template>
        </t-table>
      </t-space>
    </t-card>
  </div>
</template>

<style scoped>
.course-practice {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
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