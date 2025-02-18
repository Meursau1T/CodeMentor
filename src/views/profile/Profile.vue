<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeMenu = ref('info');

const handleMenuChange = (value: string) => {
  activeMenu.value = value;
  router.push(`/profile/${value}`);
};
</script>

<template>
  <div class="profile-container">
    <t-layout>
      <t-aside width="200px">
        <t-menu
          v-model="activeMenu"
          theme="light"
          @change="handleMenuChange"
        >
          <t-menu-item value="info">个人信息</t-menu-item>
          <t-menu-item value="history">作答历史</t-menu-item>
        </t-menu>
      </t-aside>
      <t-layout>
        <t-content>
          <router-view></router-view>
        </t-content>
      </t-layout>
    </t-layout>
  </div>
</template>

<style scoped>
.profile-container {
  height: calc(100vh - 60px);
  background-color: #f3f4f6;
}

:deep(.t-layout) {
  height: 100%;
}

:deep(.t-layout__sider) {
  background-color: white;
  border-right: 1px solid #e5e7eb;
  height: 100%;
}

:deep(.t-layout__content) {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}
</style> 