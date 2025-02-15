import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../views/MainPage.vue'
import Course from '../views/Course.vue'
import QuestionBank from '../views/QuestionBank.vue'
import AIMentor from '../views/AIMentor.vue'
import Login from '../views/Login.vue'
import { useUserInfoStore } from '../stores/userInfo'
import Cookies from 'js-cookie'
import { ROUTE_NAME, ROUTE_PATH } from '../constants'

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
      path: ROUTE_PATH.AIMENTOR,
      name: ROUTE_NAME.AIMENTOR,
      component: AIMentor,
      meta: { requiresAuth: true }
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
