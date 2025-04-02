<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Cookies from 'js-cookie';

const router = useRouter();
const route = useRoute();
const studentId = ref(route.params.studentId);
const tableData = ref([]);
const loading = ref(false);
const courseId = ref(route.params.courseId);

const filterValue = ref({
  status: 'all',
  difficulty: 'all'
});

const columns = [
  { colKey: 'problem_id', title: '题目编号', width: 300 },
  { colKey: 'title_cn', title: '题目', width: 400 },
  { colKey: 'status', title: '状态', width: 300 }
];

const handleRowClick = (row: any) => {
  router.push(`/course-chapters/${courseId.value}/student-answer-detail/${studentId.value}/${row.row.id}`);
};

const getStatusTheme = (status: string) => {
  switch (status) {
    case 'TRIED':
      return 'warning'
    case 'SOLVED':
      return 'success'
    default:
      return 'danger'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'TRIED':
      return '已尝试'
    case 'SOLVED':
      return '已解决'
    default:
      return status
  }
}

onMounted(async () => {
  loading.value = true;
  try {
    const response = await fetch(`http://47.119.38.174:8080/api/courses/${courseId.value}/records/?user_id=${studentId.value}`, {
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`
      }
    });
    const result = await response.json();
    
    tableData.value = result.data.map(item => ({
      id: item.id,
      problem_id: item.problem_id,
      title_cn: item.title_cn,
      status: item.status === 'TRIED' ? '已尝试' : item.status
    }));
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="answer-history">
    <div class="header">
      <t-button theme="default" variant="text" @click="router.back()">
        <template #icon><t-icon name="chevron-left" /></template>
        返回班级列表
      </t-button>
    </div>

    <div class="filter-section">
      <t-space>
        <!-- <t-select
          v-model="filterValue.status"
          placeholder="答题状态"
          :options="[
            { label: '全部', value: 'all' },
            { label: '已通过', value: 'passed' },
            { label: '未通过', value: 'failed' }
          ]"
        ></t-select>
        <t-select
          v-model="filterValue.difficulty"
          placeholder="难度"
          :options="[
            { label: '全部', value: 'all' },
            { label: '简单', value: 'easy' },
            { label: '中等', value: 'medium' },
            { label: '困难', value: 'hard' }
          ]"
        ></t-select> -->
      </t-space>
    </div>

    <t-table
      class="question-table"
      :data="tableData"
      :columns="columns"
      :loading="loading"
      hover
      @row-click="handleRowClick"
    >
      <template #status="{ row }">
        <t-tag :theme="getStatusTheme(row.status)">
          {{ getStatusText(row.status) }}
        </t-tag>
      </template>
    </t-table>
  </div>
</template>

<style scoped>
.answer-history {
  padding: 20px;
  background-color: white;
  border-radius: 8px;
}

.header {
  margin-bottom: 20px;
}

.filter-section {
  margin-bottom: 20px;
}

:deep(.question-table tbody tr) {
  cursor: pointer;
}
</style> 