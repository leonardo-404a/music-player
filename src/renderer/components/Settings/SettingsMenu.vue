<template>
    <div>
      <h2>Configurações</h2>
      <FolderSelector />
    </div>
    <button class="back-button" @click="openMainScreen">Voltar</button>
</template>

<script setup lang="ts">
  import FolderSelector from './FolderSelector.vue' 

    const openMainScreen = () => {
        window.dispatchEvent(new CustomEvent('navigate', { detail: 'main' }));
    };
</script>
  
<style scoped>
    .back-button {
        margin-top: 1em;
    }
</style>
  