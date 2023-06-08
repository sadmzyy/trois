
import * as THREE from "three"
import * as TWEEN from '@tweenjs/tween.js'
import { PointerSelectObjectInterface } from '../core/usePointer'
import { Viewer3DUtils } from "../utils/Viewer3DUtils"
import { CoordinateAxesViewport } from '../export'

export interface BimViewerConfigInterface {
  renderer: any,
  tween?: any,
}

export function useBimViewer(params: BimViewerConfigInterface) {
  const { renderer } = params
  const { pointer } = renderer.three

  //pointer.onSelectObject = selectObject

  const initAxesRenderer = (axesDiv: HTMLDivElement) => {
    const cav = new CoordinateAxesViewport(axesDiv.clientWidth, axesDiv.clientHeight)
    if (cav.renderer) {
      axesDiv.appendChild(cav.renderer.domElement)
      cav.setHostRenderer(renderer)
    }
    renderer.axesViewport = cav
  }

  /**
   * Make camera fly to objects
   */
  const flyToObjects = (objects: THREE.Object3D[]) => {
    if (!objects || objects.length === 0 || !renderer.camera) {
      return
    }
    const eye = new THREE.Vector3()
    const look = new THREE.Vector3()
    Viewer3DUtils.getCameraPositionByObjects(objects, renderer.camera, eye, look)
    flyTo(eye, look)
  }

  /**
     * Make camera fly to an object
     */
  const flyToObject = (object: THREE.Object3D) => {
    flyToObjects([object])
  }

  /**
     * Flies to current selected object if any
     */
  const flyToSelectedObject = (selectedObject: any) => {
    if (!selectedObject) {
      return
    }
    let obj = selectedObject
    // if part of InstancedMesh is selected, fly to that part rather than fly to the whole InstancedMesh
    if (obj instanceof THREE.InstancedMesh && obj.userData.clonedMesh) {
      obj = obj.userData.clonedMesh
    }
    flyToObject(obj)
  }
  /**
   * Make camera fly to target position with given lookAt position
   * @param position camera's target position
   * @param lookAt camera's new lookAt position
   */
  const flyTo = (position: THREE.Vector3, lookAt: THREE.Vector3, onCompleteCallback?: () => void) => {
    const camera = renderer.camera
    const controls = renderer.controls
    if (!camera || !controls) {
      return
    }
    if (position.equals(lookAt)) {
      console.error("[Viewer3D] camera position and lookAt cannot be the same!")
      return
    } else if (isNaN(position.x) || isNaN(position.y) || isNaN(position.z) || isNaN(lookAt.x) || isNaN(lookAt.y) || isNaN(lookAt.z)) {
      console.error("[Viewer3D] invalid position or lookAt!")
      return
    }
    // If distance between position and lookAt is too near or far (according to camera's near/far settings).
    // need to adjust 'position' to fit it.
    const distance = position.distanceTo(lookAt)
    if (distance < camera.near) {
    // the new position is just farer than original position
      position = position.clone().sub(lookAt).normalize().multiplyScalar(camera.near * 1.1)
      console.warn("[Viewer3D] camera could be too close to see the object!")
    } else if (distance > camera.far) {
    // the new position is just closer than original position
      position = position.clone().sub(lookAt).normalize().multiplyScalar(camera.far * 0.9)
      console.warn("[Viewer3D] camera could be too far to see the object!")
    }

    const update = (p?: THREE.Vector3, t?: THREE.Vector3) => {
      t && camera.lookAt(t)
      p && camera.position.set(p.x, p.y, p.z)
      t && controls.target.set(t.x, t.y, t.z)
      controls.update()
      // this.enableRender()
    }

    // there are two steps
    // 1) change camera's lookAt point in x miliseconds
    // 2) change camera's position in y miliseconds
    let tween
    const t = controls.target.clone() // have to copy one, otherwise TWEEN breaks the passed in object!
    const tween1 = new TWEEN.Tween(t)
    tween1.to(lookAt, 500)
    tween1.easing(TWEEN.Easing.Sinusoidal.InOut)
    tween1.onUpdate(() => {
      update(undefined, t)
    })
    tween1.onComplete(() => {
      const p = camera.position.clone()
      const tween2 = new TWEEN.Tween(p)
      tween2.to(position, 1500)
      tween2.easing(TWEEN.Easing.Sinusoidal.InOut)
      tween2.onUpdate(() => {
        update(p, lookAt)
      })
      tween2.onComplete(() => {
        update(p, lookAt)
        onCompleteCallback && onCompleteCallback()
      })
      tween = tween2
      tween2.start()
    })
    tween = tween1
    tween1.start()
  }

  return {
    initAxesRenderer,
    flyTo,
    flyToSelectedObject,
  }
}
