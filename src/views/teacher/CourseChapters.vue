<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import * as echarts from 'echarts'

const route = useRoute()
const router = useRouter()
const courseId = ref(Number(route.params.id))

interface Chapter {
  id: number
  kpId: number
  name: string
  questionCount: number
}

interface Course {
  id: number
  name: string
  chapters: Chapter[]
}

const course = ref<Course>({
  id: 0,
  name: '',
  chapters: []
})

const loading = ref(true)

// 添加新的响应式数据
const dialogVisible = ref(false)
const classes = ref<{ id: number; name: string }[]>([])
const selectedClassIds = ref<number[]>([])
const submitting = ref(false)
const activeClassId = ref<number>(0)
const classList = ref<{ id: number; name: string }[]>([])
const students = ref<{ id: number; name: string; student_id: string }[]>([])
const classLoading = ref(false)
const statsDialogVisible = ref(false)
const chartContainer = ref<HTMLElement | null>(null)
const pieChartContainer = ref<HTMLElement | null>(null)
let barChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

// Mock数据，后续替换为实际API调用
const fetchCourseDetail = async () => {
  loading.value = true
  try {
    const response = await fetch(`http://47.119.38.174:8080/api/courses/${courseId.value}/knowledge_points/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`
      }
    })
    const responseData = await response.json()
    
    // 从响应中提取实际数据数组
    const chaptersData = responseData.data

    course.value = {
      id: courseId.value,
      name: course.value.name,
      chapters: chaptersData.map((item: { id: number, name: string }, index: number) => ({
        id: index + 1,
        kpId: index + 1,
        name: item.name,
        questionCount: 0
      }))
    }
  } catch (error) {
    console.error('获取课程详情失败:', error)
  } finally {
    loading.value = false
  }
}

const handleEditQuestions = (chapterKpId: number) => {
  router.push(`/question-selection/${courseId.value}/${chapterKpId}`)
}

// 添加获取班级列表方法
const fetchClasses = async () => {
  try {
    const response = await fetch('http://47.119.38.174:8080/api/classes/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`
      }
    })
    const responseData = await response.json()
    classes.value = responseData.data.class_names.map((name: string, index: number) => ({
      id: index + 1,
      name: name
    }))
  } catch (error) {
    console.error('获取班级列表失败:', error)
  }
}

// 添加提交方法
const handleSubmit = async () => {
  submitting.value = true
  try {
    const response = await fetch(`http://47.119.38.174:8080/api/courses/${courseId.value}/classes/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        class_ids: selectedClassIds.value
      })
    })
    const result = await response.json()
    if (result.result) {
      alert(`成功添加${result.data.added_count}个班级，当前共${result.data.total_count}个班级`)
      dialogVisible.value = false
      selectedClassIds.value = [] // 清空已选班级
    } else {
      alert('添加班级失败')
    }
  } catch (error) {
    console.error('提交失败:', error)
    alert('请求异常，请稍后重试')
  } finally {
    submitting.value = false
  }
}
// 添加获取课程班级列表方法
const fetchCourseClasses = async () => {
  try {
    const response = await fetch(`http://47.119.38.174:8080/api/courses/${courseId.value}/classes/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`
      }
    })
    const responseData = await response.json()
    classList.value = responseData.data
    console.log(classList.value)
    if (classList.value.length > 0) {
      activeClassId.value = classList.value[0].id
      console.log(activeClassId.value)
      fetchClassStudents(classList.value[0].id)
    }
  } catch (error) {
    console.error('获取课程班级失败:', error)
  }
}

// 添加获取班级学生方法
const fetchClassStudents = async (classId: number) => {
  classLoading.value = true
  try {
    const response = await fetch(`http://47.119.38.174:8080/api/courses/${courseId.value}/classes/${classId}/users/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`
      }
    })
    const responseData = await response.json()
    if (responseData.result) {
      students.value = responseData.data.map((user: any) => ({
        
        name: user.name,
        studentId: user.student_id,
        user_id:user.user_id,
        correct_rate: `${Number(user.correct_rate).toFixed(0)}%`,
        progress: `${Number(user.progress).toFixed(2)}%`,
        solved_count:user.solved_count,
        wrong_count:user.wrong_count
      }))
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
  } finally {
    classLoading.value = false
  }
}

// 添加tab切换处理
const handleTabChange = (value: number) => {
  activeClassId.value = value
  fetchClassStudents(value) // 确保切换时调用获取学生方法
}

const handleStudentClick = (row: any) => {
  router.push(`/course-chapters/${courseId.value}/student-answers/${row.row.user_id}`)
}

// 添加获取统计数据的方法
const fetchCourseStats = async () => {
  try {
    const response = await fetch(`http://47.119.38.174:8080/api/courses/${courseId.value}/problems/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })
    const data = await response.json()
    
    if (data.result) {
      // 计算难度分布
      const difficultyCount = {
        Easy: 0,
        Medium: 0,
        Hard: 0
      }
      
      data.data.forEach((problem: any) => {
        difficultyCount[problem.difficulty]++
      })
      
      // 绘制图表
      drawCharts(data.data.length, difficultyCount)
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 绘制图表的方法
const drawCharts = (totalProblems: number, difficultyCount: any) => {
  // 绘制条形图
  if (barChart) {
    barChart.dispose()
  }
  barChart = echarts.init(chartContainer.value!)
  barChart.setOption({
    title: {
      text: '课程题目统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['题目总数']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '题目数量',
        type: 'bar',
        data: [totalProblems],
        itemStyle: {
          color: '#0052D9'
        }
      }
    ]
  })

  // 绘制饼图
  if (pieChart) {
    pieChart.dispose()
  }
  pieChart = echarts.init(pieChartContainer.value!)
  pieChart.setOption({
    title: {
      text: '难度分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '难度分布',
        type: 'pie',
        radius: '50%',
        data: [
          { value: difficultyCount.Easy, name: '简单', itemStyle: { color: '#10B981' } },
          { value: difficultyCount.Medium, name: '中等', itemStyle: { color: '#F59E0B' } },
          { value: difficultyCount.Hard, name: '困难', itemStyle: { color: '#EF4444' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  })
}

// 处理弹窗显示
const handleShowStats = () => {
  statsDialogVisible.value = true
  // 等待DOM更新后初始化图表
  setTimeout(() => {
    fetchCourseStats()
  }, 100)
}

// 处理弹窗关闭
const handleCloseStats = () => {
  statsDialogVisible.value = false
  if (barChart) {
    barChart.dispose()
    barChart = null
  }
  if (pieChart) {
    pieChart.dispose()
    pieChart = null
  }
}

// 监听窗口大小变化
const handleResize = () => {
  if (barChart) {
    barChart.resize()
  }
  if (pieChart) {
    pieChart.resize()
  }
}

onMounted(() => {
  fetchCourseDetail()
  fetchCourseClasses()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  handleCloseStats()
})
</script>

<template>
  <t-layout>
    <t-content class="content-inner">
      <t-card :bordered="true" >
        <template #title>
          <t-space>
            <t-button
              variant="text"
              theme="default"
              @click="router.back()"
            >
              <template #icon>
                <t-icon name="chevron-left" />
              </template>
              返回
            </t-button>
            <t-divider layout="vertical" />
            <span class="course-title">知识点目录</span>
          </t-space>
        </template>

        <template #actions>
          <t-space>
            <t-button theme="default" @click="handleShowStats">统计信息</t-button>
            <t-button theme="primary" @click="() => { dialogVisible = true; fetchClasses() }">添加班级</t-button>
          </t-space>
        </template>

        <t-loading :loading="loading">
          <t-table
            :data="course.chapters"
            :columns="[
              { colKey: 'id', title: '章节序号', width: 100 },
              { colKey: 'name', title: '章节名称' },
            //   { colKey: 'questionCount', title: '关联题目数', width: 120 },
              { colKey: 'operation', title: '操作', width: 120 }
            ]"
            row-key="id"
            hover
          >
            <template #id="{ row }">
              第 {{ row.id }} 章
            </template>
            <!-- <template #questionCount="{ row }">
              {{ row.questionCount }} 道题目
            </template> -->
            <template #operation="{ row }">
              <t-button
                variant="text"
                theme="primary"
                @click="handleEditQuestions(row.kpId)"
              >
                编辑题目
              </t-button>
            </template>
          </t-table>
        </t-loading>
      </t-card>
      <t-card class="class-card" title="班级管理" :bordered="true">
        <t-tabs v-model="activeClassId" @change="handleTabChange">
            <t-tab-panel 
                v-for="cls in classList" 
                :key="cls.id" 
                :value="cls.id" 
                :label="cls.name"
            >
                <t-loading :loading="classLoading">
                    <t-table
                        :data="students"
                        :columns="[
                            { colKey: 'studentId', title: '学号' },
                            { colKey: 'name', title: '姓名' },
                            { colKey: 'progress', title: '学习进度' },
                            { colKey: 'solved_count', title: '作答数量' },
                            { colKey: 'wrong_count', title: '错题数量' },
                            { colKey: 'correct_rate', title: '准确率' }
                        ]"
                        row-key="id"
                        hover
                        @row-click="handleStudentClick"
                    >
                        <template #id="{ row }">{{ row.id }}</template>
                        <template #name="{ row }">{{ row.name }}</template>
                        <template #studentId="{ row }">{{ row.studentId }}</template>
                    </t-table>
                </t-loading>
            </t-tab-panel>
        </t-tabs>
    </t-card>

      <t-dialog
        header="添加班级"
        :visible="dialogVisible"
        :on-confirm="handleSubmit"
        @close="() => dialogVisible = false"
        :confirm-btn="{
          loading: submitting,
          content: '确认添加'
        }"
      >
        <t-checkbox-group v-model="selectedClassIds">
          <t-checkbox
            v-for="cls in classes"
            :key="cls.id"
            :value="cls.id"
          >
            {{ cls.name }}
          </t-checkbox>
        </t-checkbox-group>
      </t-dialog>

      <t-dialog
        v-model:visible="statsDialogVisible"
        header="课程统计信息"
        :width="800"
        :footer="false"
        @close="handleCloseStats"
      >
        <div class="stats-container">
          <div ref="chartContainer" class="chart"></div>
          <div ref="pieChartContainer" class="chart"></div>
        </div>
      </t-dialog>
    </t-content>
  </t-layout>
</template>

<style scoped>
.content-inner {
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.course-title {
  font-size: 16px;
  font-weight: 600;
}

.class-card {
  margin-top: 20px;
}

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px;
}

.chart {
  width: 100%;
  height: 300px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style> 