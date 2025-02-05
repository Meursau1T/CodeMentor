import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../views/MainPage.vue'
import Course from '../views/Course.vue'
import QuestionBank from '../views/QuestionBank.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: MainPage,
    },
    {
      path: '/course',
      name: 'course',
      component: Course,
    },
    {
      path: '/question',
      name: 'question',
      component: QuestionBank,
    },
  ],
})

export default router
