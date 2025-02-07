<template>
  <div class="question-bank">
    <t-card class="question-list" :bordered="false" shadow>
      <t-table 
        :data="filteredData" 
        :columns="columns"
        :filter-value="filterValue"
        :filter-icon="filterIcon"
        @filter-change="onFilterChange"
      />
    </t-card>
  </div>
</template>

<script setup lang="ts">
/** 题库页面 */
import { ref, computed } from 'vue'
import { h } from 'vue'
import { FilterIcon } from 'tdesign-icons-vue-next'

// 难度选项
const difficulties = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
]

// 知识点选项
const topics = [
  { value: 'array', label: '数组' },
  { value: 'string', label: '字符串' },
  { value: 'function', label: '函数' },
]

// 题目列表数据
const questionList = [
  { title: '两数之和', difficulty: 'easy', status: 'not_started', topics: ['array'] },
  { title: '链表反转', difficulty: 'medium', status: 'in_progress', topics: ['function'] },
  { title: '最长回文子串', difficulty: 'hard', status: 'completed', topics: ['string'] },
]

// 筛选状态
const filterValue = ref<Record<string, string[]>>({
  difficulty: [],
  status: [],
  topics: [],
})

// 自定义筛选图标
const filterIcon = () => h(FilterIcon)

// 筛选变化处理
const onFilterChange = (filterInfo: Record<string, string[]>) => {
  filterValue.value = filterInfo
}

// 修改筛选后的数据计算属性
const filteredData = computed(() => {
  return questionList.filter(item => {
    // 检查难度筛选
    if (filterValue.value.difficulty?.length && !filterValue.value.difficulty.includes(item.difficulty)) {
      return false
    }
    // 检查状态筛选
    if (filterValue.value.status?.length && !filterValue.value.status.includes(item.status)) {
      return false
    }
    // 检查知识点筛选
    if (filterValue.value.topics?.length && !item.topics?.some(t => filterValue.value.topics.includes(t))) {
      return false
    }
    return true
  })
})

// 修改表格列配置，添加知识点列
const columns = [
  {
    colKey: 'title',
    title: '题目',
    width: '60%',
  },
  {
    colKey: 'difficulty',
    title: '难度',
    filter: {
      type: 'multiple',
      list: difficulties.map(item => ({ label: item.label, value: item.value })),
    },
    cell: ({ row }: { row: { difficulty: 'easy' | 'medium' | 'hard' } }) => {
      if (!row) return '-'
      const colorMap = {
        easy: '#2BA471',
        medium: '#E37318',
        hard: '#E34D59'
      }
      const textMap = {
        easy: '简单',
        medium: '中等',
        hard: '困难'
      }
      return h('span', { style: { color: colorMap[row.difficulty] } }, textMap[row.difficulty])
    }
  },
  {
    colKey: 'status',
    title: '状态',
    filter: {
      type: 'multiple',
      list: [
        { label: '未开始', value: 'not_started' },
        { label: '进行中', value: 'in_progress' },
        { label: '已完成', value: 'completed' },
      ],
    },
    cell: ({ row }: { row: { status: 'not_started' | 'in_progress' | 'completed' } }) => {
      if (!row) return '-'
      const statusMap = {
        not_started: '未开始',
        in_progress: '进行中',
        completed: '已完成'
      }
      return statusMap[row.status]
    }
  },
  {
    colKey: 'topics',
    title: '知识点',
    filter: {
      type: 'multiple',
      list: topics.map(item => ({ label: item.label, value: item.value })),
    },
    cell: ({ row }: { row: { topics: string[] } }) => {
      if (!row?.topics) return '-'
      return row.topics.map(t => topics.find(item => item.value === t)?.label).join('、')
    }
  }
]
</script>

<style scoped>
.question-bank {
  padding: 20px;
}

.filter-area {
  margin-bottom: 20px;
}

.filter-item {
  width: 200px;
}

.question-list {
  background: #fff;
}
</style>
