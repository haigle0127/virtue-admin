<template>
  <span>{{ displayValue }}</span>
</template>

<script lang="ts">
export default {
  name: 'CountTo',
  props: {
    startVal: {
      type: Number,
      default: 0
    },
    endVal: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 2000
    }
  },
  data() {
    return {
      displayValue: this.startVal,
      rafId: null
    }
  },
  watch: {
    endVal: {
      immediate: true,
      handler() {
        this.start()
      }
    }
  },
  unmounted() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }
  },
  methods: {
    start() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId)
      }
      const startTime = performance.now()
      const startValue = this.startVal
      const endValue = this.endVal
      const duration = this.duration

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        // easeOutExpo
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
        this.displayValue = Math.floor(startValue + (endValue - startValue) * easeProgress)
        if (progress < 1) {
          this.rafId = requestAnimationFrame(animate)
        }
      }
      this.rafId = requestAnimationFrame(animate)
    }
  }
}
</script>
