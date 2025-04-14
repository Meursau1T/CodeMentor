
// 1. 定义类型接口
interface Student {
    id: string;
    name: string;
    progress: number;
    answerCount: number;
    wrongCount: number;
    accuracy: number;
    isTeacher?: boolean; // 可选属性，用于标记教师
  }
  
  interface ClassStats {
    avgProgress: number;
    avgAccuracy: number;
    wrongRate: number;
  }
  
  // 2. 学生数据（使用类型断言确保类型安全）
  export const class1StudentData: Student[] = [
    { id: '20240010', name: '林小凡', progress: 22, answerCount: 12, wrongCount: 3, accuracy: 75 },
    { id: '20240011', name: '徐天宇', progress: 38, answerCount: 25, wrongCount: 5, accuracy: 80 },
    { id: '20240002', name: '李梓萱', progress: 15, answerCount: 10, wrongCount: 3, accuracy: 70 },
    { id: '20240009', name: '赵心悦', progress: 25, answerCount: 20, wrongCount: 4, accuracy: 80 },
    { id: '20240008', name: '吴宇航', progress: 32, answerCount: 22, wrongCount: 7, accuracy: 68 },
    { id: '20240007', name: '周雅静', progress: 40, answerCount: 30, wrongCount: 6, accuracy: 80 },
    { id: '20240005', name: '陈思琪', progress: 18, answerCount: 15, wrongCount: 5, accuracy: 67 },
    { id: '20240001', name: '王浩然', progress: 35, answerCount: 25, wrongCount: 8, accuracy: 68 },
    { id: '20240006', name: '黄子轩', progress: 10, answerCount: 8, wrongCount: 2, accuracy: 75 },
    { id: '20240003', name: '张明远', progress: 28, answerCount: 15, wrongCount: 5, accuracy: 67 },
    { id: '20240012', name: '郑佳宁', progress: 16, answerCount: 12, wrongCount: 4, accuracy: 67 },
    { id: '20240013', name: '高晨曦', progress: 33, answerCount: 20, wrongCount: 6, accuracy: 70 },
    { id: '20240014', name: '方文昊', progress: 21, answerCount: 14, wrongCount: 4, accuracy: 71 },
    { id: '20240015', name: '胡诗涵', progress: 39, answerCount: 25, wrongCount: 5, accuracy: 80 }
  ];
  
  export const class2StudentData: Student[] = [
    { id: '20240048', name: '邱浩然', progress: 18, answerCount: 15, wrongCount: 5, accuracy: 67 },
    { id: '20240046', name: '蔡天佑', progress: 40, answerCount: 30, wrongCount: 0, accuracy: 100 },
    { id: '20240050', name: '尹嘉怡', progress: 12, answerCount: 8, wrongCount: 2, accuracy: 75 },
    { id: '20240049', name: '秦小雨', progress: 25, answerCount: 16, wrongCount: 4, accuracy: 75 },
    { id: '20240059', name: '易天宇', progress: 32, answerCount: 22, wrongCount: 7, accuracy: 68 },
    { id: '20240056', name: '龚一凡', progress: 15, answerCount: 10, wrongCount: 3, accuracy: 70 },
    { id: '20240058', name: '黎梦欣', progress: 28, answerCount: 20, wrongCount: 4, accuracy: 80 },
    { id: '20240047', name: '贾梦瑶', progress: 10, answerCount: 5, wrongCount: 2, accuracy: 60 },
    { id: '20240052', name: '侯静雯', progress: 35, answerCount: 25, wrongCount: 5, accuracy: 80 },
    { id: '20240054', name: '郝明哲', progress: 22, answerCount: 15, wrongCount: 5, accuracy: 67 },
    { id: '20240057', name: '常思远', progress: 19, answerCount: 10, wrongCount: 3, accuracy: 70 },
    { id: '20240055', name: '万雅琴', progress: 38, answerCount: 25, wrongCount: 5, accuracy: 80 },
    { id: '20240051', name: '段逸飞', progress: 16, answerCount: 10, wrongCount: 3, accuracy: 70 },
    { id: '20240053', name: '熊子涵', progress: 24, answerCount: 15, wrongCount: 5, accuracy: 67 },
    { id: '20240060', name: '武佳琪', progress: 30, answerCount: 20, wrongCount: 6, accuracy: 70 }
  ];
  
  export const class3StudentData: Student[] = [
    { id: '20240081', name: '白宇航', progress: 0, answerCount: 0, wrongCount: 0, accuracy: 0 },
    { id: '20240082', name: '崔雨晴', progress: 18, answerCount: 15, wrongCount: 5, accuracy: 67 },
    { id: '20240083', name: '丁浩然', progress: 32, answerCount: 22, wrongCount: 5, accuracy: 77 },
    { id: '20240084', name: '范诗涵', progress: 25, answerCount: 16, wrongCount: 4, accuracy: 75 },
    { id: '20240085', name: '傅明轩', progress: 40, answerCount: 30, wrongCount: 6, accuracy: 80 },
    { id: '20240086', name: '高晓彤', progress: 12, answerCount: 8, wrongCount: 2, accuracy: 75 },
    { id: '20240087', name: '韩星辰', progress: 38, answerCount: 28, wrongCount: 0, accuracy: 100 },
    { id: '20240088', name: '蒋欣然', progress: 15, answerCount: 10, wrongCount: 3, accuracy: 70 },
    { id: '20240089', name: '金一鸣', progress: 28, answerCount: 18, wrongCount: 4, accuracy: 78 },
    { id: '20240090', name: '梁佳琪', progress: 22, answerCount: 15, wrongCount: 5, accuracy: 67 },
    { id: '20240091', name: '刘子墨', progress: 35, answerCount: 25, wrongCount: 5, accuracy: 80 },
    { id: '20240092', name: '陆思远', progress: 19, answerCount: 10, wrongCount: 3, accuracy: 70 },
    { id: '20240093', name: '马欣怡', progress: 30, answerCount: 20, wrongCount: 6, accuracy: 70 },
    { id: '20240094', name: '潘宇航', progress: 16, answerCount: 10, wrongCount: 3, accuracy: 70 },
    { id: '20240095', name: '钱文昊', progress: 24, answerCount: 15, wrongCount: 4, accuracy: 73 }
  ];


export const class4StudentData: Student[] = [
  { id: '20240032', name: '卢昊然', progress: 25, answerCount: 18, wrongCount: 6, accuracy: 67 },
  { id: '20240037', name: '孟佳琪', progress: 35, answerCount: 28, wrongCount: 7, accuracy: 75 },
  { id: '20240038', name: '谭文博', progress: 15, answerCount: 10, wrongCount: 4, accuracy: 60 },
  { id: '20240034', name: '魏志强', progress: 40, answerCount: 32, wrongCount: 8, accuracy: 75 },
  { id: '20240036', name: '廖宇航', progress: 22, answerCount: 16, wrongCount: 5, accuracy: 69 },
  { id: '20240033', name: '丁美琳', progress: 28, answerCount: 20, wrongCount: 5, accuracy: 75 },
  { id: '20240035', name: '姜欣怡', progress: 18, answerCount: 12, wrongCount: 4, accuracy: 67 },
  { id: '20240041', name: '陆晓雨', progress: 32, answerCount: 25, wrongCount: 7, accuracy: 72 },
  { id: '20240044', name: '邹家乐', progress: 20, answerCount: 14, wrongCount: 4, accuracy: 71 },
  { id: '20240031', name: '江语晨', progress: 38, answerCount: 30, wrongCount: 9, accuracy: 70 },
  { id: '20240040', name: '杜子豪', progress: 25, answerCount: 18, wrongCount: 6, accuracy: 67 },
  { id: '20240042', name: '白宇轩', progress: 40, answerCount: 35, wrongCount: 10, accuracy: 71 },
  { id: '20240045', name: '任思颖', progress: 18, answerCount: 10, wrongCount: 3, accuracy: 70 },
  { id: '20240039', name: '石静怡', progress: 30, answerCount: 22, wrongCount: 5, accuracy: 77 },
  { id: '20240043', name: '潘诗雨', progress: 22, answerCount: 15, wrongCount: 5, accuracy: 67 }
];


export const class5StudentData: Student[] = [
  { id: '20240100', name: '李明轩', progress: 0, answerCount: 0, wrongCount: 0, accuracy: 0 },
  { id: '20240101', name: '张雨桐', progress: 35, answerCount: 28, wrongCount: 7, accuracy: 75 },
  { id: '20240103', name: '刘思琪', progress: 15, answerCount: 10, wrongCount: 4, accuracy: 60 },
  { id: '20240104', name: '陈宇航', progress: 40, answerCount: 32, wrongCount: 8, accuracy: 75 },
  { id: '20240105', name: '杨雅静', progress: 22, answerCount: 16, wrongCount: 5, accuracy: 69 },
  { id: '20240106', name: '赵天宇', progress: 28, answerCount: 20, wrongCount: 5, accuracy: 75 },
  { id: '20240107', name: '周晓萌', progress: 18, answerCount: 12, wrongCount: 4, accuracy: 67 },
  { id: '20240108', name: '吴俊杰', progress: 32, answerCount: 25, wrongCount: 7, accuracy: 72 },
  { id: '20240109', name: '黄诗涵', progress: 20, answerCount: 14, wrongCount: 4, accuracy: 71 },
  { id: '20240110', name: '林佳怡', progress: 38, answerCount: 30, wrongCount: 9, accuracy: 70 },
  { id: '20240111', name: '徐子豪', progress: 25, answerCount: 18, wrongCount: 6, accuracy: 67 },
  { id: '20240112', name: '孙婉清', progress: 40, answerCount: 35, wrongCount: 10, accuracy: 71 },
  { id: '20240113', name: '朱博文', progress: 18, answerCount: 10, wrongCount: 3, accuracy: 70 },
  { id: '20240114', name: '胡欣怡', progress: 30, answerCount: 22, wrongCount: 5, accuracy: 77 },
  { id: '20240115', name: '高天翔', progress: 22, answerCount: 15, wrongCount: 5, accuracy: 67 },
  { id: '20240116', name: '郑雨晴', progress: 25, answerCount: 18, wrongCount: 6, accuracy: 67 },
  { id: '20240117', name: '冯子轩', progress: 40, answerCount: 36, wrongCount: 9, accuracy: 75 }
];

export const class6StudentData: Student[] = [
  { id: '20240065', name: '安志强', progress: 18, answerCount: 15, wrongCount: 5, accuracy: 67 },
  { id: '20240066', name: '于诗涵', progress: 35, answerCount: 28, wrongCount: 7, accuracy: 75 },
  { id: '20240062', name: '颜如玉', progress: 12, answerCount: 8, wrongCount: 3, accuracy: 63 },
  { id: '20240067', name: '傅天宇', progress: 40, answerCount: 32, wrongCount: 8, accuracy: 75 },
  { id: '20240061', name: '庞博文', progress: 22, answerCount: 18, wrongCount: 6, accuracy: 67 },
  { id: '20240068', name: '薛晓萌', progress: 28, answerCount: 20, wrongCount: 5, accuracy: 75 },
  { id: '20240069', name: '牛欣怡', progress: 15, answerCount: 10, wrongCount: 4, accuracy: 60 },
  { id: '20240064', name: '温婉清', progress: 32, answerCount: 25, wrongCount: 7, accuracy: 72 },
  { id: '20240071', name: '顾雨晴', progress: 25, answerCount: 16, wrongCount: 5, accuracy: 69 },
  { id: '20240070', name: '史俊杰', progress: 38, answerCount: 30, wrongCount: 9, accuracy: 70 },
  { id: '20240063', name: '兰宇航', progress: 20, answerCount: 12, wrongCount: 4, accuracy: 67 },
  { id: '20240072', name: '贺明轩', progress: 40, answerCount: 35, wrongCount: 10, accuracy: 71 },
  { id: '20240073', name: '费雅静', progress: 18, answerCount: 10, wrongCount: 3, accuracy: 70 },
  { id: '20240075', name: '阮星辰', progress: 30, answerCount: 22, wrongCount: 5, accuracy: 77 },
  { id: '20240074', name: '章子豪', progress: 22, answerCount: 15, wrongCount: 5, accuracy: 67 }
];

  // 计算单个班级的统计数据
const calculateClassStats = (students: Student[]): ClassStats => {
  const validStudents = students.filter(s => !s.isTeacher && s.answerCount > 0);
  const totalProgress = students.reduce((sum, s) => sum + s.progress, 0);
  const totalAccuracy = validStudents.reduce((sum, s) => sum + s.accuracy, 0);
  const totalWrong = validStudents.reduce((sum, s) => sum + s.wrongCount, 0);
  const totalAnswers = validStudents.reduce((sum, s) => sum + s.answerCount, 0);

  return {
    avgProgress: parseFloat((totalProgress / students.length).toFixed(2)),
    avgAccuracy: validStudents.length > 0 
      ? parseFloat((totalAccuracy / validStudents.length).toFixed(2))
      : 0,
    wrongRate: totalAnswers > 0
      ? parseFloat((totalWrong / totalAnswers * 100).toFixed(2))
      : 0
  };
};

// 计算所有班级的统计数据
export const allClassStats = {
  class1: calculateClassStats(class1StudentData),
  class2: calculateClassStats(class2StudentData),
  class3: calculateClassStats(class3StudentData),
  class4: calculateClassStats(class4StudentData),
  class5: calculateClassStats(class5StudentData),
  class6: calculateClassStats(class6StudentData)
};

// 输出结果（实际使用时可以直接使用 allClassStats）
console.log('各班级统计数据:', {
  一班: allClassStats.class1,
  二班: allClassStats.class2,
  三班: allClassStats.class3,
  四班: allClassStats.class4,
  五班: allClassStats.class5,
  六班: allClassStats.class6
});
 