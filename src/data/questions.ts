import { Question, QuestionType } from '../types';

const INITIAL_QUESTIONS: Question[] = [
  {
    id: '1',
    type: QuestionType.SINGLE_CHOICE,
    chapter: '电力系统基本概念',
    difficulty: 'basic',
    text: '电力系统由哪三部分组成？',
    options: ['发电机、变压器、电动机', '发电机、电网、用户', '发电厂、输电线路、分配电网', '发电厂、变电所、配电网'],
    correctAnswer: 'B',
    explanation: '电力系统是由发电机、电网和用户三部分组成的。',
    tags: ['基本概念'],
  },
  {
    id: '2',
    type: QuestionType.SINGLE_CHOICE,
    chapter: '电力系统潮流计算',
    difficulty: 'intermediate',
    text: '在电力系统潮流计算中，PQ节点的已知变量是？',
    options: ['电压和相位', '有功和无功', '有功和电压', '无功和电压'],
    correctAnswer: 'B',
    explanation: 'PQ节点的已知量是有功功率P和无功功率Q。',
    tags: ['潮流计算', '节点类型'],
  },
  {
    id: '3',
    type: QuestionType.TRUE_FALSE,
    chapter: '电力系统故障分析',
    difficulty: 'basic',
    text: '对称分量法可以将不对称的三相电流分解为正序、负序和零序分量。',
    correctAnswer: 'true',
    explanation: '对称分量法是分析不对称故障的基本工具。',
    tags: ['故障分析', '对称分量法'],
  },
  {
    id: '4',
    type: QuestionType.SINGLE_CHOICE,
    chapter: '电力系统稳态分析',
    difficulty: 'advanced',
    text: '电力系统的静态稳定性是指系统受到多大的扰动后能恢复到原始状态？',
    options: ['微小扰动', '大扰动', '短路故障', '切除线路'],
    correctAnswer: 'A',
    explanation: '静态稳定性指在微小扰动下能恢复原状态。',
    tags: ['稳态分析', '稳定性'],
  },
  {
    id: '5',
    type: QuestionType.MULTIPLE_CHOICE,
    chapter: '无功功率平衡与电压调整',
    difficulty: 'intermediate',
    text: '以下哪些设备可以作为无功补偿装置？',
    options: ['并联电容器', '同步调相机', '静止无功补偿器 (SVC)', '异步电动机'],
    correctAnswer: ['A', 'B', 'C'],
    explanation: '并联电容器、同步调相机、SVC均为常见的无功补偿设备；异步电动机通常消耗无功。',
    tags: ['电压调整', '无功补偿'],
  },
  {
    id: '6',
    type: QuestionType.SINGLE_CHOICE,
    chapter: '有功功率平衡与频率调整',
    difficulty: 'basic',
    text: '电力系统的一次调频是由什么完成的？',
    options: ['调度员手动操作', '发电机组的调速器自动完成', '调频机组的自动调频装置', '负荷的调节'],
    correctAnswer: 'B',
    explanation: '一次调频是由发电机组调速器根据转速变化自动调节。',
    tags: ['频率调整'],
  },
  {
    id: '7',
    type: QuestionType.SINGLE_CHOICE,
    chapter: '电力系统暂态分析',
    difficulty: 'intermediate',
    text: '提高电力系统暂态稳定性的主要措施不通过？',
    options: ['快速切除故障', '采用自动重合闸', '强行励磁', '增加负荷'],
    correctAnswer: 'D',
    explanation: '增加负荷通常不会直接提高暂态稳定性，反而可能使情况复杂；前三者是常规可靠手段。',
    tags: ['暂态分析', '稳定性'],
  },
  {
    id: '8',
    type: QuestionType.TRUE_FALSE,
    chapter: '电力系统潮流计算',
    difficulty: 'basic',
    text: '牛顿-拉夫逊法潮流计算具有平方收敛特性。',
    correctAnswer: 'true',
    explanation: '牛顿法在初值选取合适的情况下收敛极快。',
    tags: ['潮流计算'],
  },
  {
    id: '9',
    type: QuestionType.SINGLE_CHOICE,
    chapter: '电力系统故障分析',
    difficulty: 'intermediate',
    text: '两相接地短路的零序电流分布与什么有关？',
    options: ['负序阻抗', '正序阻抗', '变压器中性点接地情况', '负荷大小'],
    correctAnswer: 'C',
    explanation: '零序电流的路径取决于零序网结构，尤其是变压器中性点的接地情况。',
    tags: ['故障分析'],
  },
  {
    id: '10',
    type: QuestionType.SINGLE_CHOICE,
    chapter: '无功功率平衡与电压调整',
    difficulty: 'intermediate',
    text: '变压器分接头调整属于哪种电压调节手段？',
    options: ['一级调压', '辅助调压', '改变网络参数调压', '改变无功平衡调压'],
    correctAnswer: 'C',
    explanation: '调整分接头改变的是电压比，属于局部网络参数调整手段。',
    tags: ['电压调整'],
  }
];

// Generate 3000 questions for demonstration
export const QUESTION_BANK: Question[] = Array.from({ length: 3000 }).map((_, index) => {
  const base = INITIAL_QUESTIONS[index % INITIAL_QUESTIONS.length];
  const difficultyMap = ['basic', 'intermediate', 'advanced'] as const;
  
  return {
    ...base,
    id: `q-${index + 1}`,
    text: `${base.text} (模拟题目 #${index + 1})`,
    difficulty: difficultyMap[index % 3], // Varies difficulty for distribution
    // Keep internal values logic the same, just IDs and numbers vary
  };
});
