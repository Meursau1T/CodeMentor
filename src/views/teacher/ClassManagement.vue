<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from 'tdesign-vue-next'
import * as XLSX from "xlsx"; // 正确写法
import Cookies from 'js-cookie'

const route = useRoute()
const router = useRouter()
const className = ref(route.params.className) // 实际应从接口获取
const fileData = ref<any[]>([])
const isUploading = ref(false)

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
  min-height: 300px;
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

.action-bar {
  margin-top: 24px;
  text-align: right;
  border-top: 1px solid var(--td-component-stroke);
  padding-top: 16px;
}
</style> 