<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import Cookies from 'js-cookie'
import { MessagePlugin } from 'tdesign-vue-next'

const route = useRoute()
const chapterId = ref(Number(route.params.chapterId))

// 获取课程ID和章节ID
const courseId = ref(Number(route.params.courseId))
const chapterKpId = ref(Number(route.params.chapterKpId))

interface Problem {
  id: number
  leetcode_id: number
  title: string
  difficulty: string,
  tag_id:number,
  tag_name:string
}

const problems = ref<Problem[]>([])
const selectedProblemIds = ref<number[]>([])
const loading = ref(true)

// 添加分页相关状态
const currentPage = ref(1)
const pageSize = ref(20)

// 计算分页后的数据
const paginatedProblems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return problems.value.slice(start, end)
})

// 计算总数（根据实际数据长度）
const total = computed(() => problems.value.length)

// 添加筛选相关状态
const selectedDifficulty = ref('')
const selectedTagId = ref<number | null>(null)
const tags = ref<{ value: number; label: string }[]>([])

const difficulties = [
  { label: '简单', value: 'Easy', color: '#10B981' },
  { label: '中等', value: 'Medium', color: '#F59E0B' },
  { label: '困难', value: 'Hard', color: '#EF4444' }
]


// 新增详情相关状态
const detailVisible = ref(false)
const detailLoading = ref(false)
const problemDetail = ref<{
  content: string
  difficulty: string
  tags: Array<{ name: string }>
  sample_cases: string
}>({
  content: '',
  difficulty: '',
  tags: [],
  sample_cases: ''
})

const getDifficultyLabel = (difficulty: string) => {
  return difficulties.find(d => d.value === difficulty)?.label || ''
}

const getDifficultyColor = (difficulty: string) => {
  return difficulties.find(d => d.value === difficulty)?.color || '#9CA3AF'
}

// 获取题库全部题目
const fetchProblems = async () => {
  try {
    currentPage.value = 1 // 重置到第一页
    const body: Record<string, any> = {}
    if (selectedDifficulty.value) body.difficulty = selectedDifficulty.value
    if (selectedTagId.value) body.tag_id = selectedTagId.value

    const response = await fetch(`http://47.119.38.174:8080/api/problems/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    problems.value = data.data.map(question => ({
      id: question.id,
      leetcode_id: question.leetcode_id,
      title: question.title_cn,
      difficulty: question.difficulty,
      tag_id: question.tag_id,
      tag_name: question.tag_name
    }))

    // 更新知识点选项
    const tagMap = new Map<number, { value: number; label: string }>()
    data.data.forEach((q: any) => {
      tagMap.set(q.tag_id, { value: q.tag_id, label: q.tag_name })
    })
    tags.value = Array.from(tagMap.values())

  } catch (error) {
    console.error('获取题目列表失败:', error)
    MessagePlugin.error('获取题目列表失败')
  } finally {
    loading.value = false
  }
}
// 新增获取题目详情方法
const fetchProblemDetail = async (id: number) => {
  try {
    detailLoading.value = true
    const response = await fetch(`http://47.119.38.174:8080/api/problems/${id}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`
      }
    })
    
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || '获取详情失败')
    
    problemDetail.value = {
      content: data.data.content,
      difficulty: data.data.difficulty,
      tags: data.data.tags,
      sample_cases: data.data.sample_cases
    }
    detailVisible.value = true
  } catch (error) {
    console.error('获取题目详情失败:', error)
    MessagePlugin.error(error.message || '获取题目详情失败')
  } finally {
    detailLoading.value = false
  }
}
// 提交选题
const handleSubmit = async () => {
  if (selectedProblemIds.value.length === 0) {
    MessagePlugin.warning('请至少选择一个题目')
    return
  }

  try {
    const response = await fetch(`http://47.119.38.174:8080/api/courses/${courseId.value}/knowledge_points/${chapterKpId.value}/problems/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        problem_ids: selectedProblemIds.value
      })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || '提交失败')
    
    MessagePlugin.success(`成功添加${data.data.added_count}个题目，当前共${data.data.total_count}题`)
    alert(`成功添加"${data.data.added_count}"个题目，当前共"${data.data.total_count}"题`)
  } catch (error) {
    console.error('提交选题失败:', error)
    alert(error.message || '选题保存失败')
    MessagePlugin.error(error.message || '选题保存失败')
  }
}

onMounted(() => {
  fetchProblems()
})
</script>

<template>
  <t-layout>
    <t-content class="content-inner">
      <t-card title="题库选题">
        <template #actions>
          <t-space>
            <t-button @click="$router.go(-1)">返回</t-button>
            <t-button theme="primary" @click="handleSubmit">确认选题</t-button>
          </t-space>
        </template>

        <!-- 添加筛选表单 -->
        <t-form layout="inline" class="filter-form">
          <t-form-item label="难度筛选">
            <t-select
              v-model="selectedDifficulty"
              placeholder="请选择难度"
              clearable
              @change="fetchProblems"
            >
              <t-option
                v-for="d in difficulties"
                :key="d.value"
                :value="d.value"
                :label="d.label"
              />
            </t-select>
          </t-form-item>
          <t-form-item label="知识点筛选">
            <t-select
              v-model="selectedTagId"
              placeholder="请选择知识点"
              clearable
              @change="fetchProblems"
            >
              <t-option
                v-for="tag in tags"
                :key="tag.value"
                :value="tag.value"
                :label="tag.label"
              />
            </t-select>
          </t-form-item>
          <t-form-item>
            <t-button variant="base" theme="default" @click="() => { selectedDifficulty = ''; selectedTagId = null; fetchProblems() }">重置筛选</t-button>
          </t-form-item>
        </t-form>

        <t-loading :loading="loading">
            <t-table
            row-key="id"
            :data="paginatedProblems"
            :columns="[
              { 
                colKey: 'row-select', 
                type: 'multiple', 
                width: 50,
                checkProps: ({ row }) => ({ checked: selectedProblemIds.includes(row.id) })
              },
              { 
                colKey: 'leetcode_id', 
                title: '题目ID', 
                width: 100,
                cell: (h, { row }) => h('a', {
                  style: { color: 'var(--td-brand-color)', cursor: 'pointer' },
                  onClick: () => fetchProblemDetail(row.id)
                }, row.leetcode_id)
              },
              { 
                colKey: 'title', 
                title: '题目标题',
                cell: (h, { row }) => h('a', {
                  style: { color: 'var(--td-brand-color)', cursor: 'pointer' },
                  onClick: () => fetchProblemDetail(row.id)
                }, row.title)
              },
              { 
                colKey: 'difficulty', 
                title: '难度',
                cell: (h, { row }) => h('span', {
                  style: { color: getDifficultyColor(row.difficulty) },
                  innerHTML: getDifficultyLabel(row.difficulty)
                })
              }
            ]"
            :selected-row-keys="selectedProblemIds"
            @select-change="(val: number[]) => selectedProblemIds = val"
            hover
          />
          <t-dialog
            v-model:visible="detailVisible"
            header="题目详情"
            width="800px"
            :footer="null"
          >
            <t-loading :loading="detailLoading">
              <div class="problem-detail-container">
                <div class="content-section" v-html="problemDetail.content"></div>
                <t-divider />
                <div class="meta-section">
                  <t-space direction="vertical">
                    <t-tag :color="getDifficultyColor(problemDetail.difficulty)">
                      {{ getDifficultyLabel(problemDetail.difficulty) }}
                    </t-tag>
                    <t-space>
                      <span style="margin-right: 8px;">相关标签：</span>
                      <t-tag v-for="tag in problemDetail.tags" :key="tag.ID">
                        {{ tag.name }}
                      </t-tag>
                    </t-space>
                    <div v-if="problemDetail.sample_cases">
                      <h4>示例用例：</h4>
                      <pre>{{ problemDetail.sample_cases }}</pre>
                    </div>
                  </t-space>
                </div>
              </div>
            </t-loading>
          </t-dialog>
          <t-pagination
            v-model:current="currentPage"
            v-model:pageSize="pageSize"
            :total="total"
            show-jumper
            :pageSizeOptions="[20, 50, 100]"
            style="margin-top: 20px;"
          />
        </t-loading>
      </t-card>
    </t-content>
  </t-layout>
</template>

<style scoped>
.problem-detail-container {
  max-height: 70vh;
  overflow-y: auto;
}

.content-section :deep(pre) {
  background: var(--td-bg-color-secondarycontainer);
  padding: 12px;
  border-radius: 4px;
}

.content-section :deep(code) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 14px;
}

.meta-section {
  margin-top: 16px;
  padding: 12px;
  background: var(--td-bg-color-secondarycontainer);
  border-radius: 4px;
}
</style> 