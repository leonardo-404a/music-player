<template>
    <div class="music-list-container">
      <h1>Músicas</h1>
      <button @click="refreshMusicList">Atualizar Lista de Músicas</button>
      <div v-if="isLoading">Buscando músicas...</div>
      <div v-else-if="folderTrees.length === 0">Nenhuma música encontrada.</div>
      <div v-else>
        <FolderTree v-for="(tree, index) in folderTrees" :key="index" :nodes="[tree]" @play="playMusic" />
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import FolderTree from './FolderTree.vue';
  
  export default {
    components: {
      FolderTree,
    },
    emits: ['play'],
    setup(props, { emit }) {
      const folderTrees = ref([]);
      const isLoading = ref(false);
  
      const getBasename = (filePath) => {
        return filePath.split(/[/\\]/).pop()
      };
  
      const getRelativePath = (base, filePath) => {
        return filePath.substring(base.length).replace(/^[\\/]/, '');
      };
      const buildFolderTree = (folders, files) => {
  const trees = [];

  folders.forEach(folder => {
    const treeRoot = {
      name: getBasename(folder),
      type: 'folder',
      isOpen: false,
      children: [],
    };

    const relevantFiles = files.filter(file => file.startsWith(folder));
    const relativeFiles = relevantFiles.map(file => getRelativePath(folder, file));

    relativeFiles.forEach(relativePath => {
      const parts = relativePath.split(/[/\\]/);
      let currentLevel = treeRoot;

      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          const fullPath = pathJoin(folder, relativePath);
          currentLevel.children.push({
            name: part.replace('.mp3', ''),
            path: fullPath,
            type: 'file',
          });
        } else {
          let existingFolder = currentLevel.children.find(child => child.name === part && child.type === 'folder');
          if (!existingFolder) {
            existingFolder = {
              name: part,
              type: 'folder',
              isOpen: false,
              children: [],
            };
            currentLevel.children.push(existingFolder);
          }
          currentLevel = existingFolder;
        }
      });
    });

    trees.push(treeRoot);
  });

  return trees;
};
  
      const pathJoin = (base, relative) => {
        return base.endsWith('/') || base.endsWith('\\') ? `${base}${relative}` : `${base}/${relative}`;
      };
  
      const fetchMusicFiles = async () => {
        try {
          isLoading.value = true;
          const folders = await window.api.getSelectedFolders();
          if (folders.length === 0) {
            alert('Nenhuma pasta selecionada. Por favor, selecione uma pasta nas configurações.');
            isLoading.value = false;
            return;
          }
          const files = await window.api.deepSearchMusicFiles(folders);
          folderTrees.value = buildFolderTree(folders, files);
        } catch (error) {
          console.error('Erro ao buscar arquivos MP3:', error);
          alert('Ocorreu um erro ao buscar as músicas.');
        } finally {
          isLoading.value = false;
        }
      };
  
      const playMusic = async (filePath) => {
        try {
        const dataURL = await window.api.readFileAsDataURL(filePath);

        emit('play', {
          name: getBasename(filePath),
          dataURL: dataURL,
        });
      } catch (error) {
        console.error('Erro ao reproduzir a música:', error);
        alert('Ocorreu um erro ao tentar reproduzir a música.');
      }
    };

      const refreshMusicList = () => {
        fetchMusicFiles();
      };
  
      onMounted(() => {
        fetchMusicFiles();
      });
  
      return {
        folderTrees,
        playMusic,
        refreshMusicList,
        isLoading,
      };
    },
  };
  </script>
  
  <style scoped>
  .music-list-container {
    background-color: #121212;
    padding: 16px;
    border-radius: 8px;
    color: #ffffff;
  }
  
  button {
    cursor: pointer;
    padding: 8px 12px;
    margin-bottom: 16px;
    background-color: #3f51b5;
    border: none;
    border-radius: 4px;
    color: white;
    transition: background-color 0.3s;
  }
  
  button:hover {
    background-color: #303f9f;
  }
  
  h1 {
    color: #ffffff;
    margin-bottom: 16px;
  }
  </style>
  