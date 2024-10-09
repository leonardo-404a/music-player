<template>
    <ul>
      <li v-for="(node, index) in nodes" :key="index">
        <div v-if="node.type === 'folder'" class="folder" @click="toggle(node)">
          <span :class="['caret', { 'caret-down': node.isOpen }]">
            {{ node.isOpen ? '▼' : '▶' }}
          </span>
          <span class="folder-icon">{{ node.isOpen ? '📂' : '📁' }}</span>
          {{ node.name }}
        </div>
        <FolderTree
          v-if="node.type === 'folder' && node.isOpen"
          :nodes="node.children"
          @play="play"
        />
        <div
          v-else-if="node.type === 'file'"
          class="file"
          @click="play(node.path)"
        >
          🎵 {{ node.name }}
        </div>
      </li>
    </ul>
  </template>
  
  <script>
  export default {
    name: 'FolderTree',
    props: {
      nodes: {
        type: Array,
        required: true,
      },
    },
    emits: ['play'],
    created() {
    },
    methods: {
      toggle(node) {
        node.isOpen = !node.isOpen;
      },
      play(filePath) {
        this.$emit('play', filePath);
      },
    },
  };
  </script>
  
  <style scoped>
  ul {
    list-style-type: none;
    padding-left: 20px;
    margin: 0;
  }
  
  li {
    margin: 4px 0;
  }
  
  .folder,
  .file {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s;
  }
  
  .folder:hover,
  .file:hover {
    background-color: #2e2e2e;
  }
  
  .caret {
    width: 20px;
    display: inline-block;
    transition: transform 0.3s;
  }
  
  .folder-icon {
    margin-right: 8px;
  }
  
  .file {
    padding-left: 28px;
  }
  </style>
  