<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const tableData = ref([]);
const loading = ref(false);

const filterValue = ref({
  status: 'all',
  difficulty: 'all'
});

const columns = [
  { colKey: 'id', title: '题目编号', width: 100 },
  { colKey: 'title', title: '题目', width: 200 },
  { colKey: 'difficulty', title: '难度', width: 100 },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'submitTime', title: '提交时间', width: 160 }
];

const handleRowClick = (row: any) => {
  router.push(`/profile/answer/${row.row.id}`);
};

onMounted(async () => {
  loading.value = true;
  try {
    // TODO: 调用API获取历史记录
    tableData.value = [
      {
        id: 1,
        title: '两数之和',
        difficulty: '简单',
        status: '已通过',
        submitTime: '2024-03-10 10:30:00'
      }
      // ... 更多数据
    ];
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
        <t-tag :theme="row.status === '已通过' ? 'success' : 'danger'">
          {{ row.status }}
        </t-tag>
      </template>
      
      <template #difficulty="{ row }">
        <t-tag :theme="
          row.difficulty === '简单' ? 'success' :
          row.difficulty === '中等' ? 'warning' : 'danger'
        ">
          {{ row.difficulty }}
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