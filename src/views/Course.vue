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
  },
  {
    title: '二叉树',
    subtopics: [
      { title: '二叉树定义' },
      { title: '二叉树遍历' },
      { title: '二叉树插入' },
      { title: '二叉树删除' },
      { title: '二叉搜索树' },
      { title: '平衡二叉树' },
    ]
  },
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
      <h1 class="title">知识图谱</h1>
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
        <h1 class="title">能力分析报告</h1>
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
}

.left-card {
  flex: 1;
  background: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.right-card {
  width: 450px;
  height: 380px;
  background: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.bottom-card {
  margin-top: 24px;
  background: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.title {
  font-size: 32px;
  font-weight: bold;
  color: #000;
  margin-bottom: 4px;
}

.custom-tree :deep(.t-tree__item[data-level="0"]) {
  font-size: 20px;
}

.custom-tree :deep(.t-tree__item[data-level="1"]) {
  font-size: 16px;
}

.operation-btn {
  font-size: 16px;
  cursor: pointer;
  color: #a6a6a6;
}

.list-item {
  padding: 0;
}

.stats-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
}

.stats-item span {
  margin-left: 12px;
}

</style>
