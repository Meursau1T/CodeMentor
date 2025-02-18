// Mock 用户数据
export const mockUserInfo = {
  id: "U001",
  name: "测试用户",
  avatar: null
};

// Mock 历史记录列表
export const mockAnswerHistory = {
  total: 10,
  items: [
    {
      id: 1,
      title: "两数之和",
      difficulty: "简单",
      status: "已通过",
      submitTime: "2024-03-10 10:30:00"
    },
    {
      id: 2,
      title: "合并两个有序链表",
      difficulty: "中等",
      status: "未通过",
      submitTime: "2024-03-09 15:20:00"
    },
    // ... 更多mock数据
  ]
};

// Mock 答题详情
export const mockAnswerDetail = {
  question: {
    id: 1,
    title: "两数之和",
    difficulty: "简单",
    description: "给定一个整数数组 nums...",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "因为 nums[0] + nums[1] == 9 ，返回 [0, 1]"
      }
    ],
    hints: ["可以使用哈希表来优化时间复杂度"]
  },
  userAnswer: {
    code: "function twoSum(nums, target) {...}",
    submitTime: "2024-03-10 10:30:00",
    status: "已通过",
    executionTime: "56ms",
    memoryUsage: "41.2MB"
  },
  aiCorrection: {
    code: "// 优化后的代码...",
    explanation: "建议使用哈希表优化查找过程..."
  },
  solution: {
    code: "function twoSum(nums, target) {...}",
    explanation: "本题主要考察以下知识点..."
  }
}; 