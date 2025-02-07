<template>
  <div class="question-bank">
    <!-- 筛选器区域 -->
    <div class="filter-area">
      <t-space>
        <t-select v-model="difficulty" class="filter-item" placeholder="难度" multiple>
          <t-option v-for="item in difficulties" :key="item.value" :value="item.value" :label="item.label" />
        </t-select>
        <t-select v-model="topic" class="filter-item" placeholder="知识点" multiple>
          <t-option v-for="item in topics" :key="item.value" :value="item.value" :label="item.label" />
        </t-select>
        <t-button theme="danger" variant="base" @click="clearFilters">清空筛选</t-button>
      </t-space>
    </div>

    <!-- 题目列表 -->
    <t-card class="question-list" :bordered="false" shadow>
      <t-table :data="filteredQuestionList" :columns="columns" />
    </t-card>
  </div>
</template>

<script setup lang="ts">
/** 题库页面 */
import { ref, computed } from 'vue'
import { h } from 'vue'
import { Button as TButton } from 'tdesign-vue-next'

const difficulty = ref<string[]>([])
const topic = ref<string[]>([])

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

// 添加计算属性来过滤题目列表
const filteredQuestionList = computed(() => {
  return questionList.filter(question => {
    const matchDifficulty = difficulty.value.length === 0 || difficulty.value.includes(question.difficulty)
    const matchTopic = topic.value.length === 0 || question.topics?.some(t => topic.value.includes(t))
    return matchDifficulty && matchTopic
  })
})

// 表格列配置
const columns = [
  {
    colKey: 'title',
    title: '题目',
    width: '60%',
  },
  {
    colKey: 'difficulty',
    title: '难度',
    cell: ({ row }: { row: { difficulty: 'easy' | 'medium' | 'hard' } }) => {
      // 添加调试日志
      console.log('row:', row)
      
      // 添加空值检查
      if (!row) {
        return '-'
      }
      
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
    cell: ({ row }: { row: { status: 'not_started' | 'in_progress' | 'completed' } }) => {
      // 添加空值检查
      if (!row) {
        return '-'
      }
      const statusMap = {
        not_started: '未开始',
        in_progress: '进行中',
        completed: '已完成'
      }
      return statusMap[row.status]
    }
  }
]

// 确保注册了组件
// const { t-table: TTable, t-card: TCard, t-space: TSpace, t-select: TSelect, t-option: TOption } = Table

const clearFilters = () => {
  difficulty.value = []
  topic.value = []
}
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
