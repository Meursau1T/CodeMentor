<script setup>
import { ref, watch } from 'vue';
import { useUserInfoStore } from '../stores/userInfo'
import { useRoute } from 'vue-router';
import { ROUTE_NAME } from '../constants';

const route = useRoute();
const activeValue = ref("main");
const userStore = useUserInfoStore();

const handleLogout = () => {
  // 清除 store 中的用户信息
  userStore.logout();
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
            <img class="logo" height="28" src="https://lf3-static.bytednsdoc.com/obj/eden-cn/medeh7bmupenuhd/szu.png" alt="logo" />
        </template>
        <t-menu-item :value="ROUTE_NAME.MAIN" to="/" active="true" :disabled="!userStore.isLogin()"> 首页 </t-menu-item>
        <t-menu-item :value="ROUTE_NAME.COURSE" to="/course" :disabled="!userStore.isLogin()"> 课程 </t-menu-item>
        <t-menu-item :value="ROUTE_NAME.QUESTION" to="/question" :disabled="!userStore.isLogin()"> 题库 </t-menu-item>
        <t-dropdown :options="[{ content: '退出登录', value: 'logout' }]" @click="handleLogout" :disabled="!userStore.isLogin()">
            <t-avatar class="user-avatar" v-if="userStore.isLogin()">{{ userStore.userInfo.name }}</t-avatar>
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
    width: 70px;
    font-size: medium;
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
    width: 116px;
}
</style>