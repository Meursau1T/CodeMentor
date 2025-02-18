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
      path: '/question/coding/:id',
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
    }
  ],
})

router.beforeEach((to, from, next) => {
  const userStore = useUserInfoStore()
  const userInfo = Cookies.get('userInfo')
  if (userInfo) {
    userStore.setUserInfo(JSON.parse(userInfo))
  }

  if (to.meta.requiresAuth && !userStore.isLogin()) {
    next('/login')
  } else {
    next()
  }
})

export default router
