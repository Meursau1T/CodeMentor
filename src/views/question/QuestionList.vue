<script setup lang="ts">
import { ref } from 'vue';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

// Mock data
const difficulties = [
  { label: '全部', value: 'ALL' },
  { label: '简单', value: 'EASY', color: '#10B981' },
  { label: '中等', value: 'MEDIUM', color: '#F59E0B' },
  { label: '困难', value: 'HARD', color: '#EF4444' }
];

const topics = [
  { label: '数组', value: 'array' },
  { label: '字符串', value: 'string' },
  { label: '链表', value: 'linked-list' },
  { label: '二叉树', value: 'binary-tree' },
  { label: '动态规划', value: 'dp' },
  { label: '回溯算法', value: 'backtracking' }
];

// Updated mock data with tags and consistent difficulty values
const mockQuestions = [
  {
    id: 1,
    leetcode_id: 1,
    title: "两数之和",
    title_slug: "two-sum",
    difficulty: "EASY",
    topics: ["array", "hash-table"],
    status: "SOLVED",
    pass_rate: "46.5%"
  },
  {
    id: 2,
    leetcode_id: 2,
    title: "最长回文子串",
    title_slug: "longest-palindromic-substring",
    difficulty: "MEDIUM",
    topics: ["string", "dp"],
    status: "ATTEMPTED",
    pass_rate: "35.8%"
  },
  {
    id: 3,
    leetcode_id: 3,
    title: "N皇后",
    title_slug: "n-queens",
    difficulty: "HARD",
    topics: ["backtracking"],
    status: "NOT_STARTED",
    pass_rate: "25.2%"
  }
];

// Reactive states
const selectedDifficulties = ref([]);
const selectedTopics = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');

// Computed properties
const filteredQuestions = computed(() => {
  let result = [...mockQuestions];
  
  if (selectedDifficulties.value.length) {
    result = result.filter(q => selectedDifficulties.value.includes(q.difficulty));
  }
  
  if (selectedTopics.value.length) {
    result = result.filter(q => 
      q.topics.some(topic => selectedTopics.value.includes(topic))
    );
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(q => 
      q.title.toLowerCase().includes(query) || 
      q.title_slug.toLowerCase().includes(query)
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
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'SOLVED':
      return 'check-circle-filled';
    case 'ATTEMPTED':
      return 'error-circle-filled';
    default:
      return 'minus-circle';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'SOLVED':
      return '#10B981';
    case 'ATTEMPTED':
      return '#F59E0B';
    default:
      return '#9CA3AF';
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

const handlePageChange = (page: number) => {
  currentPage.value = page;
};

const handleFilterChange = () => {
  currentPage.value = 1;
};

const router = useRouter();

const handleQuestionClick = (data: { row: { id: string}}) => {
  if (data.row.id) {
    router.push(`/question/coding/${data.row.id}`);
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
    colKey: 'topics',
    title: '标签',
    width: 200,
    cell: (h: any, { row }: { row: any }) => getTopicLabels(row.topics),
  },
  {
    colKey: 'status',
    title: '状态',
    width: 100,
    cell: (h: any, { row }: { row: any }) => {
      return h('t-icon', {
        props: {
          name: getStatusIcon(row.status)
        },
        style: { color: getStatusColor(row.status) }
      });
    },
  },
  {
    colKey: 'pass_rate',
    title: '通过率',
    width: 100,
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
          <t-select
            v-model="selectedTopics"
            multiple
            placeholder="选择标签"
            :options="topics"
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
      :pagination="{
        current: currentPage,
        pageSize: pageSize,
        total: filteredQuestions.length,
        onChange: handlePageChange
      }"
      hover
    />
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
</style>


