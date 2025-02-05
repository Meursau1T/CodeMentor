<template>
    <t-head-menu class="header" v-model="activeValue" theme="light">
        <template #logo>
            <img class="logo" height="28" src="https://tdesign.gtimg.com/site/baseLogo-light.png" alt="logo" />
        </template>
        <t-menu-item value="main" to="/" active="true"> 首页 </t-menu-item>
        <t-menu-item value="course" to="/course"> 课程 </t-menu-item>
        <t-menu-item value="question" to="/question"> 题库 </t-menu-item>
        <t-avatar class="user-avatar" :icon="icon" />
    </t-head-menu>
</template>


<script setup>
import { ref } from 'vue';

const activeValue = ref('main');

</script>

<style scoped>
.header {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    background-color: #ffffff;
}

.menu-item {
    font-size: 24px;
    font-weight: bold;
}

.menu {
    display: flex;
    gap: 20px;
}

.header /deep/ .t-head-menu__inner {
    flex-grow: 1;
}

.header .t-menu__item {
    color: #A6A6A6;
    width: 70px;
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
        margin-top: 30px;
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
    width: 137px;
}
</style>