<script setup>
import { ref, provide, onMounted } from 'vue'
import TheNavbar from './components/TheNavbar.vue'

// Global state
const currentTheme = ref('light')
const isLoading = ref(false)

// Initialize theme from localStorage
onMounted(() => {
  const savedTheme = localStorage.getItem('sodesign-theme')
  if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
    currentTheme.value = savedTheme
  }
})

// Provide global state to child components
provide('theme', currentTheme)
provide('loading', isLoading)

// Global methods
const setTheme = (theme) => {
  currentTheme.value = theme
  localStorage.setItem('sodesign-theme', theme)
}

const setLoading = (loading) => {
  isLoading.value = loading
}

provide('setTheme', setTheme)
provide('setLoading', setLoading)
</script>

<template>
  <div id="app" :data-theme="currentTheme">
    <!-- Navigation Header -->
    <TheNavbar />

    <!-- Router View - 路由内容将在这里渲染 -->
    <router-view />
  </div>
</template>

<style>
/* App-specific styles */
#app {
  min-height: 100vh;
}
</style>
