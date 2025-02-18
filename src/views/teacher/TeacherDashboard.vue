<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserInfoStore } from '../../stores/userInfo'

const currentCourse = ref('程序设计')
const currentClass = ref('01班')

const courses = ['程序设计', '数据结构', '面向对象']
const classes = ['01班', '02班', '03班', '04班']

// Mock数据生成函数
const generateMockStudents = (classId: string) => {
  const students = []
  for (let i = 1; i <= 30; i++) {
    const totalQuestions = Math.floor(Math.random() * 50) + 20
    const wrongQuestions = Math.floor(Math.random() * (totalQuestions / 2))
    const correctRate = ((totalQuestions - wrongQuestions) / totalQuestions * 100).toFixed(1)
    const progress = Math.floor(Math.random() * 100)
    
    students.push({
      id: `2023${classId}${i.toString().padStart(2, '0')}`,
      name: `学生${i}`,
      totalQuestions,
      wrongQuestions,
      correctRate: `${correctRate}%`,
      progress: `${progress}%`
    })
  }
  return students
}

const students = ref(generateMockStudents('01'))

const handleClassChange = (classId: string) => {
  currentClass.value = classId
  students.value = generateMockStudents(classId.replace('班', ''))
}

const handleCourseChange = (course: string) => {
  currentCourse.value = course
  students.value = generateMockStudents(currentClass.value.replace('班', ''))
}

const userStore = useUserInfoStore()
const isAdmin = computed(() => userStore.userInfo?.role === 'admin')

const menuItems = computed(() => {
  if (isAdmin.value) {
    return [
      { path: '/teacher-dashboard', label: '教师管理' }
    ]
  }
  return [
    { path: '/', label: '首页' },
    { path: '/exercises', label: '题库' },
    { path: '/ai-tutor', label: 'AI导师' }
  ]
})
</script>

<template>
  <div class="dashboard-container">
    <div class="sidebar">
      <h2>课程列表</h2>
      <div
        v-for="course in courses"
        :key="course"
        :class="['course-item', { active: course === currentCourse }]"
        @click="handleCourseChange(course)"
      >
        {{ course }}
      </div>
    </div>
    
    <div class="main-content">
      <h1>{{ currentCourse }}</h1>
      
      <div class="class-tabs">
        <div
          v-for="classId in classes"
          :key="classId"
          :class="['tab-item', { active: classId === currentClass }]"
          @click="handleClassChange(classId)"
        >
          {{ classId }}
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>学号</th>
              <th>姓名</th>
              <th>答题数量</th>
              <th>错题数量</th>
              <th>正确率</th>
              <th>学习进度</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in students" :key="student.id">
              <td>{{ student.id }}</td>
              <td>{{ student.name }}</td>
              <td>{{ student.totalQuestions }}</td>
              <td>{{ student.wrongQuestions }}</td>
              <td>{{ student.correctRate }}</td>
              <td>{{ student.progress }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  display: flex;
  height: calc(100vh - 64px);
}

.sidebar {
  width: 200px;
  background-color: #f5f5f5;
  padding: 20px;
  border-right: 1px solid #e0e0e0;
}

.course-item {
  padding: 12px;
  margin: 8px 0;
  cursor: pointer;
  border-radius: 4px;
}

.course-item:hover {
  background-color: #e0e0e0;
}

.course-item.active {
  background-color: #0052d9;
  color: white;
}

.main-content {
  flex: 1;
  padding: 20px;
}

.class-tabs {
  display: flex;
  margin: 20px 0;
  border-bottom: 1px solid #e0e0e0;
}

.tab-item {
  padding: 8px 16px;
  cursor: pointer;
  margin-right: 8px;
  border-radius: 4px 4px 0 0;
}

.tab-item:hover {
  background-color: #f5f5f5;
}

.tab-item.active {
  background-color: #0052d9;
  color: white;
}

.table-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

th {
  background-color: #f5f5f5;
  font-weight: bold;
}

tr:hover {
  background-color: #f9f9f9;
}
</style> 