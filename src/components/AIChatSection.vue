<script setup>
import { ref, nextTick } from 'vue'
import ChatDialog from './ChatDialog.vue'

// AI Chat section data
const sectionData = ref({
  title: '我是SoDesign.AI，欢迎来挑战我！',
  subtitle: '工业设计智能创造引擎'
})

// Chat state
const chatInput = ref('')
const selectedButtons = ref(new Set())

// Chat button actions - 使用内联SVG图标
const chatActions = ref([
  {
    action: 'settings',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDhWMTJMMTUgMTVNMjEgMTJDMjEgMTYuOTcwNiAxNi45NzA2IDIxIDEyIDIxQzcuMDI5NDQgMjEgMyAxNi45NzA2IDMgMTJDMyA3LjAyOTQ0IDcuMDI5NDQgMyAxMiAzQzE2Ljk3MDYgMyAyMSA3LjAyOTQ0IDIxIDEyWiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=',
    alt: 'Settings'
  },
  {
    action: 'network',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==',
    alt: 'Network'
  },
  {
    action: 'files',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEzIDJINkE0IDQgMCAwIDAgMiA2VjE4QTQgNCAwIDAgMCA2IDIySDE4QTQgNCAwIDAgMCAyMiAxOFY5TDEzIDJaIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTEzIDJWOUgyMCIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=',
    alt: 'Files'
  },
  {
    action: 'send',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyIDJMMTEgMTNNMjIgMkwyIDlMMTEgMTNNMjIgMkwxMSAxM1YxOUw3IDE1IiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==',
    alt: 'Send'
  }
])

// Event handlers
const handleChatInput = (value) => {
  chatInput.value = value
}

const handleButtonAction = (action, isSelected) => {
  if (action === 'send') {
    handleSendMessage()
    return
  }
  
  if (isSelected) {
    selectedButtons.value.add(action)
  } else {
    selectedButtons.value.delete(action)
  }
  
  console.log(`${action} ${isSelected ? 'enabled' : 'disabled'}`)
  console.log('Selected buttons:', Array.from(selectedButtons.value))
}

const handleSendMessage = () => {
  if (chatInput.value.trim()) {
    console.log('Sending message:', chatInput.value)
    console.log('With selected options:', Array.from(selectedButtons.value))
    
    // Clear input after sending
    chatInput.value = ''
    
    // Here you would typically send the message to your AI service
    // For now, we'll just log it
  }
}

const clearSelection = () => {
  selectedButtons.value.clear()
}
</script>

<template>
  <section id="ai-chat" class="content-section">
    <div class="section-container">
      <div class="ai-chat-content">
        <h2 class="ai-chat-title">{{ sectionData.title }}</h2>
        <p class="ai-chat-subtitle">{{ sectionData.subtitle }}</p>

        <!-- Chat Dialog Box -->
        <ChatDialog
          :input-value="chatInput"
          :actions="chatActions"
          :selected-buttons="selectedButtons"
          @input-change="handleChatInput"
          @button-action="handleButtonAction"
          @send-message="handleSendMessage"
          @clear-selection="clearSelection"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* AI Chat Section */
#ai-chat {
    min-height: 100vh;
    display: flex;
    align-items: center;
    position: relative;
    background: url('https://s3.20250131.xyz/gh/usst-502s/welcome/2025/7/1753016719127-693.png') center center/cover no-repeat;
    overflow: hidden;
}

/* Background image optimization for AI Chat section (1536x1024) */
@media (min-width: 1536px) {
    #ai-chat {
        background-size: contain;
        background-repeat: no-repeat;
        background-color: #f0f0f0;
    }
}

#ai-chat .section-container {
    position: relative;
    z-index: 2;
    max-width: none;
    padding: 0;
}

.ai-chat-content {
    max-width: none;
    margin: 0;
    text-align: center;
    padding: 0 2rem;
}

.ai-chat-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--text-primary);
}

.ai-chat-subtitle {
    font-size: 1.25rem;
    color: var(--text-secondary);
    margin-bottom: 3rem;
    font-weight: 400;
}

/* Mobile Chat Dialog Adjustments */
@media (max-width: 768px) {
    .ai-chat-title {
        font-size: 1.75rem;
    }

    .ai-chat-subtitle {
        font-size: 1rem;
        margin-bottom: 2rem;
    }

    .ai-chat-content {
        padding: 0 1rem;
    }
}
</style>
