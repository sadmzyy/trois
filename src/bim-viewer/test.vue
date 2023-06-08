<template>
  <div>
    <BottomBar :viewer="viewer"/>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, inject, computed } from 'vue'

import BottomBar from "./components/bottom-bar/BottomBar";

const renderer = ref(null)
const viewer = computed(() => renderer)

</script>

<style>

</style>