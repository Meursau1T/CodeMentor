<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useUserInfoStore } from '../stores/userInfo'
import { useRoute, useRouter } from 'vue-router';
import { ROUTE_NAME } from '../constants';

const route = useRoute();
const activeValue = ref<string | symbol>("main");
const userStore = useUserInfoStore();
const router = useRouter();

const menuItems = computed(() => {
  console.log('Current user role:', userStore.userInfo?.role);
  
  if (userStore.userInfo?.role === 'admin') {
    console.log('Showing teacher menu');
    return [
      { value: ROUTE_NAME.TEACHER_DASHBOARD, label: '教师端', to: '/teacher-dashboard' }
    ];
  }
  console.log('Showing student menu');
  return [
    { value: ROUTE_NAME.MAIN, label: '首页', to: '/' },
    { value: ROUTE_NAME.COURSE, label: '课程', to: '/course' },
    { value: ROUTE_NAME.QUESTION, label: '题库', to: '/question' },
    { value: ROUTE_NAME.AIMENTOR, label: 'AI导师', to: '/ai-mentor' }
  ];
});

const handleLogout = () => {
  // 清除 store 中的用户信息
  userStore.logout();
};

const handleDropdownClick = (data: { value: string }) => {  
  if (data.value === 'logout') {
    handleLogout();
  } else if (data.value === 'profile') {
    router.push('/profile/info');
  }
};

// 监听路由变化,更新activeValue
watch(
  () => route.name,
  (newRouteName) => {
    if (newRouteName) {
      activeValue.value = newRouteName;
    }
  },
  { immediate: true }
);

</script>

<template>
    <t-head-menu class="header" v-model="activeValue" theme="light">
        <template #logo>
            <img class="logo" height="28" src="@/assets/szu.png" alt="logo" />
        </template>
        <t-menu-item 
          v-for="item in menuItems" 
          :key="item.value"
          :value="item.value" 
          :to="item.to" 
          :disabled="!userStore.isLogin()"
        >
          {{ item.label }}
        </t-menu-item>
        <t-dropdown 
          :options="[
            { content: '个人主页', value: 'profile' },
            { content: '退出登录', value: 'logout' }
          ]" 
          @click="handleDropdownClick"
          :disabled="!userStore.isLogin()"
        >
          <t-avatar class="user-avatar" v-if="userStore.isLogin()">
            {{ userStore.userInfo.name }}
          </t-avatar>
        </t-dropdown>
    </t-head-menu>
</template>


<style scoped>
.header {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    background-color: #ffffff;

    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.menu-item {
    font-size: 24px;
    font-weight: bold;
}

.menu {
    display: flex;
    gap: 20px;
}

.header :deep(.t-head-menu__inner) {
    flex-grow: 1;
    height: var(--td-comp-size-xxl)
}

.header .t-menu__item {
    color: #A6A6A6;
    width: 90px;
    font-size: 18px;
    height: var(--td-comp-size-xxl)
}

/** 关闭点击时的背景色 */
.header :deep(.t-menu__item div) {
    display: none !important;
}

.header .t-menu__item.t-is-active {
    color: #2A82E4;
    background-color: unset;

    &::after {
        content: "";
        display: block;
        position: absolute;
        width: 100%;
        height: 2px;
        background-color: #2A82E4;
        margin-top: 68px;
        transition: opacity 0.3s ease;
    }
}

.header .t-menu__item:hover:not(.t-is-active):not(.t-is-opened):not(.t-is-disabled):not(:has(.router-link-exact-active)) {
    color: #000000;
}

.header .t-menu__item:hover:not(.t-is-active):not(.t-is-opened):not(.t-is-disabled) {
    background-color: unset;
}

.user-avatar {
    cursor: pointer;
    margin-left: auto;
}

.logo {
    width: 170px;
    height: fit-content;
}
</style>