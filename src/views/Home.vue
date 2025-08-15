<script setup>
import { ref } from 'vue'
import TheHero from '../components/TheHero.vue'
import WebUISection from '../components/WebUISection.vue'
import AIChatSection from '../components/AIChatSection.vue'
import Generation3DSection from '../components/Generation3DSection.vue'
import ModeLIBSection from '../components/ModeLIBSection.vue'

// 页面标题
document.title = 'SoDesign.AI - Industrial Design Intelligent Creation Engine'
</script>

<template>
  <main>
    <!-- Hero Section -->
    <TheHero />
    
    <!-- WebUI Section -->
    <WebUISection />
    
    <!-- AI Chat Section -->
    <AIChatSection />
    
    <!-- 3D Generation Section -->
    <Generation3DSection />
    
    <!-- ModeLIB Section -->
    <ModeLIBSection />
  </main>
</template>

<style scoped>
main {
  margin-top: 0;
}
</style>
