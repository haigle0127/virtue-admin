<template>
  <svg-icon v-if="icon" :icon-class="icon" />
  <span v-if="title" class="menu-title">{{ title }}</span>
</template>

<script lang="ts">
export default {
  name: 'MenuItem',
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  }
}
</script>
