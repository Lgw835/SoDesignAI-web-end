<script setup>
import { ref } from 'vue'
import ChatDialog from './ChatDialog.vue'

// 3D Generation section data
const sectionData = ref({
  title: '一键生成任何 3D 内容',
  subtitle: '工业设计智能创造引擎'
})

// Generation state
const generationInput = ref('')
const selectedButtons = ref(new Set())

// Chat actions (similar to ChatDialog format)
const chatActions = ref([
  {
    action: 'upload-image',
    icon: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIi8+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiLz48cG9seWxpbmUgcG9pbnRzPSIyMSwxNSAxNiwxMCA1LDIxIi8+PC9zdmc+',
    alt: 'Upload Image'
  },
  {
    action: 'settings',
    icon: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjMiLz48cGF0aCBkPSJtMTIgMSAwIDZtMCA2IDAgNiIvPjxwYXRoIGQ9Im0xNy41IDYuNS0zIDNtLTYgNi0zIDMiLz48cGF0aCBkPSJtNi41IDYuNSAzIDNtNiA2IDMgMyIvPjwvc3ZnPg==',
    alt: 'Settings'
  },
  {
    action: 'hd-texture',
    icon: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiPjxyZWN0IHg9IjIiIHk9IjMiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxNCIgcng9IjIiIHJ5PSIyIi8+PGxpbmUgeDE9IjgiIHkxPSIyMSIgeDI9IjE2IiB5Mj0iMjEiLz48bGluZSB4MT0iMTIiIHkxPSIxNyIgeDI9IjEyIiB5Mj0iMjEiLz48L3N2Zz4=',
    alt: 'HD Texture'
  },
  {
    action: 'send',
    icon: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiPjxsaW5lIHgxPSIyMiIgeTE9IjIiIHgyPSIxMSIgeTI9IjEzIi8+PHBvbHlnb24gcG9pbnRzPSIyMiwyIDEzLDIxIDExLDEzIDMsOSIvPjwvc3ZnPg==',
    alt: 'Generate'
  }
])

// Event handlers
const handleGenerationInput = (value) => {
  generationInput.value = value
}

const handleButtonAction = (action, isSelected) => {
  if (isSelected) {
    selectedButtons.value.add(action)
  } else {
    selectedButtons.value.delete(action)
  }

  switch(action) {
    case 'upload-image':
      handleImageUpload()
      break
    case 'settings':
      handleSettings()
      break
    case 'hd-texture':
      console.log('HD Texture:', isSelected ? 'enabled' : 'disabled')
      break
  }
}

const handleImageUpload = () => {
  console.log('打开图片上传')
  
  // Create file input element
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = 'image/*'
  fileInput.style.display = 'none'

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (file) {
      console.log('选择的图片:', file.name)
      // Add image processing logic here
    }
  })

  document.body.appendChild(fileInput)
  fileInput.click()
  document.body.removeChild(fileInput)
}

const handleSettings = () => {
  console.log('打开设置')
  alert('设置功能开发中...')
}

const handleSendMessage = () => {
  if (!generationInput.value.trim()) {
    alert('请输入描述内容')
    return
  }

  const generationConfig = {
    description: generationInput.value,
    hdTexture: selectedButtons.value.has('hd-texture')
  }

  console.log('开始生成 3D 内容:', generationConfig)
  simulate3DGeneration(generationConfig)
}

const handleClearSelection = () => {
  selectedButtons.value.clear()
}

const simulate3DGeneration = (config) => {
  // Simulate generation time
  setTimeout(() => {
    console.log('3D 内容生成完成!')
    alert('3D 内容生成完成！')

    // Clear input after generation
    generationInput.value = ''
    selectedButtons.value.clear()
  }, 3000)
}
</script>

<template>
  <section id="generation-3d" class="content-section">
    <div class="section-container">
      <div class="generation-3d-content">
        <h2 class="generation-3d-title">{{ sectionData.title }}</h2>
        <p class="generation-3d-subtitle">{{ sectionData.subtitle }}</p>

        <!-- 3D Generation Input Box -->
        <ChatDialog
          :input-value="generationInput"
          :actions="chatActions"
          :selected-buttons="selectedButtons"
          @input-change="handleGenerationInput"
          @button-action="handleButtonAction"
          @send-message="handleSendMessage"
          @clear-selection="handleClearSelection"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 3D Generation Section */
#generation-3d {
    min-height: 100vh !important;
    display: flex !important;
    align-items: center !important;
    position: relative !important;
    background: url('https://s3.20250131.xyz/gh/usst-502s/welcome/2025/7/1753176501331-478.png') center center/cover no-repeat !important;
    overflow: hidden !important;
}

/* Background image optimization for 3D Generation section (1536x1024) */
@media (min-width: 1536px) {
    #generation-3d {
        background-size: contain !important;
        background-repeat: no-repeat !important;
        background-color: #f0f0f0 !important;
    }
}

#generation-3d .section-container {
    position: relative;
    z-index: 2;
    max-width: none;
    padding: 0;
}

/* 3D Generation Content Styles */
.generation-3d-content {
    max-width: none;
    margin: 0;
    text-align: center;
    padding: 0 2rem;
}

.generation-3d-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--text-primary);
}

.generation-3d-subtitle {
    font-size: 1.25rem;
    color: var(--text-secondary);
    margin-bottom: 3rem;
    font-weight: 400;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
    #generation-3d {
        min-height: 100vh !important;
        padding: 2rem 0 !important;
        background-position: center center !important;
        background-size: cover !important;
    }

    .generation-3d-title {
        font-size: 1.75rem;
        margin-bottom: 0.75rem;
        line-height: 1.3;
    }

    .generation-3d-subtitle {
        font-size: 0.95rem;
        margin-bottom: 1.5rem;
        line-height: 1.4;
    }

    .generation-3d-content {
        padding: 0 1rem;
        max-width: 100%;
    }

    #generation-3d .section-container {
        padding: 1rem 0;
    }
}

/* Extra small mobile devices */
@media (max-width: 480px) {
    .generation-3d-title {
        font-size: 1.5rem;
    }

    .generation-3d-subtitle {
        font-size: 0.9rem;
    }

    .generation-3d-content {
        padding: 0 0.75rem;
    }
}
</style>
