<template>
  <div>
    <MainScreen v-if="currentScreen === 'main'" @openSettings="openSettingsMenu" />
    <SettingsMenu v-else />
</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import MainScreen from './components/MainScreen.vue';
import SettingsMenu from './components/Settings/SettingsMenu.vue';

const currentScreen = ref('main');

const openSettingsMenu = () => {
  currentScreen.value = 'settings';
};

onMounted(() => {
  window.addEventListener('navigate', (event: any) => {
    currentScreen.value = event.detail;
  });
});
</script>

<style scoped>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
  }
</style>
