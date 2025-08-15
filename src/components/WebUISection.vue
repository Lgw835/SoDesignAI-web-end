<script setup>
import { ref } from 'vue'

// WebUI section data
const sectionData = ref({
  title: 'WebUI',
  features: ['文生图', '图生图'],
  description: '通过文本描述或意向图示意，\n快速生成可视化设计方案。',
  image: 'https://s3.20250131.xyz/gh/usst-502s/welcome/2025/7/1753014943908-721.png',
  learnMoreLink: '#',
  getStartedLink: '#'
})

// Event handlers
const handleLearnMore = () => {
  console.log('Learn more clicked')
  // Add learn more logic here
}

const handleGetStarted = () => {
  console.log('Get started clicked')
  // Add get started logic here
}
</script>

<template>
  <section id="webui" class="content-section">
    <div class="section-container">
      <div class="section-content">
        <div class="section-text">
          <h2 class="section-title">{{ sectionData.title }}</h2>
          <div class="feature-tags">
            <span 
              v-for="feature in sectionData.features" 
              :key="feature"
              class="feature-tag"
            >
              {{ feature }}
            </span>
          </div>
          <p class="section-description">
            {{ sectionData.description }}
          </p>
          <a 
            :href="sectionData.learnMoreLink" 
            class="learn-more"
            @click.prevent="handleLearnMore"
          >
            Learn More
          </a>
          <button 
            class="btn btn-primary"
            @click="handleGetStarted"
          >
            GET STARTED
          </button>
        </div>
        <div class="section-image">
          <div class="image-frame">
            <img 
              :src="sectionData.image"
              alt="WebUI Interface Example" 
              class="webui-image"
            >
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* WebUI Section Specific Styles */
#webui {
    min-height: 100vh;
    display: flex;
    align-items: center;
    position: relative;
    background: url('https://s3.20250131.xyz/gh/usst-502s/welcome/2025/7/1753012645988-833.png') center center/cover no-repeat;
    overflow: hidden;
}

/* Background image optimization for WebUI section (1536x1024) */
@media (min-width: 1536px) {
    #webui {
        background-size: contain;
        background-repeat: no-repeat;
        background-color: #f5f5f5;
    }
}

#webui .section-container {
    position: relative;
    z-index: 2;
}

#webui .section-content {
    display: grid;
    grid-template-columns: 1fr 3fr;
    gap: 6rem;
    align-items: center;
    min-height: 80vh;
}

/* WebUI Text Content */
#webui .section-text {
    max-width: 500px;
    margin-left: 1rem;
}

#webui .section-title {
    font-size: 4rem;
    font-weight: 900;
    margin-bottom: 2rem;
    color: #333;
    position: relative;
}

/* Blue circle decoration for WebUI title */
#webui .section-title::before {
    content: '';
    position: absolute;
    left: -60px;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    background: #00CEC9;
    border-radius: 50%;
    z-index: -1;
}

#webui .feature-tags {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
}

#webui .feature-tag {
    background: transparent;
    color: #333;
    padding: 0;
    border-radius: 0;
    font-weight: 700;
    font-size: 2rem;
    border: none;
}

#webui .section-description {
    font-size: 1rem;
    color: #666;
    margin-bottom: 1.5rem;
    line-height: 1.6;
    white-space: pre-line;
}

#webui .learn-more {
    display: block;
    color: #999;
    text-decoration: underline;
    font-size: 0.9rem;
    margin-bottom: 2rem;
    cursor: pointer;
}

#webui .learn-more:hover {
    color: #666;
}

#webui .btn-primary {
    background: var(--accent-color);
    color: #000;
    padding: 1rem 2.5rem;
    font-size: 1rem;
    font-weight: 700;
    border-radius: 50px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    border: none;
    box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
    cursor: pointer;
}

/* WebUI Image Container with 3D Effects */
#webui .section-image {
    position: relative;
    perspective: 1000px;
}

#webui .image-frame {
    background: #fff;
    border: 3px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    box-shadow:
        0 20px 40px rgba(0, 0, 0, 0.1),
        0 10px 20px rgba(0, 0, 0, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    transform: rotateY(-5deg) rotateX(2deg);
    transition: all 0.3s ease;
    position: relative;
}

#webui .image-frame:hover {
    transform: rotateY(-2deg) rotateX(1deg) translateY(-10px);
    box-shadow:
        0 30px 60px rgba(0, 0, 0, 0.15),
        0 15px 30px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

#webui .image-frame::before {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0.1));
    border-radius: 12px;
    z-index: -1;
}

.webui-image {
    width: 100%;
    height: auto;
    border-radius: 4px;
    display: block;
}

/* Optimize for 1086x670 image aspect ratio */
#webui .image-frame {
    aspect-ratio: 1086 / 670;
}

/* Mobile WebUI Optimization */
@media (max-width: 768px) {
    #webui .section-content {
        grid-template-columns: 1fr;
        gap: 3rem;
        min-height: auto;
        padding: 2rem 0;
    }

    #webui .section-text {
        max-width: none;
        margin-left: 0;
        text-align: center;
    }

    #webui .section-title {
        font-size: 2.5rem;
        margin-bottom: 1.5rem;
    }

    #webui .section-title::before {
        display: none;
    }

    #webui .feature-tags {
        justify-content: center;
        gap: 1rem;
        flex-direction: row;
    }

    #webui .feature-tag {
        font-size: 1.5rem;
    }

    #webui .section-description {
        text-align: center;
        margin-bottom: 1rem;
    }

    #webui .learn-more {
        text-align: center;
        margin-bottom: 1.5rem;
    }

    #webui .image-frame {
        transform: none;
        margin: 0 auto;
        max-width: 100%;
    }

    #webui .image-frame:hover {
        transform: translateY(-5px);
    }
}
</style>
