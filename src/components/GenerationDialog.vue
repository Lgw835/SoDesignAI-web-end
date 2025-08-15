<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  inputValue: {
    type: String,
    default: ''
  },
  hdTextureEnabled: {
    type: Boolean,
    default: false
  },
  controlActions: {
    type: Array,
    default: () => []
  },
  isGenerating: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['input-change', 'hd-texture-toggle', 'control-action', 'start-generation'])

// Local state
const generationInputRef = ref(null)

// Computed
const buttonText = computed(() => {
  return props.isGenerating ? '生成中...' : '开始生成'
})

// Input handlers
const handleInput = (event) => {
  const value = event.target.value
  emit('input-change', value)
  autoResize(event.target)
}

// Auto resize textarea
const autoResize = (textarea) => {
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
}

// Control button handlers
const handleControlClick = (action) => {
  emit('control-action', action)
}

// HD Texture toggle handler
const handleHDToggle = (event) => {
  emit('hd-texture-toggle', event.target.checked)
}

// Generation button handler
const handleGeneration = () => {
  if (!props.isGenerating) {
    emit('start-generation')
  }
}

// SVG icons
const getSVGIcon = (iconType) => {
  const icons = {
    image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21,15 16,10 5,21"/>
    </svg>`,
    settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="m12 1 0 6m0 6 0 6"/>
      <path d="m17.5 6.5-3 3m-6 6-3 3"/>
      <path d="m6.5 6.5 3 3m6 6 3 3"/>
    </svg>`
  }
  return icons[iconType] || ''
}
</script>

<template>
  <div class="generation-input-dialog">
    <div class="generation-input-container">
      <textarea 
        ref="generationInputRef"
        class="generation-input" 
        placeholder="输入描述"
        rows="4"
        :value="inputValue"
        @input="handleInput"
      ></textarea>

      <!-- Control Bar -->
      <div class="generation-controls">
        <div class="generation-controls-left">
          <button 
            v-for="action in controlActions" 
            :key="action.action"
            class="generation-control-btn"
            :data-action="action.action"
            :aria-label="action.alt"
            @click="handleControlClick(action.action)"
          >
            <span 
              class="control-icon"
              v-html="getSVGIcon(action.icon)"
            ></span>
          </button>

          <!-- HD Texture Toggle -->
          <div class="hd-texture-toggle">
            <span class="toggle-label">高清纹理</span>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                :checked="hdTextureEnabled"
                @change="handleHDToggle"
              >
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="generation-controls-right">
          <button 
            class="generation-start-btn"
            :disabled="isGenerating"
            :style="{ opacity: isGenerating ? '0.7' : '1' }"
            @click="handleGeneration"
          >
            {{ buttonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 3D Generation Input Dialog */
.generation-input-dialog {
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

/* Desktop Input Container */
@media (min-width: 769px) {
    .generation-input-dialog .generation-input-container {
        width: 1000px;
        max-width: 80vw;
    }
}

/* Mobile Input Container */
@media (max-width: 768px) {
    .generation-input-dialog .generation-input-container {
        width: 90%;
        max-width: 90%;
    }
}

.generation-input-container {
    background: #ffffff;
    border-radius: 33px;
    padding: 2rem;
    min-height: 180px;
    box-shadow:
        0 25px 50px rgba(0, 0, 0, 0.12),
        0 12px 25px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    transition: all 0.3s ease;
    position: relative;
    border: 2px solid rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.generation-input-container:hover {
    transform: translateZ(10px) rotateX(1deg) translateY(-5px);
    box-shadow:
        0 30px 60px rgba(0, 0, 0, 0.15),
        0 15px 30px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.generation-input-container::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    background: linear-gradient(45deg,
        rgba(255, 193, 7, 0.3) 0%,
        rgba(255, 193, 7, 0.1) 25%,
        rgba(0, 206, 201, 0.1) 50%,
        rgba(255, 193, 7, 0.1) 75%,
        rgba(255, 193, 7, 0.3) 100%);
    border-radius: 36px;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.generation-input-container:hover::before {
    opacity: 1;
}

/* Generation Input Field */
.generation-input {
    width: 100%;
    min-height: 120px;
    padding: 1rem;
    border: none;
    border-radius: 12px;
    background: rgba(248, 249, 250, 0.8);
    font-size: 1rem;
    font-family: inherit;
    color: var(--text-primary);
    resize: none;
    outline: none;
    transition: all 0.3s ease;
}

.generation-input::placeholder {
    color: #999;
    font-size: 1rem;
}

.generation-input:focus {
    background: rgba(248, 249, 250, 1);
    box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.3);
}

/* Generation Controls */
.generation-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.generation-controls-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.generation-controls-right {
    display: flex;
    align-items: center;
}

/* Control Buttons */
.generation-control-btn {
    width: 44px;
    height: 44px;
    border: none;
    border-radius: 12px;
    background: rgba(248, 249, 250, 0.8);
    color: #666;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    padding: 0;
}

.generation-control-btn:hover {
    background: rgba(248, 249, 250, 1);
    color: var(--accent-color);
    transform: translateY(-2px);
}

.control-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.control-icon :deep(svg) {
    width: 100%;
    height: 100%;
}

/* HD Texture Toggle */
.hd-texture-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.toggle-label {
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
}

.toggle-switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
    cursor: pointer;
}

.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-slider {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    border-radius: 24px;
    transition: 0.3s;
}

.toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    border-radius: 50%;
    transition: 0.3s;
}

.toggle-switch input:checked + .toggle-slider {
    background-color: var(--accent-color);
}

.toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(20px);
}

/* Start Generation Button */
.generation-start-btn {
    background: var(--accent-color);
    color: #000;
    border: none;
    border-radius: 50px;
    padding: 0.75rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
    white-space: nowrap;
}

.generation-start-btn:hover:not(:disabled) {
    background: #e6ac00;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 193, 7, 0.4);
}

.generation-start-btn:active:not(:disabled) {
    transform: translateY(0);
}

.generation-start-btn:disabled {
    cursor: not-allowed;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
    .generation-input-container {
        padding: 1.5rem;
        min-height: 160px;
    }

    .generation-input {
        min-height: 100px;
        font-size: 0.9rem;
    }

    .generation-controls {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }

    .generation-controls-left {
        justify-content: center;
        gap: 0.75rem;
    }

    .generation-controls-right {
        justify-content: center;
    }

    .generation-start-btn {
        width: 100%;
        padding: 1rem 2rem;
        font-size: 1.1rem;
    }

    .toggle-label {
        font-size: 0.8rem;
    }
}
</style>
