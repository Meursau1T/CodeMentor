<script setup lang="ts">
import { ref } from 'vue'
import { Message } from 'tdesign-vue-next'
import { useRouter } from 'vue-router'
import { PlusIcon, HelpCircleIcon } from 'tdesign-icons-vue-next'
import Cookies from 'js-cookie'

const router = useRouter()
const class_name = ref('')
const isSubmitting = ref(false)

const handleSubmit = async () => {
  if (!class_name.value.trim()) {
    Message.error('请输入班级名称')
    return
  }

  try {
    isSubmitting.value = true
    const response = await fetch('http://47.119.38.174:8080/api/classes/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        class_name: class_name.value.trim()
      })
    })

    const data = await response.json()
    if (data.result) {
        //成功弹出alert提示
        alert(`"${data.data.class_name}" 创建成功`)
      
      // 通过路由参数触发父页面刷新
      setTimeout(() => {
        router.push({
          path: '/teacher-dashboard',
          query: {
            tab: 'classes',
            refresh: Date.now()  // 添加时间戳强制刷新
          }
        })
      }, 1500)
    } else {
      Message.error('班级创建失败')
    }
  } catch (error) {
    Message.error('网络请求异常')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <t-layout>
    <t-content class="content-inner">
      <t-card title="创建新班级" :bordered="true">
        <t-form class="class-form">
          <t-form-item
            label="班级名称"
            required
            :rules="[{ required: true, message: '班级名称不能为空' }]"
          >
            <t-input v-model="class_name" placeholder="请输入班级名称" clearable />
          </t-form-item>

          <t-form-item>
            <t-space>
              <t-button theme="default" @click="router.back()">
                返回
              </t-button>
              <t-button
                theme="primary"
                :loading="isSubmitting"
                @click="handleSubmit"
              >
                立即创建
                <template #suffix>
                  <t-tooltip content="建议命名格式：年级+专业+编号" placement="top">
                    <help-circle-icon size="20px" />
                  </t-tooltip>
                </template>
              </t-button>
            </t-space>
          </t-form-item>
        </t-form>
      </t-card>
    </t-content>
  </t-layout>
</template>

<style scoped>
.content-inner {
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.class-form {
  max-width: 600px;
  margin: 0 auto;
}

/* 保持与课程创建页面一致的输入框样式 */
.t-form-item {
  margin-bottom: 24px;
}
</style> 