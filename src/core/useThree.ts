import { Camera, Object3D, OrthographicCamera, PerspectiveCamera, Scene, WebGLRenderer, WebGLRendererParameters, InstancedMesh, Material, Matrix4, Mesh, Color, MeshStandardMaterial, MeshPhongMaterial, MeshBasicMaterial, LineBasicMaterial, MeshLambertMaterial, DoubleSide, Vector3 } from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import { Viewer3DUtils } from "../utils/Viewer3DUtils"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import usePointer, { PointerConfigInterface, PointerPublicConfigInterface, PointerInterface, PointerSelectObjectInterface } from './usePointer'

export interface SizeInterface {
  width: number
  height: number
  wWidth: number
  wHeight: number
  ratio: number
}

export interface ThreeConfigInterface {
  params?: WebGLRendererParameters
  canvas?: HTMLCanvasElement
  antialias: boolean
  alpha: boolean
  autoClear: boolean
  orbitCtrl: boolean | Record<string, unknown>
  pointer: boolean | PointerPublicConfigInterface
  resize: boolean | string
  width?: number
  height?: number
  onResize?(size: SizeInterface): void
  [index:string]: any
}

export interface ThreeInterface {
  config: ThreeConfigInterface
  renderer: WebGLRenderer
  composer?: EffectComposer
  camera?: Camera
  cameraCtrl?: OrbitControls
  tween?: any
  scene?: Scene
  pointer?: PointerInterface
  size: SizeInterface
  init(): boolean
  dispose(): void
  render(): void
  renderC(): void
  setSize(width: number, height: number): void
  addIntersectObject(o: Object3D): void
  removeIntersectObject(o: Object3D): void
}

/**
 * Three.js helper
 */
export default function useThree(params: ThreeConfigInterface): ThreeInterface {
  // default config
  const config: ThreeConfigInterface = {
    antialias: true,
    alpha: false,
    autoClear: true,
    orbitCtrl: false,
    pointer: false,
    resize: false,
    width: 300,
    height: 150,
  }

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      config[key] = value
    })
  }

  // size
  const size: SizeInterface = {
    width: 1, height: 1,
    wWidth: 1, wHeight: 1,
    ratio: 1,
  }

  const beforeRenderCallbacks: {(): void}[] = []

  const intersectObjects: Object3D[] = []

  const renderer = createRenderer()

  // returned object
  const obj: ThreeInterface = {
    config,
    renderer,
    size,
    init,
    dispose,
    render,
    renderC,
    setSize,
    addIntersectObject, removeIntersectObject,
  }

  return obj

  /**
   * create WebGLRenderer
   */
  function createRenderer(): WebGLRenderer {
    const renderer = new WebGLRenderer({ canvas: config.canvas, antialias: config.antialias, alpha: config.alpha, ...config.params })
    renderer.autoClear = config.autoClear
    return renderer
  }

  /**
   * init three
   */
  function init() {
    if (!obj.scene) {
      console.error('Missing Scene')
      return false
    }

    if (!obj.camera) {
      console.error('Missing Camera')
      return false
    }

    if (config.resize) {
      onResize()
      window.addEventListener('resize', onResize)
    } else if (config.width && config.height) {
      setSize(config.width, config.height)
    }

    initPointer()

    if (config.orbitCtrl) {
      const cameraCtrl = new OrbitControls(obj.camera, obj.renderer.domElement)
      if (config.orbitCtrl instanceof Object) {
        Object.entries(config.orbitCtrl).forEach(([key, value]) => {
          // @ts-ignore
          cameraCtrl[key] = value
        })
      }
      cameraCtrl.listenToKeyEvents(document.body)
      onBeforeRender(() => { cameraCtrl.update() })
      obj.cameraCtrl = cameraCtrl
    }

    return true
  }

  /**
   * init pointer
   */
  function initPointer() {
    let pointerConf: PointerConfigInterface = {
      camera: obj.camera!,
      domElement: obj.renderer!.domElement,
      intersectObjects,
      selectedObject: undefined,
      onSelectObject: onSelectObject,
      flyToSelectedObject: flyToSelectedObject,
    }

    if (config.pointer && config.pointer instanceof Object) {
      pointerConf = { ...pointerConf, ...config.pointer }
    }

    const pointer = obj.pointer = usePointer(pointerConf)
    if (config.pointer || intersectObjects.length) {
      pointer.addListeners()
      if (pointerConf.intersectMode === 'frame') {
        onBeforeRender(pointer.intersect)
      }
    }
  }

  /**
   * add before render callback
   */
  function onBeforeRender(cb: {(): void}) {
    beforeRenderCallbacks.push(cb)
  }

  /**
   * default render
   */
  function render() {
    // if (obj.cameraCtrl) obj.cameraCtrl.update()
    beforeRenderCallbacks.forEach(c => c())
    obj.renderer!.render(obj.scene!, obj.camera!)
  }

  /**
   * composer render
   */
  function renderC() {
    // if (obj.cameraCtrl) obj.cameraCtrl.update()
    beforeRenderCallbacks.forEach(c => c())
    obj.composer!.render()
  }

  /**
   * add intersect object
   */
  function addIntersectObject(o: Object3D) {
    if (intersectObjects.indexOf(o) === -1) {
      intersectObjects.push(o)
    }
    // add listeners if needed
    if (obj.pointer && !obj.pointer.listeners) {
      obj.pointer.addListeners()
    }
  }

  /**
   * remove intersect object
   */
  function removeIntersectObject(o: Object3D) {
    const i = intersectObjects.indexOf(o)
    if (i !== -1) {
      intersectObjects.splice(i, 1)
    }
    // remove listeners if needed
    if (obj.pointer && !config.pointer && intersectObjects.length === 0) {
      obj.pointer.removeListeners()
    }
  }

  /**
   * remove listeners and dispose
   */
  function dispose() {
    // beforeRenderCallbacks = []
    window.removeEventListener('resize', onResize)
    if (obj.pointer) obj.pointer.removeListeners()
    if (obj.cameraCtrl) obj.cameraCtrl.dispose()
    if (obj.renderer) obj.renderer.dispose()
  }

  /**
   * resize listener
   */
  function onResize() {
    if (config.resize === 'window') {
      setSize(window.innerWidth, window.innerHeight)
    } else {
      const elt = obj.renderer!.domElement.parentNode as Element
      if (elt) setSize(elt.clientWidth, elt.clientHeight)
    }
    config.onResize?.(size)
  }

  /**
   * update renderer size and camera
   */
  function setSize(width: number, height: number) {
    size.width = width
    size.height = height
    size.ratio = width / height

    obj.renderer!.setSize(width, height, false)

    // already done in EffectComposer
    // if (obj.composer) {
    //   obj.composer.setSize(width, height)
    // }

    const camera = (<Camera>obj.camera!)
    if (camera.type === 'PerspectiveCamera') {
      const pCamera = (<PerspectiveCamera>camera)
      pCamera.aspect = size.ratio
      pCamera.updateProjectionMatrix()
    }

    if (camera.type === 'OrthographicCamera') {
      const oCamera = (<OrthographicCamera>camera)
      size.wWidth = oCamera.right - oCamera.left
      size.wHeight = oCamera.top - oCamera.bottom
    } else {
      const wsize = getCameraSize()
      size.wWidth = wsize[0]
      size.wHeight = wsize[1]
    }
  }

  /**
   * calculate camera visible area size
   */
  function getCameraSize() {
    const camera = (<PerspectiveCamera>obj.camera!)
    const vFOV = (camera.fov * Math.PI) / 180
    const h = 2 * Math.tan(vFOV / 2) * Math.abs(camera.position.z)
    const w = h * camera.aspect
    return [w, h]
  }
  /**
   * Select or unselect an object.
   * It doesn't support selecting more than one objects.
   * It doesn't support selecting a parent object which doesn't have material itself.
   * In order to support de-select, we'll need to store some information, we do this via userData:
   * For InstancedMesh, there are two cases:
   * 1) One Mesh in InstancedMesh is selected
   * it adds following to selected object: userData {
   *   instanceId: number,
   *   originalMatrix: Matrix4,
   *   clonedMesh: Mesh
   * }
   * 2) The whole InstancedMesh is selected. This case is no different from a normal Mesh is selected, so:
   * For Mesh, it adds: userData {
   *   originalMaterial: Material
   * }
   * @param object
   * @param instanceIdOrFaceIndexId pass in instanceId if an InstancedMesh is selected, or faceIndexId for IFCModel
   * @param depthTest set to false if caller want to make sure user can see it. When an object is
   * selected by user manually, we don't need to make sure user can see it. While if selection is
   * made by program, we parbably need to make sure user can see it, in other words, the selected
   * object won't be blocked by other objects.
   */
  function onSelectObject(p: PointerSelectObjectInterface) {
    const { object, instanceIdOrFaceIndexId, depthTest = undefined } = p
    console.log('test selectObject', { object, instanceIdOrFaceIndexId, depthTest })
    // revert last selected object's material if any
    if (obj.pointer?.selectedObject) {
      const userData = obj.pointer.selectedObject.userData
      if (userData.instanceId != null && userData.originalMatrix && userData.clonedMesh) {
        obj.scene && obj.scene.remove(userData.clonedMesh) // clear the cloned mesh
        const im = obj.pointer.selectedObject as InstancedMesh
        im.setMatrixAt(userData.instanceId, userData.originalMatrix) // revert the matrix
        im.instanceMatrix.needsUpdate = true
        im.updateMatrix() // need to call it since object.matrixAutoUpdate is false
        delete userData.instanceId
        delete userData.originalMatrix

        // if the cloned object is selected, then just de-select it and return
        if (object === userData.clonedMesh) {
          userData.clonedMesh.geometry.dispose()
          delete userData.clonedMesh
          obj.pointer.selectedObject = undefined
          // if (this.outlinePass) {
          //   this.outlinePass.selectedObjects = []
          // }
          return
        }
        userData.clonedMesh.geometry.dispose()
        delete userData.clonedMesh
      } else if (userData.originalMaterial) {
        if (obj.pointer.selectedObject.material) {
          // manually dispose it according to https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects
          const material = obj.pointer.selectedObject.material
          if (Array.isArray(material)) {
            material.forEach(m => m.dispose())
          } else if (material instanceof Material) {
            material.dispose()
          }
        }
        obj.pointer.selectedObject.material = userData.originalMaterial
        delete userData.originalMaterial // clean up
      }
      obj.pointer.selectedObject = undefined
      // if (this.outlinePass) {
      //   this.outlinePass.selectedObjects = [];
      // }
    }
    if (!obj.scene || !object) {
      return
    }
    if (object instanceof InstancedMesh && instanceIdOrFaceIndexId != null && obj.pointer) {
      const im = object as InstancedMesh
      const originalMatrix = new Matrix4()
      const hideMatrix = new Matrix4()
      hideMatrix.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0) // this matrix hides an object
      im.getMatrixAt(instanceIdOrFaceIndexId, originalMatrix)
      obj.pointer.selectedObject = object
      // if (this.outlinePass) {
      //   this.outlinePass.selectedObjects = [object];
      // }

      // Here is the example to select InstancedMesh, which is to call setColorAt()
      // https://threejs.org/examples/?q=instanc#webgl_instancing_raycast
      // While, it sounds like only support MeshPhongMaterial. So here, we'll clone
      // a mesh with highlighted color to replace the original instance in InstancedMesh
      const clonedMaterial = clonedHighlightMaterials(object, { depthTest })
      if (clonedMaterial) {
        // clone a new mesh for the selected instance
        const clonedMesh = new Mesh(im.geometry.clone(), clonedMaterial)
        clonedMesh.applyMatrix4(object.matrixWorld.multiply(originalMatrix))
        clonedMesh.matrixWorldNeedsUpdate = true
        clonedMesh.name = "Cloned mesh for highlighting"
        // hide the original mesh by its matrix
        const matrix = originalMatrix.clone()
        matrix.multiplyMatrices(originalMatrix, hideMatrix)
        im.setMatrixAt(instanceIdOrFaceIndexId, matrix)
        im.instanceMatrix.needsUpdate = true
        im.updateMatrix() // need to call it since object.matrixAutoUpdate is false
        obj.pointer.selectedObject.userData.instanceId = instanceIdOrFaceIndexId // store some instanceId so highlight can be reverted
        obj.pointer.selectedObject.userData.originalMatrix = originalMatrix
        obj.pointer.selectedObject.userData.clonedMesh = clonedMesh
        obj.scene.add(clonedMesh) // add it to scene temporaly
      }
    } else {
      // save the original material, so we can reverit it back when deselect
      const clonedMaterial = clonedHighlightMaterials(object as Mesh, { depthTest })
      if (clonedMaterial) {
        obj.pointer!.selectedObject = object
        obj.pointer!.selectedObject.userData.originalMaterial = obj.pointer!.selectedObject.material
        obj.pointer!.selectedObject.material = clonedMaterial
        // if (this.outlinePass) {
        //   this.outlinePass.selectedObjects = [object];
        // }
      }
    }
  }

  function clonedHighlightMaterials(mesh: Mesh, options: {
    depthTest?: boolean,
    highlightColor?: Color,
    opacity?: number
  } = {}): Material | Material[] | undefined {
    if (!mesh || !mesh.material) {
      return undefined
    }
    const mat = mesh.material
    if (Array.isArray(mat) && mat.length > 0) {
      const newMaterials: Material[] = []
      mat.forEach(m => {
        newMaterials.push(clonedHighlightMaterial(m, options))
      })
      return newMaterials
    } else if (mat instanceof Material) {
      return clonedHighlightMaterial(mat, options)
    } else {
      console.warn(`Invalid material: ${mat}`)
    }
    return undefined
  }

  function clonedHighlightMaterial(material: Material, options: {
    depthTest?: boolean,
    highlightColor?: Color,
    opacity?: number
  } = {}) {
    const { depthTest = undefined, highlightColor = new Color(0xff00ff), opacity = 0.7 } = options
    // change highlight color here is we don't like it
    // the original mererial may be used by many objects, we cannot change the original one, thus need to clone
    const mat = material.clone()
    if (mat instanceof MeshStandardMaterial) {
      mat.emissive.set(highlightColor)
      mat.color.set(highlightColor)
    } else if (mat instanceof MeshPhongMaterial) {
      mat.emissive.set(highlightColor)
      mat.color.set(highlightColor)
    } else if (mat instanceof MeshBasicMaterial) {
      mat.color.set(highlightColor)
    } else if (mat instanceof LineBasicMaterial) {
      mat.color.set(highlightColor)
    } else if (mat instanceof MeshLambertMaterial) {
      mat.color.set(highlightColor)
    } else {
      console.error("Unsupported Material: " + (typeof mat).toString())
    }
    // it looks better to be transparent (no matter if it is originally transparent)
    mat.opacity = opacity
    mat.transparent = true // make transparent and so it can visually block other object
    if (depthTest !== undefined) {
      // set depthTest to false so that user can always see it
      mat.depthTest = false
      // make sure to be visible for both side
      mat.side = DoubleSide
    }
    return mat
  }

  /**
   * Make camera fly to objects
   */
  function flyToObjects(objects: Object3D[]) {
    if (!objects || objects.length === 0 || !obj.camera) {
      return
    }
    const eye = new Vector3()
    const look = new Vector3()
    Viewer3DUtils.getCameraPositionByObjects(objects, obj.camera, eye, look)
    flyTo(eye, look)
  }

  /**
       * Make camera fly to an object
       */
  function flyToObject(object: Object3D) {
    flyToObjects([object])
  }

  /**
       * Flies to current selected object if any
       */
  function flyToSelectedObject() {
    if (!obj.pointer?.selectedObject) {
      return
    }
    let sObj = obj.pointer.selectedObject
    // if part of InstancedMesh is selected, fly to that part rather than fly to the whole InstancedMesh
    if (sObj instanceof InstancedMesh && sObj.userData.clonedMesh) {
      sObj = sObj.userData.clonedMesh
    }
    flyToObject(sObj)
  }
  /**
     * Make camera fly to target position with given lookAt position
     * @param position camera's target position
     * @param lookAt camera's new lookAt position
     */
  function flyTo(position: Vector3, lookAt: Vector3, onCompleteCallback?: () => void) {
    const getCamera = (): PerspectiveCamera | OrthographicCamera | undefined => {
      if (obj.camera!.type === 'PerspectiveCamera') {
        const camera = (<PerspectiveCamera>obj.camera)
        return camera
      }
      if (obj.camera!.type === 'OrthographicCamera') {
        const camera = (<OrthographicCamera>obj.camera)
        return camera
      }
    }

    const camera = getCamera()
    const controls = obj.cameraCtrl
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

    const update = (p?: Vector3, t?: Vector3) => {
      t && camera.lookAt(t)
      p && camera.position.set(p.x, p.y, p.z)
      t && controls.target.set(t.x, t.y, t.z)
      controls.update()
      // this.enableRender()
    }

    // there are two steps
    // 1) change camera's lookAt point in x miliseconds
    // 2) change camera's position in y miliseconds
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
      obj.tween = tween2
      tween2.start()
    })
    obj.tween = tween1
    tween1.start()
  }
}
