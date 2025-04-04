<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { PlusIcon } from 'tdesign-icons-vue-next'
import Cookies from 'js-cookie'

const router = useRouter()
const route = useRoute()
const isCollapsed = ref(false)
const activeModule = ref('courses') // 'courses' | 'classes'

interface Course {
  id: number
  name: string
}

const courses = ref<Course[]>([])
const loading = ref(false)

// 获取课程列表
const fetchCourses = async () => {
  loading.value = true
  try {
    
    const response = await fetch('http://47.119.38.174:8080/api/courses/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('获取课程列表失败')
    }

    const { result, data } = await response.json()
    if (result) {
      // 将课程名称列表转换为所需的格式
      console.log('data', data)
      courses.value = data.course_names.map((name: string, index: number) => ({
        id: index + 1, // 临时使用索引作为ID
        name
      }))
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
  } finally {
    loading.value = false
  }
}
const classes = ref<string[]>([])

const fetchClasses = async () => {
  try {
    loading.value = true
    const response = await fetch('http://47.119.38.174:8080/api/classes/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`
      }
    })
    
    const data = await response.json()
    if (data.result) {
      classes.value = data.data.class_names // 直接获取班级名称数组
    }
  } catch (error) {
    console.error('获取班级列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleCreateCourse = () => {
  router.push('/create-course')
}

const handleCourseClick = (courseId: number) => {
  router.push(`/course/${courseId}/chapters`)
}

const handleCreateClass = () => {
  router.push('/create-class')
}

onMounted(() => {
  // 根据 URL 参数设置活动模块
  if (route.query.tab === 'classes') {
    activeModule.value = 'classes'
  }
  fetchCourses()
  fetchClasses()
})
</script>

<template>
  <t-layout>
    <!-- 侧边栏 -->
    <t-aside :width="isCollapsed ? '80px' : '200px'">
      <t-menu
        :value="activeModule"
        theme="light"
        :collapsed="isCollapsed"
      >
        <t-menu-item value="courses" @click="activeModule = 'courses'">
          <template #icon>
            <t-icon name="book" />
          </template>
          课程管理
        </t-menu-item>
        <t-menu-item value="classes" @click="activeModule = 'classes'">
          <template #icon>
            <t-icon name="usergroup" />
          </template>
          班级管理
        </t-menu-item>
      </t-menu>
      <div class="collapse-btn" @click="isCollapsed = !isCollapsed">
        <t-button variant="text" shape="square">
          <t-icon :name="isCollapsed ? 'chevron-right' : 'chevron-left'" />
        </t-button>
      </div>
    </t-aside>

    <!-- 主内容区 -->
    <t-layout class="right-layout">
      <t-content>
        <div v-if="activeModule === 'courses'" class="content-inner">
          <t-loading :loading="loading">
            <t-row :gutter="[24, 24]">
              <!-- 创建课程卡片 -->
              <t-col :span="8">
                <t-card
                  class="course-card create-card"
                  :bordered="true"
                  @click="handleCreateCourse"
                  hover
                >
                  <div class="create-card-content">
                    <div class="create-icon">
                      <plus-icon size="24px" />
                    </div>
                    <span class="create-text">添加新课程</span>
                  </div>
                </t-card>
              </t-col>

              <!-- 课程卡片列表 -->
              <t-col
                v-for="course in courses"
                :key="course.id"
                :span="8"
              >
                <t-card
                  class="course-card"
                  :bordered="true"
                  hover
                  @click="handleCourseClick(course.id)"
                >
                  <template #title>
                    <t-text
                      class="course-name"
                      ellipsis
                    >
                      {{ course.name }}
                    </t-text>
                  </template>
                  <template #footer>
                    <t-space align="center" style="width: 100%">
                      <t-button variant="text" theme="primary">
                        管理课程 >>
                      </t-button>
                    </t-space>
                  </template>
                </t-card>
              </t-col>
            </t-row>
          </t-loading>
        </div>

        <!-- 新增班级管理模块 -->
        <div v-if="activeModule === 'classes'" class="content-inner">
          <t-row :gutter="[24, 24]">
            <!-- 创建班级卡片 -->
            <t-col :span="8">
              <t-card
                class="course-card create-card"
                :bordered="true"
                @click="handleCreateClass"
                hover
              >
                <div class="create-card-content">
                  <div class="create-icon">
                    <plus-icon size="24px" />
                  </div>
                  <span class="create-text">创建新班级</span>
                </div>
              </t-card>
            </t-col>

            <!-- 修改后的班级卡片 -->
            <t-col 
              v-for="(className, index) in classes" 
              :key="`class-${index}`" 
              :span="8"
            >
              <t-card class="course-card" hover :title="className">
                
                  <div class="card-footer">
                    <t-button 
                      theme="primary" 
                      size="medium" 
                      variant="text"
                      @click="router.push(`/class/${className}/${index+1}/manage`)"
                    >
                      <template #icon><t-icon name="setting" /></template>
                      管理班级>>
                    </t-button>
                  
                </div>
              </t-card>
            </t-col>
          </t-row>
        </div>
      </t-content>
    </t-layout>
  </t-layout>
</template>

<style scoped>
.right-layout {
  margin-left: 30px;
  margin-right: 30px;
}

.content-inner {
  min-width: 900px;
  padding: 16px !important;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.course-grid {
  margin: 0 !important;
}

.course-card {
  width: 100%;
  min-width: 280px;
  height: 160px;
  margin-bottom: 12px;
  
  :deep(.t-card__body) {
    padding: 12px;
  }
}

.create-card {
  background: #F5FBFF;
}

.create-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 32px 0;
}

.create-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(0, 82, 217, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  animation: pulse 2s infinite;
  color: var(--td-brand-color);

  svg {
    width: 20px;
    height: 20px;
  }
}

.create-text {
  font-size: 14px;
  color: var(--td-text-color-secondary);
}

.course-name {
  font-size: 18px;
  font-weight: 600;
}

.collapse-btn {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  text-align: center;
  border-top: 1px solid var(--td-component-border);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 82, 217, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 82, 217, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 82, 217, 0);
  }
}

/* 新增卡片内部样式 */
.card-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-header {
  padding: 12px 0;
  font-size: 18px;
  font-weight: 600;
}

.card-footer {
  border-top: 1px solid var(--td-component-stroke);
  padding-top: 12px;
  margin-top: auto;
}

.manage-btn {
  padding: 4px 8px;
  font-size: 12px;
}

.t-row {
  margin-left: -6px !important;
  margin-right: -6px !important;
  
  .t-col {
    padding-left: 6px !important;
    padding-right: 6px !important;
    flex: 0 0 33.3333%;
    max-width: 33.3333%;
  }
}

h3 {
  font-size: 14px;
  margin: 0;
  color: var(--td-text-color-primary);
  line-height: 1.4;
}

@media (min-width: 1200px) {
  .course-card {
    height: 180px;
  }
}

@media (max-width: 992px) {
  .t-col {
    flex: 0 0 33.3333%;
    max-width: 33.3333%;
  }
}
</style> 