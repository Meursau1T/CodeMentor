<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Cookies from 'js-cookie';
import { useUserInfoStore } from '../../stores/userInfo'
const router = useRouter();
const tableData = ref([]);
const loading = ref(false);
const userStore = useUserInfoStore()
const filterValue = ref({
  status: 'all',
  difficulty: 'all'
});

const columns = [
  { colKey: 'problem_id', title: '题目编号', width: 300 },
  { colKey: 'title_cn', title: '题目', width: 400 },
  // { colKey: 'course_name', title: '相关课程', width: 150 },
  // { colKey: 'knowledge_point_name', title: '相关知识点', width: 150 },
  { colKey: 'status', title: '状态', width: 300 }
];

const handleRowClick = (row: any) => {
  console.log(row.row.id)
  router.push(`/profile/answer/${row.row.id}`);
};

onMounted(async () => {
  loading.value = true;
  const courseId = userStore.userInfo?.courseId
  try {
    const response = await fetch(`http://47.119.38.174:8080/api/records/`, {
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`
      }
    });
    const result = await response.json();
    
    tableData.value = result.data.map(item => ({
      id:item.id,
      problem_id: item.problem_id,
      title_cn: item.title_cn,
      // course_name: item.course_name,
      // knowledge_point_name: item.knowledge_point_name,
      status: item.status === 'TRIED' ? '已尝试' : item.status
    }));
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="answer-history">
    <div class="filter-section">
      <t-space>
        <t-select
          v-model="filterValue.status"
          placeholder="答题状态"
          :options="[
            { label: '全部', value: 'all' },
            { label: '已通过', value: 'passed' },
            { label: '未通过', value: 'failed' }
          ]"
        />
        <t-select
          v-model="filterValue.difficulty"
          placeholder="难度"
          :options="[
            { label: '全部', value: 'all' },
            { label: '简单', value: 'easy' },
            { label: '中等', value: 'medium' },
            { label: '困难', value: 'hard' }
          ]"
        />
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
        <t-tag :theme="row.status === 'TRIED' ? 'default' : 'danger'">
          {{ row.status === 'TRIED' ? '已尝试' : row.status }}
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

.filter-section {
  margin-bottom: 20px;
}
:deep(.question-table tbody tr) {
  cursor: pointer;
}
</style> 