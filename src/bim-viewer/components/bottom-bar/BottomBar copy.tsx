import * as THREE from "three"
import styles from "./BottomBar.module.less"
import { onMounted, defineComponent, ref, watch } from 'vue'

export interface BottomBarProps {
  viewer:any;
}

/**
 * Object info of the viewer
 */
interface ObjectInfo {
  components: number,
  points: number,
  faces: number,
  materials: { [id: string]: number } // store material ids and ref count
}


export default defineComponent({
  name: 'BottomBar',
  props: {
    viewer: {},
  },
  setup(props) {
    const viewer = props.viewer
    const eye = ref<HTMLSpanElement | null>(null)
    const objectsInfo = ref<HTMLSpanElement | null>(null)

    console.log(viewer)
    const updateCameraInfo = () => {
      if (!viewer || !viewer.scene || !viewer.camera || !viewer.controls) {
        return
      }
      const camera = viewer.camera
      const controls = viewer.controls
      const r = (num: number) => Math.round(num) // round
      const p2t = (p: THREE.Vector3) => `(${r(p.x)}, ${r(p.y)}, ${r(p.z)})` // point to text
      const p = camera.position
      const t = controls.target // target point
      if (p) {
        if (eye && eye.value) {
          eye.value.textContent = `Camera position: ${p2t(p)} | Camera target: ${p2t(t)}`
        }
      }
    }

    const getObjectInfo = (object: THREE.Object3D, info: ObjectInfo) => {
      if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.Line)) {
        return
      }
      // one InstancedMesh counts as 1 object
      info.components++
      if (object.geometry) {
        const geom = object.geometry
        if (geom.index && geom.index.count) {
          info.faces += Math.round(geom.index.count / 3)
        }
        if (geom.attributes.position) {
          const pos = geom.attributes.position
          if (pos.count && pos.itemSize) {
            info.points += pos.count
          }
        }
      }

      // log material info
      const updateMaterialInfo = (id: number) => {
        if (info.materials[id]) {
          info.materials[id]++ // material id already exist
        } else {
          info.materials[id] = 0 // material id not exist
        }
      }

      const mat = object.material
      if (mat instanceof THREE.Material) {
        updateMaterialInfo(mat.id)
      } else if (Array.isArray(mat)) {
        mat.forEach(m => updateMaterialInfo(m.id))
      }
    }
    const updateObjectsInfo = () => {
      if (!viewer.scene) {
        if (objectsInfo && objectsInfo.value) {
          objectsInfo.value.textContent = "Failed!"
        }
        return
      }
      objectsInfo.value.textContent = "Comupting..."
      // const info: { components: number, index: number, vertices: number, faces: number } = { components: 0, index: 0 }
      const info: ObjectInfo = { components: 0, points: 0, faces: 0, materials: {} }
      const updateTextContent = () => {
        const materialCount = Object.keys(info.materials).length
        objectsInfo.value.textContent = `Components: ${info.components}${info.points ? ", Points: " + info.points : ""}${info.faces ? ", Faces: " + info.faces : ""}${materialCount ? ", Materials: " + materialCount : ""}`
      }
      // traverse will be called on children of each child. Basically it traverses all the
      // descendants of a any given three js object in Depth First Traversal manner.
      viewer.scene.traverse((object) => {
        getObjectInfo(object, info)
        updateTextContent()
      })
      updateTextContent()
    }

    onMounted(() => {
      // when viewer is assigned, watch ObitControls's 'change' event
      console.log(props.viewer)
      watch(
        () => props.viewer,
        (viewer) => {
          console.log(viewer)
          if (viewer && viewer.controls) {
            viewer.controls.addEventListener("change", updateCameraInfo);
          }
        }
      )
    })

    return () => {
       <div class={ styles.bottomBar } style="width:100px;height:100px;position:absolute;  left: 1px; bottom: 1px;" ref="bottomBar">
        <div class="main">
          <el-popover placement="top" trigger="click">
            <span ref='objectsInfo'> -- </span>
            <i class="el-icon-info" slot="reference" title="Click to get statistics" onClick={ updateObjectsInfo }></i>
          </el-popover>
          <span class="separator"> | </span>
          <el-popover placement="top" trigger="click">
            <span ref='eye'>Camera position: --</span>
            <i class="el-icon-view" slot="reference" title="Click to get camera info" onClick={ updateCameraInfo }></i>
          </el-popover>
          <span class="separator"> | </span>
          <el-popover placement="top" trigger="click">
            <div class="keys">
              <span>W: Move forward</span><br />
              <span>A: Move backward</span><br />
              <span>S: Move left</span><br />
              <span>D: Move right</span><br />
              <span>Ctrl: Move lower</span><br />
              <span>Space: Move higher</span><br />
              <span>↑: Rotate up</span><br />
              <span>←: Rotate to left</span><br />
              <span>↓: Rotate to right</span><br />
              <span>→: Rotate to right</span><br />
            </div>
            <i class="el-icon-more" slot="reference" title="Click to get keyboard tips" onClick={ updateCameraInfo }></i>
          </el-popover>
        </div>
       </div>
    }
  },
})
