import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../views/MainPage.vue'
import Course from '../views/Course.vue'
import QuestionBank from '../views/QuestionBank.vue'
import Login from '../views/Login.vue'
import { useUserInfoStore } from '../stores/userInfo'
import Cookies from 'js-cookie'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/',
      name: 'main',
      component: MainPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/course',
      name: 'course',
      component: Course,
      meta: { requiresAuth: true }
    },
    {
      path: '/question',
      name: 'question',
      component: QuestionBank,
      meta: { requiresAuth: true }
    },
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
