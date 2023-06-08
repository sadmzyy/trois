import * as THREE from "three"
import styles from "./BottomBar.module.less"
import { ref, defineComponent } from 'vue'
import { Popover } from 'ant-design-vue'
import { InfoCircleOutlined, EyeOutlined, EllipsisOutlined } from '@ant-design/icons-vue'

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
    msg: {
      type: String,
      required: false,
    },
    viewer: {

    },
  },
  components: {
    InfoCircleOutlined,
    EyeOutlined,
    EllipsisOutlined,
  },
  setup(props) {
    const viewer = props.viewer
    const eyeContent = ref('Camera position: --')
    const objectsInfo = ref('--')

    console.log(viewer)
    const updateCameraInfo = () => {
      if (!viewer || !viewer.value.scene || !viewer.value.camera || !viewer.value.three.cameraCtrl) {
        return
      }
      const camera = viewer.value.camera
      const controls = viewer.value.three.cameraCtrl
      const r = (num: number) => Math.round(num) // round
      const p2t = (p: THREE.Vector3) => `(${r(p.x)}, ${r(p.y)}, ${r(p.z)})` // point to text
      const p = camera.position
      const t = controls.target // target point
      if (p) {
        eyeContent.value = `Camera position: ${p2t(p)} | Camera target: ${p2t(t)}`
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
      if (!viewer.value.scene) {
        if (objectsInfo && objectsInfo.value) {
          objectsInfo.value = "Failed!"
        }
        return
      }
      objectsInfo.value = "Comupting..."
      // const info: { components: number, index: number, vertices: number, faces: number } = { components: 0, index: 0 }
      const info: ObjectInfo = { components: 0, points: 0, faces: 0, materials: {} }
      const updateTextContent = () => {
        const materialCount = Object.keys(info.materials).length
        objectsInfo.value = `Components: ${info.components}${info.points ? ", Points: " + info.points : ""}${info.faces ? ", Faces: " + info.faces : ""}${materialCount ? ", Materials: " + materialCount : ""}`
      }
      // traverse will be called on children of each child. Basically it traverses all the
      // descendants of a any given three js object in Depth First Traversal manner.
      viewer.value.scene.traverse((object) => {
        getObjectInfo(object, info)
        updateTextContent()
      })
      updateTextContent()
    }
    return () => (
      <div class={styles.bottomBar} ref="bottomBar">
        <div class="main">
          <Popover placement="topLeft" trigger="click" content= {<span ref='objectsInfo'> { objectsInfo.value } </span>}>
            <info-circle-outlined onClick={ updateObjectsInfo } />
          </Popover>
          <span class="separator"> | </span>
          <Popover placement="topLeft" trigger="click" content={ <span ref='eye'> { eyeContent.value } </span> }>
            <eye-outlined onClick={ updateCameraInfo } />
          </Popover>
          <span class="separator"> | </span>
          <Popover placement="topLeft" trigger="click" content={
            <><span>W: Move forward</span><br />
            <span>A: Move backward</span><br />
            <span>S: Move left</span><br />
            <span>D: Move right</span><br />
            <span>Ctrl: Move lower</span><br />
            <span>Space: Move higher</span><br />
            <span>↑: Rotate up</span><br />
            <span>←: Rotate to left</span><br />
            <span>↓: Rotate to right</span><br />
            <span>→: Rotate to right</span><br /></>
            }>
            <ellipsis-outlined />
          </Popover>
        </div>
      </div>
    )
  },
})
