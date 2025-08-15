<script setup>
import { ref, nextTick } from 'vue'

// Props
const props = defineProps({
  inputValue: {
    type: String,
    default: ''
  },
  actions: {
    type: Array,
    default: () => []
  },
  selectedButtons: {
    type: Set,
    default: () => new Set()
  }
})

// Emits
const emit = defineEmits(['input-change', 'button-action', 'send-message', 'clear-selection'])

// Local state
const chatInputRef = ref(null)
const pressedButtons = ref(new Set())

// Input handlers
const handleInput = (event) => {
  const value = event.target.value
  emit('input-change', value)
  autoResize(event.target)
}

const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    if (event.shiftKey) {
      // Shift+Enter sends message
      event.preventDefault()
      emit('send-message')
    }
    // Regular Enter allows line break (default behavior)
  }
}

// Auto resize textarea
const autoResize = (textarea) => {
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
}

// Button handlers
const handleButtonClick = (action) => {
  if (action === 'send') {
    emit('send-message')
    return
  }
  
  const isCurrentlySelected = props.selectedButtons.has(action)
  emit('button-action', action, !isCurrentlySelected)
}

const handleButtonPress = (action) => {
  pressedButtons.value.add(action)
}

const handleButtonRelease = (action) => {
  pressedButtons.value.delete(action)
}

// Touch event handlers for mobile
const handleTouchStart = (event, action) => {
  event.preventDefault()
  handleButtonPress(action)
}

const handleTouchEnd = (event, action) => {
  event.preventDefault()
  handleButtonRelease(action)
  handleButtonClick(action)
}
</script>

<template>
  <div class="chat-dialog">
    <div class="chat-input-container">
      <textarea 
        ref="chatInputRef"
        class="chat-input" 
        placeholder="询问任何问题"
        rows="3"
        :value="inputValue"
        @input="handleInput"
        @keydown="handleKeydown"
      ></textarea>
      
      <div class="chat-actions">
        <div class="chat-actions-left">
          <button 
            v-for="action in actions.slice(0, 2)" 
            :key="action.action"
            class="chat-action-btn"
            :class="{ 
              pressed: pressedButtons.has(action.action),
              active: selectedButtons.has(action.action)
            }"
            :data-action="action.action"
            :aria-label="action.alt"
            @click="handleButtonClick(action.action)"
            @mousedown="handleButtonPress(action.action)"
            @mouseup="handleButtonRelease(action.action)"
            @mouseleave="handleButtonRelease(action.action)"
            @touchstart="handleTouchStart($event, action.action)"
            @touchend="handleTouchEnd($event, action.action)"
          >
            <img
              :src="action.icon"
              :alt="action.alt" 
              class="action-icon"
            >
          </button>
        </div>
        
        <div class="chat-actions-right">
          <button 
            v-for="action in actions.slice(2)" 
            :key="action.action"
            class="chat-action-btn"
            :class="{ 
              pressed: pressedButtons.has(action.action),
              active: selectedButtons.has(action.action) && action.action !== 'send'
            }"
            :data-action="action.action"
            :aria-label="action.alt"
            @click="handleButtonClick(action.action)"
            @mousedown="handleButtonPress(action.action)"
            @mouseup="handleButtonRelease(action.action)"
            @mouseleave="handleButtonRelease(action.action)"
            @touchstart="handleTouchStart($event, action.action)"
            @touchend="handleTouchEnd($event, action.action)"
          >
            <img
              :src="action.icon"
              :alt="action.alt" 
              class="action-icon"
            >
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Chat Dialog Box */
.chat-dialog {
    position: relative;
    width: 100%;
    max-width: none;
    margin: 0 auto;
    padding: 0;
    perspective: 1000px;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Desktop dialog styles */
@media (min-width: 769px) {
    .chat-dialog .chat-input-container {
        width: 1000px;
        max-width: 80vw;
    }
}

/* Mobile dialog styles */
@media (max-width: 768px) {
    .chat-dialog .chat-input-container {
        width: 90%;
        max-width: 90%;
    }
}

.chat-input-container {
    background: #ffffff;
    border-radius: 33px;
    padding: 2rem;
    min-height: 180px;
    box-shadow:
        0 20px 40px rgba(0, 0, 0, 0.1),
        0 10px 20px rgba(0, 0, 0, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    transform: translateZ(0) rotateX(2deg);
    transition: all 0.3s ease;
    position: relative;
    border: 2px solid rgba(0, 0, 0, 0.05);
}

.chat-input-container:hover {
    transform: translateZ(10px) rotateX(1deg) translateY(-5px);
    box-shadow:
        0 30px 60px rgba(0, 0, 0, 0.15),
        0 15px 30px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.chat-input-container::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0.05));
    border-radius: 40px;
    z-index: -1;
}

/* Chat Input Field */
.chat-input {
    width: 100%;
    border: none;
    outline: none;
    font-size: 1.1rem;
    color: var(--text-primary);
    background: transparent;
    padding: 1rem 0;
    font-family: 'Noto Serif', serif;
    resize: none;
    min-height: 80px;
    max-height: 200px;
    line-height: 1.5;
    overflow-y: auto;
}

.chat-input::placeholder {
    color: #adb5bd;
    font-weight: 400;
}

.chat-input:focus {
    outline: none;
}

/* Chat Action Buttons */
.chat-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.chat-actions-left {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.chat-actions-right {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.chat-action-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    min-height: 40px;
}

.chat-action-btn:hover {
    background: rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
}

.chat-action-btn:active,
.chat-action-btn.pressed {
    background: rgba(0, 0, 0, 0.1);
    transform: translateY(1px);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.chat-action-btn.active {
    background: var(--accent-color);
    box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
    transform: translateY(-2px);
}

.chat-action-btn.active .action-icon {
    filter: brightness(0) saturate(100%);
}

.action-icon {
    width: 20px;
    height: 20px;
    transition: all 0.2s ease;
    opacity: 0.7;
}

.chat-action-btn:hover .action-icon {
    opacity: 1;
    transform: scale(1.05);
}

/* Mobile Chat Dialog Adjustments */
@media (max-width: 768px) {
    .chat-input-container {
        padding: 1.5rem;
        min-height: 160px;
        border-radius: 25px;
    }

    .chat-input {
        min-height: 60px;
        font-size: 1rem;
        padding: 0.75rem 0;
    }

    .chat-actions {
        flex-direction: column;
        gap: 1rem;
        margin-top: 0.75rem;
        padding-top: 0.75rem;
    }

    .chat-actions-left {
        gap: 0.5rem;
        justify-content: center;
        order: 2;
    }

    .chat-actions-right {
        gap: 0.25rem;
        justify-content: center;
        order: 1;
        width: 100%;
    }

    .chat-action-btn {
        min-width: 36px;
        min-height: 36px;
        padding: 0.4rem;
    }

    .action-icon {
        width: 18px;
        height: 18px;
    }

    /* Make send button full width on mobile */
    .chat-actions-right .chat-action-btn[data-action="send"] {
        width: 100%;
        min-width: auto;
        padding: 0.75rem 1.5rem;
        border-radius: 25px;
        background: var(--accent-color);
        color: #000;
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
    }

    .chat-actions-right .chat-action-btn[data-action="send"]:hover {
        background: #e6ac00;
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(255, 193, 7, 0.4);
    }

    .chat-actions-right .chat-action-btn[data-action="send"] .action-icon {
        width: 20px;
        height: 20px;
    }

    /* Improve touch targets for mobile */
    .chat-action-btn {
        min-width: 44px;
        min-height: 44px;
        touch-action: manipulation;
    }

    /* Better spacing for mobile */
    .chat-input-container {
        margin: 0 auto;
        width: 95%;
        max-width: 95%;
    }
}

/* Extra small devices optimization */
@media (max-width: 480px) {
    .chat-input-container {
        padding: 1.25rem;
        min-height: 140px;
        border-radius: 20px;
    }

    .chat-input {
        min-height: 50px;
        font-size: 0.95rem;
    }

    .chat-actions-left {
        gap: 0.4rem;
    }

    .chat-action-btn {
        min-width: 40px;
        min-height: 40px;
        padding: 0.35rem;
    }

    .action-icon {
        width: 16px;
        height: 16px;
    }
}
</style>
