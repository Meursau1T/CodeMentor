<script setup lang="ts">
/** 课程页面 */
const courseObj = [
  {
    title: '基础概念',
    subtopics: [
      { title: '常量与变量' },
      { title: '数据类型' },
      { title: '运算符' },
      { title: '控制结构' },
      { title: '函数' },
      { title: '数组' },
      { title: '字符串' },
    ]
  },
  {
    title: '控制结构',
    subtopics: [
      { title: 'if语句' },
      { title: 'for循环' },
      { title: 'while循环' },
      { title: 'do-while循环' },
      { title: 'switch语句' },
      { title: 'break和continue' },
    ]
  },
  {
    title: '函数',
    subtopics: [
      { title: '函数定义' },
      { title: '函数调用' },
      { title: '参数传递' },
      { title: '返回值' },
      { title: '递归' },
      { title: '匿名函数' },
      { title: '高阶函数' },
    ]
  },
  {
    title: '指针',
    subtopics: [
      { title: '指针定义' },
      { title: '指针初始化' },
      { title: '指针操作' },
      { title: '多维指针' },
      { title: '指针遍历' },
    ]
  },
  {
    title: '结构体',
    subtopics: [
      { title: '结构体定义' },
      { title: '结构体初始化' },
      { title: '结构体操作' },
      { title: '结构体遍历' },
    ]
  },
  {
    title: '文件操作',
    subtopics: [
      { title: '文件打开' },
      { title: '文件读取' },
      { title: '文件写入' },
      { title: '文件关闭' },
    ]
  }
]
const statsList = [
  {
    icon: 'chart',
    title: '准确率',
    value: '85%'
  },
  {
    icon: 'error',
    title: '错题',
    value: '12'
  },
  {
    icon: 'star',
    title: '收藏',
    value: '8'
  },
  {
    icon: 'edit',
    title: '笔记',
    value: '5'
  }
]
</script>

<template>
  <main class="container">
    <div class="left-card">
      <h2 class="title">知识图谱</h2>
      <t-divider style="margin: 8px 0"></t-divider>
      <t-tree
        :data="courseObj"
        :expand-all="false"
        hover
        transition
        activable
        line
        :keys="{
          value: 'title',
          label: 'title',
          children: 'subtopics'
        }"
        class="custom-tree"
      >
        <template #operations="{ node }">
          <span v-if="node.getLevel() !== 0" class="operation-btn">{{ "去练习" }}</span>
        </template>
      </t-tree>
    </div>
    <div class="right-container">
      <div class="right-card">
        <h2 class="title">能力分析报告</h2>
        <t-divider style="margin: 8px 0"></t-divider>
      </div>
      <div class="bottom-card">
        <t-list>
          <t-list-item class="list-item" v-for="item in statsList" :key="item.title">
            <template #content>
              <span class="stats-item">
                <t-icon :name="item.icon" size="20px" style="color: #0052d9"/>
                <span>{{ item.title }}</span>
              </span>
            </template>
            <template #action>
              <span style="color: #0052d9; font-weight: 500">{{ item.value }}</span>
            </template>
          </t-list-item>
        </t-list>
      </div>
    </div>
  </main>
</template>

<style scoped>
.container {
  display: flex;
  width: 100%;
  padding: 32px;
  gap: 24px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 64px);
}

.left-card {
  flex: 0 0 60%; /* 固定宽度 */
  height: fit-content; /* 高度自适应内容 */
}

.right-container {
  flex: 1; /* 占据剩余空间 */
  display: flex;
  flex-direction: column;
  height: fit-content; /* 高度自适应内容 */
  gap: 24px;
}

.right-card {
  flex: 1; /* 占据上方空间 */
}

.bottom-card {
  height: fit-content; /* 高度自适应内容 */
}

.left-card, .right-card, .bottom-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  transition: all 0.3s ease;
}

.title {
  
  font-weight: 600;
  color: #0052d9;
  margin-bottom: 4px;
}

.custom-tree :deep(.t-tree__item[data-level="0"]) {
  font-size: 18px;
  color: #333333;
}

.custom-tree :deep(.t-tree__item[data-level="1"]) {
  font-size: 16px;
  color: #666666;
}

.operation-btn {
  font-size: 14px;
  cursor: pointer;
  color: #0052d9;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.operation-btn:hover {
  background-color: rgba(0, 82, 217, 0.1);
  transform: scale(1.05);
}

.list-item {
  padding: 0;
  transition: background-color 0.2s ease;
}

.list-item:hover {
  background-color: #f5f5f5;
}

.stats-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
}

.stats-item span {
  margin-left: 12px;
  color: #333333;
  font-weight: 500;
}

</style>
