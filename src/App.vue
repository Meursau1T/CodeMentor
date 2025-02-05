<script setup lang="ts">
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'


</script>

<template>
  <Header />
  <RouterView />
</template>

<style>
#app {
  width: 100vw;
  height: 100vh;
  align-items: start;
}
</style>
