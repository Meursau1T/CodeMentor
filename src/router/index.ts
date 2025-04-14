import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../views/MainPage.vue'
import Course from '../views/Course.vue'
import QuestionBank from '../views/QuestionBank.vue'
import AIMentor from '../views/AIMentor.vue'
import Login from '../views/Login.vue'
import { useUserInfoStore } from '../stores/userInfo'
import Cookies from 'js-cookie'
import { ROUTE_NAME, ROUTE_PATH } from '../constants'
import Coding from '../views/question/Coding.vue'
import Profile from '../views/profile/Profile.vue'
import PersonalInfo from '../views/profile/PersonalInfo.vue'
import AnswerHistory from '../views/profile/AnswerHistory.vue'
import AnswerDetail from '../views/profile/AnswerDetail.vue'
import TeacherDashboard from '@/views/teacher/TeacherDashboard.vue'
import CreateCourse from '@/views/teacher/CreateCourse.vue'
import CourseChapters from '@/views/teacher/CourseChapters.vue'
import QuestionList from '../views/question/QuestionList.vue'
import StudentAnswers from '@/views/teacher/StudentAnswers.vue'
import StudentAnswerDetail from '@/views/teacher/StudentAnswerDetail.vue'
import CoursePractice from '@/views/course/CoursePractice.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: ROUTE_PATH.MAIN,
      name: ROUTE_NAME.MAIN,
      component: MainPage,
      meta: { requiresAuth: true }
    },
    {
      path: ROUTE_PATH.LOGIN,
      name: ROUTE_NAME.LOGIN,
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: ROUTE_PATH.COURSE,
      name: ROUTE_NAME.COURSE,
      component: Course,
      meta: { requiresAuth: true }
    },
    {
      path: ROUTE_PATH.QUESTION,
      name: ROUTE_NAME.QUESTION,
      component: QuestionBank,
      meta: { requiresAuth: true }
    },
    {
      path: '/question/coding',
      name: 'coding',
      component: Coding,
      meta: { requiresAuth: true }
    },
    {
      path: ROUTE_PATH.AIMENTOR,
      name: ROUTE_NAME.AIMENTOR,
      component: AIMentor,
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'info',
          name: 'personalInfo',
          component: PersonalInfo,
          meta: { requiresAuth: true }
        },
        {
          path: 'history',
          name: 'answerHistory',
          component: AnswerHistory,
          meta: { requiresAuth: true }
        },
        {
          path: 'answer/:id',
          name: 'answerDetail',
          component: AnswerDetail,
          meta: { requiresAuth: true }
        }
      ]
    },
    {
      path: '/teacher-dashboard',
      component: () => import('../views/teacher/TeacherDashboard.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/problems',
      name: 'ProblemList',
      component: QuestionList,
      meta: { 
        title: '题库',
        requiresAuth: true
      }
    },
    {
      path: '/teacher',
      name: 'TeacherDashboard',
      component: TeacherDashboard
    },
    {
      path: '/create-course',
      name: 'CreateCourse',
      component: CreateCourse
    },
    {
      path: '/course/:id/chapters',
      name: 'CourseChapters',
      component: CourseChapters,
      props: true
    },
    {
      path: '/question-selection/:courseId/:chapterKpId',
      component: () => import('@/views/teacher/ProblemSelection.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/create-class',
      name: 'CreateClass',
      component: () => import('@/views/teacher/CreateClass.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/class/:className/:classID/manage',
      name: 'ClassManagement',
      component: () => import('@/views/teacher/ClassManagement.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/course-chapters/:courseId/student-answers/:studentId',
      name: 'StudentAnswers',
      component: StudentAnswers,
      meta: { requiresAuth: true }
    },
    {
      path: '/course-chapters/:courseId/student-answer-detail/:studentId/:answerId',
      name: 'StudentAnswerDetail',
      component: StudentAnswerDetail,
      meta: { requiresAuth: true }
    },
    {
      path: '/course-practice/:courseId/:knowledgePointId',
      name: 'CoursePractice',
      component: CoursePractice,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/settings',
      name: 'AdminSettings',
      component: () => import('@/views/admin/AdminSettings.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ],
})

router.beforeEach((to, from, next) => {
  const userStore = useUserInfoStore()
  const userInfo = Cookies.get('userInfo')
  console.log('dev wxf router', to, from);
  if (userInfo) {
    userStore.setUserInfo(JSON.parse(userInfo))
  }

  if (to.meta.requiresAuth && !userStore.isLogin()) {
    next('/login')
  } else if (to.meta.requiresAdmin && userStore.userInfo?.role !== 'admin') {
    next('/')
  } else {
    next()
  }
})

export default router
