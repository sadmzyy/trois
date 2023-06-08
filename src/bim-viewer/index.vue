<template>
  <div class="viewerContainer">
    <Renderer ref="renderer" antialias :orbit-ctrl="orbitCtrl" :pointer="pointer" resize="window">
      <Camera ref="camera" :fov="45" :position="{ x: 231, y: 75, z: 160 }" :lookAt="{ x: 83, y: -46, z: 12 }"/>
      <!-- <Raycaster ref="rayCaster" :intersect-recursive="true" :on-click="onClick" :on-pointer-move="onPointerMove"/> -->
      <Scene ref="scene" background="#ffffff">
        <!-- <AmbientLight /> -->
        <Box ref="box" :rotation="{ y: Math.PI / 4, z: Math.PI / 4 }" :width="10" :height="10" :depth="10" @click="click">
          <LambertMaterial />
        </Box>
        <DirectionalLight ref="light1" :intensity="0.6" :position="{ x: 5, y: 0, z: 0 }" :shadowMapSize="{ width: 16384, height: 16384 }" />
        <DirectionalLight ref="light2" :intensity="0.4" :position="{ x: 0, y: -5, z: -8 }" :shadowMapSize="{ width: 16384, height: 16384 }" />
        <GltfModel ref="gltfModel" src="/src/assets/twin/models/新水河.glb" :draco-path="dracoPath" @before-load="beforeLoad" @load="loadModel" @click="click"/>
      </Scene>
      <EffectComposer ref="composer">
        <RenderPass />
        <!-- <FXAAPass />
        <UnrealBloomPass :strength="0.5" /> -->
        <!-- <HalftonePass :radius="1" :scatter="0" /> -->
      </EffectComposer>
    </Renderer>
    <div ref="axesRenderer" id="axesRenderer" class="axesRenderer" />
    <BottomBar msg="halou" :viewer="viewer"/>
    <BimTree :viewer="viewer"></BimTree>
  </div>
  <!-- <div class="tool">
    <div class="left">
      <a-tree checkable :fieldNames="fieldNames" :clickRowToExpand="false" :treeData="treeData" @check="onCheck" @select="onSelect" />
    </div>
  </div> -->
</template>

<script lang="ts" setup name="BimViewer">
import { ref, onMounted, inject, computed } from 'vue'
import {
  AmbientLight,
  DirectionalLight,
  Sphere,
  Camera,
  Raycaster,
  GltfModel,
  Renderer,
  Scene,
  EffectComposer,
  RenderPass,
  UnrealBloomPass,
  HalftonePass,
  FXAAPass,
  Box,
  LambertMaterial,
} from '../export'
import { PointerPublicConfigInterface } from '../core/usePointer'
import { HalfFloatType, PMREMGenerator, Vector2, Color } from 'three'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

import BottomBar from "./components/bottom-bar/BottomBar"
import BimTree from './components/bim-tree/BimTree'

import { useBimViewer } from './index'

const axesRenderer = ref<HTMLDivElement | null>(null)
const light1 = ref<any>(null)
const renderer = ref<any>(null)
const camera = ref<any>(null)
const scene = ref<any>(null)
const gltfModel = ref<any>(null)
const treeData = ref([])
const composer = ref<any>(null)

const box = ref<any>(null)

const dracoPath = ref('/src/assets/twin/js/draco/')
//
const orbitCtrl = {
  enableDamping: true,
  dampingFactor: 0.5,
  enabled: true,
  keyPanSpeed: 10,
  // controls.keys = { LEFT: '65', UP: '87', RIGHT: '68', BOTTOM: '83' } // a, w, d, s
  keys: {
    LEFT: "KeyA", // left arrow
    UP: "Space", // up arrow
    RIGHT: "KeyD", // right arrow
    BOTTOM: "ControlLeft", // down arrow
  },
}

const viewer = computed(() => renderer)
const pointer = ref<PointerPublicConfigInterface>({
  intersectRecursive: true,
  // onSelectObject: () => {},
  // onIntersectClick: click,
})

let outlinePass

const fieldNames = { children: 'children', title: 'name', key: 'uuid' }

function setEnvironment(scene, renderer, path, image) {
  new RGBELoader()
    .setDataType(HalfFloatType)
    .setPath(path)
    .load(image, function (texture) {
      const pmremGenerator = new PMREMGenerator(renderer)
      pmremGenerator.compileEquirectangularShader()
      const envMap = pmremGenerator.fromEquirectangular(texture).texture
      // console.log(renderer.scene);
      if (scene) {
        scene.environment = envMap
        console.log(scene)
      }
      texture.dispose()
      pmremGenerator.dispose()
    })
}

function beforeLoad(loader) {
  const draco_locader = new DRACOLoader()
  draco_locader.setDecoderPath('/src/assets/twin/js/draco/')
  loader.setDRACOLoader(draco_locader)
}

function loadModel(model) {
  console.log({ model: model, o3d: model.scene })
  treeData.value = [model.scene]
  onSelect(model.scene, '河流')
}

function buildModelTreeData(model) {
  console.log({ model: model, o3d: model.o3d })
  // treeData.value = model.value.o3d;
}

const addColor = (color, config) => {
  // 创建一个EffectComposer（效果组合器）对象，然后在该对象上添加后期处理通道。
  // composer = new EffectComposer(config.renderer)

  // 新建一个场景通道  为了覆盖到原理来的场景上
  // renderPass = new RenderPass(config.scene, config.camera)
  // composer.addPass(renderPass)

  // 物体边缘发光通道
  outlinePass = new OutlinePass(new Vector2(window.innerWidth, window.innerHeight), config.scene, config.camera)

  outlinePass.edgeStrength = 10.0 // 边框的亮度
  outlinePass.edgeGlow = 1 // 光晕[0,1]
  outlinePass.usePatternTexture = false // 是否使用父级的材质
  outlinePass.edgeThickness = 1.0 // 边框宽度
  outlinePass.downSampleRatio = 2 // 边框弯曲度
  outlinePass.pulsePeriod = 5 // 呼吸闪烁的速度
  outlinePass.visibleEdgeColor.set(color) // 呼吸显示的颜色
  outlinePass.hiddenEdgeColor = new Color(0, 0, 255) // 呼吸消失的颜色
  outlinePass.clear = true
  composer.value.addPass(outlinePass)

  // 自定义的着色器通道 作为参数
  const effectFXAA = new ShaderPass(FXAAShader)
  effectFXAA.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight)
  effectFXAA.renderToScreen = true
  composer.value.addPass(effectFXAA)
  return outlinePass // 实例化一次后设置  outlinePass.selectedObjects = selectedObjects
}

function onCheck() {}
function onSelect(scene, name: string) {
  const selectedObjects = scene.getObjectByName(name)
  console.log(selectedObjects)
  if (selectedObjects) {
    // 物体边缘发光通道
    const outlinePass = new OutlinePass(new Vector2(window.innerWidth, window.innerHeight), scene, camera.value, selectedObjects)
    outlinePass.selectedObjects = selectedObjects
    outlinePass.edgeStrength = 10.0 // 边框的亮度
    outlinePass.edgeGlow = 1 // 光晕[0,1]
    outlinePass.usePatternTexture = false // 是否使用父级的材质
    outlinePass.edgeThickness = 1.0 // 边框宽度
    outlinePass.downSampleRatio = 1 // 边框弯曲度
    outlinePass.pulsePeriod = 5 // 呼吸闪烁的速度
    outlinePass.visibleEdgeColor.set(new Color(0, 255, 0)) // 呼吸显示的颜色
    outlinePass.hiddenEdgeColor = new Color(0, 0, 0) // 呼吸消失的颜色
    outlinePass.clear = true
    composer.value.addPass(outlinePass)
    // 自定义的着色器通道 作为参数
    const effectFXAA = new ShaderPass(FXAAShader)
    effectFXAA.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight)
    effectFXAA.renderToScreen = true
    composer.value.addPass(effectFXAA)

    console.log(renderer.value.composer)
    // renderer.value.onAfterRender(animate)
  }
}

function onSelect2(scene, selectedObjects) {
  if (selectedObjects) {
    // 物体边缘发光通道
    outlinePass = new OutlinePass(new Vector2(window.innerWidth, window.innerHeight), scene, camera.value, selectedObjects)
    outlinePass.selectedObjects = selectedObjects
    outlinePass.edgeStrength = 10.0 // 边框的亮度
    outlinePass.edgeGlow = 1 // 光晕[0,1]
    outlinePass.usePatternTexture = false // 是否使用父级的材质
    outlinePass.edgeThickness = 1.0 // 边框宽度
    outlinePass.downSampleRatio = 1 // 边框弯曲度
    outlinePass.pulsePeriod = 5 // 呼吸闪烁的速度
    outlinePass.visibleEdgeColor.set(new Color(0, 255, 0)) // 呼吸显示的颜色
    outlinePass.hiddenEdgeColor = new Color(0, 0, 0) // 呼吸消失的颜色
    outlinePass.clear = true
    composer.value.addPass(outlinePass)
    // 自定义的着色器通道 作为参数
    const effectFXAA = new ShaderPass(FXAAShader)
    effectFXAA.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight)
    effectFXAA.renderToScreen = true
    composer.value.addPass(effectFXAA)

    console.log(renderer.value.composer)
    // renderer.value.onAfterRender(animate)
  }
}

function onClick(e) {
  console.log(e)
  //outlinePass.selectedObjects = [e.intersect.object]

}

function onPointerMove(e) {
  //console.log(e)
  //outlinePass.selectedObjects = [e.intersect.object]
}

function click(e) {
  // console.log(intersect.object)
  // // onSelect2(scene.value.scene, intersect.object)
  // outlinePass.selectedObjects = [intersect.object]
  // renderer.value.onAfterRender(() => {
  //   // intersect.object.rotation.z += 0.1
  // })
  console.log(e)
  outlinePass.selectedObjects = [e.intersect.object]
}



onMounted(() => {
  // console.log(scene.value, scene.value.scene, renderer.value)
  console.log({ camera: camera.value, viewer: viewer, renderer })
  setEnvironment(scene.value.scene, renderer.value.renderer, '/src/assets/twin/equirectangular/', 'sunflowers_1k.hdr')
  addColor('yellow', {
    scene: scene.value.scene,
    camera: camera.value.camera,
  })

  renderer.value.onInit(() => {
    console.log()
    debugger
    renderer.renderFn = () => {
      // do what you want
    }
  })

  const { initAxesRenderer } = useBimViewer({ renderer: renderer.value })
  initAxesRenderer(axesRenderer.value)

  // pointer.value.onSelectObject = selectObject
})
</script>
<style lang="less" scoped>
    .viewerContainer {
      width: 100%;
      height: 100%;

      .axesRenderer {
        width: 100px;
        height: 100px;
        position: absolute;
        display: block;
        bottom: 1px;
        right: 10px;
        background: #ffffff00;
      }
    }
    .tool {
      width: 25%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      z-index: 999;
      background-color: transparent;
      .left {
        width: 100%;
        height: 100%;
        background-color: transparent;

        :deep(.ant-tree) {
          background: rgba(255, 255, 255, 0.3);
        }
      }
    }
  </style>

