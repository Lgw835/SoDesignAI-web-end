<script setup>
import { ref } from 'vue'

// Hero section data
const brandImage = ref('https://s3.20250131.xyz/gh/usst-502s/welcome/2025/7/1753009569174-861.png')
const tagline = ref('Industrial Design Intelligent\nCreation Engine')

// CTA button handler
const handleGetStarted = () => {
  // Navigate to get started section or trigger action
  const targetElement = document.querySelector('#webui')
  if (targetElement) {
    const offsetTop = targetElement.offsetTop - 80
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    })
  }
}
</script>

<template>
  <section class="hero-section">
    <div class="hero-container">
      <!-- Brand Display -->
      <div class="brand-display">
        <img 
          :src="brandImage" 
          alt="SoDesign"
          class="brand-image"
        >
        <p class="brand-tagline">{{ tagline }}</p>

        <!-- CTA Button -->
        <div class="cta-section">
          <button 
            class="btn btn-primary btn-large"
            @click="handleGetStarted"
          >
            GET STARTED
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Hero Section */
.hero-section {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    position: relative;
    background: url('https://s3.20250131.xyz/gh/usst-502s/welcome/2025/7/1753010555755-323.png') center center/cover no-repeat;
    overflow: hidden;
}

/* Background image optimization for 1536x1024 */
@media (min-width: 1536px) {
    .hero-section {
        background-size: contain;
        background-repeat: no-repeat;
        background-color: #000;
    }
}

.hero-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    position: relative;
    z-index: 2;
    width: 100%;
}

/* Brand Display */
.brand-display {
    max-width: 600px;
    margin: 0;
    text-align: left;
}

/* SoDesign image optimization for 4725x1357 */
.brand-image {
    width: 1200px;
    height: auto;
    margin-bottom: 2rem;
    max-width: 100%;
}

/* Mobile optimization for brand image */
@media (max-width: 768px) {
    .brand-image {
        width: 500px;
    }
}

.brand-tagline {
    font-size: 1.5rem;
    color: #00CEC9;
    margin-bottom: 3rem;
    font-weight: 600;
    line-height: 1.3;
    white-space: pre-line;
}

.cta-section {
    margin-top: 3rem;
}

.btn-large {
    padding: 1.2rem 3rem;
    font-size: 1.1rem;
    font-weight: 700;
    border-radius: 50px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    cursor: pointer;
}

/* Mobile responsive */
@media (max-width: 768px) {
    .hero-container {
        padding: 1rem;
    }
    
    .brand-tagline {
        font-size: 1rem;
    }
}
</style>
