<template>
  <Renderer ref="renderer" antialias :orbit-ctrl="{ enableDamping: true }" resize="window">
    <Camera :position="{ z: 10 }" />
    <Scene>
      <PointLight :position="{ y: 50, z: 50 }" />
      <Box :size="1" ref="box" :rotation="{ y: Math.PI / 4, z: Math.PI / 4 }">
        <LambertMaterial />
      </Box>
      <GltfModel ref="gltfModel" src="/src/assets/twin/models/新水河.glb" @before-load="beforeLoad" @load="loadModel" />
    </Scene>
  </Renderer>
  <bim-viewer />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Box, Camera, LambertMaterial, MeshPublicInterface, PointLight, Renderer, RendererPublicInterface, Scene } from './export'
//import BimViewer from './bim-viewer/index.vue'
//import BimViewer2 from './bim-viewer/test.vue'

export default defineComponent({
  components: { Box, Camera, LambertMaterial, PointLight, Renderer, Scene },
  mounted() {
    // const renderer = this.$refs.renderer as RendererPublicInterface
    // const mesh = (this.$refs.box as MeshPublicInterface).mesh
    // if (renderer && mesh) {
    //   renderer.onBeforeRender(() => {
    //     mesh.rotation.x += 0.01
    //   })
    // }
  },
})
</script>

<style>
body, html {
  margin: 0;
}
canvas {
  display: block;
}
</style>
