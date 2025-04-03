<script setup lang="ts">
import { ref, computed ,onMounted} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from 'tdesign-vue-next'
import * as XLSX from "xlsx"; // 正确写法
import Cookies from 'js-cookie'

const route = useRoute()
const router = useRouter()
const classId = ref(route.params.index)
const className = ref(route.params.className) // 实际应从接口获取
const fileData = ref<any[]>([])
const isUploading = ref(false)

// 添加新的响应式数据
const updateDialogVisible = ref(false)
const currentStudent = ref<any>(null)
const courses = ref<string[]>([])
const updateForm = ref({
  username: '',
  password: '',
  name: '',
  student_id: '',
  role: 'student',
  class_id: 0
})

// 解析Excel文件
const handleFileUpload = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const data = new Uint8Array(e.target?.result as ArrayBuffer)
    const workbook = XLSX.read(data, { type: 'array' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    fileData.value = jsonData.slice(1).map((row: any) => ({
      student_id: row[0],
      name: row[1]
    }))
  }
  reader.readAsArrayBuffer(file)
}

// 创建学生账号
const createStudents = async () => {
  if (!fileData.value.length) {
    Message.error('请先上传学生名单')
    return
  }

  try {
    isUploading.value = true
    
    const promises = fileData.value.map(async student => {
      // 创建FormData对象
      const formData = new FormData()
      
      // 添加文本字段
      formData.append('username', student.name)
      formData.append('name', student.name)
      formData.append('student_id', String(student.student_id))
      formData.append('password', String(student.student_id))
      formData.append('class', className.value)

      // 添加空头像文件（根据后端接口需求）
      // 如果后端允许空值可省略以下三行
      const emptyFile = new File([], 'default-avatar.png', {
        type: 'image/png'
      })
      formData.append('avatar', emptyFile)

      try {
        const response = await fetch('http://47.119.38.174:8080/api/users/register/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Cookies.get('authToken')}`
          },
          body: formData
        })
        
        // 解析响应数据
        const data = await response.json()
        
        // 非2xx状态码视为错误
        if (!response.ok) {
          return {
            success: false,
            error: data.message || `HTTP错误 ${response.status}`,
            student
          }
        }
        return { success: true, data }
      } catch (error) {
        return { 
          success: false, 
          error: error.message || '请求失败',
          student
        }
      }
    })

    // 等待所有请求完成
    const results = await Promise.all(promises)
    
    // 统计结果
    const successCount = results.filter(r => r.success).length
    const failedItems = results.filter(r => !r.success)

    if (failedItems.length === 0) {
      alert(`成功创建 ${successCount} 个学生账号`)
      
      fileData.value = []
    } else {
      // 构造错误详情信息
      const errorMessages = failedItems
        .map((item, index) => 
          `${index + 1}. ${item.student.name} (${item.student.student_id}): ${item.error}`
        )
        .join('\n')
      alert(`成功创建 ${successCount} 个，失败 ${failedItems.length} 个`)
      Message.error({
        content: `成功创建 ${successCount} 个，失败 ${failedItems.length} 个`,
        duration: 8,
        closable: true
      })
      
      // 在控制台输出详细错误信息
      console.error('失败详情：\n', errorMessages)
    }
  } catch (error) {
    Message.error('发生未预期的错误: ' + error.message)
  } finally {
    isUploading.value = false
  }
}

const students = ref<{ id: number; name: string; student_id: string }[]>([])

// 获取课程列表
const fetchCourses = async () => {
  try {
    const response = await fetch('http://47.119.38.174:8080/api/courses/', {
      method:'GET',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`
      }
    })
    const data = await response.json()
    if (data.result) {
      courses.value = data.data.course_names
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
    Message.error('获取课程列表失败')
  }
}

// 删除学生
const handleDeleteStudent = async (student: any) => {
  try {
    const response = await fetch(`http://47.119.38.174:8080/api/users/${student.id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`
      }
    })
    if (response.ok || response.result) {
      alert('删除成功')
      fetchClassStudents() // 刷新列表
    } else {
      alert('删除失败')
    }
  } catch (error) {
    console.error('删除学生失败:', error)
    alert('删除失败')
  }
}

// 打开更新弹窗
const handleUpdateStudent = (student: any) => {
  currentStudent.value = student
  updateForm.value = {
    username: student.name,
    password: student.student_id, // 默认密码为学号
    name: student.name,
    student_id: student.student_id,
    role: 'student',
    class_id: 0
  }
  updateDialogVisible.value = true
  fetchCourses() // 获取课程列表
}

// 提交更新
const handleSubmitUpdate = async () => {
  try {
    const response = await fetch(`http://47.119.38.174:8080/api/users/${currentStudent.value.id}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateForm.value)
    })
    if (response.ok) {
      Message.success('更新成功')
      updateDialogVisible.value = false
      fetchClassStudents() // 刷新列表
    } else {
      Message.error('更新失败')
    }
  } catch (error) {
    console.error('更新学生信息失败:', error)
    Message.error('更新失败')
  }
}

// 修改获取学生列表方法
const fetchClassStudents = async () => {
  try {
    const class_id = Number(classId.value)
    const response = await fetch(`http://47.119.38.174:8080/api/classes/${class_id}/users/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`
      }
    })
    const responseData = await response.json()
    if (responseData.result) {
      students.value = responseData.data.map((user: any) => ({
        id: user.id, // 确保包含 id
        name: user.name,
        student_id: user.student_id,
        username: user.username,
        role: user.role
      }))
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
  }
}

onMounted(() => {
 
  fetchClassStudents()
})

</script>

<template>
  <div class="class-management">
    <!-- 面包屑导航 -->
    <t-breadcrumb>
      <t-breadcrumb-item to="/teacher-dashboard?tab=classes">班级管理</t-breadcrumb-item>
      <t-breadcrumb-item>{{ className }}</t-breadcrumb-item>
    </t-breadcrumb>

    <!-- 返回按钮 -->
    <t-button variant="text" @click="router.push('/teacher-dashboard?tab=classes')" class="back-btn">
      <template #icon><t-icon name="chevron-left" /></template>
      返回班级列表
    </t-button>

    <!-- 上传区域 -->
    <t-card class="upload-card">
      <div class="upload-area"
        @dragover.prevent
        @drop.prevent="handleFileUpload($event.dataTransfer?.files[0])"
      >
        <div class="upload-content">
          <t-icon name="upload" size="24px" />
          <h3>批量导入学生信息</h3>
          <p class="tip">点击上传或拖拽Excel文件至此</p>
          <input 
            type="file" 
            accept=".xlsx,.xls" 
            @change="handleFileUpload($event.target?.files[0])"
            hidden
            ref="fileInput"
          >
          <t-button variant="outline" @click="$refs.fileInput.click()">
            选择文件
          </t-button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-bar">
        <t-button 
          theme="primary" 
          :loading="isUploading"
          :disabled="!fileData.length"
          @click="createStudents"
        >
          创建学生账号（{{ fileData.length }}个）
        </t-button>
      </div>
    </t-card>
    <t-card title="学生列表" class="listCard" header-bordered>
      <t-table
        :data="students"
        :columns="[
          { colKey: 'id', title: '编号', width: 80 },
          { colKey: 'student_id', title: '学号' },
          { colKey: 'name', title: '姓名' },
          { colKey: 'operation', title: '操作', width: 160 }
        ]"
        row-key="id"
        hover
      >
        <template #id="{ row }">{{ row.id }}</template>
        <template #name="{ row }">{{ row.name }}</template>
        <template #student_id="{ row }">{{ row.student_id }}</template>
        <template #operation="{ row }">
          <t-space>
            <t-button
              variant="text"
              theme="primary"
              @click="handleUpdateStudent(row)"
            >
              更新
            </t-button>
            <t-button
              variant="text"
              theme="danger"
              @click="handleDeleteStudent(row)"
            >
              删除
            </t-button>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <!-- 更新学生信息弹窗 -->
    <t-dialog
      v-model:visible="updateDialogVisible"
      header="更新学生信息"
      :width="500"
      :footer="false"
      @close="updateDialogVisible = false"
    >
      <t-form
        ref="form"
        :data="updateForm"
        :rules="{
          username: [{ required: true, message: '请输入用户名' }],
          name: [{ required: true, message: '请输入姓名' }],
          student_id: [{ required: true, message: '请输入学号' }],
          role: [{ required: true, message: '请选择角色' }],
          class_id: [{ required: true, message: '请选择班级' }]
        }"
      >
        <t-form-item label="用户名" name="username">
          <t-input v-model="updateForm.username" placeholder="请输入用户名" />
        </t-form-item>
        <t-form-item label="密码" name="password">
          <t-input v-model="updateForm.password" type="password" placeholder="请输入密码" />
        </t-form-item>
        <t-form-item label="姓名" name="name">
          <t-input v-model="updateForm.name" placeholder="请输入姓名" />
        </t-form-item>
        <t-form-item label="学号" name="student_id">
          <t-input v-model="updateForm.student_id" placeholder="请输入学号" />
        </t-form-item>
        <t-form-item label="角色" name="role">
          <t-radio-group v-model="updateForm.role">
            <t-radio value="student">学生</t-radio>
            <t-radio value="admin">管理员</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="班级" name="class_id">
          <t-select v-model="updateForm.class_id" placeholder="请选择班级">
            <t-option
              v-for="(course, index) in courses"
              :key="index"
              :value="index + 1"
              :label="course"
            />
          </t-select>
        </t-form-item>
      </t-form>
      <template #footer>
        <t-space>
          <t-button theme="default" @click="updateDialogVisible = false">取消</t-button>
          <t-button theme="primary" @click="handleSubmitUpdate">确认</t-button>
        </t-space>
      </template>
    </t-dialog>
  </div>
</template>

<style scoped>
.class-management {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.back-btn {
  margin: 16px 0;
  padding-left: 0;
}

.upload-card {
  margin-top: 24px;
}

.upload-area {
  border: 2px dashed var(--td-component-border);
  border-radius: 8px;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    border-color: var(--td-brand-color);
    background-color: var(--td-brand-color-light);
  }
}

.upload-content {
  text-align: center;
  color: var(--td-text-color-secondary);
  
  h3 {
    margin: 16px 0;
    color: var(--td-text-color-primary);
  }

  .tip {
    margin-bottom: 16px;
    font-size: 14px;
  }
}

.listCard{
  margin-top:24px;
}

.action-bar {
  margin-top: 24px;
  text-align: right;
  border-top: 1px solid var(--td-component-stroke);
  padding-top: 16px;
}

:deep(.t-form) {
  padding: 20px;
}

:deep(.t-form__item) {
  margin-bottom: 20px;
}
</style> 