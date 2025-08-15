<script setup>
import { ref } from 'vue'
import PortfolioGrid from './PortfolioGrid.vue'

// ModeLIB section data
const sectionData = ref({
  title: 'ModeLIB'
})

// Breadcrumb navigation
const breadcrumbs = ref([
  { href: '#', text: 'CheckPoint' },
  { href: '#', text: 'LoRA' },
  { href: '#', text: 'LoRA Training' }
])

// Portfolio items - 使用SoDesign.AI自己的图片资源
const portfolioItems = ref([
  {
    id: 1,
    image: 'https://s3.20250131.xyz/gh/usst-502s/welcome/2025/7/1753009569174-861.png',
    alt: 'Experimental Marketing',
    title: 'Pixel Alchemist',
    description: 'There are many variations of passages of Lorem Ipsum available majority.'
  },
  {
    id: 2,
    image: 'https://s3.20250131.xyz/gh/usst-502s/welcome/2025/7/1753010555755-323.png',
    alt: 'Mobile Design',
    title: 'Inkwell Symphonie',
    description: 'There are many variations of passages of Lorem Ipsum available majority.'
  },
  {
    id: 3,
    image: 'https://s3.20250131.xyz/gh/usst-502s/welcome/2025/7/1753012645988-833.png',
    alt: 'Social Media Marketing',
    title: 'Frame Weaver',
    description: 'There are many variations of passages of Lorem Ipsum available majority.'
  }
])

// Event handlers
const handleBreadcrumbClick = (event, href) => {
  event.preventDefault()
  console.log('Breadcrumb clicked:', href)
  // Add breadcrumb navigation logic here
}

const handlePortfolioItemClick = (item) => {
  console.log('Portfolio item clicked:', item)
  // Add portfolio item click logic here
}
</script>

<template>
  <section id="modelib" class="content-section">
    <div class="section-container">
      <h2 class="section-title">{{ sectionData.title }}</h2>

      <!-- Navigation Breadcrumbs -->
      <nav class="breadcrumbs" aria-label="ModeLIB navigation">
        <a 
          v-for="breadcrumb in breadcrumbs"
          :key="breadcrumb.text"
          :href="breadcrumb.href" 
          class="breadcrumb-link"
          @click="handleBreadcrumbClick($event, breadcrumb.href)"
        >
          {{ breadcrumb.text }}
        </a>
      </nav>

      <!-- Portfolio Grid -->
      <PortfolioGrid 
        :items="portfolioItems"
        @item-click="handlePortfolioItemClick"
      />
    </div>
  </section>
</template>

<style scoped>
/* ModeLIB Section Styles */
#modelib {
    background: var(--bg-primary);
    padding: 4rem 0;
}

.section-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

.section-title {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 2rem;
    color: var(--text-primary);
    text-align: center;
}

/* Breadcrumbs */
.breadcrumbs {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    justify-content: center;
}

.breadcrumb-link {
    color: var(--text-secondary);
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    background: var(--bg-secondary);
    transition: all 0.3s ease;
    font-size: 0.875rem;
}

.breadcrumb-link:hover {
    background: var(--accent-color);
    color: #000;
    transform: translateY(-2px);
}

/* Mobile responsive */
@media (max-width: 768px) {
    .section-container {
        padding: 0 1rem;
    }
    
    .section-title {
        font-size: 2rem;
        margin-bottom: 1.5rem;
    }
    
    .breadcrumbs {
        justify-content: center;
        gap: 0.5rem;
    }
    
    .breadcrumb-link {
        font-size: 0.75rem;
        padding: 0.4rem 0.8rem;
    }
}
</style>
