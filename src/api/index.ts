import { mockUserInfo, mockAnswerHistory, mockAnswerDetail } from '../mock';

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // 用户相关
  async getUserInfo() {
    await delay(500);
    return mockUserInfo;
  },

  async changePassword(data: { oldPassword: string; newPassword: string }) {
    await delay(1000);
    // 模拟密码验证
    if (data.oldPassword === "oldpass") {
      return { success: true, message: "密码修改成功" };
    }
    throw new Error("原密码错误");
  },

  // 作答历史相关
  async getAnswerHistory(query: {
    status?: string;
    difficulty?: string;
    page?: number;
    pageSize?: number;
  }) {
    await delay(500);
    return mockAnswerHistory;
  },

  async getAnswerDetail(id: string | number) {
    await delay(500);
    return mockAnswerDetail;
  }
}; 