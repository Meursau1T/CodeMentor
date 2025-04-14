<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import * as echarts from 'echarts'
import { studentData, ClassStats, Student } from '../../mock/mockData'; 
// import { MessagePlugin } from 'tdesign-vue'

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

// 添加新的响应式变量
const tagDialogVisible = ref(false)
const currentKnowledgePointId = ref(0)
const allTags = ref<Array<{ ID: number; name: string; name_cn: string }>>([])
const aiRecommendTags = ref<Array<{ ID: number; name: string; name_cn: string }>>([])
const selectedTagIds = ref<number[]>([])
const tagLoading = ref(false)

// 添加新的响应式变量
const classStatsDialogVisible = ref(false)
const classBarChartContainer = ref<HTMLElement | null>(null)
const classProgressChartContainer = ref<HTMLElement | null>(null)
let classBarChart: echarts.ECharts | null = null
let classProgressChart: echarts.ECharts | null = null

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
          { value: difficultyCount.Easy, name: 'Easy', itemStyle: { color: '#5470c6' } },
          { value: difficultyCount.Medium, name: 'Medium', itemStyle: { color: '#91cc75' } },
          { value: difficultyCount.Hard, name: 'Hard', itemStyle: { color: '#fac858' } }
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
  if (classBarChart) {
    classBarChart.resize()
  }
  if (classProgressChart) {
    classProgressChart.resize()
  }
}

// 获取所有标签
const fetchAllTags = async () => {
  try {
    const response = await fetch('http://47.119.38.174:8080/api/problems/tags/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`
      }
    })
    const data = await response.json()
    if (data.result) {
      allTags.value = data.data
    }
  } catch (error) {
    console.error('获取标签列表失败:', error)
  }
}

// 获取AI推荐标签
const fetchAIRecommendTags = async (knowledgePointId: number) => {
  try {
    const response = await fetch(
      `http://47.119.38.174:8080/api/courses/${courseId.value}/knowledge_points/${knowledgePointId}/ai/suggest_tags/`, 
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Cookies.get('authToken')}`
        }
      }
    )
    const data = await response.json()
    if (data.result) {
      aiRecommendTags.value = data.data.tags
    }
  } catch (error) {
    console.error('获取AI推荐标签失败:', error)
  }
}

// 处理标签点击
const handleTagClick = (tagId: number) => {
  const index = selectedTagIds.value.indexOf(tagId)
  if (index === -1) {
    selectedTagIds.value.push(tagId)
  } else {
    selectedTagIds.value.splice(index, 1)
  }
}

// 处理关联知识点按钮点击
const handleAssociateTags = (knowledgePointId: number) => {
  currentKnowledgePointId.value = knowledgePointId
  tagDialogVisible.value = true
  selectedTagIds.value = []
  fetchAllTags()
  fetchAIRecommendTags(knowledgePointId)
}

// 提交关联标签
const handleSubmitTags = async () => {
  tagLoading.value = true
  try {
    const response = await fetch(
      `http://47.119.38.174:8080/api/courses/${courseId.value}/knowledge_points/${currentKnowledgePointId.value}/tags/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Cookies.get('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tag_ids: selectedTagIds.value
        })
      }
    )
    const data = await response.json()
    if (data.result) {
      alert(`成功添加${data.data.added_tags}个标签，当前共${data.data.total_tags}个标签`)
      tagDialogVisible.value = false
    }
  } catch (error) {
    console.error('提交标签失败:', error)
    alert('提交标签失败')
  } finally {
    tagLoading.value = false
  }
}

// 获取班级统计数据
const fetchClassStats = async () => {
  try {
    const response = await fetch(`http://47.119.38.174:8080/api/courses/${courseId.value}/stats/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`
      }
    })
    const data = await response.json()
    if (data.result) {
      drawClassStats(data.data)
    }
  } catch (error) {
    console.error('获取班级统计数据失败:', error)
  }
}

// 绘制班级统计图表
const drawClassStats = (statsData: any[]) => {
  // 准备数据
  const classNames = statsData.map(item => item.class_name)
  const correctRates = statsData.map(item => Number(item.avg_correct_rate.toFixed(2)))
  const progressRates = statsData.map(item => Number((item.avg_progress * 100).toFixed(2)))

  // 绘制正确率柱状图
  if (classBarChart) {
    classBarChart.dispose()
  }
  classBarChart = echarts.init(classBarChartContainer.value!)
  classBarChart.setOption({
    title: {
      text: '各班级平均正确率',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 16,
        fontWeight: 500
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}<br/>{a}: {c}%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: classNames,
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '正确率',
      nameTextStyle: {
        padding: [0, 0, 0, 40]
      },
      axisLabel: {
        formatter: '{value}%'
      },
      max: 100
    },
    series: [
      {
        name: '正确率',
        type: 'bar',
        data: correctRates,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#2378f7' },
              { offset: 0.7, color: '#2378f7' },
              { offset: 1, color: '#83bff6' }
            ])
          }
        },
        barWidth: '40%',
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%'
        }
      }
    ]
  })

  // 绘制进度条形图
  if (classProgressChart) {
    classProgressChart.dispose()
  }
  classProgressChart = echarts.init(classProgressChartContainer.value!)
  classProgressChart.setOption({
    title: {
      text: '各班级平均学习进度',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 16,
        fontWeight: 500
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}<br/>{a}: {c}%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: classNames,
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '进度',
      nameTextStyle: {
        padding: [0, 0, 0, 40]
      },
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '学习进度',
        type: 'bar',
        data: progressRates,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#91cc75' },
            { offset: 0.5, color: '#67c23a' },
            { offset: 1, color: '#67c23a' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#67c23a' },
              { offset: 0.7, color: '#67c23a' },
              { offset: 1, color: '#91cc75' }
            ])
          }
        },
        barWidth: '40%',
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%'
        }
      }
    ]
  })
}

// 处理班级统计弹窗显示
const handleShowClassStats = () => {
  classStatsDialogVisible.value = true
  // 等待DOM更新后初始化图表
  setTimeout(() => {
    fetchClassStats()
  }, 100)
}

// 处理班级统计弹窗关闭
const handleCloseClassStats = () => {
  classStatsDialogVisible.value = false
  if (classBarChart) {
    classBarChart.dispose()
    classBarChart = null
  }
  if (classProgressChart) {
    classProgressChart.dispose()
    classProgressChart = null
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
  handleCloseClassStats()
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
              { colKey: 'name', title: '章节名称', width: 100 },
           
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
              <t-space>
              <t-button
                  variant="text"
                  theme="primary"
                  @click="handleAssociateTags(row.kpId)"
                >
                  关联知识点
                </t-button>
                <t-button
                  variant="text"
                  theme="primary"
                  @click="handleEditQuestions(row.kpId)"
                >
                   编辑题目
                </t-button>
                
              </t-space>
            </template>
          </t-table>
        </t-loading>
      </t-card>
      <t-card class="class-card" :bordered="true">
        <template #title>
              <span class="card-title">班级管理</span>
        </template>
        <template #actions>
          <t-space>
          <t-button theme="default"  @click="handleShowClassStats">
                统计信息
          </t-button>
          </t-space>
        </template>
         
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

      <t-dialog
        v-model:visible="tagDialogVisible"
        
        :width="700"
        :footer="true"
        :confirm-btn="{ loading: tagLoading, content: '确认关联' }"
        :on-confirm="handleSubmitTags"
        @close="tagDialogVisible = false"
      >
        <t-space direction="vertical" size="large" style="width: 100%">
          <!-- 可选标签部分 -->
          <div class="tag-section">
            <h3 class="section-title">关联知识点标签</h3>
            <div class="tag-container">
              <t-tag
                v-for="tag in allTags"
                :key="tag.ID"
                :theme="selectedTagIds.includes(tag.ID) ? 'primary' : 'default'"
                :variant="selectedTagIds.includes(tag.ID) ? 'light' : 'outline'"
                style="margin: 4px; cursor: pointer"
                @click="handleTagClick(tag.ID)"
              >
                {{ tag.name_cn || tag.name }}
              </t-tag>
            </div>
          </div>

          <!-- AI推荐标签部分 -->
          <div class="tag-section">
            <h3 class="section-title">AI推荐标签</h3>
            <div class="tag-container">
              <t-tag
                v-for="tag in aiRecommendTags"
                :key="tag.ID"
                theme="warning"
                variant="light"
                style="margin: 4px"
              >
                {{ tag.name_cn || tag.name }}
              </t-tag>
            </div>
          </div>
        </t-space>
      </t-dialog>

      <t-dialog
        v-model:visible="classStatsDialogVisible"
        header="班级统计信息"
        :width="900"
        :footer="false"
        @close="handleCloseClassStats"
      >
        <div class="stats-container">
          <div ref="classBarChartContainer" class="chart"></div>
          <div ref="classProgressChartContainer" class="chart"></div>
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
  height: 350px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tag-section {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.t-tag) {
  transition: all 0.3s;
}

:deep(.t-tag:hover) {
  opacity: 0.8;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
}
</style> 