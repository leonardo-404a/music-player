<template>
    <div>
      <h2>Pastas de música:</h2>
      <ul>
          <li v-for="(folder, index) in selectedFolders" :key="index">
              {{ folder }}
              <button class="remove-button" @click="removeFolder(folder)">✕</button>
            </li>
        </ul>
        <button @click="selectFolder">Adicionar Pasta</button>
    </div>
</template>
  
<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  
  const selectedFolders = ref<Set<string>>(new Set<string>());
  
  const selectFolder = async () => {
    if (window.api && window.api.selectFolder) {
      const result = await window.api.selectFolder();
  
      if (!result.canceled && result.filePaths.length > 0) {
        selectedFolders.value.add(result.filePaths[0]);
        updateLocalStorage();
      }
    } else {
      console.error('API not available');
    }
  };
  
  const removeFolder = async (folder: string) => {
    selectedFolders.value.delete(folder);
    await updateLocalStorage();
  };
  
  const updateLocalStorage = async () => {
    await window.api.updateSelectedFolders(Array.from(selectedFolders.value));
  };
  
  const loadFolders = async () => {
    const storedFolders = await window.api.getSelectedFolders();
    if (storedFolders) {
      selectedFolders.value = new Set(storedFolders);
    }
  };

   onMounted(async () => {
    await loadFolders();
  });
  </script>
  
  <style scoped>
  body {
    background-color: #121212;
    color: #e0e0e0;
  }
  
  button {
    cursor: pointer;
    padding: 8px 12px;
    margin: 8px 0;
    background-color: #3f51b5;
    border: none;
    border-radius: 4px;
    color: white;
    transition: background-color 0.3s;
  }
  
  button:hover {
    background-color: #303f9f;
  }
  
  ul {
    list-style-type: none;
    padding: 0;
  }
  
  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px; 
    margin: 4px 0;
    background-color: #1e1e1e; 
    border-radius: 4px;
    transition: background-color 0.3s; 
  }
  
  li:hover {
    background-color: #2e2e2e;
  }
  
  .remove-button {
    background: none;
    border: none;
    color: #ff5252;
    font-size: 16px;
    padding: 0;
    margin-left: 10px;
    cursor: pointer;
    transition: color 0.3s;
  }
  
  .remove-button:hover {
    color: #ff1744;
  }
  </style>
  