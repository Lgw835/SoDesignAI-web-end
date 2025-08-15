<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['item-click'])

// Local state
const hoveredItem = ref(null)

// Event handlers
const handleItemClick = (item) => {
  emit('item-click', item)
}

const handleItemHover = (itemId) => {
  hoveredItem.value = itemId
}

const handleItemLeave = () => {
  hoveredItem.value = null
}
</script>

<template>
  <div class="portfolio-grid">
    <article 
      v-for="item in items" 
      :key="item.id"
      class="portfolio-item"
      :class="{ hovered: hoveredItem === item.id }"
      @click="handleItemClick(item)"
      @mouseenter="handleItemHover(item.id)"
      @mouseleave="handleItemLeave"
    >
      <img
        :src="item.image"
        :alt="item.alt" 
        class="portfolio-image"
        loading="lazy"
      >
      <div class="portfolio-overlay">
        <div class="portfolio-content">
          <h3 class="portfolio-title">{{ item.title }}</h3>
          <p class="portfolio-description">
            {{ item.description }}
          </p>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
/* Portfolio Grid */
.portfolio-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.portfolio-item {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
    background: #fff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.portfolio-item:hover,
.portfolio-item.hovered {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.portfolio-image {
    width: 100%;
    height: 300px;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.portfolio-item:hover .portfolio-image {
    transform: scale(1.05);
}

.portfolio-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
        135deg,
        rgba(0, 0, 0, 0.8) 0%,
        rgba(0, 0, 0, 0.6) 50%,
        rgba(0, 0, 0, 0.8) 100%
    );
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    backdrop-filter: blur(2px);
}

.portfolio-item:hover .portfolio-overlay,
.portfolio-item.hovered .portfolio-overlay {
    opacity: 1;
}

.portfolio-content {
    text-align: center;
    padding: 2rem;
    transform: translateY(20px);
    transition: transform 0.3s ease;
}

.portfolio-item:hover .portfolio-content,
.portfolio-item.hovered .portfolio-content {
    transform: translateY(0);
}

.portfolio-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #fff;
}

.portfolio-description {
    font-size: 0.875rem;
    opacity: 0.9;
    line-height: 1.5;
    color: #f0f0f0;
}

/* Mobile responsive */
@media (max-width: 768px) {
    .portfolio-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
        margin-top: 1.5rem;
    }
    
    .portfolio-item {
        margin: 0 auto;
        max-width: 400px;
    }
    
    .portfolio-image {
        height: 250px;
    }
    
    .portfolio-content {
        padding: 1.5rem;
    }
    
    .portfolio-title {
        font-size: 1.25rem;
        margin-bottom: 0.75rem;
    }
    
    .portfolio-description {
        font-size: 0.8rem;
    }
    
    /* Show overlay by default on mobile for better accessibility */
    .portfolio-overlay {
        opacity: 0.8;
        background: linear-gradient(
            135deg,
            rgba(0, 0, 0, 0.7) 0%,
            rgba(0, 0, 0, 0.5) 50%,
            rgba(0, 0, 0, 0.7) 100%
        );
    }
    
    .portfolio-content {
        transform: translateY(0);
    }
}

@media (max-width: 480px) {
    .portfolio-grid {
        gap: 1rem;
    }
    
    .portfolio-item {
        max-width: 100%;
    }
    
    .portfolio-image {
        height: 200px;
    }
    
    .portfolio-content {
        padding: 1rem;
    }
    
    .portfolio-title {
        font-size: 1.1rem;
    }
    
    .portfolio-description {
        font-size: 0.75rem;
    }
}
</style>
