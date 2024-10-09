<template>
    <div>
      <button class="settings-button" @click="openSettings">Abrir Configurações</button>
      <Library class="library-list" @play="currentTrack = $event" />
    </div>
    <footer>
      <Player :currentTrack="currentTrack" />
    </footer>
  </template>
  
  <script setup lang="ts">
    import { ref } from 'vue';
    import Library from './Music/Library.vue';
    import Player from './Music/Player.vue';
    
    const openSettings = () => {
        window.dispatchEvent(new CustomEvent('navigate', { detail: 'settings' }));
    };
  
    let currentTrack = ref({ name: '', dataURL: '' });
  </script>
  
<style scoped>
    footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: #121212;
      padding: 1em;
      display: flex;
      justify-content: center;
    }
  
    .settings-button {
      margin-bottom: 2em;
    }

    .library-list {
      margin-bottom: 5em;
    }
</style>
  