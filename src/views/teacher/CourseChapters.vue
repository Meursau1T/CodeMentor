<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Cookies from 'js-cookie'


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

onMounted(() => {
  fetchCourseDetail()
  fetchCourseClasses()
})
</script>

<template>
  <t-layout>
    <t-content class="content-inner">
      <t-card :bordered="true">
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
            <span class="course-title">{{ course.name }}</span>
          </t-space>
        </template>

        <template #actions>
          <t-button theme="primary" @click="() => { dialogVisible = true; fetchClasses() }">添加班级</t-button>
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
</style> 