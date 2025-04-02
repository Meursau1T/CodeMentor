<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'

const router = useRouter()
const loading = ref(false)

interface ChapterInput {
  id: number
  name: string
}

const courseName = ref('')
const chapters = ref<ChapterInput[]>([
  { id: 1, name: '' }
])

const addChapter = () => {
  chapters.value.push({
    id: chapters.value.length + 1,
    name: ''
  })
}

const removeChapter = (index: number) => {
  chapters.value = chapters.value.filter((_, i) => i !== index)
}

const handleSubmit = async () => {
  if (!courseName.value.trim()) {
    return
  }

  const validChapters = chapters.value.filter(chapter => chapter.name.trim())
  if (!validChapters.length) {
    return
  }

  loading.value = true
  try {
    console.log('courseName.value', courseName.value)
    console.log('validChapters', validChapters.map(chapter => chapter.name.trim()))
    const response = await fetch('http://47.119.38.174:8080/api/courses/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Cookies.get('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        course_name: courseName.value,
        knowledge_point_names: validChapters.map(chapter => chapter.name.trim())
      })
    })

    if (!response.ok) {
      throw new Error('创建课程失败')
    }

    const data = await response.json()
    if (data.result) {
      router.push(`/course/${data.data.id}/chapters`)
    }
  } catch (error) {
    console.error('创建课程失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <t-layout>
    <t-content class="content-inner">
      <t-card title="创建新课程" :bordered="true">
        <t-form>
          <t-form-item label="课程名称" required>
            <t-input
              v-model="courseName"
              placeholder="请输入课程名称"
              :maxlength="50"
            />
          </t-form-item>

          <t-form-item label="课程章节" required>
            <t-space direction="vertical" style="width: 100%;">
              <div
                v-for="(chapter, index) in chapters"
                :key="chapter.id"
                class="chapter-input"
              >
                <t-input
                  v-model="chapter.name"
                  placeholder="请输入章节名称"
                  :maxlength="50"
                >
                  <template #suffix>
                    <t-button
                      v-if="chapters.length > 1"
                      variant="text"
                      theme="danger"
                      @click="removeChapter(index)"
                    >
                      <t-icon name="delete" />
                    </t-button>
                  </template>
                </t-input>
              </div>

              <t-button
                variant="dashed"
                theme="default"
                block
                @click="addChapter"
              >
                <template #icon>
                  <t-icon name="add" />
                </template>
                添加章节
              </t-button>
            </t-space>
          </t-form-item>

          <t-form-item>
            <t-space>
              <t-button theme="default" @click="router.back()">
                返回
              </t-button>
              <t-button
                theme="primary"
                :loading="loading"
                @click="handleSubmit"
              >
                立即创建并管理章节
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

.chapter-input {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
</style> 