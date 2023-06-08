'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var vue = require('vue');
var THREE = require('three');
var TWEEN = require('@tweenjs/tween.js');
var OrbitControls_js = require('three/examples/jsm/controls/OrbitControls.js');
var FontLoader_js = require('three/examples/jsm/loaders/FontLoader.js');
var TextGeometry_js = require('three/examples/jsm/geometries/TextGeometry.js');
var RectAreaLightUniformsLib_js = require('three/examples/jsm/lights/RectAreaLightUniformsLib.js');
var RectAreaLightHelper_js = require('three/examples/jsm/helpers/RectAreaLightHelper.js');
var GLTFLoader_js = require('three/examples/jsm/loaders/GLTFLoader.js');
var DRACOLoader_js = require('three/examples/jsm/loaders/DRACOLoader.js');
var FBXLoader_js = require('three/examples/jsm/loaders/FBXLoader.js');
var EffectComposer_js = require('three/examples/jsm/postprocessing/EffectComposer.js');
var RenderPass_js = require('three/examples/jsm/postprocessing/RenderPass.js');
var BokehPass_js = require('three/examples/jsm/postprocessing/BokehPass.js');
var FilmPass_js = require('three/examples/jsm/postprocessing/FilmPass.js');
var ShaderPass_js = require('three/examples/jsm/postprocessing/ShaderPass.js');
var FXAAShader_js = require('three/examples/jsm/shaders/FXAAShader.js');
var HalftonePass_js = require('three/examples/jsm/postprocessing/HalftonePass.js');
var SMAAPass_js = require('three/examples/jsm/postprocessing/SMAAPass.js');
var SSAOPass_js = require('three/examples/jsm/postprocessing/SSAOPass.js');
var UnrealBloomPass_js = require('three/examples/jsm/postprocessing/UnrealBloomPass.js');
require('three/examples/jsm/renderers/CSS2DRenderer.js');
var DRACOExporter_js = require('three/examples/jsm/exporters/DRACOExporter.js');
var OBJExporter_js = require('three/examples/jsm/exporters/OBJExporter.js');
var SimplifyModifier_js = require('three/examples/jsm/modifiers/SimplifyModifier.js');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var THREE__namespace = /*#__PURE__*/_interopNamespace(THREE);
var TWEEN__namespace = /*#__PURE__*/_interopNamespace(TWEEN);

function applyObjectProps(dst, options, setter) {
  if (options instanceof Object) {
    Object.entries(options).forEach(([key, value]) => {
      if (setter)
        setter(dst, key, value);
      else
        dst[key] = value;
    });
  }
}
function bindObjectProp(src, prop, dst, apply = true, setter) {
  if (apply)
    applyObjectProps(dst, src[prop], setter);
  const r = vue.toRef(src, prop);
  return vue.watch(r, (value) => {
    applyObjectProps(dst, value, setter);
  });
}
function bindObjectProps(src, dst, apply = true, setter) {
  if (apply)
    applyObjectProps(dst, src, setter);
  const r = vue.ref(src);
  return vue.watch(r, (value) => {
    applyObjectProps(dst, value, setter);
  }, { deep: true });
}
function setFromProp(o, prop) {
  if (prop instanceof Object) {
    Object.entries(prop).forEach(([key, value]) => {
      o[key] = value;
    });
  }
}
function bindProps(src, props, dst) {
  props.forEach((prop) => {
    bindProp(src, prop, dst, prop);
  });
}
function bindProp(src, srcProp, dst, dstProp) {
  const _dstProp = dstProp || srcProp;
  const ref2 = vue.toRef(src, srcProp);
  if (ref2.value instanceof Object) {
    setFromProp(dst[_dstProp], ref2.value);
    vue.watch(ref2, (value) => {
      setFromProp(dst[_dstProp], value);
    }, { deep: true });
  } else {
    if (ref2.value !== void 0)
      dst[_dstProp] = src[srcProp];
    vue.watch(ref2, (value) => {
      dst[_dstProp] = value;
    });
  }
}
function propsValues(props, exclude = []) {
  const values = {};
  Object.entries(props).forEach(([key, value]) => {
    if (!exclude || !exclude.includes(key)) {
      values[key] = value;
    }
  });
  return values;
}
function lerp(value1, value2, amount) {
  amount = amount < 0 ? 0 : amount;
  amount = amount > 1 ? 1 : amount;
  return value1 + (value2 - value1) * amount;
}
function limit(val, min, max) {
  return val < min ? min : val > max ? max : val;
}
const MATCAP_ROOT = "https://rawcdn.githack.com/emmelleppi/matcaps/9b36ccaaf0a24881a39062d05566c9e92be4aa0d";
const DEFAULT_MATCAP = "0404E8_0404B5_0404CB_3333FC";
function getMatcapUrl(hash = DEFAULT_MATCAP, format = 1024) {
  const fileName = `${hash}${getMatcapFormatString(format)}.png`;
  return `${MATCAP_ROOT}/${format}/${fileName}`;
}
function getMatcapFormatString(format) {
  switch (format) {
    case 64:
      return "-64px";
    case 128:
      return "-128px";
    case 256:
      return "-256px";
    case 512:
      return "-512px";
    default:
      return "";
  }
}

const _Exploder = class {
  constructor(scene, objectId, position = void 0, scale = _Exploder.DEFAULT_SCALE) {
    this.explodedTimes = 0;
    this.isExplodeUp = false;
    this.scene = scene;
    this.objectId = objectId;
    if (!objectId) {
      console.log(`[EXP] Invalid objectId: ${objectId}`);
    }
    this.scale = scale;
    if (scale <= 0) {
      console.log(`[EXP] Invalid scale: ${scale}`);
    }
    if (position) {
      this.position = position;
    } else {
      this.position = new THREE__namespace.Vector3();
      this.getObjectCenter(this.position);
    }
  }
  explode() {
    if (!this.objectId || !this.position || !this.scale) {
      console.log(`[EXP] Invalid objectId: ${this.objectId}, or position: ${this.position}, or this.power: ${this.scale}`);
      return;
    }
    const object = this.scene.getObjectById(this.objectId);
    if (!object || !object.children) {
      console.log("[EXP] No children to explode!");
      return;
    }
    console.log(`[EXP] Exploding ${object.name} at: ${this.position.x}, ${this.position.y}, ${this.position.z}`);
    object.children.forEach((childObj) => {
      if (childObj instanceof THREE__namespace.InstancedMesh) {
        const matrix = new THREE__namespace.Matrix4();
        const pos = new THREE__namespace.Vector3();
        const quaternion = new THREE__namespace.Quaternion();
        const scale = new THREE__namespace.Vector3();
        for (let i = 0; i < childObj.count; ++i) {
          childObj.getMatrixAt(i, matrix);
          matrix.decompose(pos, quaternion, scale);
          if (!this.isExplodeUp) {
            const distance = pos.clone().sub(this.position);
            pos.addScaledVector(distance, this.scale);
          } else {
            const distance2 = (pos.z - this.position.z) * this.scale;
            pos.setZ(pos.z + distance2);
          }
          matrix.setPosition(pos);
          childObj.setMatrixAt(i, matrix);
        }
        childObj.matrixWorldNeedsUpdate = true;
        childObj.instanceMatrix.needsUpdate = true;
      } else {
        const pos = childObj.position.clone();
        if (!this.isExplodeUp) {
          const distance = pos.sub(this.position);
          childObj.position.addScaledVector(distance, this.scale);
        } else {
          const distance2 = (pos.z - this.position.z) * this.scale;
          childObj.position.setZ(pos.z + distance2);
        }
      }
      childObj.updateMatrix();
    });
    this.explodedTimes++;
  }
  unexplode() {
    const object = this.scene.getObjectById(this.objectId);
    if (!object || !object.children) {
      console.log("[EXP] No children to explode!");
      return;
    }
    console.log(`[EXP] Unexploding ${object.name} at: ${this.position.x}, ${this.position.y}, ${this.position.z}`);
    for (let i = this.explodedTimes; i > 0; --i) {
      object.children.forEach((childObj) => {
        if (childObj instanceof THREE__namespace.InstancedMesh) {
          const matrix = new THREE__namespace.Matrix4();
          const pos = new THREE__namespace.Vector3();
          const quaternion = new THREE__namespace.Quaternion();
          const scale = new THREE__namespace.Vector3();
          const factor = this.scale / (1 + this.scale);
          for (let i2 = 0; i2 < childObj.count; ++i2) {
            childObj.getMatrixAt(i2, matrix);
            matrix.decompose(pos, quaternion, scale);
            if (!this.isExplodeUp) {
              const dist = pos.clone().sub(this.position);
              dist.x *= factor;
              dist.y *= factor;
              dist.z *= factor;
              pos.sub(dist);
            } else {
              const dist2 = (pos.z - this.position.z) * factor;
              pos.setZ(pos.z - dist2);
            }
            matrix.setPosition(pos);
            childObj.setMatrixAt(i2, matrix);
          }
          childObj.matrixWorldNeedsUpdate = true;
          childObj.instanceMatrix.needsUpdate = true;
        } else {
          const pos = childObj.position.clone();
          const factor = this.scale / (1 + this.scale);
          if (!this.isExplodeUp) {
            const dist = pos.sub(this.position);
            dist.x *= factor;
            dist.y *= factor;
            dist.z *= factor;
            childObj.position.sub(dist);
          } else {
            const dist2 = (pos.z - this.position.z) * factor;
            childObj.position.setZ(pos.z - dist2);
          }
        }
        childObj.updateMatrix();
      });
    }
  }
  setOnlyExplodeUp(onlyExplodeUp) {
    this.isExplodeUp = onlyExplodeUp;
  }
  getObjectCenter(center) {
    const bbox = new THREE__namespace.Box3();
    if (!this.objectId) {
      console.log(`[EXP] Invalid objectId: ${this.objectId}`);
      return;
    }
    const object = this.scene.getObjectById(this.objectId);
    if (!object || !object.children) {
      console.log("[EXP] No children to explode!");
      return;
    }
    object.traverse((obj) => {
      bbox.expandByObject(obj);
    });
    bbox.getCenter(center);
  }
};
let Exploder = _Exploder;
Exploder.DEFAULT_SCALE = 1;

class SceneUtils {
  static getVisibleObjectBoundingBox(scene) {
    const bbox = new THREE__namespace.Box3();
    scene.traverseVisible((object) => {
      if (object instanceof THREE__namespace.Mesh && object.userData.selectable !== false) {
        bbox.expandByObject(object);
      }
    });
    return bbox;
  }
  static getObjectsBoundingBox(scene, objectUuids) {
    const bbox = new THREE__namespace.Box3();
    objectUuids.forEach((uuid) => {
      const object = scene.getObjectByProperty("uuid", uuid);
      if (object) {
        const box = SceneUtils.getBoundingBox(object);
        if (!box.isEmpty()) {
          bbox.union(box);
        }
      }
    });
    return bbox;
  }
  static getBoundingBox(object, sampling = true) {
    const bbox = new THREE__namespace.Box3();
    if (object instanceof THREE__namespace.InstancedMesh) {
      return SceneUtils.getInstancedMeshBoundingBox(object);
    }
    if (object.children.length === 0) {
      bbox.expandByObject(object);
      return bbox;
    }
    const count = object.children.length;
    let divisor = 1;
    if (count > 20)
      divisor = 3;
    if (count > 100)
      divisor = 5;
    if (count > 200)
      divisor = 10;
    if (count > 1e3)
      divisor = 100;
    object.updateMatrixWorld(false);
    for (let i = 0; i < count; ++i) {
      const child = object.children[i];
      if (!sampling || i % divisor === 0) {
        child.updateMatrix();
        if (child instanceof THREE__namespace.InstancedMesh) {
          const box = SceneUtils.getInstancedMeshBoundingBox(child);
          bbox.union(box);
        } else {
          bbox.expandByObject(child);
        }
      }
    }
    return bbox;
  }
  static getInstancedMeshBoundingBox(mesh) {
    const bbox = new THREE__namespace.Box3();
    const matrix = new THREE__namespace.Matrix4();
    for (let i = 0; i < mesh.count; ++i) {
      mesh.getMatrixAt(i, matrix);
      const geom = mesh.geometry.clone();
      if (geom.boundingBox) {
        const box = geom.boundingBox.applyMatrix4(matrix);
        if (!box.isEmpty() && !isNaN(box.min.x) && !isNaN(box.min.y) && !isNaN(box.min.z) && !isNaN(box.max.x) && !isNaN(box.max.y) && !isNaN(box.max.z)) {
          bbox.union(box);
        }
      }
    }
    bbox.applyMatrix4(mesh.matrixWorld);
    return bbox;
  }
  static explodeObject(object, scene, exploderDict, onlyExplodeUp = false) {
    if (exploderDict[object.id]) {
      exploderDict[object.id].unexplode();
    }
    const position = new THREE__namespace.Vector3();
    SceneUtils.getPositionCenter(object, position);
    const exploder = new Exploder(scene, object.id, position);
    exploder.setOnlyExplodeUp(onlyExplodeUp);
    exploder.explode();
    exploderDict[object.id] = exploder;
  }
  static explodeObjects(scene, exploderDict, objectUuids, onlyExplodeUp = false) {
    scene.traverse((object) => {
      if (objectUuids.find((id) => id === object.uuid)) {
        if (object.children && object.children.length === 1) {
          SceneUtils.explodeObject(object.children[0], scene, exploderDict, onlyExplodeUp);
        } else {
          SceneUtils.explodeObject(object, scene, exploderDict, onlyExplodeUp);
        }
      }
    });
    return exploderDict;
  }
  static unexplodeObjects(scene, exploderDict) {
    scene.traverse((object) => {
      const exploder = exploderDict[object.id];
      if (exploder) {
        exploder.unexplode();
        delete exploderDict[object.id];
      }
    });
  }
  static getPositionCenter(object, center) {
    const bbox = SceneUtils.getBoundingBox(object);
    bbox.getCenter(center);
    center.y = bbox.min.y;
  }
}

var Views = /* @__PURE__ */ ((Views2) => {
  Views2["Top"] = "Top";
  Views2["Bottom"] = "Bottom";
  Views2["Front"] = "Front";
  Views2["Back"] = "Back";
  Views2["Left"] = "Left";
  Views2["Right"] = "Right";
  return Views2;
})(Views || {});
const _Viewer3DUtils = class {
  static getCameraPositionByView(scene, view, eye, look) {
    const bbox = SceneUtils.getVisibleObjectBoundingBox(scene);
    _Viewer3DUtils.getCameraPositionByBboxAndView(bbox, view, eye, look);
  }
  static getCameraPositionByObjectUuids(scene, objectUuids, view, eye, look) {
    const bbox = SceneUtils.getObjectsBoundingBox(scene, objectUuids);
    _Viewer3DUtils.getCameraPositionByBboxAndView(bbox, view, eye, look);
  }
  static getCameraPositionByObjects(objects, camera, eye, look) {
    const bbox = new THREE__namespace.Box3();
    objects.forEach((object) => {
      const box = SceneUtils.getBoundingBox(object);
      bbox.union(box);
    });
    _Viewer3DUtils.getCameraPositionByBboxAndCamera(bbox, camera, eye, look);
  }
  static getCameraPositionByBboxAndCamera(bbox, camera, eye, look) {
    if (bbox.isEmpty()) {
      return;
    }
    const DISTANCE_FACTOR = 1.2;
    let distance = bbox.max.x - bbox.min.x + (bbox.max.y - bbox.min.y) + (bbox.max.z - bbox.min.z);
    distance *= DISTANCE_FACTOR;
    const distanceVector = new THREE__namespace.Vector3(distance, distance, distance);
    const cx = (bbox.min.x + bbox.max.x) / 2;
    const cy = (bbox.min.y + bbox.max.y) / 2;
    const cz = (bbox.min.z + bbox.max.z) / 2;
    look.set(cx, cy, cz);
    const oldPostion = new THREE__namespace.Vector3();
    camera.getWorldPosition(oldPostion);
    const dir = oldPostion.sub(look).normalize();
    const pos = dir.multiply(distanceVector).add(look);
    eye.set(pos.x, pos.y, pos.z);
  }
  static getCameraPositionByBboxAndView(bbox, view, eye, look) {
    if (bbox.isEmpty()) {
      return;
    }
    const distance = bbox.max.x - bbox.min.x + (bbox.max.y - bbox.min.y) + (bbox.max.z - bbox.min.z);
    const delta = (0.5 + 0.5 / Math.pow(Math.E, distance / 100)) * distance;
    let x = 0;
    let y = bbox.min.y + (bbox.max.y - bbox.min.y);
    let z = 0;
    const cx = (bbox.min.x + bbox.max.x) / 2;
    const cy = (bbox.min.y + bbox.max.y) / 2;
    const cz = (bbox.min.z + bbox.max.z) / 2;
    if (view === "Top" /* Top */) {
      y = bbox.max.y + delta;
    } else if (view === "Bottom" /* Bottom */) {
      y = bbox.min.y - delta;
    } else if (view === "Front" /* Front */) {
      z = bbox.max.z + delta;
      x = cx;
    } else if (view === "Back" /* Back */) {
      z = bbox.min.z - delta;
      x = cx;
    } else if (view === "Left" /* Left */) {
      x = bbox.min.x - delta;
      z = cz;
    } else if (view === "Right" /* Right */) {
      x = bbox.max.x + delta;
      z = cz;
    }
    eye.x = x;
    eye.y = y;
    eye.z = z;
    look.x = cx;
    look.y = cy;
    look.z = cz;
  }
  static async sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("");
      }, ms);
    });
  }
  static async twinkle(obj, ms = 500) {
    const uuids = _Viewer3DUtils.twinklingObjectUuids;
    if (uuids[obj.uuid]) {
      return;
    }
    uuids[obj.uuid] = true;
    obj.visible = !obj.visible;
    await this.sleep(ms);
    obj.visible = !obj.visible;
    await this.sleep(ms);
    obj.visible = !obj.visible;
    await this.sleep(ms);
    obj.visible = !obj.visible;
    await this.sleep(ms);
    obj.visible = !obj.visible;
    await this.sleep(ms);
    obj.visible = !obj.visible;
    delete uuids[obj.uuid];
  }
};
let Viewer3DUtils = _Viewer3DUtils;
Viewer3DUtils.twinklingObjectUuids = {};

function useRaycaster(options) {
  const {
    camera,
    resetPosition = new THREE.Vector3(0, 0, 0)
  } = options;
  const raycaster = new THREE.Raycaster();
  const position = resetPosition.clone();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const updatePosition = (coords) => {
    raycaster.setFromCamera(coords, camera);
    camera.getWorldDirection(plane.normal);
    raycaster.ray.intersectPlane(plane, position);
  };
  const intersect = (coords, objects, recursive = false) => {
    raycaster.setFromCamera(coords, camera);
    return raycaster.intersectObjects(objects, recursive);
  };
  return {
    position,
    updatePosition,
    intersect
  };
}

function usePointer(options) {
  const {
    camera,
    domElement,
    intersectObjects,
    selectedObject = void 0,
    intersectRecursive = false,
    touch = true,
    resetOnEnd = false,
    onEnter = () => {
    },
    onMove = () => {
    },
    onLeave = () => {
    },
    onClick = () => {
    },
    onIntersectEnter = () => {
    },
    onIntersectOver = () => {
    },
    onIntersectMove = () => {
    },
    onIntersectLeave = () => {
    },
    onIntersectClick = () => {
    },
    onSelectObject,
    flyToSelectedObject
  } = options;
  const position = new THREE.Vector2(0, 0);
  const positionN = new THREE.Vector2(0, 0);
  const raycaster = useRaycaster({ camera });
  const positionV3 = raycaster.position;
  const obj = {
    position,
    positionN,
    positionV3,
    intersectObjects,
    selectedObject,
    listeners: false,
    mouseDoubleClicked: false,
    addListeners,
    removeListeners,
    intersect
  };
  return obj;
  function reset() {
    position.set(0, 0);
    positionN.set(0, 0);
    positionV3.set(0, 0, 0);
  }
  function updatePosition(event) {
    let x, y;
    if (event.touches && event.touches.length > 0) {
      x = event.touches[0].clientX;
      y = event.touches[0].clientY;
    } else {
      x = event.clientX;
      y = event.clientY;
    }
    const rect = domElement.getBoundingClientRect();
    position.x = x - rect.left;
    position.y = y - rect.top;
    positionN.x = position.x / rect.width * 2 - 1;
    positionN.y = -(position.y / rect.height) * 2 + 1;
    raycaster.updatePosition(positionN);
  }
  function intersect() {
    const _intersectObjects = getIntersectObjects();
    if (_intersectObjects.length) {
      const intersects = raycaster.intersect(positionN, _intersectObjects, intersectRecursive);
      const offObjects = [..._intersectObjects];
      const iMeshes = [];
      intersects.forEach((intersect2) => {
        var _a, _b, _c;
        const { object } = intersect2;
        const component = getComponent(object);
        if (object instanceof THREE.InstancedMesh) {
          if (iMeshes.indexOf(object) !== -1)
            return;
          iMeshes.push(object);
        }
        if (!object.userData.over) {
          object.userData.over = true;
          const overEvent = { type: "pointerover", over: true, component, intersect: intersect2 };
          const enterEvent = { ...overEvent, type: "pointerenter" };
          onIntersectOver(overEvent);
          onIntersectEnter(enterEvent);
          (_a = component == null ? void 0 : component.onPointerOver) == null ? void 0 : _a.call(component, overEvent);
          (_b = component == null ? void 0 : component.onPointerEnter) == null ? void 0 : _b.call(component, enterEvent);
        }
        const moveEvent = { type: "pointermove", component, intersect: intersect2 };
        onIntersectMove(moveEvent);
        (_c = component == null ? void 0 : component.onPointerMove) == null ? void 0 : _c.call(component, moveEvent);
        offObjects.splice(offObjects.indexOf(object), 1);
      });
      offObjects.forEach((object) => {
        var _a, _b;
        const component = getComponent(object);
        if (object.userData.over) {
          object.userData.over = false;
          const overEvent = { type: "pointerover", over: false, component };
          const leaveEvent = { ...overEvent, type: "pointerleave" };
          onIntersectOver(overEvent);
          onIntersectLeave(leaveEvent);
          (_a = component == null ? void 0 : component.onPointerOver) == null ? void 0 : _a.call(component, overEvent);
          (_b = component == null ? void 0 : component.onPointerLeave) == null ? void 0 : _b.call(component, leaveEvent);
        }
      });
    }
  }
  function pointerEnter(event) {
    updatePosition(event);
    onEnter({ type: "pointerenter", position, positionN, positionV3 });
  }
  function pointerMove(event) {
    updatePosition(event);
    onMove({ type: "pointermove", position, positionN, positionV3 });
    intersect();
  }
  function pointerClick(event) {
    var _a;
    updatePosition(event);
    const _intersectObjects = getIntersectObjects();
    console.log(_intersectObjects);
    if (_intersectObjects.length) {
      const intersects = raycaster.intersect(positionN, _intersectObjects, intersectRecursive);
      const intersect2 = getFirstIntersect(intersects);
      const { object } = intersect2;
      const component = getComponent(object);
      if (object instanceof THREE.InstancedMesh) {
        return;
      }
      const event2 = { type: "click", component, intersect: intersect2 };
      onIntersectClick(event2);
      (_a = component == null ? void 0 : component.onClick) == null ? void 0 : _a.call(component, event2);
    }
    onClick({ type: "click", position, positionN, positionV3 });
  }
  function pointerUp(event) {
    if (!obj.mouseDoubleClicked) {
      setTimeout(onPointerUp(event), 200);
    }
    if (obj.mouseDoubleClicked) {
      setTimeout(() => {
        obj.mouseDoubleClicked = false;
      }, 200);
    }
  }
  function onPointerUp(event) {
    return () => {
      if (!obj.mouseDoubleClicked) {
        pointerClick(event);
      }
    };
  }
  function pointerDblClick(event) {
    obj.mouseDoubleClicked = true;
    pointerClick(event);
    flyToSelectedObject && flyToSelectedObject();
  }
  function pointerLeave() {
    if (resetOnEnd)
      reset();
    onLeave({ type: "pointerleave" });
  }
  function getFirstIntersect(intersections) {
    const firstIntersect = intersections.find((intersect2) => {
      const object2 = intersect2.object;
      return object2.visible && (object2.userData.selectable !== false || object2 instanceof THREE.Mesh);
    });
    let object = firstIntersect && firstIntersect.object || void 0;
    let instanceId;
    if (object) {
      if (object.userData.selectable === false) {
        console.log(`[Viewer] object(type: ${object.type}, name: ${object.name}) not selectable!`);
        object = void 0;
      } else if (object instanceof THREE.InstancedMesh) {
        instanceId = firstIntersect.instanceId;
        if (obj.selectedObject && obj.selectedObject.uuid === object.uuid && obj.selectedObject.userData.instanceId === instanceId) {
          object = void 0;
        }
      } else if (obj.selectedObject && obj.selectedObject.uuid === object.uuid) {
        object = void 0;
      }
    }
    if (onSelectObject) {
      object ? onSelectObject({
        object,
        instanceIdOrFaceIndexId: instanceId,
        depthTest: void 0
      }) : clearSelection();
    }
    return firstIntersect;
  }
  function clearSelection() {
    onSelectObject && onSelectObject({ depthTest: void 0 });
  }
  function getComponent(object) {
    if (object.userData.component)
      return object.userData.component;
    let parent = object.parent;
    while (parent) {
      if (parent.userData.component) {
        return parent.userData.component;
      }
      parent = parent.parent;
    }
    return void 0;
  }
  function getIntersectObjects() {
    if (typeof intersectObjects === "function") {
      return intersectObjects();
    } else
      return intersectObjects;
  }
  function addListeners() {
    domElement.addEventListener("mouseenter", pointerEnter);
    domElement.addEventListener("mousemove", pointerMove);
    domElement.addEventListener("mouseleave", pointerLeave);
    domElement.addEventListener("pointerup", pointerUp);
    domElement.addEventListener("dblclick", pointerDblClick);
    if (touch) {
      domElement.addEventListener("touchstart", pointerEnter);
      domElement.addEventListener("touchmove", pointerMove);
      domElement.addEventListener("touchend", pointerLeave);
    }
    obj.listeners = true;
  }
  function removeListeners() {
    domElement.removeEventListener("mouseenter", pointerEnter);
    domElement.removeEventListener("mousemove", pointerMove);
    domElement.removeEventListener("mouseleave", pointerLeave);
    domElement.removeEventListener("pointerup", pointerUp);
    domElement.removeEventListener("dblclick", pointerDblClick);
    domElement.removeEventListener("touchstart", pointerEnter);
    domElement.removeEventListener("touchmove", pointerMove);
    domElement.removeEventListener("touchend", pointerLeave);
    obj.listeners = false;
  }
}

function useThree(params) {
  const config = {
    antialias: true,
    alpha: false,
    autoClear: true,
    orbitCtrl: false,
    pointer: false,
    resize: false,
    width: 300,
    height: 150
  };
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      config[key] = value;
    });
  }
  const size = {
    width: 1,
    height: 1,
    wWidth: 1,
    wHeight: 1,
    ratio: 1
  };
  const beforeRenderCallbacks = [];
  const intersectObjects = [];
  const renderer = createRenderer();
  const obj = {
    config,
    renderer,
    size,
    init,
    dispose,
    render,
    renderC,
    setSize,
    addIntersectObject,
    removeIntersectObject
  };
  return obj;
  function createRenderer() {
    const renderer2 = new THREE.WebGLRenderer({ canvas: config.canvas, antialias: config.antialias, alpha: config.alpha, ...config.params });
    renderer2.autoClear = config.autoClear;
    return renderer2;
  }
  function init() {
    if (!obj.scene) {
      console.error("Missing Scene");
      return false;
    }
    if (!obj.camera) {
      console.error("Missing Camera");
      return false;
    }
    if (config.resize) {
      onResize();
      window.addEventListener("resize", onResize);
    } else if (config.width && config.height) {
      setSize(config.width, config.height);
    }
    initPointer();
    if (config.orbitCtrl) {
      const cameraCtrl = new OrbitControls_js.OrbitControls(obj.camera, obj.renderer.domElement);
      if (config.orbitCtrl instanceof Object) {
        Object.entries(config.orbitCtrl).forEach(([key, value]) => {
          cameraCtrl[key] = value;
        });
      }
      cameraCtrl.listenToKeyEvents(document.body);
      onBeforeRender(() => {
        cameraCtrl.update();
      });
      obj.cameraCtrl = cameraCtrl;
    }
    return true;
  }
  function initPointer() {
    let pointerConf = {
      camera: obj.camera,
      domElement: obj.renderer.domElement,
      intersectObjects,
      selectedObject: void 0,
      onSelectObject,
      flyToSelectedObject
    };
    if (config.pointer && config.pointer instanceof Object) {
      pointerConf = { ...pointerConf, ...config.pointer };
    }
    const pointer = obj.pointer = usePointer(pointerConf);
    if (config.pointer || intersectObjects.length) {
      pointer.addListeners();
      if (pointerConf.intersectMode === "frame") {
        onBeforeRender(pointer.intersect);
      }
    }
  }
  function onBeforeRender(cb) {
    beforeRenderCallbacks.push(cb);
  }
  function render() {
    beforeRenderCallbacks.forEach((c) => c());
    obj.renderer.render(obj.scene, obj.camera);
  }
  function renderC() {
    beforeRenderCallbacks.forEach((c) => c());
    obj.composer.render();
  }
  function addIntersectObject(o) {
    if (intersectObjects.indexOf(o) === -1) {
      intersectObjects.push(o);
    }
    if (obj.pointer && !obj.pointer.listeners) {
      obj.pointer.addListeners();
    }
  }
  function removeIntersectObject(o) {
    const i = intersectObjects.indexOf(o);
    if (i !== -1) {
      intersectObjects.splice(i, 1);
    }
    if (obj.pointer && !config.pointer && intersectObjects.length === 0) {
      obj.pointer.removeListeners();
    }
  }
  function dispose() {
    window.removeEventListener("resize", onResize);
    if (obj.pointer)
      obj.pointer.removeListeners();
    if (obj.cameraCtrl)
      obj.cameraCtrl.dispose();
    if (obj.renderer)
      obj.renderer.dispose();
  }
  function onResize() {
    var _a;
    if (config.resize === "window") {
      setSize(window.innerWidth, window.innerHeight);
    } else {
      const elt = obj.renderer.domElement.parentNode;
      if (elt)
        setSize(elt.clientWidth, elt.clientHeight);
    }
    (_a = config.onResize) == null ? void 0 : _a.call(config, size);
  }
  function setSize(width, height) {
    size.width = width;
    size.height = height;
    size.ratio = width / height;
    obj.renderer.setSize(width, height, false);
    const camera = obj.camera;
    if (camera.type === "PerspectiveCamera") {
      const pCamera = camera;
      pCamera.aspect = size.ratio;
      pCamera.updateProjectionMatrix();
    }
    if (camera.type === "OrthographicCamera") {
      const oCamera = camera;
      size.wWidth = oCamera.right - oCamera.left;
      size.wHeight = oCamera.top - oCamera.bottom;
    } else {
      const wsize = getCameraSize();
      size.wWidth = wsize[0];
      size.wHeight = wsize[1];
    }
  }
  function getCameraSize() {
    const camera = obj.camera;
    const vFOV = camera.fov * Math.PI / 180;
    const h = 2 * Math.tan(vFOV / 2) * Math.abs(camera.position.z);
    const w = h * camera.aspect;
    return [w, h];
  }
  function onSelectObject(p) {
    var _a;
    const { object, instanceIdOrFaceIndexId, depthTest = void 0 } = p;
    console.log("test selectObject", { object, instanceIdOrFaceIndexId, depthTest });
    if ((_a = obj.pointer) == null ? void 0 : _a.selectedObject) {
      const userData = obj.pointer.selectedObject.userData;
      if (userData.instanceId != null && userData.originalMatrix && userData.clonedMesh) {
        obj.scene && obj.scene.remove(userData.clonedMesh);
        const im = obj.pointer.selectedObject;
        im.setMatrixAt(userData.instanceId, userData.originalMatrix);
        im.instanceMatrix.needsUpdate = true;
        im.updateMatrix();
        delete userData.instanceId;
        delete userData.originalMatrix;
        if (object === userData.clonedMesh) {
          userData.clonedMesh.geometry.dispose();
          delete userData.clonedMesh;
          obj.pointer.selectedObject = void 0;
          return;
        }
        userData.clonedMesh.geometry.dispose();
        delete userData.clonedMesh;
      } else if (userData.originalMaterial) {
        if (obj.pointer.selectedObject.material) {
          const material = obj.pointer.selectedObject.material;
          if (Array.isArray(material)) {
            material.forEach((m) => m.dispose());
          } else if (material instanceof THREE.Material) {
            material.dispose();
          }
        }
        obj.pointer.selectedObject.material = userData.originalMaterial;
        delete userData.originalMaterial;
      }
      obj.pointer.selectedObject = void 0;
    }
    if (!obj.scene || !object) {
      return;
    }
    if (object instanceof THREE.InstancedMesh && instanceIdOrFaceIndexId != null && obj.pointer) {
      const im = object;
      const originalMatrix = new THREE.Matrix4();
      const hideMatrix = new THREE.Matrix4();
      hideMatrix.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      im.getMatrixAt(instanceIdOrFaceIndexId, originalMatrix);
      obj.pointer.selectedObject = object;
      const clonedMaterial = clonedHighlightMaterials(object, { depthTest });
      if (clonedMaterial) {
        const clonedMesh = new THREE.Mesh(im.geometry.clone(), clonedMaterial);
        clonedMesh.applyMatrix4(object.matrixWorld.multiply(originalMatrix));
        clonedMesh.matrixWorldNeedsUpdate = true;
        clonedMesh.name = "Cloned mesh for highlighting";
        const matrix = originalMatrix.clone();
        matrix.multiplyMatrices(originalMatrix, hideMatrix);
        im.setMatrixAt(instanceIdOrFaceIndexId, matrix);
        im.instanceMatrix.needsUpdate = true;
        im.updateMatrix();
        obj.pointer.selectedObject.userData.instanceId = instanceIdOrFaceIndexId;
        obj.pointer.selectedObject.userData.originalMatrix = originalMatrix;
        obj.pointer.selectedObject.userData.clonedMesh = clonedMesh;
        obj.scene.add(clonedMesh);
      }
    } else {
      const clonedMaterial = clonedHighlightMaterials(object, { depthTest });
      if (clonedMaterial) {
        obj.pointer.selectedObject = object;
        obj.pointer.selectedObject.userData.originalMaterial = obj.pointer.selectedObject.material;
        obj.pointer.selectedObject.material = clonedMaterial;
      }
    }
  }
  function clonedHighlightMaterials(mesh, options = {}) {
    if (!mesh || !mesh.material) {
      return void 0;
    }
    const mat = mesh.material;
    if (Array.isArray(mat) && mat.length > 0) {
      const newMaterials = [];
      mat.forEach((m) => {
        newMaterials.push(clonedHighlightMaterial(m, options));
      });
      return newMaterials;
    } else if (mat instanceof THREE.Material) {
      return clonedHighlightMaterial(mat, options);
    } else {
      console.warn(`Invalid material: ${mat}`);
    }
    return void 0;
  }
  function clonedHighlightMaterial(material, options = {}) {
    const { depthTest = void 0, highlightColor = new THREE.Color(16711935), opacity = 0.7 } = options;
    const mat = material.clone();
    if (mat instanceof THREE.MeshStandardMaterial) {
      mat.emissive.set(highlightColor);
      mat.color.set(highlightColor);
    } else if (mat instanceof THREE.MeshPhongMaterial) {
      mat.emissive.set(highlightColor);
      mat.color.set(highlightColor);
    } else if (mat instanceof THREE.MeshBasicMaterial) {
      mat.color.set(highlightColor);
    } else if (mat instanceof THREE.LineBasicMaterial) {
      mat.color.set(highlightColor);
    } else if (mat instanceof THREE.MeshLambertMaterial) {
      mat.color.set(highlightColor);
    } else {
      console.error("Unsupported Material: " + (typeof mat).toString());
    }
    mat.opacity = opacity;
    mat.transparent = true;
    if (depthTest !== void 0) {
      mat.depthTest = false;
      mat.side = THREE.DoubleSide;
    }
    return mat;
  }
  function flyToObjects(objects) {
    if (!objects || objects.length === 0 || !obj.camera) {
      return;
    }
    const eye = new THREE.Vector3();
    const look = new THREE.Vector3();
    Viewer3DUtils.getCameraPositionByObjects(objects, obj.camera, eye, look);
    flyTo(eye, look);
  }
  function flyToObject(object) {
    flyToObjects([object]);
  }
  function flyToSelectedObject() {
    var _a;
    if (!((_a = obj.pointer) == null ? void 0 : _a.selectedObject)) {
      return;
    }
    let sObj = obj.pointer.selectedObject;
    if (sObj instanceof THREE.InstancedMesh && sObj.userData.clonedMesh) {
      sObj = sObj.userData.clonedMesh;
    }
    flyToObject(sObj);
  }
  function flyTo(position, lookAt, onCompleteCallback) {
    const getCamera = () => {
      if (obj.camera.type === "PerspectiveCamera") {
        const camera2 = obj.camera;
        return camera2;
      }
      if (obj.camera.type === "OrthographicCamera") {
        const camera2 = obj.camera;
        return camera2;
      }
    };
    const camera = getCamera();
    const controls = obj.cameraCtrl;
    if (!camera || !controls) {
      return;
    }
    if (position.equals(lookAt)) {
      console.error("[Viewer3D] camera position and lookAt cannot be the same!");
      return;
    } else if (isNaN(position.x) || isNaN(position.y) || isNaN(position.z) || isNaN(lookAt.x) || isNaN(lookAt.y) || isNaN(lookAt.z)) {
      console.error("[Viewer3D] invalid position or lookAt!");
      return;
    }
    const distance = position.distanceTo(lookAt);
    if (distance < camera.near) {
      position = position.clone().sub(lookAt).normalize().multiplyScalar(camera.near * 1.1);
      console.warn("[Viewer3D] camera could be too close to see the object!");
    } else if (distance > camera.far) {
      position = position.clone().sub(lookAt).normalize().multiplyScalar(camera.far * 0.9);
      console.warn("[Viewer3D] camera could be too far to see the object!");
    }
    const update = (p, t2) => {
      t2 && camera.lookAt(t2);
      p && camera.position.set(p.x, p.y, p.z);
      t2 && controls.target.set(t2.x, t2.y, t2.z);
      controls.update();
    };
    const t = controls.target.clone();
    const tween1 = new TWEEN__namespace.Tween(t);
    tween1.to(lookAt, 500);
    tween1.easing(TWEEN__namespace.Easing.Sinusoidal.InOut);
    tween1.onUpdate(() => {
      update(void 0, t);
    });
    tween1.onComplete(() => {
      const p = camera.position.clone();
      const tween2 = new TWEEN__namespace.Tween(p);
      tween2.to(position, 1500);
      tween2.easing(TWEEN__namespace.Easing.Sinusoidal.InOut);
      tween2.onUpdate(() => {
        update(p, lookAt);
      });
      tween2.onComplete(() => {
        update(p, lookAt);
        onCompleteCallback && onCompleteCallback();
      });
      obj.tween = tween2;
      tween2.start();
    });
    obj.tween = tween1;
    tween1.start();
  }
}

const RendererInjectionKey = Symbol("Renderer");
var Renderer = vue.defineComponent({
  name: "Renderer",
  props: {
    params: { type: Object, default: () => ({}) },
    antialias: Boolean,
    alpha: Boolean,
    autoClear: { type: Boolean, default: true },
    orbitCtrl: { type: [Boolean, Object], default: false },
    pointer: { type: [Boolean, Object], default: false },
    resize: { type: [Boolean, String], default: false },
    shadow: Boolean,
    width: String,
    height: String,
    pixelRatio: Number,
    xr: Boolean,
    props: { type: Object, default: () => ({}) },
    onReady: Function
  },
  inheritAttrs: false,
  setup(props, { attrs }) {
    const initCallbacks = [];
    const mountedCallbacks = [];
    const beforeRenderCallbacks = [];
    const afterRenderCallbacks = [];
    const resizeCallbacks = [];
    const canvas = document.createElement("canvas");
    Object.entries(attrs).forEach(([key, value]) => {
      const matches = key.match(/^on([A-Z][a-zA-Z]*)$/);
      if (matches) {
        canvas.addEventListener(matches[1].toLowerCase(), value);
      } else {
        canvas.setAttribute(key, value);
      }
    });
    const config = {
      canvas,
      params: props.params,
      antialias: props.antialias,
      alpha: props.alpha,
      autoClear: props.autoClear,
      orbitCtrl: props.orbitCtrl,
      pointer: props.pointer,
      resize: props.resize
    };
    if (props.width)
      config.width = parseInt(props.width);
    if (props.height)
      config.height = parseInt(props.height);
    const three = useThree(config);
    bindObjectProp(props, "props", three.renderer);
    vue.watchEffect(() => {
      if (props.pixelRatio)
        three.renderer.setPixelRatio(props.pixelRatio);
    });
    const renderFn = () => {
    };
    return {
      canvas,
      three,
      renderer: three.renderer,
      size: three.size,
      renderFn,
      raf: true,
      initCallbacks,
      mountedCallbacks,
      beforeRenderCallbacks,
      afterRenderCallbacks,
      resizeCallbacks
    };
  },
  computed: {
    camera: {
      get: function() {
        return this.three.camera;
      },
      set: function(camera) {
        this.three.camera = camera;
      }
    },
    scene: {
      get: function() {
        return this.three.scene;
      },
      set: function(scene) {
        this.three.scene = scene;
      }
    },
    composer: {
      get: function() {
        return this.three.composer;
      },
      set: function(composer) {
        this.three.composer = composer;
      }
    }
  },
  provide() {
    return {
      [RendererInjectionKey]: this
    };
  },
  mounted() {
    var _a;
    this.$el.parentNode.insertBefore(this.canvas, this.$el);
    if (this.three.init()) {
      if (this.three.pointer) {
        this.$pointer = this.three.pointer;
      }
      this.three.config.onResize = (size) => {
        this.resizeCallbacks.forEach((e) => e({ type: "resize", renderer: this, size }));
      };
      if (this.shadow) {
        this.renderer.shadowMap.enabled = true;
      }
      this.renderFn = this.three.composer ? this.three.renderC : this.three.render;
      this.initCallbacks.forEach((e) => e({ type: "init", renderer: this }));
      (_a = this.onReady) == null ? void 0 : _a.call(this, this);
      if (this.xr) {
        this.renderer.xr.enabled = true;
        this.renderer.setAnimationLoop(this.render);
      } else {
        requestAnimationFrame(this.renderLoop);
      }
    }
    this.mountedCallbacks.forEach((e) => e({ type: "mounted", renderer: this }));
  },
  beforeUnmount() {
    this.canvas.remove();
    this.beforeRenderCallbacks = [];
    this.afterRenderCallbacks = [];
    this.raf = false;
    this.three.dispose();
  },
  methods: {
    onInit(cb) {
      this.addListener("init", cb);
    },
    onMounted(cb) {
      this.addListener("mounted", cb);
    },
    onBeforeRender(cb) {
      this.addListener("beforerender", cb);
    },
    offBeforeRender(cb) {
      this.removeListener("beforerender", cb);
    },
    onAfterRender(cb) {
      this.addListener("afterrender", cb);
    },
    offAfterRender(cb) {
      this.removeListener("afterrender", cb);
    },
    onResize(cb) {
      this.addListener("resize", cb);
    },
    offResize(cb) {
      this.removeListener("resize", cb);
    },
    addListener(type, cb) {
      const callbacks = this.getCallbacks(type);
      callbacks.push(cb);
    },
    removeListener(type, cb) {
      const callbacks = this.getCallbacks(type);
      const index = callbacks.indexOf(cb);
      if (index !== -1)
        callbacks.splice(index, 1);
    },
    getCallbacks(type) {
      if (type === "init") {
        return this.initCallbacks;
      } else if (type === "mounted") {
        return this.mountedCallbacks;
      } else if (type === "beforerender") {
        return this.beforeRenderCallbacks;
      } else if (type === "afterrender") {
        return this.afterRenderCallbacks;
      } else {
        return this.resizeCallbacks;
      }
    },
    render(time) {
      this.beforeRenderCallbacks.forEach((e) => e({ type: "beforerender", renderer: this, time }));
      this.renderFn({ renderer: this, time });
      this.afterRenderCallbacks.forEach((e) => e({ type: "afterrender", renderer: this, time }));
      this.three.tween && TWEEN__namespace.update();
    },
    renderLoop(time) {
      if (this.raf)
        requestAnimationFrame(this.renderLoop);
      this.render(time);
    }
  },
  render() {
    return this.$slots.default ? this.$slots.default() : [];
  },
  __hmrId: "Renderer"
});

var Camera = vue.defineComponent({
  props: {
    props: { type: Object, default: () => ({}) }
  },
  render() {
    return this.$slots.default ? this.$slots.default() : [];
  }
});
function cameraSetProp(camera, key, value, updateProjectionMatrix = true) {
  camera[key] = value;
  if (updateProjectionMatrix)
    camera.updateProjectionMatrix();
}

var OrthographicCamera = vue.defineComponent({
  extends: Camera,
  name: "OrthographicCamera",
  props: {
    left: { type: Number, default: -1 },
    right: { type: Number, default: 1 },
    top: { type: Number, default: 1 },
    bottom: { type: Number, default: -1 },
    near: { type: Number, default: 0.1 },
    far: { type: Number, default: 2e3 },
    zoom: { type: Number, default: 1 },
    position: { type: Object, default: () => ({ x: 0, y: 0, z: 0 }) }
  },
  setup(props) {
    const renderer = vue.inject(RendererInjectionKey);
    if (!renderer) {
      console.error("Renderer not found");
      return;
    }
    const camera = new THREE.OrthographicCamera(props.left, props.right, props.top, props.bottom, props.near, props.far);
    renderer.camera = camera;
    bindProp(props, "position", camera);
    bindObjectProp(props, "props", camera, true, cameraSetProp);
    ["left", "right", "top", "bottom", "near", "far", "zoom"].forEach((p) => {
      vue.watch(() => props[p], (value) => {
        cameraSetProp(camera, p, value);
      });
    });
    return { renderer, camera };
  },
  __hmrId: "OrthographicCamera"
});

var PerspectiveCamera = vue.defineComponent({
  extends: Camera,
  name: "PerspectiveCamera",
  props: {
    aspect: { type: Number, default: 2.049 },
    far: { type: Number, default: 3e4 },
    fov: { type: Number, default: 50 },
    near: { type: Number, default: 0.5 },
    position: { type: Object, default: () => ({ x: 0, y: 0, z: 0 }) },
    lookAt: { type: Object, default: null }
  },
  setup(props) {
    var _a;
    const renderer = vue.inject(RendererInjectionKey);
    if (!renderer) {
      console.error("Renderer not found");
      return;
    }
    const camera = new THREE.PerspectiveCamera(props.fov, props.aspect, props.near, props.far);
    renderer.camera = camera;
    bindProp(props, "position", camera);
    if (props.lookAt)
      camera.lookAt((_a = props.lookAt.x) != null ? _a : 0, props.lookAt.y, props.lookAt.z);
    vue.watch(() => props.lookAt, (v) => {
      var _a2;
      camera.lookAt((_a2 = v.x) != null ? _a2 : 0, v.y, v.z);
    }, { deep: true });
    bindObjectProp(props, "props", camera, true, cameraSetProp);
    ["aspect", "far", "fov", "near"].forEach((p) => {
      vue.watch(() => props[p], (value) => {
        cameraSetProp(camera, p, value);
      });
    });
    return { renderer, camera };
  },
  __hmrId: "PerspectiveCamera"
});

const SceneInjectionKey = Symbol("Scene");
var Scene = vue.defineComponent({
  name: "Scene",
  props: {
    background: [String, Number, Object]
  },
  setup(props) {
    const renderer = vue.inject(RendererInjectionKey);
    const scene = new THREE.Scene();
    if (!renderer) {
      console.error("Renderer not found");
      return;
    }
    renderer.scene = scene;
    vue.provide(SceneInjectionKey, scene);
    const setBackground = (value) => {
      if (!value)
        return;
      if (typeof value === "string" || typeof value === "number") {
        if (scene.background instanceof THREE.Color)
          scene.background.set(value);
        else
          scene.background = new THREE.Color(value);
      } else if (value instanceof THREE.Texture) {
        scene.background = value;
      }
    };
    setBackground(props.background);
    vue.watch(() => props.background, setBackground);
    const add = (o) => {
      scene.add(o);
    };
    const remove = (o) => {
      scene.remove(o);
    };
    return { scene, add, remove };
  },
  render() {
    return this.$slots.default ? this.$slots.default() : [];
  },
  __hmrId: "Scene"
});

const pointerProps = {
  onPointerEnter: Function,
  onPointerOver: Function,
  onPointerMove: Function,
  onPointerLeave: Function,
  onPointerDown: Function,
  onPointerUp: Function,
  onClick: Function
};
var Object3D = vue.defineComponent({
  name: "Object3D",
  inject: {
    renderer: RendererInjectionKey,
    scene: SceneInjectionKey
  },
  emits: ["created", "ready"],
  props: {
    position: { type: Object, default: () => ({ x: 0, y: 0, z: 0 }) },
    rotation: { type: Object, default: () => ({ x: 0, y: 0, z: 0 }) },
    scale: { type: Object, default: () => ({ x: 1, y: 1, z: 1, order: "XYZ" }) },
    lookAt: { type: Object, default: null },
    userData: { type: Object, default: () => ({}) },
    visible: { type: Boolean, default: true },
    props: { type: Object, default: () => ({}) },
    disableAdd: { type: Boolean, default: false },
    disableRemove: { type: Boolean, default: false },
    ...pointerProps
  },
  setup() {
    return {};
  },
  created() {
    if (!this.renderer) {
      console.error("Missing parent Renderer");
    }
    if (!this.scene) {
      console.error("Missing parent Scene");
    }
  },
  unmounted() {
    if (!this.disableRemove)
      this.removeFromParent();
    if (this.o3d) {
      if (this.renderer)
        this.renderer.three.removeIntersectObject(this.o3d);
    }
  },
  methods: {
    initObject3D(o3d) {
      var _a;
      this.o3d = o3d;
      o3d.userData.component = this;
      if (this.onPointerEnter || this.onPointerOver || this.onPointerMove || this.onPointerLeave || this.onPointerDown || this.onPointerUp || this.onClick) {
        if (this.renderer)
          this.renderer.three.addIntersectObject(o3d);
      }
      bindProp(this, "position", o3d);
      bindProp(this, "rotation", o3d);
      bindProp(this, "scale", o3d);
      bindProp(this, "userData", o3d.userData);
      bindProp(this, "visible", o3d);
      bindObjectProp(this, "props", o3d);
      this.$emit("created", o3d);
      if (this.lookAt)
        o3d.lookAt((_a = this.lookAt.x) != null ? _a : 0, this.lookAt.y, this.lookAt.z);
      vue.watch(() => this.lookAt, (v) => {
        var _a2;
        o3d.lookAt((_a2 = v.x) != null ? _a2 : 0, v.y, v.z);
      }, { deep: true });
      this.parent = this.getParent();
      if (!this.disableAdd) {
        if (this.addToParent())
          this.$emit("ready", this);
        else
          console.error("Missing parent (Scene, Group...)");
      }
    },
    getParent() {
      let parent = this.$parent;
      if (!parent) {
        const instance = vue.getCurrentInstance();
        if (instance && instance.parent)
          parent = instance.parent.ctx;
      }
      while (parent) {
        if (parent.add)
          return parent;
        parent = parent.$parent;
      }
      return void 0;
    },
    addToParent(o) {
      const o3d = o || this.o3d;
      if (this.parent) {
        this.parent.add(o3d);
        return true;
      }
      return false;
    },
    removeFromParent(o) {
      const o3d = o || this.o3d;
      if (this.parent) {
        this.parent.remove(o3d);
        return true;
      }
      return false;
    },
    add(o) {
      var _a;
      (_a = this.o3d) == null ? void 0 : _a.add(o);
    },
    remove(o) {
      var _a;
      (_a = this.o3d) == null ? void 0 : _a.remove(o);
    }
  },
  render() {
    return this.$slots.default ? this.$slots.default() : [];
  },
  __hmrId: "Object3D"
});

var Group = vue.defineComponent({
  name: "Group",
  extends: Object3D,
  setup() {
    return {
      group: new THREE.Group()
    };
  },
  created() {
    this.initObject3D(this.group);
  },
  __hmrId: "Group"
});

const emptyCallBack = () => {
};
var Raycaster = vue.defineComponent({
  name: "Raycaster",
  props: {
    onPointerEnter: { type: Function, default: emptyCallBack },
    onPointerOver: { type: Function, default: emptyCallBack },
    onPointerMove: { type: Function, default: emptyCallBack },
    onPointerLeave: { type: Function, default: emptyCallBack },
    onClick: { type: Function, default: emptyCallBack },
    onDblClick: { type: Function, default: emptyCallBack },
    intersectMode: { type: String, default: "move" },
    intersectRecursive: { type: Boolean, default: false }
  },
  setup() {
    const renderer = vue.inject(RendererInjectionKey);
    return { renderer };
  },
  mounted() {
    if (!this.renderer) {
      console.error("Renderer not found");
      return;
    }
    const renderer = this.renderer;
    this.renderer.onMounted(() => {
      if (!renderer.camera)
        return;
      this.pointer = usePointer({
        camera: renderer.camera,
        domElement: renderer.canvas,
        intersectObjects: () => renderer.scene ? renderer.scene.children : [],
        intersectRecursive: this.intersectRecursive,
        onIntersectEnter: this.onPointerEnter,
        onIntersectOver: this.onPointerOver,
        onIntersectMove: this.onPointerMove,
        onIntersectLeave: this.onPointerLeave,
        onIntersectClick: this.onClick
      });
      this.pointer.addListeners();
      if (this.intersectMode === "frame") {
        renderer.onBeforeRender(this.pointer.intersect);
      }
    });
  },
  unmounted() {
    var _a;
    if (this.pointer) {
      this.pointer.removeListeners();
      (_a = this.renderer) == null ? void 0 : _a.offBeforeRender(this.pointer.intersect);
    }
  },
  render() {
    return [];
  },
  __hmrId: "Raycaster"
});

var CubeCamera = vue.defineComponent({
  extends: Object3D,
  props: {
    cubeRTSize: { type: Number, default: 256 },
    cubeCameraNear: { type: Number, default: 0.1 },
    cubeCameraFar: { type: Number, default: 2e3 },
    autoUpdate: Boolean,
    hideMeshes: { type: Array, default: () => [] }
  },
  setup(props) {
    const rendererC = vue.inject(RendererInjectionKey);
    if (!rendererC || !rendererC.scene) {
      console.error("Missing Renderer / Scene");
      return {};
    }
    const renderer = rendererC.renderer, scene = rendererC.scene;
    const cubeRT = new THREE.WebGLCubeRenderTarget(props.cubeRTSize, { format: THREE.RGBAFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
    const cubeCamera = new THREE.CubeCamera(props.cubeCameraNear, props.cubeCameraFar, cubeRT);
    const updateRT = () => {
      props.hideMeshes.forEach((m) => {
        m.visible = false;
      });
      cubeCamera.update(renderer, scene);
      props.hideMeshes.forEach((m) => {
        m.visible = true;
      });
    };
    if (props.autoUpdate) {
      rendererC.onBeforeRender(updateRT);
      vue.onUnmounted(() => {
        rendererC.offBeforeRender(updateRT);
      });
    } else {
      rendererC.onMounted(updateRT);
    }
    return { cubeRT, cubeCamera, updateRT };
  },
  created() {
    if (this.cubeCamera)
      this.initObject3D(this.cubeCamera);
  },
  render() {
    return [];
  },
  __hmrId: "CubeCamera"
});

class CoordinateAxes extends THREE__namespace.Object3D {
  constructor(addTexts = true) {
    super();
    this.name = "COORDINATE_AXES";
    this.AXIS_LENGTH = 1;
    this.AXIS_COLOR_X = 16711680;
    this.AXIS_COLOR_Y = 65280;
    this.AXIS_COLOR_Z = 255;
    const origin = new THREE__namespace.Vector3(0, 0, 0);
    const axisX = new THREE__namespace.Vector3(1, 0, 0);
    const axisY = new THREE__namespace.Vector3(0, 1, 0);
    const axisZ = new THREE__namespace.Vector3(0, 0, 1);
    const arrowX = new THREE__namespace.ArrowHelper(axisX, origin, this.AXIS_LENGTH, this.AXIS_COLOR_X, this.AXIS_LENGTH / 5, this.AXIS_LENGTH / 8);
    const arrowY = new THREE__namespace.ArrowHelper(axisY, origin, this.AXIS_LENGTH, this.AXIS_COLOR_Y, this.AXIS_LENGTH / 5, this.AXIS_LENGTH / 8);
    const arrowZ = new THREE__namespace.ArrowHelper(axisZ, origin, this.AXIS_LENGTH, this.AXIS_COLOR_Z, this.AXIS_LENGTH / 5, this.AXIS_LENGTH / 8);
    this.add(arrowX, arrowY, arrowZ);
    addTexts && this.addTexts();
  }
  addTexts() {
    new FontLoader_js.FontLoader().load("three/fonts/helvetiker_regular.typeface.json", (font) => {
      const x = this.createText(font, "x", new THREE__namespace.Color(16711680));
      const y = this.createText(font, "y", new THREE__namespace.Color(65280));
      const z = this.createText(font, "z", new THREE__namespace.Color(255));
      x.position.set(this.AXIS_LENGTH, 0, 0);
      y.position.set(0, this.AXIS_LENGTH, 0);
      z.position.set(0, 0, this.AXIS_LENGTH);
      this.add(x, y, z);
    });
  }
  createText(font, text, color) {
    const textGeom = new TextGeometry_js.TextGeometry(text, {
      font,
      size: 0.3,
      height: 0.02,
      curveSegments: 6,
      bevelEnabled: false,
      bevelThickness: 0,
      bevelSize: 0.01,
      bevelSegments: 3
    });
    const textMat = new THREE__namespace.MeshStandardMaterial({
      flatShading: true,
      transparent: true,
      opacity: 0.6,
      emissive: color || new THREE__namespace.Color(65280)
    });
    return new THREE__namespace.Mesh(textGeom, textMat);
  }
}

class CoordinateAxesViewport {
  constructor(width, height) {
    this.height = 100;
    this.width = 100;
    this.width = width || this.width;
    this.height = height || this.height;
    this.init();
  }
  init() {
    this.initRenderer();
    this.initScene();
    this.animate();
  }
  initRenderer() {
    this.renderer = new THREE__namespace.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
  }
  initScene() {
    this.scene = new THREE__namespace.Scene();
    this.camera = new THREE__namespace.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    this.scene.add(this.camera);
    this.coordinateAxes = new CoordinateAxes();
    this.scene.add(this.coordinateAxes);
  }
  render() {
    if (this.renderer && this.scene && this.camera) {
      this.update();
      this.renderer.render(this.scene, this.camera);
    }
  }
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }
  setHostRenderer(renderer) {
    this.hostRenderer = renderer;
    this.update();
  }
  update() {
    if (!this.hostRenderer || !this.hostRenderer.camera) {
      return;
    }
    const camera = this.hostRenderer.camera;
    if (camera) {
      const target = new THREE__namespace.Vector3();
      camera.getWorldDirection(target);
      const up = camera.up;
      this.updateCameraDirection(target, up);
    }
  }
  updateCameraDirection(direction, up) {
    if (!this.camera || !direction) {
      return;
    }
    direction.normalize();
    const distanceFactor = 2;
    const centerDelta = 0.3;
    this.camera.position.set(-direction.x * distanceFactor + centerDelta, -direction.y * distanceFactor + centerDelta, -direction.z * distanceFactor + centerDelta);
    this.camera.lookAt(centerDelta, centerDelta, centerDelta);
    this.camera.up = up;
  }
  dispose() {
    if (!this.scene || !this.camera || !this.coordinateAxes) {
      return;
    }
    this.scene.clear();
    this.hostRenderer = void 0;
    this.camera = void 0;
    this.coordinateAxes = void 0;
    this.scene = void 0;
  }
}

const MeshInjectionKey = Symbol("Mesh");
const Mesh = vue.defineComponent({
  name: "Mesh",
  extends: Object3D,
  props: {
    castShadow: Boolean,
    receiveShadow: Boolean
  },
  setup() {
    return {};
  },
  provide() {
    return {
      [MeshInjectionKey]: this
    };
  },
  mounted() {
    if (!this.mesh && !this.loading)
      this.initMesh();
  },
  methods: {
    initMesh() {
      const mesh = new THREE.Mesh(this.geometry, this.material);
      bindProp(this, "castShadow", mesh);
      bindProp(this, "receiveShadow", mesh);
      this.mesh = mesh;
      this.initObject3D(mesh);
    },
    createGeometry() {
    },
    addGeometryWatchers(props) {
      Object.keys(props).forEach((prop) => {
        vue.watch(() => this[prop], () => {
          this.refreshGeometry();
        });
      });
    },
    setGeometry(geometry) {
      this.geometry = geometry;
      if (this.mesh)
        this.mesh.geometry = geometry;
    },
    setMaterial(material) {
      this.material = material;
      if (this.mesh)
        this.mesh.material = material;
    },
    refreshGeometry() {
      const oldGeo = this.geometry;
      this.createGeometry();
      if (this.mesh && this.geometry)
        this.mesh.geometry = this.geometry;
      oldGeo == null ? void 0 : oldGeo.dispose();
    }
  },
  unmounted() {
    if (this.geometry)
      this.geometry.dispose();
    if (this.material)
      this.material.dispose();
  },
  __hmrId: "Mesh"
});
function meshComponent(name, props, createGeometry) {
  return vue.defineComponent({
    name,
    extends: Mesh,
    props,
    created() {
      this.createGeometry();
      this.addGeometryWatchers(props);
    },
    methods: {
      createGeometry() {
        this.geometry = createGeometry(this);
      }
    }
  });
}

const Geometry = vue.defineComponent({
  emits: ["created"],
  props: {
    rotateX: Number,
    rotateY: Number,
    rotateZ: Number,
    attributes: { type: Array, default: () => [] }
  },
  inject: {
    mesh: MeshInjectionKey
  },
  setup() {
    return {};
  },
  created() {
    if (!this.mesh) {
      console.error("Missing parent Mesh");
      return;
    }
    this.createGeometry();
    this.rotateGeometry();
    if (this.geometry)
      this.mesh.setGeometry(this.geometry);
    Object.keys(this.$props).forEach((prop) => {
      vue.watch(() => this[prop], this.refreshGeometry);
    });
  },
  unmounted() {
    var _a;
    (_a = this.geometry) == null ? void 0 : _a.dispose();
  },
  methods: {
    createGeometry() {
      const bufferAttributes = {};
      const geometry = new THREE.BufferGeometry();
      this.attributes.forEach((attribute) => {
        if (attribute.name && attribute.itemSize && attribute.array) {
          const bufferAttribute = bufferAttributes[attribute.name] = new THREE.BufferAttribute(attribute.array, attribute.itemSize, attribute.normalized);
          geometry.setAttribute(attribute.name, bufferAttribute);
        }
      });
      geometry.computeBoundingBox();
      geometry.userData.component = this;
      this.geometry = geometry;
      this.$emit("created", geometry);
    },
    rotateGeometry() {
      if (!this.geometry)
        return;
      if (this.rotateX)
        this.geometry.rotateX(this.rotateX);
      if (this.rotateY)
        this.geometry.rotateY(this.rotateY);
      if (this.rotateZ)
        this.geometry.rotateZ(this.rotateZ);
    },
    refreshGeometry() {
      const oldGeo = this.geometry;
      this.createGeometry();
      this.rotateGeometry();
      if (this.geometry && this.mesh)
        this.mesh.setGeometry(this.geometry);
      oldGeo == null ? void 0 : oldGeo.dispose();
    }
  },
  render() {
    return [];
  }
});
function geometryComponent(name, props, createGeometry) {
  return vue.defineComponent({
    name,
    extends: Geometry,
    props,
    methods: {
      createGeometry() {
        this.geometry = createGeometry(this);
        this.geometry.userData.component = this;
        this.$emit("created", this.geometry);
      }
    }
  });
}

const props$n = {
  size: Number,
  width: { type: Number, default: 1 },
  height: { type: Number, default: 1 },
  depth: { type: Number, default: 1 },
  widthSegments: { type: Number, default: 1 },
  heightSegments: { type: Number, default: 1 },
  depthSegments: { type: Number, default: 1 }
};
function createGeometry$h(comp) {
  if (comp.size) {
    return new THREE.BoxGeometry(comp.size, comp.size, comp.size, comp.widthSegments, comp.heightSegments, comp.depthSegments);
  } else {
    return new THREE.BoxGeometry(comp.width, comp.height, comp.depth, comp.widthSegments, comp.heightSegments, comp.depthSegments);
  }
}
var BoxGeometry = geometryComponent("BoxGeometry", props$n, createGeometry$h);

const props$m = {
  radius: { type: Number, default: 1 },
  segments: { type: Number, default: 8 },
  thetaStart: { type: Number, default: 0 },
  thetaLength: { type: Number, default: Math.PI * 2 }
};
function createGeometry$g(comp) {
  return new THREE.CircleGeometry(comp.radius, comp.segments, comp.thetaStart, comp.thetaLength);
}
var CircleGeometry = geometryComponent("CircleGeometry", props$m, createGeometry$g);

const props$l = {
  radius: { type: Number, default: 1 },
  height: { type: Number, default: 1 },
  radialSegments: { type: Number, default: 8 },
  heightSegments: { type: Number, default: 1 },
  openEnded: { type: Boolean, default: false },
  thetaStart: { type: Number, default: 0 },
  thetaLength: { type: Number, default: Math.PI * 2 }
};
function createGeometry$f(comp) {
  return new THREE.ConeGeometry(comp.radius, comp.height, comp.radialSegments, comp.heightSegments, comp.openEnded, comp.thetaStart, comp.thetaLength);
}
var ConeGeometry = geometryComponent("ConeGeometry", props$l, createGeometry$f);

const props$k = {
  radiusTop: { type: Number, default: 1 },
  radiusBottom: { type: Number, default: 1 },
  height: { type: Number, default: 1 },
  radialSegments: { type: Number, default: 8 },
  heightSegments: { type: Number, default: 1 },
  openEnded: { type: Boolean, default: false },
  thetaStart: { type: Number, default: 0 },
  thetaLength: { type: Number, default: Math.PI * 2 }
};
function createGeometry$e(comp) {
  return new THREE.CylinderGeometry(comp.radiusTop, comp.radiusBottom, comp.height, comp.radialSegments, comp.heightSegments, comp.openEnded, comp.thetaStart, comp.thetaLength);
}
var CylinderGeometry = geometryComponent("CylinderGeometry", props$k, createGeometry$e);

const props$j = {
  radius: { type: Number, default: 1 },
  detail: { type: Number, default: 0 }
};
function createGeometry$d(comp) {
  return new THREE.DodecahedronGeometry(comp.radius, comp.detail);
}
var DodecahedronGeometry = geometryComponent("DodecahedronGeometry", props$j, createGeometry$d);

const props$i = {
  shapes: { type: [Object, Array] },
  options: { type: Object }
};
function createGeometry$c(comp) {
  return new THREE.ExtrudeGeometry(comp.shapes, comp.options);
}
var ExtrudeGeometry = geometryComponent("ExtrudeGeometry", props$i, createGeometry$c);

const props$h = {
  radius: { type: Number, default: 1 },
  detail: { type: Number, default: 0 }
};
function createGeometry$b(comp) {
  return new THREE.IcosahedronGeometry(comp.radius, comp.detail);
}
var IcosahedronGeometry = geometryComponent("IcosahedronGeometry", props$h, createGeometry$b);

const props$g = {
  points: Array,
  segments: { type: Number, default: 12 },
  phiStart: { type: Number, default: 0 },
  phiLength: { type: Number, default: Math.PI * 2 }
};
function createGeometry$a(comp) {
  return new THREE.LatheGeometry(comp.points, comp.segments, comp.phiStart, comp.phiLength);
}
var LatheGeometry = geometryComponent("LatheGeometry", props$g, createGeometry$a);

const props$f = {
  radius: { type: Number, default: 1 },
  detail: { type: Number, default: 0 }
};
function createGeometry$9(comp) {
  return new THREE.OctahedronGeometry(comp.radius, comp.detail);
}
var OctahedronGeometry = geometryComponent("OctahedronGeometry", props$f, createGeometry$9);

const props$e = {
  width: { type: Number, default: 1 },
  height: { type: Number, default: 1 },
  widthSegments: { type: Number, default: 1 },
  heightSegments: { type: Number, default: 1 }
};
function createGeometry$8(comp) {
  return new THREE.PlaneGeometry(comp.width, comp.height, comp.widthSegments, comp.heightSegments);
}
var PlaneGeometry = geometryComponent("PlaneGeometry", props$e, createGeometry$8);

const props$d = {
  vertices: Array,
  indices: Array,
  radius: { type: Number, default: 1 },
  detail: { type: Number, default: 0 }
};
function createGeometry$7(comp) {
  return new THREE.PolyhedronGeometry(comp.vertices, comp.indices, comp.radius, comp.detail);
}
var PolyhedronGeometry = geometryComponent("PolyhedronGeometry", props$d, createGeometry$7);

const props$c = {
  innerRadius: { type: Number, default: 0.5 },
  outerRadius: { type: Number, default: 1 },
  thetaSegments: { type: Number, default: 8 },
  phiSegments: { type: Number, default: 1 },
  thetaStart: { type: Number, default: 0 },
  thetaLength: { type: Number, default: Math.PI * 2 }
};
function createGeometry$6(comp) {
  return new THREE.RingGeometry(comp.innerRadius, comp.outerRadius, comp.thetaSegments, comp.phiSegments, comp.thetaStart, comp.thetaLength);
}
var RingGeometry = geometryComponent("RingGeometry", props$c, createGeometry$6);

const props$b = {
  radius: { type: Number, default: 1 },
  widthSegments: { type: Number, default: 12 },
  heightSegments: { type: Number, default: 12 },
  phiStart: { type: Number, default: 0 },
  phiLength: { type: Number, default: Math.PI * 2 },
  thetaStart: { type: Number, default: 0 },
  thetaLength: { type: Number, default: Math.PI }
};
function createGeometry$5(comp) {
  return new THREE.SphereGeometry(comp.radius, comp.widthSegments, comp.heightSegments, comp.phiStart, comp.phiLength, comp.thetaStart, comp.thetaLength);
}
var SphereGeometry = geometryComponent("SphereGeometry", props$b, createGeometry$5);

const props$a = {
  shapes: { type: [Object, Array] },
  curveSegments: { type: Number }
};
function createGeometry$4(comp) {
  return new THREE.ShapeGeometry(comp.shapes, comp.curveSegments);
}
var ShapeGeometry = geometryComponent("ShapeGeometry", props$a, createGeometry$4);

const props$9 = {
  radius: { type: Number, default: 1 },
  detail: { type: Number, default: 0 }
};
function createGeometry$3(comp) {
  return new THREE.TetrahedronGeometry(comp.radius, comp.detail);
}
var TetrahedronGeometry = geometryComponent("TetrahedronGeometry", props$9, createGeometry$3);

const props$8 = {
  radius: { type: Number, default: 1 },
  tube: { type: Number, default: 0.4 },
  radialSegments: { type: Number, default: 8 },
  tubularSegments: { type: Number, default: 6 },
  arc: { type: Number, default: Math.PI * 2 }
};
function createGeometry$2(comp) {
  return new THREE.TorusGeometry(comp.radius, comp.tube, comp.radialSegments, comp.tubularSegments, comp.arc);
}
var TorusGeometry = geometryComponent("TorusGeometry", props$8, createGeometry$2);

const props$7 = {
  radius: { type: Number, default: 1 },
  tube: { type: Number, default: 0.4 },
  tubularSegments: { type: Number, default: 64 },
  radialSegments: { type: Number, default: 8 },
  p: { type: Number, default: 2 },
  q: { type: Number, default: 3 }
};
function createGeometry$1(comp) {
  return new THREE.TorusKnotGeometry(comp.radius, comp.tube, comp.tubularSegments, comp.radialSegments, comp.p, comp.q);
}
var TorusKnotGeometry = geometryComponent("TorusKnotGeometry", props$7, createGeometry$1);

const props$6 = {
  points: Array,
  path: THREE.Curve,
  tubularSegments: { type: Number, default: 64 },
  radius: { type: Number, default: 1 },
  radialSegments: { type: Number, default: 8 },
  closed: { type: Boolean, default: false }
};
function createGeometry(comp) {
  let curve;
  if (comp.points) {
    curve = new THREE.CatmullRomCurve3(comp.points);
  } else if (comp.path) {
    curve = comp.path;
  } else {
    console.error("Missing path curve or points.");
  }
  return new THREE.TubeGeometry(curve, comp.tubularSegments, comp.radius, comp.radiusSegments, comp.closed);
}
var TubeGeometry = vue.defineComponent({
  extends: Geometry,
  props: props$6,
  methods: {
    createGeometry() {
      this.geometry = createGeometry(this);
    },
    updatePoints(points) {
      updateTubeGeometryPoints(this.geometry, points);
    }
  }
});
function updateTubeGeometryPoints(tube, points) {
  const curve = new THREE.CatmullRomCurve3(points);
  const { radialSegments, radius, tubularSegments, closed } = tube.parameters;
  const frames = curve.computeFrenetFrames(tubularSegments, closed);
  tube.tangents = frames.tangents;
  tube.normals = frames.normals;
  tube.binormals = frames.binormals;
  tube.parameters.path = curve;
  const pAttribute = tube.getAttribute("position");
  const nAttribute = tube.getAttribute("normal");
  const normal = new THREE.Vector3();
  const P = new THREE.Vector3();
  for (let i = 0; i < tubularSegments; i++) {
    updateSegment(i);
  }
  updateSegment(tubularSegments);
  tube.attributes.position.needsUpdate = true;
  tube.attributes.normal.needsUpdate = true;
  function updateSegment(i) {
    curve.getPointAt(i / tubularSegments, P);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    for (let j = 0; j <= radialSegments; j++) {
      const v = j / radialSegments * Math.PI * 2;
      const sin = Math.sin(v);
      const cos = -Math.cos(v);
      normal.x = cos * N.x + sin * B.x;
      normal.y = cos * N.y + sin * B.y;
      normal.z = cos * N.z + sin * B.z;
      normal.normalize();
      const index = i * (radialSegments + 1) + j;
      nAttribute.setXYZ(index, normal.x, normal.y, normal.z);
      pAttribute.setXYZ(index, P.x + radius * normal.x, P.y + radius * normal.y, P.z + radius * normal.z);
    }
  }
}

var Light = vue.defineComponent({
  extends: Object3D,
  name: "Light",
  props: {
    color: { type: String, default: "#ffffff" },
    intensity: { type: Number, default: 1 },
    castShadow: { type: Boolean, default: false },
    shadowMapSize: { type: Object, default: () => ({ x: 512, y: 512 }) },
    shadowCamera: { type: Object, default: () => ({}) }
  },
  setup() {
    return {};
  },
  unmounted() {
    if (this.light instanceof THREE.SpotLight || this.light instanceof THREE.DirectionalLight) {
      this.removeFromParent(this.light.target);
    }
  },
  methods: {
    initLight(light) {
      this.light = light;
      if (light.shadow) {
        light.castShadow = this.castShadow;
        setFromProp(light.shadow.mapSize, this.shadowMapSize);
        setFromProp(light.shadow.camera, this.shadowCamera);
      }
      ["color", "intensity", "castShadow"].forEach((p) => {
        vue.watch(() => this[p], (value) => {
          if (p === "color") {
            light.color.set(value);
          } else {
            light[p] = value;
          }
        });
      });
      this.initObject3D(light);
      if (light instanceof THREE.SpotLight || light instanceof THREE.DirectionalLight) {
        bindProp(this, "target", light.target, "position");
        this.addToParent(light.target);
      }
    }
  },
  __hmrId: "Light"
});

var AmbientLight = vue.defineComponent({
  extends: Light,
  created() {
    this.initLight(new THREE.AmbientLight(this.color, this.intensity));
  },
  __hmrId: "AmbientLight"
});

var DirectionalLight = vue.defineComponent({
  extends: Light,
  props: {
    target: { type: Object, default: () => ({ x: 0, y: 0, z: 0 }) }
  },
  created() {
    this.initLight(new THREE.DirectionalLight(this.color, this.intensity));
  },
  __hmrId: "DirectionalLight"
});

var HemisphereLight = vue.defineComponent({
  extends: Light,
  props: {
    groundColor: { type: String, default: "#444444" }
  },
  created() {
    const light = new THREE.HemisphereLight(this.color, this.groundColor, this.intensity);
    vue.watch(() => this.groundColor, (value) => {
      light.groundColor.set(value);
    });
    this.initLight(light);
  },
  __hmrId: "HemisphereLight"
});

var PointLight = vue.defineComponent({
  extends: Light,
  props: {
    distance: { type: Number, default: 0 },
    decay: { type: Number, default: 1 }
  },
  created() {
    this.initLight(new THREE.PointLight(this.color, this.intensity, this.distance, this.decay));
  },
  __hmrId: "PointLight"
});

var RectAreaLight = vue.defineComponent({
  extends: Light,
  props: {
    width: { type: Number, default: 10 },
    height: { type: Number, default: 10 },
    helper: Boolean
  },
  created() {
    RectAreaLightUniformsLib_js.RectAreaLightUniformsLib.init();
    const light = new THREE.RectAreaLight(this.color, this.intensity, this.width, this.height);
    const watchProps = ["width", "height"];
    watchProps.forEach((p) => {
      vue.watch(() => this[p], (value) => {
        light[p] = value;
      });
    });
    if (this.helper) {
      const lightHelper = new RectAreaLightHelper_js.RectAreaLightHelper(light);
      light.add(lightHelper);
    }
    this.initLight(light);
  },
  __hmrId: "RectAreaLight"
});

var SpotLight = vue.defineComponent({
  extends: Light,
  props: {
    angle: { type: Number, default: Math.PI / 3 },
    decay: { type: Number, default: 1 },
    distance: { type: Number, default: 0 },
    penumbra: { type: Number, default: 0 },
    target: Object
  },
  created() {
    const light = new THREE.SpotLight(this.color, this.intensity, this.distance, this.angle, this.penumbra, this.decay);
    const watchProps = ["angle", "decay", "distance", "penumbra"];
    watchProps.forEach((p) => {
      vue.watch(() => this[p], (value) => {
        light[p] = value;
      });
    });
    this.initLight(light);
  },
  __hmrId: "SpotLight"
});

const MaterialInjectionKey = Symbol("Material");
const BaseMaterial = vue.defineComponent({
  emits: ["created"],
  props: {
    color: { type: String, default: "#ffffff" },
    props: { type: Object, default: () => ({}) }
  },
  inject: {
    mesh: MeshInjectionKey
  },
  setup() {
    return {};
  },
  provide() {
    return {
      [MaterialInjectionKey]: this
    };
  },
  created() {
    if (!this.mesh) {
      console.error("Missing parent Mesh");
      return;
    }
    if (this.createMaterial) {
      const material = this.material = this.createMaterial();
      vue.watch(() => this.color, (value) => {
        material.color.set(value);
      });
      bindObjectProp(this, "props", material, false, this.setProp);
      this.$emit("created", material);
      this.mesh.setMaterial(material);
    }
  },
  unmounted() {
    var _a;
    (_a = this.material) == null ? void 0 : _a.dispose();
  },
  methods: {
    getMaterialParams() {
      return { ...propsValues(this.$props, ["props"]), ...this.props };
    },
    setProp(material, key, value, needsUpdate = false) {
      const dstVal = material[key];
      if (dstVal instanceof THREE.Color)
        dstVal.set(value);
      else
        material[key] = value;
      material.needsUpdate = needsUpdate;
    },
    setTexture(texture, key = "map") {
      this.setProp(this.material, key, texture, true);
    }
  },
  render() {
    return this.$slots.default ? this.$slots.default() : [];
  },
  __hmrId: "Material"
});
function materialComponent(name, props, createMaterial) {
  return vue.defineComponent({
    name,
    extends: BaseMaterial,
    props,
    methods: {
      createMaterial() {
        return createMaterial(this.getMaterialParams());
      }
    }
  });
}
const BasicMaterial = materialComponent("BasicMaterial", { props: { type: Object, default: () => ({}) } }, (opts) => new THREE.MeshBasicMaterial(opts));
const LambertMaterial = materialComponent("LambertMaterial", { props: { type: Object, default: () => ({}) } }, (opts) => new THREE.MeshLambertMaterial(opts));
const PhongMaterial = materialComponent("PhongMaterial", { props: { type: Object, default: () => ({}) } }, (opts) => new THREE.MeshPhongMaterial(opts));
const PhysicalMaterial = materialComponent("PhysicalMaterial", { props: { type: Object, default: () => ({}) } }, (opts) => new THREE.MeshPhysicalMaterial(opts));
const PointsMaterial = materialComponent("PointsMaterial", { props: { type: Object, default: () => ({}) } }, (opts) => new THREE.PointsMaterial(opts));
const ShadowMaterial = materialComponent("ShadowMaterial", { color: { type: String, default: "#000000" }, props: { type: Object, default: () => ({}) } }, (opts) => new THREE.ShadowMaterial(opts));
const StandardMaterial = materialComponent("StandardMaterial", { props: { type: Object, default: () => ({}) } }, (opts) => new THREE.MeshStandardMaterial(opts));
const ToonMaterial = materialComponent("ToonMaterial", { props: { type: Object, default: () => ({}) } }, (opts) => new THREE.MeshToonMaterial(opts));

var MatcapMaterial = materialComponent(
  "MatcapMaterial",
  {
    src: String,
    name: { type: String, default: "0404E8_0404B5_0404CB_3333FC" }
  },
  (opts) => {
    const src = opts.src ? opts.src : getMatcapUrl(opts.name);
    const params = propsValues(opts, ["src", "name"]);
    params.matcap = new THREE.TextureLoader().load(src);
    return new THREE.MeshMatcapMaterial(params);
  }
);

const defaultVertexShader = `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`;
const defaultFragmentShader = `
  varying vec2 vUv;
  void main() {
    gl_FragColor = vec4(vUv.x, vUv.y, 0., 1.0);
  }
`;
var ShaderMaterial = materialComponent(
  "ShaderMaterial",
  {
    props: { type: Object, default: () => ({
      uniforms: {},
      vertexShader: defaultVertexShader,
      fragmentShader: defaultFragmentShader
    }) }
  },
  (opts) => new THREE.ShaderMaterial(propsValues(opts, ["color"]))
);

function replaceAll(string, find, replace) {
  return string.split(find).join(replace);
}
const meshphongFragHead = THREE.ShaderChunk.meshphong_frag.slice(0, THREE.ShaderChunk.meshphong_frag.indexOf("void main() {"));
const meshphongFragBody = THREE.ShaderChunk.meshphong_frag.slice(THREE.ShaderChunk.meshphong_frag.indexOf("void main() {"));
const SubsurfaceScatteringShader = {
  uniforms: THREE.UniformsUtils.merge([
    THREE.ShaderLib.phong.uniforms,
    {
      thicknessColor: { value: new THREE.Color(16777215) },
      thicknessDistortion: { value: 0.1 },
      thicknessAmbient: { value: 0 },
      thicknessAttenuation: { value: 0.1 },
      thicknessPower: { value: 2 },
      thicknessScale: { value: 10 }
    }
  ]),
  vertexShader: `
    #define USE_UV
    ${THREE.ShaderChunk.meshphong_vert}
  `,
  fragmentShader: `
    #define USE_UV
    #define SUBSURFACE

    ${meshphongFragHead}

    uniform float thicknessPower;
    uniform float thicknessScale;
    uniform float thicknessDistortion;
    uniform float thicknessAmbient;
    uniform float thicknessAttenuation;
    uniform vec3 thicknessColor;

    void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in GeometricContext geometry, inout ReflectedLight reflectedLight) {
      #ifdef USE_COLOR
        vec3 thickness = vColor * thicknessColor;
      #else
        vec3 thickness = thicknessColor;
      #endif
      vec3 scatteringHalf = normalize(directLight.direction + (geometry.normal * thicknessDistortion));
      float scatteringDot = pow(saturate(dot(geometry.viewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
      vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * thickness;
      reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
    }
  ` + meshphongFragBody.replace(
    "#include <lights_fragment_begin>",
    replaceAll(
      THREE.ShaderChunk.lights_fragment_begin,
      "RE_Direct( directLight, geometry, material, reflectedLight );",
      `
        RE_Direct( directLight, geometry, material, reflectedLight );
        #if defined( SUBSURFACE ) && defined( USE_UV )
          RE_Direct_Scattering(directLight, vUv, geometry, reflectedLight);
        #endif
      `
    )
  )
};

var SubSurfaceMaterial = vue.defineComponent({
  extends: BaseMaterial,
  props: {
    uniforms: { type: Object, default: () => ({
      diffuse: "#ffffff",
      thicknessColor: "#ffffff",
      thicknessDistortion: 0.4,
      thicknessAmbient: 0.01,
      thicknessAttenuation: 0.7,
      thicknessPower: 2,
      thicknessScale: 4
    }) }
  },
  methods: {
    createMaterial() {
      const params = SubsurfaceScatteringShader;
      const uniforms = THREE.UniformsUtils.clone(params.uniforms);
      bindObjectProp(this, "uniforms", uniforms, true, (dst, key, value) => {
        const dstVal = dst[key].value;
        if (dstVal instanceof THREE.Color)
          dstVal.set(value);
        else
          dst[key].value = value;
      });
      const material = new THREE.ShaderMaterial({
        ...params,
        lights: true,
        ...this.props,
        uniforms
      });
      return material;
    }
  }
});

var Texture = vue.defineComponent({
  inject: {
    material: MaterialInjectionKey
  },
  props: {
    name: { type: String, default: "map" },
    uniform: String,
    src: String,
    onLoad: Function,
    onProgress: Function,
    onError: Function,
    props: { type: Object, default: () => ({}) }
  },
  setup() {
    return {};
  },
  created() {
    this.refreshTexture();
    vue.watch(() => this.src, this.refreshTexture);
  },
  unmounted() {
    var _a, _b;
    (_a = this.material) == null ? void 0 : _a.setTexture(null, this.name);
    (_b = this.texture) == null ? void 0 : _b.dispose();
  },
  methods: {
    createTexture() {
      if (!this.src)
        return void 0;
      return new THREE.TextureLoader().load(this.src, this.onLoaded, this.onProgress, this.onError);
    },
    initTexture() {
      if (!this.texture)
        return;
      bindObjectProp(this, "props", this.texture);
      if (!this.material)
        return;
      this.material.setTexture(this.texture, this.name);
      if (this.material.material instanceof THREE.ShaderMaterial && this.uniform) {
        this.material.material.uniforms[this.uniform] = { value: this.texture };
      }
    },
    refreshTexture() {
      var _a;
      (_a = this.texture) == null ? void 0 : _a.dispose();
      this.texture = this.createTexture();
      this.initTexture();
    },
    onLoaded(t) {
      var _a;
      (_a = this.onLoad) == null ? void 0 : _a.call(this, t);
    }
  },
  render() {
    return [];
  }
});

var CubeTexture = vue.defineComponent({
  extends: Texture,
  props: {
    name: { type: String, default: "envMap" },
    path: { type: String, required: true },
    urls: {
      type: Array,
      default: () => ["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"]
    },
    props: { type: Object, default: () => ({ mapping: THREE.CubeReflectionMapping }) }
  },
  created() {
    vue.watch(() => this.path, this.refreshTexture);
    vue.watch(() => this.urls, this.refreshTexture);
  },
  methods: {
    createTexture() {
      return new THREE.CubeTextureLoader().setPath(this.path).load(this.urls, this.onLoaded, this.onProgress, this.onError);
    }
  }
});

var VideoTexture = vue.defineComponent({
  extends: Texture,
  props: {
    videoId: {
      type: String,
      required: true
    }
  },
  created() {
    vue.watch(() => this.videoId, this.refreshTexture);
  },
  methods: {
    createTexture() {
      const video = document.getElementById(this.videoId);
      return new THREE.VideoTexture(video);
    }
  }
});

var Box = meshComponent("Box", props$n, createGeometry$h);

var Circle = meshComponent("Circle", props$m, createGeometry$g);

var Cone = meshComponent("Cone", props$l, createGeometry$f);

var Cylinder = meshComponent("Cylinder", props$k, createGeometry$e);

var Dodecahedron = meshComponent("Dodecahedron", props$j, createGeometry$d);

var Icosahedron = meshComponent("Icosahedron", props$h, createGeometry$b);

var Lathe = meshComponent("Lathe", props$g, createGeometry$a);

var Octahedron = meshComponent("Octahedron", props$f, createGeometry$9);

var Plane = meshComponent("Plane", props$e, createGeometry$8);

var Polyhedron = meshComponent("Polyhedron", props$d, createGeometry$7);

var Ring = meshComponent("Ring", props$c, createGeometry$6);

var Sphere = meshComponent("Sphere", props$b, createGeometry$5);

var Tetrahedron = meshComponent("Tetrahedron", props$9, createGeometry$3);

const props$5 = {
  text: { type: String, required: true, default: "Text" },
  fontSrc: { type: String, required: true },
  size: { type: Number, default: 80 },
  height: { type: Number, default: 5 },
  depth: { type: Number, default: 1 },
  curveSegments: { type: Number, default: 12 },
  bevelEnabled: { type: Boolean, default: false },
  bevelThickness: { type: Number, default: 10 },
  bevelSize: { type: Number, default: 8 },
  bevelOffset: { type: Number, default: 0 },
  bevelSegments: { type: Number, default: 5 },
  align: { type: [Boolean, String], default: false }
};
var Text = vue.defineComponent({
  extends: Mesh,
  props: props$5,
  setup() {
    return {};
  },
  created() {
    if (!this.fontSrc) {
      console.error('Missing required prop: "font-src"');
      return;
    }
    const watchProps = [
      "text",
      "size",
      "height",
      "curveSegments",
      "bevelEnabled",
      "bevelThickness",
      "bevelSize",
      "bevelOffset",
      "bevelSegments",
      "align"
    ];
    watchProps.forEach((p) => {
      vue.watch(() => this[p], () => {
        if (this.font)
          this.refreshGeometry();
      });
    });
    const loader = new FontLoader_js.FontLoader();
    this.loading = true;
    loader.load(this.fontSrc, (font) => {
      this.loading = false;
      this.font = font;
      this.createGeometry();
      this.initMesh();
    });
  },
  methods: {
    createGeometry() {
      this.geometry = new TextGeometry_js.TextGeometry(this.text, {
        font: this.font,
        size: this.size,
        height: this.height,
        depth: this.depth,
        curveSegments: this.curveSegments,
        bevelEnabled: this.bevelEnabled,
        bevelThickness: this.bevelThickness,
        bevelSize: this.bevelSize,
        bevelOffset: this.bevelOffset,
        bevelSegments: this.bevelSegments
      });
      if (this.align === "center") {
        this.geometry.center();
      }
    }
  }
});

var Torus = meshComponent("Torus", props$8, createGeometry$2);

var TorusKnot = meshComponent("TorusKnot", props$7, createGeometry$1);

var Tube = vue.defineComponent({
  extends: Mesh,
  props: props$6,
  created() {
    this.createGeometry();
    this.addGeometryWatchers(props$6);
  },
  methods: {
    createGeometry() {
      this.geometry = createGeometry(this);
    },
    updatePoints(points) {
      updateTubeGeometryPoints(this.geometry, points);
    }
  },
  __hmrId: "Tube"
});

var Image = vue.defineComponent({
  emits: ["loaded"],
  extends: Mesh,
  props: {
    src: { type: String, required: true },
    width: Number,
    height: Number,
    widthSegments: { type: Number, default: 1 },
    heightSegments: { type: Number, default: 1 },
    keepSize: Boolean
  },
  setup() {
    return {};
  },
  created() {
    if (!this.renderer)
      return;
    this.geometry = new THREE.PlaneGeometry(1, 1, this.widthSegments, this.heightSegments);
    this.material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: this.loadTexture() });
    vue.watch(() => this.src, this.refreshTexture);
    ["width", "height"].forEach((p) => {
      vue.watch(() => this[p], this.resize);
    });
    this.resize();
    if (this.keepSize)
      this.renderer.onResize(this.resize);
  },
  unmounted() {
    var _a;
    (_a = this.renderer) == null ? void 0 : _a.offResize(this.resize);
  },
  methods: {
    loadTexture() {
      return new THREE.TextureLoader().load(this.src, this.onLoaded);
    },
    refreshTexture() {
      var _a;
      (_a = this.texture) == null ? void 0 : _a.dispose();
      if (this.material) {
        this.material.map = this.loadTexture();
        this.material.needsUpdate = true;
      }
    },
    onLoaded(texture) {
      this.texture = texture;
      this.resize();
      this.$emit("loaded", texture);
    },
    resize() {
      if (!this.renderer || !this.texture)
        return;
      const screen = this.renderer.size;
      const iW = this.texture.image.width;
      const iH = this.texture.image.height;
      const iRatio = iW / iH;
      let w = 1, h = 1;
      if (this.width && this.height) {
        w = this.width * screen.wWidth / screen.width;
        h = this.height * screen.wHeight / screen.height;
      } else if (this.width) {
        w = this.width * screen.wWidth / screen.width;
        h = w / iRatio;
      } else if (this.height) {
        h = this.height * screen.wHeight / screen.height;
        w = h * iRatio;
      } else {
        if (iRatio > 1)
          w = h * iRatio;
        else
          h = w / iRatio;
      }
      if (this.mesh) {
        this.mesh.scale.x = w;
        this.mesh.scale.y = h;
      }
    }
  },
  __hmrId: "Image"
});

var InstancedMesh = vue.defineComponent({
  extends: Mesh,
  props: {
    count: { type: Number, required: true }
  },
  methods: {
    initMesh() {
      if (!this.renderer)
        return;
      if (!this.geometry || !this.material) {
        console.error("Missing geometry and/or material");
        return false;
      }
      this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.count);
      this.mesh.userData.component = this;
      bindProp(this, "castShadow", this.mesh);
      bindProp(this, "receiveShadow", this.mesh);
      if (this.onPointerEnter || this.onPointerOver || this.onPointerMove || this.onPointerLeave || this.onPointerDown || this.onPointerUp || this.onClick) {
        this.renderer.three.addIntersectObject(this.mesh);
      }
      this.initObject3D(this.mesh);
    }
  },
  __hmrId: "InstancedMesh"
});

var Sprite = vue.defineComponent({
  extends: Object3D,
  emits: ["loaded"],
  props: {
    src: { type: String, required: true }
  },
  setup() {
    return {};
  },
  created() {
    this.texture = new THREE.TextureLoader().load(this.src, this.onLoaded);
    this.material = new THREE.SpriteMaterial({ map: this.texture });
    this.sprite = new THREE.Sprite(this.material);
    this.initObject3D(this.sprite);
  },
  unmounted() {
    var _a, _b;
    (_a = this.texture) == null ? void 0 : _a.dispose();
    (_b = this.material) == null ? void 0 : _b.dispose();
  },
  methods: {
    onLoaded() {
      this.updateUV();
      this.$emit("loaded");
    },
    updateUV() {
      if (!this.texture || !this.sprite)
        return;
      const iWidth = this.texture.image.width;
      const iHeight = this.texture.image.height;
      const iRatio = iWidth / iHeight;
      let x = 0.5, y = 0.5;
      if (iRatio > 1) {
        x = 0.5 * iRatio;
      } else {
        y = 0.5 / iRatio;
      }
      const positions = this.sprite.geometry.attributes.position.array;
      positions[0] = -x;
      positions[1] = -y;
      positions[5] = x;
      positions[6] = -y;
      positions[10] = x;
      positions[11] = y;
      positions[15] = -x;
      positions[16] = y;
      this.sprite.geometry.attributes.position.needsUpdate = true;
    }
  },
  __hmrId: "Sprite"
});

var Points = vue.defineComponent({
  extends: Object3D,
  setup() {
    return {};
  },
  provide() {
    return {
      [MeshInjectionKey]: this
    };
  },
  mounted() {
    this.mesh = this.points = new THREE.Points(this.geometry, this.material);
    this.initObject3D(this.mesh);
  },
  methods: {
    setGeometry(geometry) {
      this.geometry = geometry;
      if (this.mesh)
        this.mesh.geometry = geometry;
    },
    setMaterial(material) {
      this.material = material;
      if (this.mesh)
        this.mesh.material = material;
    }
  }
});

var Model = vue.defineComponent({
  extends: Object3D,
  emits: ["before-load", "load", "progress", "error"],
  props: {
    src: { type: String, required: true }
  },
  data() {
    return {
      progress: 0
    };
  },
  methods: {
    onLoad(model) {
      this.$emit("load", model);
    },
    onProgress(progress) {
      this.progress = progress.loaded / progress.total;
      this.$emit("progress", progress);
    },
    onError(error) {
      this.$emit("error", error);
    }
  }
});

var GLTF = vue.defineComponent({
  extends: Model,
  props: {
    dracoPath: { type: String, required: true }
  },
  created() {
    const loader = new GLTFLoader_js.GLTFLoader();
    if (this.dracoPath) {
      const dracoLoader = new DRACOLoader_js.DRACOLoader();
      dracoLoader.setDecoderPath(this.dracoPath);
      loader.setDRACOLoader(dracoLoader);
    }
    this.$emit("before-load", loader);
    loader.load(this.src, (gltf) => {
      this.onLoad(gltf);
      this.initObject3D(gltf.scene);
    }, this.onProgress, this.onError);
  }
});

var FBX = vue.defineComponent({
  extends: Model,
  created() {
    const loader = new FBXLoader_js.FBXLoader();
    this.$emit("before-load", loader);
    loader.load(this.src, (fbx) => {
      this.onLoad(fbx);
      this.initObject3D(fbx);
    }, this.onProgress, this.onError);
  }
});

const ComposerInjectionKey = Symbol("Composer");
var EffectComposer = vue.defineComponent({
  setup() {
    const renderer = vue.inject(RendererInjectionKey);
    return { renderer };
  },
  provide() {
    return {
      [ComposerInjectionKey]: this
    };
  },
  created() {
    if (!this.renderer) {
      console.error("Renderer not found");
      return;
    }
    const renderer = this.renderer;
    const composer = new EffectComposer_js.EffectComposer(this.renderer.renderer);
    this.composer = composer;
    this.renderer.composer = composer;
    renderer.addListener("init", () => {
      renderer.renderer.autoClear = false;
      this.resize();
      renderer.addListener("resize", this.resize);
    });
  },
  unmounted() {
    var _a;
    (_a = this.renderer) == null ? void 0 : _a.removeListener("resize", this.resize);
  },
  methods: {
    addPass(pass) {
      var _a;
      (_a = this.composer) == null ? void 0 : _a.addPass(pass);
    },
    removePass(pass) {
      var _a;
      (_a = this.composer) == null ? void 0 : _a.removePass(pass);
    },
    resize() {
      if (this.composer && this.renderer) {
        this.composer.setSize(this.renderer.size.width, this.renderer.size.height);
      }
    }
  },
  render() {
    return this.$slots.default ? this.$slots.default() : [];
  },
  __hmrId: "EffectComposer"
});

var EffectPass = vue.defineComponent({
  inject: {
    renderer: RendererInjectionKey,
    composer: ComposerInjectionKey
  },
  emits: ["ready"],
  setup() {
    return {};
  },
  created() {
    if (!this.composer) {
      console.error("Missing parent EffectComposer");
    }
    if (!this.renderer) {
      console.error("Missing parent Renderer");
    }
  },
  unmounted() {
    var _a, _b, _c;
    if (this.pass) {
      (_a = this.composer) == null ? void 0 : _a.removePass(this.pass);
      (_c = (_b = this.pass).dispose) == null ? void 0 : _c.call(_b);
    }
  },
  methods: {
    initEffectPass(pass) {
      var _a;
      this.pass = pass;
      (_a = this.composer) == null ? void 0 : _a.addPass(pass);
      this.$emit("ready", pass);
    }
  },
  render() {
    return [];
  },
  __hmrId: "EffectPass"
});

var RenderPass = vue.defineComponent({
  extends: EffectPass,
  created() {
    if (!this.renderer)
      return;
    if (!this.renderer.scene) {
      console.error("Missing Scene");
      return;
    }
    if (!this.renderer.camera) {
      console.error("Missing Camera");
      return;
    }
    const pass = new RenderPass_js.RenderPass(this.renderer.scene, this.renderer.camera);
    this.initEffectPass(pass);
  },
  __hmrId: "RenderPass"
});

const props$4 = {
  focus: { type: Number, default: 1 },
  aperture: { type: Number, default: 0.025 },
  maxblur: { type: Number, default: 0.01 }
};
var BokehPass = vue.defineComponent({
  extends: EffectPass,
  props: props$4,
  created() {
    if (!this.renderer)
      return;
    if (!this.renderer.scene) {
      console.error("Missing Scene");
      return;
    }
    if (!this.renderer.camera) {
      console.error("Missing Camera");
      return;
    }
    const params = {
      focus: this.focus,
      aperture: this.aperture,
      maxblur: this.maxblur,
      width: this.renderer.size.width,
      height: this.renderer.size.height
    };
    const pass = new BokehPass_js.BokehPass(this.renderer.scene, this.renderer.camera, params);
    Object.keys(props$4).forEach((p) => {
      vue.watch(() => this[p], (value) => {
        pass.uniforms[p].value = value;
      });
    });
    this.initEffectPass(pass);
  },
  __hmrId: "BokehPass"
});

const props$3 = {
  noiseIntensity: { type: Number, default: 0.5 },
  scanlinesIntensity: { type: Number, default: 0.05 },
  scanlinesCount: { type: Number, default: 4096 },
  grayscale: { type: Number, default: 0 }
};
var FilmPass = vue.defineComponent({
  extends: EffectPass,
  props: props$3,
  created() {
    const pass = new FilmPass_js.FilmPass(this.noiseIntensity, this.scanlinesIntensity, this.scanlinesCount, this.grayscale);
    Object.keys(props$3).forEach((p) => {
      vue.watch(() => this[p], (value) => {
        pass.uniforms[p].value = value;
      });
    });
    this.initEffectPass(pass);
  },
  __hmrId: "FilmPass"
});

var FXAAPass = vue.defineComponent({
  extends: EffectPass,
  created() {
    var _a;
    const pass = new ShaderPass_js.ShaderPass(FXAAShader_js.FXAAShader);
    (_a = this.renderer) == null ? void 0 : _a.addListener("resize", this.resize);
    this.initEffectPass(pass);
  },
  unmounted() {
    var _a;
    (_a = this.renderer) == null ? void 0 : _a.removeListener("resize", this.resize);
  },
  methods: {
    resize({ size }) {
      if (this.pass) {
        const { resolution } = this.pass.material.uniforms;
        resolution.value.x = 1 / size.width;
        resolution.value.y = 1 / size.height;
      }
    }
  },
  __hmrId: "FXAAPass"
});

const props$2 = {
  shape: { type: Number, default: 1 },
  radius: { type: Number, default: 4 },
  rotateR: { type: Number, default: Math.PI / 12 * 1 },
  rotateG: { type: Number, default: Math.PI / 12 * 2 },
  rotateB: { type: Number, default: Math.PI / 12 * 3 },
  scatter: { type: Number, default: 0 }
};
var HalftonePass = vue.defineComponent({
  extends: EffectPass,
  props: props$2,
  created() {
    if (!this.renderer)
      return;
    const pass = new HalftonePass_js.HalftonePass(this.renderer.size.width, this.renderer.size.height, {});
    Object.keys(props$2).forEach((p) => {
      pass.uniforms[p].value = this[p];
      vue.watch(() => this[p], (value) => {
        pass.uniforms[p].value = value;
      });
    });
    this.initEffectPass(pass);
  },
  __hmrId: "HalftonePass"
});

var SMAAPass = vue.defineComponent({
  extends: EffectPass,
  created() {
    if (!this.renderer)
      return;
    const pass = new SMAAPass_js.SMAAPass(this.renderer.size.width, this.renderer.size.height);
    this.initEffectPass(pass);
  },
  __hmrId: "SMAAPass"
});

var SSAOPass = vue.defineComponent({
  extends: EffectPass,
  props: {
    options: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
    if (!this.renderer)
      return;
    if (!this.renderer.scene) {
      console.error("Missing Scene");
      return;
    }
    if (!this.renderer.camera) {
      console.error("Missing Camera");
      return;
    }
    const pass = new SSAOPass_js.SSAOPass(
      this.renderer.scene,
      this.renderer.camera,
      this.renderer.size.width,
      this.renderer.size.height
    );
    Object.keys(this.options).forEach((key) => {
      pass[key] = this.options[key];
    });
    this.initEffectPass(pass);
  },
  __hmrId: "SSAOPass"
});

var DefaultShader = {
  uniforms: {},
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `
};

var TiltShift = {
  uniforms: {
    tDiffuse: { value: null },
    blurRadius: { value: 0 },
    gradientRadius: { value: 0 },
    start: { value: new THREE.Vector2() },
    end: { value: new THREE.Vector2() },
    delta: { value: new THREE.Vector2() },
    texSize: { value: new THREE.Vector2() }
  },
  vertexShader: DefaultShader.vertexShader,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float blurRadius;
    uniform float gradientRadius;
    uniform vec2 start;
    uniform vec2 end;
    uniform vec2 delta;
    uniform vec2 texSize;
    varying vec2 vUv;

    float random(vec3 scale, float seed) {
      /* use the fragment position for a different seed per-pixel */
      return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
    }

    void main() {
      vec4 color = vec4(0.0);
      float total = 0.0;

      /* randomize the lookup values to hide the fixed number of samples */
      float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);

      vec2 normal = normalize(vec2(start.y - end.y, end.x - start.x));
      float radius = smoothstep(0.0, 1.0, abs(dot(vUv * texSize - start, normal)) / gradientRadius) * blurRadius;
      for (float t = -30.0; t <= 30.0; t++) {
          float percent = (t + offset - 0.5) / 30.0;
          float weight = 1.0 - abs(percent);
          vec4 texel = texture2D(tDiffuse, vUv + delta / texSize * percent * radius);
          // vec4 texel2 = texture2D(tDiffuse, vUv + vec2(-delta.y, delta.x) / texSize * percent * radius);

          /* switch to pre-multiplied alpha to correctly blur transparent images */
          texel.rgb *= texel.a;
          // texel2.rgb *= texel2.a;

          color += texel * weight;
          total += 2.0 * weight;
      }

      gl_FragColor = color / total;

      /* switch back from pre-multiplied alpha */
      gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
    }
  `
};

const props$1 = {
  blurRadius: { type: Number, default: 10 },
  gradientRadius: { type: Number, default: 100 },
  start: { type: Object, default: () => ({ x: 0, y: 100 }) },
  end: { type: Object, default: () => ({ x: 10, y: 100 }) }
};
var TiltShiftPass = vue.defineComponent({
  extends: EffectPass,
  props: props$1,
  setup() {
    return { uniforms1: {}, uniforms2: {} };
  },
  created() {
    if (!this.composer)
      return;
    this.pass1 = new ShaderPass_js.ShaderPass(TiltShift);
    this.pass2 = new ShaderPass_js.ShaderPass(TiltShift);
    const uniforms1 = this.uniforms1 = this.pass1.uniforms;
    const uniforms2 = this.uniforms2 = this.pass2.uniforms;
    uniforms2.blurRadius = uniforms1.blurRadius;
    uniforms2.gradientRadius = uniforms1.gradientRadius;
    uniforms2.start = uniforms1.start;
    uniforms2.end = uniforms1.end;
    uniforms2.texSize = uniforms1.texSize;
    bindProp(this, "blurRadius", uniforms1.blurRadius, "value");
    bindProp(this, "gradientRadius", uniforms1.gradientRadius, "value");
    this.updateFocusLine();
    ["start", "end"].forEach((p) => {
      vue.watch(() => this[p], this.updateFocusLine, { deep: true });
    });
    this.pass1.setSize = (width, height) => {
      uniforms1.texSize.value.set(width, height);
    };
    this.initEffectPass(this.pass1);
    this.composer.addPass(this.pass2);
  },
  unmounted() {
    if (this.composer && this.pass2)
      this.composer.removePass(this.pass2);
  },
  methods: {
    updateFocusLine() {
      this.uniforms1.start.value.copy(this.start);
      this.uniforms1.end.value.copy(this.end);
      const dv = new THREE.Vector2().copy(this.end).sub(this.start).normalize();
      this.uniforms1.delta.value.copy(dv);
      this.uniforms2.delta.value.set(-dv.y, dv.x);
    }
  },
  __hmrId: "TiltShiftPass"
});

const props = {
  strength: { type: Number, default: 1.5 },
  radius: { type: Number, default: 0 },
  threshold: { type: Number, default: 0 }
};
var UnrealBloomPass = vue.defineComponent({
  extends: EffectPass,
  props,
  created() {
    if (!this.renderer)
      return;
    const size = new THREE.Vector2(this.renderer.size.width, this.renderer.size.height);
    const pass = new UnrealBloomPass_js.UnrealBloomPass(size, this.strength, this.radius, this.threshold);
    Object.keys(props).forEach((p) => {
      vue.watch(() => this[p], (value) => {
        pass.uniforms[p].value = value;
      });
    });
    this.initEffectPass(pass);
  },
  __hmrId: "UnrealBloomPass"
});

var ZoomBlur = {
  uniforms: {
    tDiffuse: { value: null },
    center: { value: new THREE.Vector2(0.5, 0.5) },
    strength: { value: 0 }
  },
  vertexShader: DefaultShader.vertexShader,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 center;
    uniform float strength;
    varying vec2 vUv;

    float random(vec3 scale, float seed) {
      /* use the fragment position for a different seed per-pixel */
      return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
    }
    
    void main() {
      vec4 color = vec4(0.0);
      float total = 0.0;
      vec2 toCenter = center - vUv;
      
      /* randomize the lookup values to hide the fixed number of samples */
      float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
      
      for (float t = 0.0; t <= 40.0; t++) {
        float percent = (t + offset) / 40.0;
        float weight = 4.0 * (percent - percent * percent);
        vec4 texel = texture2D(tDiffuse, vUv + toCenter * percent * strength);

        /* switch to pre-multiplied alpha to correctly blur transparent images */
        texel.rgb *= texel.a;

        color += texel * weight;
        total += weight;
      }

      gl_FragColor = color / total;

      /* switch back from pre-multiplied alpha */
      gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
    }
  `
};

var ZoomBlurPass = vue.defineComponent({
  extends: EffectPass,
  props: {
    center: { type: Object, default: () => ({ x: 0.5, y: 0.5 }) },
    strength: { type: Number, default: 0.5 }
  },
  created() {
    const pass = new ShaderPass_js.ShaderPass(ZoomBlur);
    bindProp(this, "center", pass.uniforms.center, "value");
    bindProp(this, "strength", pass.uniforms.strength, "value");
    this.initEffectPass(pass);
  },
  __hmrId: "ZoomBlurPass"
});

var TROIS = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Renderer: Renderer,
  RendererInjectionKey: RendererInjectionKey,
  OrthographicCamera: OrthographicCamera,
  PerspectiveCamera: PerspectiveCamera,
  Camera: PerspectiveCamera,
  Group: Group,
  Scene: Scene,
  SceneInjectionKey: SceneInjectionKey,
  Object3D: Object3D,
  Raycaster: Raycaster,
  CubeCamera: CubeCamera,
  CoordinateAxesViewport: CoordinateAxesViewport,
  BufferGeometry: Geometry,
  BoxGeometry: BoxGeometry,
  CircleGeometry: CircleGeometry,
  ConeGeometry: ConeGeometry,
  CylinderGeometry: CylinderGeometry,
  DodecahedronGeometry: DodecahedronGeometry,
  ExtrudeGeometry: ExtrudeGeometry,
  IcosahedronGeometry: IcosahedronGeometry,
  LatheGeometry: LatheGeometry,
  OctahedronGeometry: OctahedronGeometry,
  PlaneGeometry: PlaneGeometry,
  PolyhedronGeometry: PolyhedronGeometry,
  RingGeometry: RingGeometry,
  SphereGeometry: SphereGeometry,
  ShapeGeometry: ShapeGeometry,
  TetrahedronGeometry: TetrahedronGeometry,
  TorusGeometry: TorusGeometry,
  TorusKnotGeometry: TorusKnotGeometry,
  TubeGeometry: TubeGeometry,
  AmbientLight: AmbientLight,
  DirectionalLight: DirectionalLight,
  HemisphereLight: HemisphereLight,
  PointLight: PointLight,
  RectAreaLight: RectAreaLight,
  SpotLight: SpotLight,
  Material: BaseMaterial,
  BasicMaterial: BasicMaterial,
  LambertMaterial: LambertMaterial,
  PhongMaterial: PhongMaterial,
  PhysicalMaterial: PhysicalMaterial,
  PointsMaterial: PointsMaterial,
  ShadowMaterial: ShadowMaterial,
  StandardMaterial: StandardMaterial,
  ToonMaterial: ToonMaterial,
  MaterialInjectionKey: MaterialInjectionKey,
  MatcapMaterial: MatcapMaterial,
  ShaderMaterial: ShaderMaterial,
  SubSurfaceMaterial: SubSurfaceMaterial,
  Texture: Texture,
  CubeTexture: CubeTexture,
  VideoTexture: VideoTexture,
  Mesh: Mesh,
  MeshInjectionKey: MeshInjectionKey,
  Box: Box,
  Circle: Circle,
  Cone: Cone,
  Cylinder: Cylinder,
  Dodecahedron: Dodecahedron,
  Icosahedron: Icosahedron,
  Lathe: Lathe,
  Octahedron: Octahedron,
  Plane: Plane,
  Polyhedron: Polyhedron,
  Ring: Ring,
  Sphere: Sphere,
  Tetrahedron: Tetrahedron,
  Text: Text,
  Torus: Torus,
  TorusKnot: TorusKnot,
  Tube: Tube,
  Image: Image,
  InstancedMesh: InstancedMesh,
  Sprite: Sprite,
  Points: Points,
  GltfModel: GLTF,
  FbxModel: FBX,
  EffectComposer: EffectComposer,
  ComposerInjectionKey: ComposerInjectionKey,
  RenderPass: RenderPass,
  EffectPass: EffectPass,
  BokehPass: BokehPass,
  FilmPass: FilmPass,
  FXAAPass: FXAAPass,
  HalftonePass: HalftonePass,
  SMAAPass: SMAAPass,
  SSAOPass: SSAOPass,
  TiltShiftPass: TiltShiftPass,
  UnrealBloomPass: UnrealBloomPass,
  ZoomBlurPass: ZoomBlurPass,
  applyObjectProps: applyObjectProps,
  bindObjectProp: bindObjectProp,
  bindObjectProps: bindObjectProps,
  setFromProp: setFromProp,
  bindProps: bindProps,
  bindProp: bindProp,
  propsValues: propsValues,
  lerp: lerp,
  limit: limit,
  getMatcapUrl: getMatcapUrl
});

const TroisJSVuePlugin = {
  install(app) {
    const comps = [
      "Camera",
      "OrthographicCamera",
      "PerspectiveCamera",
      "Raycaster",
      "Renderer",
      "Scene",
      "Group",
      "CubeCamera",
      "AmbientLight",
      "DirectionalLight",
      "HemisphereLight",
      "PointLight",
      "RectAreaLight",
      "SpotLight",
      "BasicMaterial",
      "LambertMaterial",
      "MatcapMaterial",
      "PhongMaterial",
      "PhysicalMaterial",
      "PointsMaterial",
      "ShaderMaterial",
      "StandardMaterial",
      "SubSurfaceMaterial",
      "ToonMaterial",
      "Texture",
      "CubeTexture",
      "BufferGeometry",
      "Mesh",
      "Box",
      "BoxGeometry",
      "Circle",
      "CircleGeometry",
      "Cone",
      "ConeGeometry",
      "Cylinder",
      "CylinderGeometry",
      "Dodecahedron",
      "DodecahedronGeometry",
      "Icosahedron",
      "IcosahedronGeometry",
      "Lathe",
      "LatheGeometry",
      "Octahedron",
      "OctahedronGeometry",
      "Plane",
      "PlaneGeometry",
      "Polyhedron",
      "PolyhedronGeometry",
      "Ring",
      "RingGeometry",
      "Sphere",
      "SphereGeometry",
      "Tetrahedron",
      "TetrahedronGeometry",
      "Text",
      "Torus",
      "TorusGeometry",
      "TorusKnot",
      "TorusKnotGeometry",
      "Tube",
      "TubeGeometry",
      "Image",
      "InstancedMesh",
      "Points",
      "Sprite",
      "FbxModel",
      "GltfModel",
      "BokehPass",
      "EffectComposer",
      "FilmPass",
      "FXAAPass",
      "HalftonePass",
      "RenderPass",
      "SAOPass",
      "SMAAPass",
      "SSAOPass",
      "TiltShiftPass",
      "UnrealBloomPass",
      "ZoomBlurPass"
    ];
    comps.forEach((comp) => {
      app.component(comp, TROIS[comp]);
    });
  }
};
function createApp(params) {
  return vue.createApp(params).use(TroisJSVuePlugin);
}

const decimalPrecisionRange = {
  "Precision from file": 99,
  "0(1)": 0,
  "0.1(1/2)": 1,
  "0.01(1/4)": 2,
  "0.001(1/8)": 3,
  "0.0001(1/16)": 4,
  "0.00001(1/32)": 5,
  "0.000001(1/64)": 6
};
const showPrecisionValue = (value, precistionType) => {
  const str = value.toFixed(precistionType === decimalPrecisionRange["Precision from file"] ? 2 : precistionType);
  return str;
};

const _ExportUtils = class {
  static exportToGltf(input, filename) {
    _ExportUtils.exportToGltfOrGlb(input, filename, { binary: false });
  }
  static exportToGlb(input, filename) {
    _ExportUtils.exportToGltfOrGlb(input, filename, { binary: true });
  }
  static exportToGltfOrGlb(input, filename, options = {}) {
    if (!input || !filename) {
      throw new Error("Invalid input or filename!");
    }
    console.warn("Not implemented yet!");
  }
  static exportToObj(input, filename) {
    if (!input || !filename) {
      throw new Error("Invalid input or filename!");
    }
    filename = _ExportUtils.addExtention(filename, _ExportUtils.EXTENSION_OBJ);
    const exporter = new OBJExporter_js.OBJExporter();
    const result = exporter.parse(input);
    _ExportUtils.saveString(result, filename);
  }
  static exportToDraco(input, filename, options = {}) {
    if (!input || !filename) {
      throw new Error("Invalid input or filename!");
    }
    filename = _ExportUtils.addExtention(filename, _ExportUtils.EXTENSION_DRACO);
    const exporter = new DRACOExporter_js.DRACOExporter();
    const DEFAULT_OPTIONS = {
      encodeSpeed: 5
    };
    options = Object.assign({}, DEFAULT_OPTIONS, options);
    const result = exporter.parse(input, options);
    _ExportUtils.saveArrayBuffer(result, filename);
  }
  static exportToThreeJsJson(input, filename) {
    const json = input.toJSON();
    if (!filename.toLowerCase().endsWith(_ExportUtils.EXTENSION_JSON)) {
      filename += _ExportUtils.EXTENSION_JSON;
    }
    _ExportUtils.saveJson(json, filename);
  }
  static save(blob, filename) {
    let link = _ExportUtils.downloadLink;
    if (!link) {
      link = document.createElement("a");
      link.style.display = "none";
      document.body.appendChild(link);
      _ExportUtils.downloadLink = link;
    }
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }
  static saveArrayBuffer(buffer, filename) {
    _ExportUtils.save(new Blob([buffer], { type: "application/octet-stream" }), filename);
  }
  static saveJson(json, filename) {
    _ExportUtils.saveJsonString(JSON.stringify(json), filename);
  }
  static saveJsonString(jsonString, filename) {
    _ExportUtils.save(new Blob([jsonString], { type: "application/json" }), filename);
  }
  static saveString(str, filename) {
    _ExportUtils.save(new Blob([str], { type: "text/csv" }), filename);
  }
  static addExtention(filename, extension) {
    if (!filename.toLowerCase().endsWith(extension.toLowerCase())) {
      filename += extension;
    }
    return filename;
  }
};
let ExportUtils = _ExportUtils;
ExportUtils.EXTENSION_GLTF = ".gltf";
ExportUtils.EXTENSION_GLB = ".glb";
ExportUtils.EXTENSION_OBJ = ".obj";
ExportUtils.EXTENSION_DRACO = ".drc";
ExportUtils.EXTENSION_JSON = ".json";

class MaterialUtils {
  static materialEquals(m1, m2) {
    if (m1 === m2) {
      return true;
    }
    if (m1 instanceof THREE__namespace.Material && m2 instanceof THREE__namespace.Material) {
      const result = m1.type === m2.type && m1.alphaTest === m2.alphaTest && m1.opacity === m2.opacity && m1.side === m2.side && m1.visible === m2.visible && m1.name === m2.name && m1.transparent === m2.transparent && this.colorEquals(m1.color, m2.color) && this.colorEquals(m1.emissive, m2.emissive) && m1.roughness === m2.roughness && m1.metalness === m2.metalness && m1.alphaMap === m2.alphaMap;
      return result;
    }
    return false;
  }
  static materialsEquals(m1, m2) {
    if (m1 === m2) {
      return true;
    } else if (Array.isArray(m1) && Array.isArray(m2) && m1.length === m2.length) {
      for (let i = 0; i < m1.length; ++i) {
        if (!this.materialEquals(m1[i], m2[i])) {
          return false;
        }
      }
      return true;
    } else if (m1 instanceof THREE__namespace.Material && m2 instanceof THREE__namespace.Material) {
      return this.materialEquals(m1, m2);
    }
    return false;
  }
  static colorEquals(c1, c2) {
    if (c1 === c2) {
      return true;
    }
    if (c1 instanceof THREE__namespace.Color && c2 instanceof THREE__namespace.Color) {
      return c1.equals(c2);
    }
    return false;
  }
}

const matrixAutoUpdate = false;

const _ObjectUtils = class {
  static resetObjectStyle(object) {
    this.revertWireframeMode(object);
    this.revertObjectOpacity(object, []);
    this.revertVisibleForFloors(object);
  }
  static resetObjectStyleByUuid(scene, uuid) {
    const object = this.getObjectByUuid(scene, uuid);
    this.resetObjectStyle(object);
  }
  static setObjectOpacity(object, opacity = 0.3, includeObjectUuids, excludeObjectUuids) {
    const materialInfoList = [];
    const addOpacity = (mat) => {
      if (!materialInfoList.find((m) => m.uuid === mat.uuid)) {
        materialInfoList.push({ uuid: mat.uuid, opacity: mat.opacity, transparent: mat.transparent });
        mat.opacity *= opacity;
        mat.transparent = true;
      }
    };
    const addOpacityForClonedMaterial = (mat) => {
      const matInfo = materialInfoList.find((m) => m.uuid === mat.uuid);
      if (!matInfo) {
        const clonedMaterial = mat.clone();
        materialInfoList.push({ uuid: mat.uuid, opacity: mat.opacity, transparent: mat.transparent, material: mat, clonedMaterial });
        clonedMaterial.opacity *= opacity;
        clonedMaterial.transparent = true;
        return clonedMaterial;
      }
      return matInfo.clonedMaterial;
    };
    object.traverse((obj) => {
      if (excludeObjectUuids && excludeObjectUuids.indexOf(obj.uuid) !== -1) {
        return;
      }
      if (includeObjectUuids && includeObjectUuids.indexOf(obj.uuid) === -1) {
        return;
      }
      if (obj instanceof THREE__namespace.Mesh) {
        const mesh = obj;
        if (includeObjectUuids) {
          if (Array.isArray(mesh.material)) {
            const materials = [];
            mesh.material.forEach((mat) => {
              const m = addOpacityForClonedMaterial(mat);
              if (m) {
                materials.push(m);
              }
            });
            mesh.material = materials;
          } else if (mesh.material) {
            const m = addOpacityForClonedMaterial(mesh.material);
            if (m) {
              mesh.material = m;
            }
          }
        } else {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
              addOpacity(mat);
            });
          } else if (mesh.material) {
            const mat = mesh.material;
            addOpacity(mat);
          }
        }
      }
    });
    return materialInfoList;
  }
  static revertObjectOpacity(object, materialInfoList, includeObjectUuids, excludeObjectUuids) {
    const revertOpacity = (mat) => {
      const material = materialInfoList.find((m) => m.uuid === mat.uuid);
      if (material) {
        mat.opacity = material.opacity;
        mat.transparent = material.transparent;
      } else {
        mat.opacity = 1;
      }
    };
    const tryGetOriginalMaterial = (mat) => {
      const matInfo = materialInfoList.find((m) => m.clonedMaterial && m.clonedMaterial.uuid === mat.uuid);
      if (matInfo) {
        return matInfo.material;
      }
      return void 0;
    };
    object.traverse((mesh) => {
      if (excludeObjectUuids && excludeObjectUuids.indexOf(mesh.uuid) !== -1) {
        return;
      }
      if (includeObjectUuids && includeObjectUuids.indexOf(mesh.uuid) === -1) {
        return;
      }
      if (mesh instanceof THREE__namespace.Mesh) {
        if (includeObjectUuids) {
          if (Array.isArray(mesh.material)) {
            const materials = [];
            mesh.material.forEach((mat) => {
              const m = tryGetOriginalMaterial(mat);
              if (m) {
                materials.push(m);
              }
            });
            mesh.material = materials;
          } else if (mesh.material) {
            const m = tryGetOriginalMaterial(mesh.material);
            if (m) {
              mesh.material = m;
            }
          }
        } else {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
              revertOpacity(mat);
            });
          } else if (mesh.material) {
            const mat = mesh.material;
            revertOpacity(mat);
          }
        }
      }
    });
  }
  static setObjectOpacityByUuid(scene, uuid, opacity = 0.3, includeObjectUuids, excludeObjectUuids) {
    const object = scene.getObjectByProperty("uuid", uuid);
    if (!object) {
      throw new Error(`Failed to find object by uuid: ${uuid}`);
    }
    return _ObjectUtils.setObjectOpacity(object, opacity, includeObjectUuids, excludeObjectUuids);
  }
  static revertObjectOpacityByUuid(scene, uuid, materialInfoList, includeObjectUuids, excludeObjectUuids) {
    const object = scene.getObjectByProperty("uuid", uuid);
    if (!object) {
      throw new Error(`Failed to find object by uuid: ${uuid}`);
    }
    _ObjectUtils.revertObjectOpacity(object, materialInfoList, includeObjectUuids, excludeObjectUuids);
  }
  static explodeObject(scene, object, explodeUp = false) {
    const position = new THREE__namespace.Vector3();
    SceneUtils.getPositionCenter(object, position);
    const exploder = new Exploder(scene, object.id, position);
    exploder.setOnlyExplodeUp(explodeUp);
    exploder.explode();
    return exploder;
  }
  static unexplodeObject(exploder) {
    if (!exploder) {
      throw new Error("Invalid exploder!");
    }
    exploder.unexplode();
  }
  static setWireframeMode(object) {
    const wireframeMaterial = new THREE__namespace.MeshBasicMaterial({
      color: 16732160,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    object.traverseVisible((obj) => {
      if (obj instanceof THREE__namespace.Mesh) {
        const mesh = obj;
        mesh.userData.materialForWireframe = mesh.material;
        mesh.material = wireframeMaterial;
      }
    });
  }
  static setWireframeModeByUuid(scene, uuid) {
    const object = scene.getObjectByProperty("uuid", uuid);
    if (!object) {
      throw new Error(`Failed to find object by uuid: ${uuid}`);
    }
    _ObjectUtils.setWireframeMode(object);
  }
  static revertWireframeMode(object) {
    object.traverseVisible((obj) => {
      if (obj instanceof THREE__namespace.Mesh) {
        if (obj.userData.materialForWireframe) {
          obj.material = obj.userData.materialForWireframe;
          obj.userData.materialForWireframe = void 0;
        }
      }
    });
  }
  static revertWireframeModeByUuid(scene, uuid) {
    const object = scene.getObjectByProperty("uuid", uuid);
    if (!object) {
      throw new Error(`Failed to find object by uuid: ${uuid}`);
    }
    _ObjectUtils.revertWireframeMode(object);
  }
  static findInner(scene, searchText, targetUuids = [], findFirst = false) {
    const val = searchText.toLowerCase();
    const results = [];
    const matchStr = (str) => {
      return str.toLowerCase().indexOf(val) !== -1;
    };
    const matchNum = (num) => {
      return num.toString().indexOf(val) !== -1;
    };
    const matchUserData = (userData) => {
      if (userData.name) {
        if (userData.name.toLowerCase().indexOf(val) !== -1) {
          return true;
        }
      }
      if (userData.gltfExtensions) {
        const ext = userData.gltfExtensions;
        const id = ext.objectId && ext.objectId.Value || ext.elementId && ext.elementId.Value;
        if (id && id.toLowerCase().indexOf(val) !== -1) {
          return true;
        }
      }
      return false;
    };
    if (targetUuids.length > 0) {
      for (let i = 0; i < targetUuids.length; ++i) {
        const uuid = targetUuids[i];
        const object = scene.getObjectByProperty("uuid", uuid);
        if (object) {
          object.traverse((obj) => {
            if (matchStr(obj.name) || matchNum(obj.id) || matchUserData(obj.userData)) {
              results.push(obj);
            }
          });
        }
        if (findFirst && results.length > 0) {
          return [results[0]];
        }
      }
    } else {
      scene.traverse((obj) => {
        if (matchStr(obj.name) || matchNum(obj.id) || matchUserData(obj.userData)) {
          results.push(obj);
        }
      });
      if (findFirst && results.length > 0) {
        return [results[0]];
      }
    }
    return results;
  }
  static find(scene, searchText, targetUuids = [], findFirst = false) {
    return this.findInner(scene, searchText, targetUuids);
  }
  static findFirst(scene, searchText, targetUuids = [], findFirst = false) {
    const results = this.findInner(scene, searchText, targetUuids, true);
    if (results.length > 0) {
      return results[0];
    }
    return void 0;
  }
  static getFloorsFromString(str) {
    const results = [];
    const reg = new RegExp(/(?:-?(?:\d+(?:\.5)?)F)(?=\W|$)/, "g");
    const arr = reg.exec(str);
    if (arr && arr.length > 0) {
      arr.forEach((r) => {
        if (r) {
          const f = r.replace("F", "");
          const num = Number(f);
          if (num) {
            results.push(num);
          } else {
            console.log(`[OU] invalid floor: ${r}`);
          }
        }
      });
    }
    return results;
  }
  static matchFloor(str, floor) {
    const results = this.getFloorsFromString(str);
    const i = results.findIndex((r) => r === floor);
    return i !== -1;
  }
  static matchFloors(str, floors) {
    const results = this.getFloorsFromString(str);
    const i = results.findIndex((r) => {
      const j = floors.findIndex((f) => f === r);
      return j !== -1;
    });
    return i !== -1;
  }
  static distinctFloors(scene, modelUuid) {
    const floors = [];
    const match = (name) => {
      const results = this.getFloorsFromString(name);
      results.forEach((f) => {
        floors[f] = true;
      });
    };
    modelUuid.forEach((uuid) => {
      const object = scene.getObjectByProperty("uuid", uuid);
      if (object) {
        object.traverse((obj) => {
          match(obj.name);
          if (obj.userData.gltfExtensions) {
            const ext = obj.userData.gltfExtensions;
            if (ext.level && ext.level.Value) {
              match(ext.level.Value);
            }
          }
        });
      }
    });
    return Object.keys(floors).sort();
  }
  static traverseObjectByFloors(scene, modelUuid, floors, matchCallback, unmatchCallback) {
    const object = scene.getObjectByProperty("uuid", modelUuid);
    if (!object) {
      return [];
    }
    object.traverse((obj) => {
      let isMatch = this.matchFloors(obj.name, floors);
      if (!isMatch) {
        if (obj.userData && obj.userData.gltfExtensions) {
          const ext = obj.userData.gltfExtensions;
          if (ext.level && ext.level.Value) {
            isMatch = this.matchFloors(ext.level.Value, floors);
          }
        }
      }
      if (isMatch && matchCallback) {
        matchCallback(obj);
      }
      if (!isMatch && unmatchCallback) {
        unmatchCallback(obj);
      }
    });
  }
  static setVisibleForFloors(scene, modelUuid, floors, makeUnmatchedInvisible = true) {
    this.traverseObjectByFloors(scene, modelUuid, floors, (object) => {
      let obj = object;
      while (obj) {
        obj.visible = true;
        obj = obj.parent || void 0;
      }
    }, (object) => {
      if (makeUnmatchedInvisible) {
        object.visible = false;
      }
    });
  }
  static revertVisibleForFloors(object) {
    object.traverse((obj) => {
      obj.visible = true;
    });
  }
  static revertVisibleForFloorsByUuid(scene, uuid) {
    const object = this.getObjectByUuid(scene, uuid);
    this.revertVisibleForFloors(object);
  }
  static getObjectByUuid(scene, uuid) {
    const object = scene.getObjectByProperty("uuid", uuid);
    if (!object) {
      throw new Error(`Failed to find object by uuid: ${uuid}`);
    }
    return object;
  }
  static addOutlines(object, material = this.OUTLINE_MATERIAL.clone(), options = { visibleOnly: true, meshOnly: true, replaceOriginalObject: false }) {
    if (!object) {
      return [];
    }
    if (object.children.length === 0 && (options.visibleOnly && !object.visible || options.meshOnly && !(object instanceof THREE__namespace.Mesh))) {
      return [];
    }
    const obj = object;
    const length = obj.children.length;
    if (length > 0) {
      for (let i = length - 1; i >= 0; --i) {
        const o = obj.children[i];
        const lines2 = this.addOutlines(o, material, options);
        lines2.forEach((line) => line.applyMatrix4(obj.matrixWorld));
      }
    }
    if (!obj.geometry) {
      return [];
    }
    const createOutline = (geometry, matrix) => {
      const geom = new THREE__namespace.EdgesGeometry(geometry, 5);
      geom.applyMatrix4(matrix);
      const line = new THREE__namespace.LineSegments(geom, material);
      line.userData.selectable = false;
      line.userData.isOutline = true;
      line.matrixAutoUpdate = matrixAutoUpdate;
      line.updateMatrix();
      return line;
    };
    const lines = [];
    if (obj instanceof THREE__namespace.InstancedMesh) {
      for (let i = 0; i < obj.count; ++i) {
        const m = new THREE__namespace.Matrix4();
        obj.getMatrixAt(i, m);
        const line = createOutline(obj.geometry, m);
        if (options.replaceOriginalObject && obj.parent) {
          const parent = obj.parent;
          parent.children.push(line);
        } else {
          obj.children.push(line);
        }
        lines.push(line);
      }
    } else {
      const line = createOutline(obj.geometry, obj.matrix);
      if (options.replaceOriginalObject && obj.parent) {
        obj.removeFromParent();
        obj.geometry.dispose();
        const parent = obj.parent;
        parent.children.push(line);
      } else {
        obj.children.push(line);
      }
      lines.push(line);
    }
    return lines;
  }
  static removeOutlines(object) {
    if (!object || !Array.isArray(object.children)) {
      return;
    }
    for (let i = object.children.length - 1; i >= 0; --i) {
      const child = object.children[i];
      if (child.children.length > 0) {
        this.removeOutlines(child);
      }
      if (child.userData.isOutline) {
        object.remove(child);
      }
    }
  }
  static hasOutline(object) {
    let result = false;
    for (let i = 0; i < object.children.length; ++i) {
      const obj = object.children[i];
      if (obj.userData.isOutline) {
        result = true;
        break;
      }
      if (obj.children.length > 0) {
        result = this.hasOutline(obj);
        if (result) {
          break;
        }
      }
    }
    return result;
  }
  static setOutlinesVisibility(object, visible) {
    object.traverse((obj) => {
      if (obj.userData.isOutline) {
        obj.visible = visible;
      }
    });
  }
};
let ObjectUtils = _ObjectUtils;
ObjectUtils.OUTLINE_MATERIAL = new THREE__namespace.LineBasicMaterial({ name: "outline", color: 0, transparent: true, opacity: 0.2 });

class PmremUtils {
  static async createEnvTextureFromDataArray(pmremGenerator, data = this.HDR_CITY_STREET_64x32, width = 64, height = 32) {
    if (pmremGenerator) {
      const texture = new THREE__namespace.DataTexture(data, width, height);
      texture.flipY = true;
      texture.magFilter = THREE__namespace.LinearFilter;
      texture.minFilter = THREE__namespace.LinearFilter;
      texture.type = THREE__namespace.HalfFloatType;
      texture.version = 1;
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      pmremGenerator.dispose();
      return Promise.resolve(envMap);
    }
    return Promise.reject(new Error("Invalid pmremGenerator!"));
  }
}
PmremUtils.HDR_CITY_STREET_64x32 = Uint16Array.from([11910, 12340, 1279715360, 11926, 12348, 12806, 15360, 11958, 12364, 12814, 15360, 11974, 12380, 1283015360, 11958, 12364, 12822, 15360, 11926, 12348, 12797, 15360, 11878, 12324, 1277315360, 11830, 12308, 12749, 15360, 11798, 12292, 12733, 15360, 11782, 12279, 1272515360, 11765, 12263, 12709, 15360, 11749, 12247, 12701, 15360, 11733, 12231, 1270115360, 11701, 12215, 12693, 15360, 11685, 12199, 12685, 15360, 11685, 12199, 1268515360, 11701, 12215, 12693, 15360, 11717, 12231, 12701, 15360, 11733, 12247, 1270915360, 11749, 12263, 12717, 15360, 11749, 12279, 12717, 15360, 11765, 12279, 1272515360, 11765, 12279, 12725, 15360, 11765, 12292, 12725, 15360, 11798, 12300, 1273315360, 11830, 12316, 12749, 15360, 11846, 12324, 12757, 15360, 11894, 12340, 1278115360, 11926, 12356, 12797, 15360, 11942, 12356, 12797, 15360, 11926, 12348, 1278915360, 11926, 12348, 12789, 15360, 11942, 12356, 12797, 15360, 11942, 12356, 1279715360, 11942, 12348, 12806, 15360, 11942, 12356, 12806, 15360, 11942, 12356, 1281415360, 11958, 12372, 12830, 15360, 11974, 12372, 12830, 15360, 11974, 12372, 1283815360, 11990, 12388, 12854, 15360, 12055, 12420, 12886, 15360, 12119, 12452, 1291815360, 12167, 12476, 12950, 15360, 12231, 12500, 12982, 15360, 12263, 12516, 1299815360, 12231, 12500, 12974, 15360, 12199, 12484, 12958, 15360, 12199, 12484, 1295815360, 12199, 12492, 12966, 15360, 12247, 12508, 12982, 15360, 12247, 12508, 1299015360, 12231, 12500, 12982, 15360, 12199, 12484, 12966, 15360, 12167, 12468, 1294215360, 12119, 12444, 12918, 15360, 12087, 12436, 12902, 15360, 12055, 12420, 1288615360, 12055, 12412, 12878, 15360, 12039, 12412, 12878, 15360, 12022, 12396, 1286215360, 12006, 12388, 12846, 15360, 11958, 12364, 12830, 15360, 11910, 12340, 1280615360, 12119, 12508, 13103, 15360, 12087, 12484, 13071, 15360, 12055, 12468, 1304615360, 12006, 12436, 13006, 15360, 11926, 12396, 12958, 15360, 11878, 12364, 1292615360, 11846, 12348, 12894, 15360, 11782, 12308, 12854, 15360, 11749, 12292, 1283015360, 11717, 12263, 12814, 15360, 11685, 12247, 12806, 15360, 11669, 12215, 1278915360, 11685, 12231, 12789, 15360, 11701, 12247, 12797, 15360, 11701, 12247, 1280615360, 11717, 12263, 12814, 15360, 11749, 12292, 12822, 15360, 11782, 12308, 1283815360, 11798, 12316, 12846, 15360, 11814, 12332, 12862, 15360, 11846, 12340, 1287015360, 11862, 12348, 12878, 15360, 11846, 12340, 12870, 15360, 11846, 12340, 1286215360, 11878, 12356, 12886, 15360, 11910, 12372, 12910, 15360, 11942, 12396, 1293415360, 11958, 12412, 12958, 15360, 12039, 12452, 12998, 15360, 12071, 12468, 1302215360, 12039, 12452, 12998, 15360, 12039, 12452, 12998, 15360, 12006, 12444, 1300615360, 11974, 12436, 12998, 15360, 11942, 12412, 12982, 15360, 11926, 12396, 1297415360, 11926, 12404, 12974, 15360, 11958, 12420, 12998, 15360, 12006, 12452, 1303815360, 12055, 12476, 13071, 15360, 12039, 12476, 13079, 15360, 12087, 12508, 1312715360, 12247, 12597, 13231, 15360, 12388, 12693, 13332, 15360, 12420, 12741, 1336415360, 12436, 12757, 13372, 15360, 12468, 12773, 13380, 15360, 12500, 12806, 1338815360, 12516, 12822, 13404, 15360, 12629, 12934, 13452, 15360, 12741, 13046, 1350815360, 12806, 13095, 13532, 15360, 12757, 13046, 13516, 15360, 12645, 12950, 1346015360, 12565, 12870, 13428, 15360, 12532, 12838, 13412, 15360, 12549, 12854, 1341215360, 12516, 12838, 13396, 15360, 12452, 12757, 13356, 15360, 12420, 12725, 1334015360, 12404, 12709, 13332, 15360, 12372, 12677, 13316, 15360, 12279, 12589, 1320715360, 12135, 12516, 13119, 15360, 12388, 12709, 13348, 15360, 12247, 12581, 1322315360, 12055, 12476, 13087, 15360, 11910, 12388, 12982, 15360, 11733, 12308, 1288615360, 11669, 12247, 12846, 15360, 11621, 12199, 12814, 15360, 11541, 12103, 1276515360, 11492, 12055, 12733, 15360, 11508, 12055, 12733, 15360, 11476, 12022, 1271715360, 11525, 12055, 12725, 15360, 11589, 12135, 12757, 15360, 11669, 12199, 1276515360, 11765, 12292, 12814, 15360, 11862, 12348, 12886, 15360, 11910, 12372, 1291015360, 12006, 12420, 12966, 15360, 12071, 12452, 12998, 15360, 12119, 12476, 1302215360, 12167, 12492, 13046, 15360, 12183, 12500, 13063, 15360, 12199, 12524, 1307915360, 12308, 12589, 13151, 15360, 12300, 12581, 13151, 15360, 12167, 12516, 1308715360, 12087, 12468, 13030, 15360, 12022, 12444, 13014, 15360, 11990, 12420, 1299015360, 11974, 12420, 12990, 15360, 11974, 12420, 12990, 15360, 11990, 12436, 1301415360, 11990, 12444, 13030, 15360, 12103, 12500, 13103, 15360, 12087, 12508, 1311115360, 12039, 12484, 13103, 15360, 12039, 12476, 13103, 15360, 11942, 12436, 1305415360, 11974, 12452, 13087, 15360, 12039, 12492, 13135, 15360, 12103, 12532, 1319915360, 12183, 12581, 13263, 15360, 12308, 12661, 13340, 15360, 12484, 12822, 1343615360, 12613, 12918, 13484, 15360, 12725, 13046, 13540, 15360, 13046, 13332, 1367715360, 13143, 13380, 13717, 15360, 13223, 13420, 13741, 15360, 13396, 13540, 1386215360, 13436, 13589, 13902, 15360, 13484, 13629, 13942, 15360, 13468, 13621, 1393415360, 13412, 13564, 13878, 15360, 13372, 13524, 13846, 15360, 13287, 13452, 1378115360, 13223, 13428, 13749, 15360, 13340, 13492, 13805, 15360, 13239, 13428, 1374915360, 13095, 13364, 13685, 15360, 12918, 13223, 13597, 15360, 12822, 13111, 1355615360, 12613, 12934, 13468, 15360, 12532, 12854, 13428, 15360, 12565, 12870, 1344415360, 12468, 12789, 13396, 15360, 12372, 12693, 13340, 15360, 12087, 12492, 1311115360, 11846, 12364, 12958, 15360, 11717, 12300, 12878, 15360, 11557, 12135, 1278115360, 11476, 12055, 12741, 15360, 11460, 12022, 12725, 15360, 11476, 12022, 1272515360, 11476, 12022, 12709, 15360, 11476, 11958, 12605, 15360, 11364, 11733, 1233215360, 11111, 11412, 11661, 15360, 11223, 11476, 11773, 15360, 11388, 11669, 1209515360, 11765, 12119, 12492, 15360, 12388, 12613, 13079, 15360, 12661, 12902, 1335615360, 12998, 13255, 13564, 15360, 13372, 13508, 13797, 15360, 13412, 13548, 1384615360, 13287, 13436, 13725, 15360, 13271, 13428, 13709, 15360, 13287, 13428, 1371715360, 13014, 13287, 13597, 15360, 12709, 12998, 13460, 15360, 12452, 12741, 1333215360, 12364, 12653, 13271, 15360, 12404, 12693, 13316, 15360, 12420, 12709, 1331615360, 12420, 12709, 13332, 15360, 12263, 12589, 13231, 15360, 12332, 12661, 1331215360, 12300, 12629, 13295, 15360, 12263, 12605, 13287, 15360, 12231, 12597, 1327915360, 12247, 12613, 13303, 15360, 12231, 12597, 13295, 15360, 12231, 12605, 1331215360, 12199, 12597, 13324, 15360, 12231, 12613, 13340, 15360, 12516, 12870, 1346815360, 12725, 13063, 13564, 15360, 12741, 13079, 13573, 15360, 12854, 13175, 1361315360, 12902, 13223, 13629, 15360, 13046, 13348, 13693, 15360, 13356, 13516, 1384615360, 13605, 13765, 14078, 15360, 13717, 13870, 14191, 15360, 13765, 13918, 1425515360, 13765, 13910, 14247, 15360, 13701, 13854, 14191, 15360, 13573, 13733, 1407015360, 13508, 13677, 14006, 15360, 13380, 13548, 13886, 15360, 13111, 13380, 1374115360, 13063, 13348, 13709, 15360, 12886, 13207, 13629, 15360, 12725, 13046, 1354815360, 12645, 12966, 13508, 15360, 12677, 12982, 13508, 15360, 12629, 12950, 1349215360, 12452, 12789, 13412, 15360, 12324, 12661, 13332, 15360, 12356, 12677, 1334015360, 12388, 12693, 13348, 15360, 12279, 12597, 13247, 15360, 11894, 12396, 1299815360, 11637, 12231, 12846, 15360, 11573, 12135, 12789, 15360, 11589, 12151, 1279715360, 11621, 12167, 12797, 15360, 11637, 12119, 12677, 15360, 11079, 11404, 1169315360, 10517, 10701, 10653, 15360, 10252, 10348, 10007, 15360, 9902, 9999, 9428, 153609846, 9886, 9047, 15360, 10135, 10260, 9685, 15360, 10412, 10533, 10412, 15360, 1126811436, 11549, 15360, 12364, 12605, 13087, 15360, 12444, 12709, 13255, 15360, 1254912822, 13348, 15360, 12613, 12886, 13396, 15360, 12597, 12886, 13412, 15360, 1258112870, 13404, 15360, 12661, 12950, 13460, 15360, 12725, 13014, 13492, 15360, 1307913332, 13645, 15360, 12757, 13046, 13500, 15360, 12677, 12982, 13476, 15360, 1285413143, 13556, 15360, 12693, 12982, 13492, 15360, 12581, 12886, 13452, 15360, 1270913030, 13508, 15360, 12372, 12709, 13364, 15360, 12324, 12661, 13348, 15360, 1229212645, 13340, 15360, 12292, 12645, 13348, 15360, 12468, 12806, 13436, 15360, 1253212854, 13460, 15360, 12500, 12854, 13468, 15360, 12500, 12854, 13484, 15360, 1272513063, 13589, 15360, 12982, 13324, 13701, 15360, 13111, 13388, 13741, 15360, 1301413340, 13709, 15360, 13014, 13332, 13717, 15360, 13287, 13476, 13862, 15360, 1343613621, 13974, 15360, 13532, 13717, 14095, 15360, 13725, 13902, 14295, 15360, 1394214103, 14420, 15360, 13974, 14135, 14436, 15360, 13862, 14022, 14388, 15360, 1372513894, 14295, 15360, 13789, 13958, 14336, 15360, 13830, 13990, 14348, 15360, 1337213548, 13942, 15360, 13014, 13332, 13733, 15360, 12886, 13239, 13661, 15360, 1285413207, 13637, 15360, 12757, 13095, 13589, 15360, 12757, 13079, 13573, 15360, 1264512982, 13516, 15360, 12629, 12966, 13532, 15360, 12549, 12870, 13468, 15360, 1235612693, 13372, 15360, 12151, 12549, 13231, 15360, 12215, 12573, 13247, 15360, 1219912565, 13231, 15360, 12071, 12492, 13135, 15360, 12055, 12468, 13087, 15360, 1187812372, 12958, 15360, 11685, 12199, 12781, 15360, 10774, 11159, 11412, 15360, 9533, 96218870, 15360, 9308, 9340, 8071, 15360, 9276, 9300, 7878, 15360, 9324, 9332, 8420, 153609191, 9216, 7991, 15360, 8950, 8983, 7766, 15360, 9493, 9525, 8677, 15360, 10252, 1033210007, 15360, 10661, 10846, 10894, 15360, 10701, 10926, 10998, 15360, 10950, 1127611428, 15360, 11364, 11637, 12063, 15360, 11958, 12388, 12926, 15360, 12183, 1254013175, 15360, 12340, 12645, 13295, 15360, 12420, 12693, 13316, 15360, 12757, 1303013460, 15360, 13046, 13324, 13645, 15360, 13095, 13348, 13677, 15360, 13303, 1346013781, 15360, 13207, 13404, 13741, 15360, 13127, 13372, 13717, 15360, 13372, 1352413862, 15360, 12693, 13030, 13540, 15360, 12725, 13046, 13548, 15360, 12468, 1282213436, 15360, 12263, 12629, 13348, 15360, 12436, 12773, 13428, 15360, 12693, 1299813524, 15360, 12725, 13046, 13564, 15360, 12645, 12982, 13556, 15360, 12613, 1296613556, 15360, 12886, 13255, 13685, 15360, 13436, 13629, 14022, 15360, 13637, 1381314231, 15360, 13621, 13789, 14215, 15360, 13878, 14038, 14412, 15360, 14022, 1418314468, 15360, 13926, 14119, 14452, 15360, 14054, 14231, 14508, 15360, 14135, 1431114540, 15360, 14348, 14436, 14669, 15360, 14460, 14540, 14749, 15360, 14404, 1448414709, 15360, 14420, 14500, 14709, 15360, 14653, 14717, 14894, 15360, 14119, 1427914508, 15360, 13484, 13669, 14078, 15360, 13063, 13380, 13773, 15360, 12677, 1307913613, 15360, 12484, 12886, 13516, 15360, 12436, 12822, 13476, 15360, 12468, 1283813476, 15360, 12039, 12532, 13316, 15360, 12231, 12613, 13340, 15360, 12468, 1278913436, 15360, 12388, 12725, 13396, 15360, 12135, 12557, 13287, 15360, 12151, 1255713271, 15360, 12039, 12484, 13175, 15360, 11878, 12396, 13038, 15360, 11814, 1234812950, 15360, 11492, 11894, 12460, 15360, 9950, 10103, 9621, 15360, 8830, 8838, 722015360, 8565, 8533, 7015, 15360, 8541, 8501, 6919, 15360, 8332, 8300, 6822, 15360, 84128372, 7220, 15360, 8710, 8701, 7686, 15360, 9372, 9404, 8549, 15360, 9533, 9621, 907915360, 9268, 9292, 8196, 15360, 9452, 9460, 8167, 15360, 9533, 9581, 8533, 15360, 97429870, 9316, 15360, 11460, 11814, 12348, 15360, 11942, 12388, 12902, 15360, 11749, 1216712573, 15360, 11300, 11492, 11621, 15360, 11974, 12332, 12669, 15360, 12436, 1274113364, 15360, 12597, 12886, 13460, 15360, 12966, 13271, 13653, 15360, 12998, 1330313669, 15360, 13476, 13629, 13974, 15360, 13733, 13886, 14239, 15360, 13364, 1352413894, 15360, 13063, 13356, 13725, 15360, 12982, 13287, 13669, 15360, 12484, 1280613444, 15360, 12565, 12902, 13500, 15360, 12950, 13287, 13693, 15360, 12934, 1327113677, 15360, 12693, 13046, 13589, 15360, 12661, 13030, 13605, 15360, 12870, 1327113717, 15360, 13348, 13548, 13966, 15360, 13621, 13813, 14271, 15360, 13797, 1397414412, 15360, 13942, 14119, 14484, 15360, 14263, 14388, 14629, 15360, 14420, 1450814733, 15360, 14460, 14548, 14773, 15360, 14982, 15046, 15231, 15360, 15564, 1558015669, 15360, 15974, 15982, 16078, 15360, 15805, 15821, 15926, 15360, 15460, 1547615572, 15360, 15436, 15460, 15556, 15360, 14781, 14862, 15127, 15360, 13621, 1381314348, 15360, 12789, 13207, 13757, 15360, 12452, 12886, 13581, 15360, 12263, 1270913476, 15360, 12039, 12597, 13396, 15360, 11942, 12516, 13340, 15360, 11846, 1246813271, 15360, 11733, 12380, 13127, 15360, 11926, 12460, 13191, 15360, 12055, 1252413263, 15360, 11878, 12428, 13159, 15360, 11605, 12231, 12886, 15360, 11412, 1199012709, 15360, 11508, 12103, 12789, 15360, 11637, 12231, 12854, 15360, 10661, 1107911380, 15360, 9541, 9685, 9252, 15360, 8573, 8605, 7493, 15360, 8404, 8388, 7348, 153608830, 8822, 8212, 15360, 9308, 9324, 9095, 15360, 9324, 9364, 9220, 15360, 9047, 91198653, 15360, 9023, 9055, 8404, 15360, 9055, 9063, 8167, 15360, 8870, 8846, 7541, 153608862, 8806, 7380, 15360, 8950, 8910, 7252, 15360, 9268, 9284, 7557, 15360, 10316, 1046810380, 15360, 11239, 11476, 11677, 15360, 10653, 10942, 11047, 15360, 9661, 9814, 932415360, 10693, 10958, 11047, 15360, 11396, 11653, 11990, 15360, 11878, 12292, 1259715360, 12468, 12789, 13396, 15360, 12773, 13095, 13589, 15360, 13364, 13516, 1389415360, 13894, 14054, 14380, 15360, 13717, 13870, 14247, 15360, 13420, 13589, 1395815360, 13255, 13452, 13830, 15360, 12806, 13143, 13637, 15360, 13159, 13412, 1383015360, 13629, 13813, 14215, 15360, 13303, 13500, 13910, 15360, 13079, 13396, 1380515360, 13191, 13452, 13878, 15360, 13412, 13621, 14062, 15360, 14103, 14279, 1454015360, 14773, 14854, 15086, 15360, 14717, 14805, 15046, 15360, 14295, 14420, 1468515360, 14380, 14476, 14733, 15360, 14572, 14661, 14902, 15360, 15596, 15612, 1570115360, 16351, 16335, 16384, 15360, 16484, 16476, 16492, 15360, 16516, 16500, 1651615360, 16388, 16375, 16404, 15360, 16054, 16054, 16118, 15360, 15918, 15926, 1600615360, 15556, 15572, 15669, 15360, 14653, 14725, 14982, 15360, 13637, 13838, 1431915360, 13412, 13613, 14054, 15360, 12870, 13287, 13789, 15360, 12404, 12838, 1352415360, 12199, 12677, 13428, 15360, 12324, 12741, 13452, 15360, 11942, 12516, 1332415360, 11765, 12380, 13111, 15360, 11428, 11942, 12589, 15360, 10886, 11388, 1190215360, 10372, 10717, 11006, 15360, 9846, 10240, 10191, 15360, 10252, 10549, 1076615360, 10613, 11079, 11484, 15360, 10581, 10998, 11388, 15360, 9613, 9846, 9629, 153608525, 8557, 7541, 15360, 8605, 8613, 7814, 15360, 9292, 9324, 9079, 15360, 9388, 93969220, 15360, 10709, 10846, 11031, 15360, 9894, 9966, 9854, 15360, 9252, 9236, 877415360, 8822, 8790, 8183, 15360, 8292, 8260, 6533, 15360, 8111, 8007, 6324, 15360, 82288183, 6405, 15360, 8501, 8501, 6565, 15360, 8814, 8878, 7172, 15360, 9260, 9364, 824415360, 8902, 9095, 8252, 15360, 9444, 9581, 9047, 15360, 9509, 9637, 8790, 15360, 94779613, 8806, 15360, 10725, 11063, 11079, 15360, 11508, 11910, 12356, 15360, 12484, 1278913380, 15360, 12838, 13159, 13629, 15360, 13428, 13589, 13974, 15360, 14135, 1427914484, 15360, 13942, 14087, 14396, 15360, 13677, 13846, 14247, 15360, 13436, 1361314006, 15360, 13597, 13781, 14183, 15360, 14183, 14340, 14540, 15360, 14022, 1421514484, 15360, 13637, 13838, 14271, 15360, 14038, 14231, 14508, 15360, 14380, 1447614701, 15360, 14757, 14854, 15078, 15360, 15030, 15111, 15343, 15360, 15420, 1545215556, 15360, 15476, 15500, 15588, 15360, 15351, 15388, 15492, 15360, 15572, 1559615677, 15360, 15653, 15669, 15717, 15360, 15821, 15821, 15853, 15360, 15845, 1584515869, 15360, 15998, 15990, 16022, 15360, 15926, 15926, 15974, 15360, 15653, 1566915733, 15360, 15661, 15677, 15749, 15360, 15612, 15629, 15717, 15360, 15271, 1533515452, 15360, 14484, 14572, 14821, 15360, 14215, 14372, 14588, 15360, 13468, 1367714167, 15360, 12773, 13175, 13653, 15360, 12725, 13143, 13637, 15360, 12452, 1288613532, 15360, 12263, 12709, 13444, 15360, 11894, 12436, 13103, 15360, 10252, 1053310661, 15360, 8613, 8693, 7445, 15360, 8742, 8782, 7047, 15360, 8420, 8412, 6565, 153607926, 7910, 6405, 15360, 8806, 8854, 7300, 15360, 9127, 9228, 8007, 15360, 8685, 87507300, 15360, 8348, 8356, 6758, 15360, 8380, 8340, 7300, 15360, 8991, 8918, 8388, 153609838, 9790, 9549, 15360, 10055, 10127, 10047, 15360, 9501, 9493, 9268, 15360, 9332, 92928902, 15360, 9079, 9007, 8509, 15360, 8300, 8260, 7252, 15360, 8693, 8701, 8196, 153608228, 8212, 7111, 15360, 8469, 8501, 7380, 15360, 8420, 8501, 6919, 15360, 8549, 86456983, 15360, 8581, 8661, 6951, 15360, 9268, 9332, 7718, 15360, 9063, 9207, 7445, 153609284, 9380, 7718, 15360, 9412, 9557, 8693, 15360, 10276, 10517, 10103, 15360, 1183012279, 12589, 15360, 12725, 13079, 13589, 15360, 13127, 13396, 13773, 15360, 1408714231, 14460, 15360, 13974, 14119, 14412, 15360, 13677, 13854, 14247, 15360, 1411914279, 14500, 15360, 13990, 14167, 14460, 15360, 14364, 14452, 14653, 15360, 1456414653, 14837, 15360, 14404, 14492, 14701, 15360, 14870, 14942, 15135, 15360, 1538815420, 15500, 15360, 15207, 15287, 15420, 15360, 14797, 14894, 15127, 15360, 1527115335, 15452, 15360, 15926, 15942, 15990, 15360, 16207, 16207, 16231, 15360, 1611816110, 16126, 15360, 15741, 15733, 15741, 15360, 16239, 16207, 16175, 15360, 1644416460, 16484, 15360, 16046, 16022, 16006, 15360, 15942, 15950, 15966, 15360, 1577315789, 15829, 15360, 15789, 15797, 15845, 15360, 15693, 15709, 15757, 15360, 1554015564, 15653, 15360, 15303, 15364, 15468, 15360, 14733, 14813, 15014, 15360, 1386214054, 14420, 15360, 12838, 13255, 13725, 15360, 12789, 13207, 13693, 15360, 1246812918, 13564, 15360, 12404, 12838, 13500, 15360, 11428, 11862, 12412, 15360, 9143, 92768388, 15360, 8541, 8533, 6726, 15360, 8444, 8428, 6629, 15360, 8212, 8183, 6597, 153608388, 8380, 7015, 15360, 8726, 8710, 6758, 15360, 8332, 8316, 6437, 15360, 8453, 84286565, 15360, 8597, 8605, 7814, 15360, 8701, 8661, 8151, 15360, 9452, 9396, 9015, 1536010581, 10557, 10380, 15360, 10950, 10974, 10846, 15360, 10380, 10356, 10252, 1536010749, 10741, 10685, 15360, 9870, 9854, 9693, 15360, 9023, 9039, 8669, 15360, 8790, 88548509, 15360, 8196, 8167, 7332, 15360, 7975, 8015, 7079, 15360, 8589, 8750, 7445, 153609095, 9260, 7111, 15360, 8983, 9135, 7188, 15360, 8902, 8991, 7252, 15360, 8862, 90077015, 15360, 8967, 9111, 7300, 15360, 8742, 8878, 7493, 15360, 9557, 9999, 9549, 1536011292, 11613, 11862, 15360, 12135, 12468, 12982, 15360, 12215, 12460, 12878, 1536013356, 13468, 13685, 15360, 13821, 13934, 14199, 15360, 13548, 13701, 14022, 1536014103, 14263, 14468, 15360, 14279, 14388, 14572, 15360, 14364, 14452, 14645, 1536014709, 14789, 14950, 15360, 15143, 15199, 15327, 15360, 15388, 15412, 15468, 1536015476, 15500, 15548, 15360, 15420, 15444, 15492, 15360, 15436, 15460, 15516, 1536015612, 15637, 15685, 15360, 16086, 16086, 16110, 15360, 16396, 16388, 16396, 1536016094, 16094, 16110, 15360, 15869, 15861, 15861, 15360, 16135, 16110, 16070, 1536016428, 16420, 16404, 15360, 15588, 15556, 15524, 15360, 15484, 15500, 15508, 1536015335, 15364, 15396, 15360, 15677, 15685, 15717, 15360, 15604, 15621, 15661, 1536015420, 15444, 15500, 15360, 15303, 15372, 15452, 15360, 14717, 14805, 14998, 1536014412, 14508, 14701, 15360, 13548, 13765, 14199, 15360, 13271, 13508, 13942, 1536012661, 13159, 13709, 15360, 12468, 12854, 13436, 15360, 10260, 10484, 10509, 153608613, 8669, 6951, 15360, 8151, 8143, 6469, 15360, 8653, 8629, 7814, 15360, 8469, 84447541, 15360, 8718, 8693, 7814, 15360, 8372, 8332, 6597, 15360, 8356, 8308, 7111, 153609047, 8983, 8396, 15360, 8822, 8798, 8308, 15360, 9372, 9348, 8967, 15360, 10364, 1036410183, 15360, 10268, 10260, 9894, 15360, 10541, 10533, 10468, 15360, 10380, 1036410276, 15360, 10621, 10613, 10549, 15360, 9910, 9942, 9758, 15360, 8364, 8380, 762115360, 8581, 8637, 8135, 15360, 8252, 8300, 7573, 15360, 8119, 8175, 7300, 15360, 83728453, 7493, 15360, 8420, 8501, 6983, 15360, 8742, 8822, 7573, 15360, 8782, 8854, 815115360, 8581, 8661, 7079, 15360, 9220, 9268, 8340, 15360, 9549, 9645, 8854, 15360, 1171711950, 12127, 15360, 12468, 12741, 13207, 15360, 12709, 12966, 13388, 15360, 1230012508, 12886, 15360, 12492, 12709, 13063, 15360, 13239, 13372, 13548, 15360, 1247612597, 12814, 15360, 13581, 13685, 13878, 15360, 14476, 14548, 14685, 15360, 1455614629, 14773, 15360, 14765, 14829, 14966, 15360, 15159, 15207, 15303, 15360, 1537215396, 15444, 15360, 15516, 15532, 15572, 15360, 15653, 15661, 15693, 15360, 1582915837, 15853, 15360, 16022, 16014, 16022, 15360, 16311, 16295, 16279, 15360, 1634316319, 16303, 15360, 16412, 16388, 16359, 15360, 15813, 15797, 15773, 15360, 1306313151, 13183, 15360, 11484, 11701, 11798, 15360, 12300, 12412, 12468, 15360, 1461314637, 14653, 15360, 11974, 12215, 12316, 15360, 14135, 14215, 14303, 15360, 1560415629, 15677, 15360, 15524, 15548, 15596, 15360, 15351, 15380, 15428, 15360, 1479714894, 15054, 15360, 13990, 14231, 14500, 15360, 13492, 13709, 14070, 15360, 1288613316, 13701, 15360, 12613, 13207, 13749, 15360, 11525, 11974, 12428, 15360, 9284, 94128629, 15360, 8597, 8653, 6951, 15360, 7806, 7790, 6292, 15360, 7589, 7541, 6437, 153607485, 7437, 6597, 15360, 7453, 7404, 6180, 15360, 7774, 7686, 6565, 15360, 8300, 82607332, 15360, 9918, 9942, 9862, 15360, 10348, 10372, 10231, 15360, 9725, 9709, 922815360, 10613, 10621, 10509, 15360, 10199, 10175, 9838, 15360, 10380, 10388, 1034015360, 11207, 11255, 11284, 15360, 10661, 10717, 10725, 15360, 10103, 10135, 995015360, 8444, 8436, 7669, 15360, 8469, 8501, 7445, 15360, 8950, 9111, 8854, 15360, 94859798, 10071, 15360, 8364, 8501, 8039, 15360, 7959, 7951, 6806, 15360, 8597, 8605, 803915360, 8501, 8533, 7557, 15360, 8758, 8830, 7509, 15360, 10758, 10830, 10693, 1536011508, 11605, 11621, 15360, 13524, 13669, 13886, 15360, 13830, 14022, 14327, 1536013926, 14103, 14364, 15360, 13460, 13621, 13886, 15360, 12854, 13191, 13420, 1536013597, 13733, 13926, 15360, 13846, 13990, 14223, 15360, 13773, 13942, 14199, 1536013910, 14087, 14356, 15360, 13813, 14022, 14319, 15360, 14247, 14396, 14540, 1536014693, 14765, 14878, 15360, 15223, 15279, 15343, 15360, 15508, 15524, 15540, 1536015540, 15548, 15564, 15360, 15327, 15335, 15319, 15360, 15303, 15311, 15303, 1536015918, 15910, 15886, 15360, 16247, 16207, 16151, 15360, 16175, 16143, 16086, 1536014436, 14452, 14436, 15360, 12263, 12380, 12404, 15360, 11476, 11701, 11773, 1536012380, 12492, 12532, 15360, 14797, 14797, 14757, 15360, 11372, 11589, 11677, 1536012597, 12934, 13356, 15360, 13990, 14364, 14725, 15360, 14183, 14444, 14773, 1536014231, 14444, 14717, 15360, 14412, 14532, 14709, 15360, 14054, 14199, 14380, 1536012372, 12500, 12605, 15360, 12199, 12565, 13006, 15360, 12581, 13175, 13653, 1536010055, 10380, 10324, 15360, 8557, 8573, 6726, 15360, 8167, 8196, 6533, 15360, 7517, 74856119, 15360, 7244, 7172, 5798, 15360, 7071, 6959, 5718, 15360, 7669, 7581, 6260, 153608661, 8605, 7975, 15360, 10942, 11079, 11151, 15360, 12573, 12741, 13014, 15360, 1190212030, 12191, 15360, 10308, 10332, 10135, 15360, 11255, 11300, 11284, 15360, 1127611348, 11396, 15360, 10055, 10215, 10292, 15360, 12183, 12332, 12468, 15360, 9918, 99669798, 15360, 8734, 8742, 8196, 15360, 8967, 8950, 8469, 15360, 10260, 10276, 1003915360, 9734, 9758, 9605, 15360, 9388, 9404, 9308, 15360, 7943, 7878, 7095, 15360, 77267637, 6645, 15360, 8047, 7983, 7204, 15360, 9284, 9236, 8693, 15360, 9621, 9565, 914315360, 11255, 11268, 11047, 15360, 13175, 13332, 13420, 15360, 13773, 13934, 1417515360, 13854, 14022, 14271, 15360, 13870, 14038, 14279, 15360, 13388, 13516, 1367715360, 12279, 12629, 12966, 15360, 13348, 13452, 13564, 15360, 13821, 13918, 1405415360, 13701, 13846, 14022, 15360, 13460, 13605, 13781, 15360, 13492, 13637, 1382115360, 13709, 13821, 13950, 15360, 14372, 14428, 14476, 15360, 14516, 14572, 1461315360, 14741, 14789, 14813, 15360, 14725, 14749, 14749, 15360, 13452, 13484, 1346815360, 13476, 13500, 13492, 15360, 14990, 15022, 15022, 15360, 14556, 14572, 1456415360, 15094, 15111, 15094, 15360, 13231, 13287, 13215, 15360, 11255, 11380, 1117515360, 10677, 10886, 10492, 15360, 11846, 12006, 11934, 15360, 14327, 14340, 1427915360, 10766, 11039, 10862, 15360, 12918, 13255, 13452, 15360, 14231, 14548, 1488615360, 13878, 14380, 14765, 15360, 13444, 13862, 14412, 15360, 12151, 12404, 1262115360, 12637, 12902, 13215, 15360, 11549, 11749, 11870, 15360, 12279, 12653, 1311915360, 13223, 13404, 13516, 15360, 9228, 9260, 8276, 15360, 8087, 7991, 6308, 153607918, 7814, 6919, 15360, 7469, 7364, 6148, 15360, 7485, 7380, 6212, 15360, 8228, 79917204, 15360, 9276, 8967, 8212, 15360, 9806, 9573, 8742, 15360, 10135, 10087, 9621, 1536011452, 11452, 11452, 15360, 10629, 10637, 10509, 15360, 10693, 10733, 10637, 1536011095, 11111, 10982, 15360, 11292, 11348, 11372, 15360, 10199, 10244, 10167, 1536010814, 10926, 10846, 15360, 8669, 8774, 7493, 15360, 7870, 7910, 6244, 15360, 8204, 81836919, 15360, 9806, 9758, 9159, 15360, 9460, 9436, 8629, 15360, 9159, 9087, 8260, 153607637, 7509, 6790, 15360, 7758, 7629, 6838, 15360, 7967, 7918, 6774, 15360, 10854, 1074910501, 15360, 11508, 11412, 11316, 15360, 12372, 12300, 12151, 15360, 12030, 1211912063, 15360, 12781, 12910, 12982, 15360, 13476, 13581, 13661, 15360, 13484, 1358913677, 15360, 12404, 12428, 12380, 15360, 11605, 11765, 11798, 15360, 11492, 1153311452, 15360, 11838, 11886, 11798, 15360, 12263, 12372, 12380, 15360, 12151, 1223112175, 15360, 11492, 11508, 11412, 15360, 11119, 11111, 10838, 15360, 12508, 1258112573, 15360, 12621, 12693, 12677, 15360, 12573, 12629, 12589, 15360, 12292, 1232412231, 15360, 12476, 12565, 12573, 15360, 11998, 12159, 12215, 15360, 12950, 1307113159, 15360, 12263, 12372, 12428, 15360, 12380, 12428, 12444, 15360, 11300, 1130811143, 15360, 10199, 10244, 9734, 15360, 9709, 9701, 9252, 15360, 10492, 10581, 1040415360, 11476, 11516, 11388, 15360, 9477, 9517, 8790, 15360, 11717, 11854, 11838, 1536014247, 14420, 14524, 15360, 14054, 14311, 14436, 15360, 13597, 13805, 13982, 1536011364, 11533, 11597, 15360, 12263, 12428, 12549, 15360, 11436, 11605, 11653, 1536013079, 13324, 13444, 15360, 12516, 12613, 12605, 15360, 10039, 10015, 9605, 15360, 86938621, 7878, 15360, 7951, 7862, 6902, 15360, 8196, 8204, 7015, 15360, 8677, 8589, 763715360, 9284, 9031, 8340, 15360, 9814, 9605, 8902, 15360, 10685, 10428, 9910, 1536010492, 10260, 9685, 15360, 9404, 9252, 7943, 15360, 8830, 8766, 7220, 15360, 9220, 90477943, 15360, 9693, 9669, 9015, 15360, 11412, 11468, 11372, 15360, 11135, 11159, 1102315360, 10087, 10055, 9428, 15360, 9910, 10007, 9621, 15360, 9236, 9300, 8934, 153609597, 9557, 8902, 15360, 10669, 10549, 9782, 15360, 9926, 9870, 9127, 15360, 9894, 99189047, 15360, 8685, 8742, 7910, 15360, 9958, 10167, 10284, 15360, 10215, 10332, 1039615360, 11396, 11428, 11452, 15360, 11223, 11255, 11300, 15360, 11814, 11862, 1195815360, 10685, 10846, 10870, 15360, 10340, 10380, 10007, 15360, 11175, 11207, 1089415360, 12103, 12207, 12215, 15360, 11143, 11103, 10902, 15360, 9910, 9966, 9613, 1536010015, 10079, 9493, 15360, 10806, 10846, 10517, 15360, 10862, 10934, 10637, 1536010838, 10942, 10661, 15360, 10958, 11087, 10878, 15360, 10709, 10838, 10701, 1536010669, 10741, 10589, 15360, 10581, 10669, 10525, 15360, 10252, 10348, 9974, 1536011396, 11500, 11525, 15360, 11207, 11255, 11264, 15360, 10878, 10910, 10934, 1536011031, 11063, 11159, 15360, 11292, 11324, 11396, 15360, 11223, 11255, 11300, 1536010693, 10685, 10645, 15360, 10428, 10420, 10324, 15360, 10300, 10252, 9991, 1536010838, 10846, 10798, 15360, 10428, 10428, 10364, 15360, 9669, 9605, 9380, 15360, 1016710244, 10087, 15360, 11709, 11854, 11910, 15360, 11223, 11284, 11268, 15360, 1023110244, 9878, 15360, 10199, 10244, 9862, 15360, 10183, 10260, 9942, 15360, 10525, 1065310541, 15360, 12500, 12597, 12621, 15360, 11814, 11741, 11597, 15360, 11533, 1146011175, 15360, 11103, 11006, 10557, 15360, 10444, 10396, 9846, 15360, 10007, 10023, 922815360, 9653, 9790, 8469, 15360, 9316, 9372, 8039, 15360, 9557, 9830, 8071, 15360, 96219918, 8071, 15360, 9677, 10015, 8167, 15360, 9991, 10284, 8420, 15360, 10215, 104368581, 15360, 10260, 10484, 8645, 15360, 10292, 10476, 8902, 15360, 10324, 10468, 925215360, 9910, 9894, 8886, 15360, 10525, 10573, 9701, 15360, 9782, 10039, 8581, 153609565, 9814, 8167, 15360, 9950, 10039, 8934, 15360, 10749, 10758, 10199, 15360, 1066910685, 10244, 15360, 10838, 10838, 10460, 15360, 11215, 10910, 10087, 15360, 1149211364, 10806, 15360, 11095, 11159, 11055, 15360, 11364, 11388, 11356, 15360, 1102311039, 10990, 15360, 11653, 11653, 11613, 15360, 11798, 11725, 11557, 15360, 1197411862, 11637, 15360, 12039, 11942, 11765, 15360, 12119, 12047, 11934, 15360, 1215112071, 11950, 15360, 12087, 12006, 11886, 15360, 12047, 11966, 11838, 15360, 1199011926, 11790, 15360, 11974, 11910, 11798, 15360, 11998, 11934, 11814, 15360, 1211112039, 11886, 15360, 12231, 12143, 11998, 15360, 12292, 12199, 12039, 15360, 1203911974, 11846, 15360, 11822, 11782, 11653, 15360, 11862, 11838, 11765, 15360, 1179811765, 11701, 15360, 11782, 11733, 11669, 15360, 11798, 11749, 11685, 15360, 1183811790, 11725, 15360, 11870, 11822, 11749, 15360, 11741, 11701, 11621, 15360, 1156511541, 11452, 15360, 11533, 11500, 11412, 15360, 11621, 11581, 11484, 15360, 1160511557, 11460, 15360, 11516, 11468, 11372, 15360, 11565, 11533, 11444, 15360, 1167711637, 11541, 15360, 11725, 11661, 11557, 15360, 11725, 11661, 11557, 15360, 1173311669, 11573, 15360, 11838, 11773, 11677, 15360, 11998, 11926, 11814, 15360, 1201411926, 11798, 15360, 11460, 11404, 11332, 15360, 11637, 11557, 11428, 15360, 1201411894, 11693, 15360, 12167, 12022, 11765, 15360, 12119, 11982, 11709, 15360, 1192611806, 11516, 15360, 11685, 11589, 11300, 15360, 11476, 11404, 10886, 15360, 1123911151, 10468, 15360, 10766, 10733, 9894, 15360, 10565, 10565, 9589, 15360, 10436, 104449332, 15360, 10308, 10308, 9031, 15360, 10308, 10316, 8999, 15360, 10199, 10244, 877415360, 9725, 9645, 8549, 15360, 10244, 10276, 8967, 15360, 10878, 10838, 10183, 1536011055, 10966, 10348, 15360, 11119, 11006, 10404, 15360, 11264, 11135, 10565, 1536011404, 11316, 10822, 15360, 11492, 11388, 10982, 15360, 11798, 11613, 11223, 1536012047, 11830, 11412, 15360, 12039, 11894, 11597, 15360, 12127, 11990, 11693, 1536012127, 11990, 11725, 15360, 12191, 12055, 11806, 15360, 12191, 12055, 11830, 1536011870, 11773, 11613, 15360, 11573, 11516, 11428, 15360, 11533, 11484, 11412, 1536011541, 11492, 11420, 15360, 11565, 11516, 11452, 15360, 11589, 11541, 11476, 1536011605, 11557, 11500, 15360, 11637, 11589, 11533, 15360, 11669, 11621, 11557, 1536011701, 11645, 11573, 15360, 11733, 11669, 11589, 15360, 11798, 11717, 11605, 1536011838, 11749, 11621, 15360, 11878, 11782, 11661, 15360, 11894, 11798, 11661, 1536011926, 11806, 11653, 15360, 11958, 11822, 11661, 15360, 11982, 11846, 11677, 1536012006, 11870, 11685, 15360, 12095, 11950, 11765, 15360, 12047, 11910, 11741, 1536011886, 11765, 11605, 15360, 11838, 11733, 11589, 15360, 11814, 11717, 11589, 1536011814, 11709, 11573, 15360, 11790, 11693, 11565, 15360, 11741, 11677, 11589, 1536011733, 11677, 11613, 15360, 11733, 11685, 11629, 15360, 11717, 11669, 11621, 1536011685, 11645, 11589, 15360, 11629, 11589, 11533, 15360, 11573, 11525, 11468, 1536011492, 11444, 11380, 15360, 11316, 11255, 11111, 15360, 11348, 11292, 11143, 1536011516, 11436, 11316, 15360, 11854, 11749, 11589, 15360, 12127, 11990, 11765, 1536012199, 12055, 11782, 15360, 12340, 12231, 11910, 15360, 12372, 12292, 11958, 1536012380, 12300, 11974, 15360, 12348, 12247, 11910, 15360, 12324, 12215, 11878, 1536012247, 12103, 11773, 15360, 12095, 11958, 11637, 15360, 12055, 11926, 11613, 1536011974, 11854, 11541, 15360, 11870, 11765, 11468, 15360, 11966, 11854, 11541, 1536012300, 12151, 11846, 15360, 12396, 12316, 12006, 15360, 12388, 12308, 11990, 1536012388, 12308, 12006, 15360, 12396, 12316, 12022, 15360, 12396, 12308, 12022, 1536012396, 12308, 12022, 15360, 12364, 12279, 11974, 15360, 12340, 12247, 11942, 1536012340, 12231, 11926, 15360, 12215, 12071, 11806, 15360, 12095, 11966, 11749, 1536011741, 11645, 11500, 15360, 11420, 11356, 11255, 15360, 11364, 11308, 11207, 1536011356, 11300, 11175, 15360, 11348, 11292, 11191, 15360, 11372, 11324, 11255, 1536011412, 11364, 11308, 15360, 11420, 11372, 11316, 15360, 11428, 11380, 11324, 1536011444, 11388, 11332, 15360, 11484, 11428, 11364, 15360, 11508, 11460, 11396, 1536011557, 11500, 11436, 15360, 11589, 11533, 11460, 15360, 11613, 11557, 11484, 1536011621, 11557, 11492, 15360, 11613, 11557, 11500, 15360, 11621, 11557, 11500, 1536011629, 11573, 11508, 15360, 11629, 11573, 11508, 15360, 11605, 11557, 11484, 1536011589, 11533, 11468, 15360, 11557, 11508, 11436, 15360, 11549, 11500, 11428, 1536011557, 11500, 11436, 15360, 11549, 11492, 11436, 15360, 11533, 11484, 11428, 1536011525, 11476, 11428, 15360, 11516, 11476, 11428, 15360, 11525, 11484, 11444, 1536011516, 11476, 11428, 15360, 11468, 11428, 11380, 15360, 11428, 11388, 11332, 1536011356, 11308, 11239, 15360, 11308, 11255, 11127, 15360, 11167, 11071, 10926, 1536011223, 11119, 10966, 15360, 11276, 11175, 10998, 15360, 11404, 11332, 11191, 1536011773, 11693, 11557, 15360, 11926, 11798, 11613, 15360, 12207, 12039, 11773, 1536012348, 12231, 11894, 15360, 12308, 12151, 11846, 15360, 12332, 12215, 11894, 1536012364, 12279, 11958, 15360, 12380, 12292, 11974, 15360, 12396, 12316, 12022, 1536012404, 12316, 12039, 15360, 12412, 12332, 12087, 15360, 12412, 12332, 12103, 1536012436, 12356, 12135, 15360, 12372, 12292, 12039, 15360, 12420, 12332, 12087, 1536012396, 12316, 12055, 15360, 12356, 12263, 11990, 15360, 12340, 12231, 11942, 1536012271, 12127, 11854, 15360, 12215, 12071, 11814, 15360, 12292, 12135, 11878, 1536012288, 12135, 11870, 15360, 12111, 11982, 11765, 15360, 11990, 11886, 11717, 1536011637, 11557, 11428, 15360, 11364, 11300, 11143, 15360, 11316, 11239, 11079, 1536011300, 11207, 11047, 15360, 11268, 11159, 11015, 15360, 11268, 11159, 11015, 1536011268, 11159, 11031, 15360, 11300, 11223, 11095, 15360, 11340, 11292, 11191, 1536011348, 11300, 11223, 15360, 11372, 11324, 11255, 15360, 11380, 11332, 11255, 1536011372, 11316, 11239, 15360, 11396, 11340, 11268, 15360, 11468, 11404, 11300, 1536011460, 11404, 11324, 15360, 11484, 11428, 11356, 15360, 11492, 11436, 11372, 1536011500, 11444, 11388, 15360, 11508, 11460, 11404, 15360, 11500, 11452, 11396, 1536011492, 11436, 11380, 15360, 11468, 11412, 11356, 15360, 11444, 11388, 11324, 1536011444, 11388, 11324, 15360, 11428, 11380, 11316, 15360, 11412, 11356, 11300, 1536011404, 11348, 11300, 15360, 11404, 11356, 11308, 15360, 11396, 11356, 11308, 1536011388, 11348, 11308, 15360, 11372, 11340, 11292, 15360, 11348, 11308, 11255, 1536011284, 11223, 11111, 15360, 11231, 11143, 11023, 15360, 11199, 11111, 10974, 1536011047, 10958, 10814, 15360, 11127, 11023, 10870, 15360, 11119, 11006, 10846, 1536011175, 11055, 10886, 15360, 11292, 11191, 10998, 15360, 11525, 11404, 11284, 1536011822, 11637, 11476, 15360, 11878, 11733, 11549, 15360, 11918, 11790, 11573, 1536012063, 11918, 11653, 15360, 12223, 12063, 11765, 15360, 12300, 12151, 11846, 1536012255, 12103, 11814, 15360, 12271, 12127, 11846, 15360, 12271, 12127, 11862, 1536012271, 12127, 11886, 15360, 12308, 12183, 11942, 15360, 12175, 12039, 11814, 1536012063, 11934, 11709, 15360, 12159, 12014, 11765, 15360, 12215, 12063, 11798, 1536012143, 11998, 11757, 15360, 12071, 11934, 11693, 15360, 11998, 11870, 11661, 1536011974, 11870, 11685, 15360, 11998, 11910, 11757, 15360, 11846, 11765, 11629, 1536011468, 11396, 11284, 15360, 11308, 11223, 11031, 15360, 11215, 11103, 10934, 1536011207, 11095, 10942, 15360, 11215, 11103, 10950, 15360, 11191, 11087, 10942, 1536011175, 11079, 10942, 15360, 11167, 11063, 10934, 15360, 11143, 11031, 10902, 1536011247, 11143, 11015, 15360, 11284, 11191, 11079, 15360, 11300, 11223, 11095, 1536011316, 11268, 11127, 15360, 11340, 11284, 11143, 15360, 11340, 11284, 11159, 1536011356, 11300, 11191, 15360, 11372, 11316, 11239, 15360, 11380, 11324, 11255, 1536011372, 11316, 11255, 15360, 11380, 11324, 11276, 15360, 11380, 11324, 11268, 1536011372, 11316, 11255, 15360, 11364, 11316, 11255, 15360, 11364, 11308, 11239, 1536011348, 11292, 11207, 15360, 11340, 11284, 11191, 15360, 11348, 11292, 11191, 1536011348, 11292, 11207, 15360, 11340, 11292, 11207, 15360, 11340, 11292, 11207, 1536011324, 11276, 11207, 15360, 11308, 11255, 11175, 15360, 11264, 11175, 11079, 1536011119, 11039, 10934, 15360, 11103, 11015, 10902, 15360, 11095, 11006, 10878, 1536011031, 10942, 10806, 15360, 10990, 10902, 10766, 15360, 11047, 10942, 10814, 1536011031, 10926, 10790, 15360, 11055, 10942, 10806, 15360, 11119, 10998, 10846, 1536011151, 11015, 10830, 15360, 11268, 11095, 10886, 15360, 11484, 11396, 11268, 1536011790, 11701, 11549, 15360, 11886, 11790, 11637, 15360, 11838, 11741, 11581, 1536011838, 11725, 11541, 15360, 11902, 11782, 11581, 15360, 11966, 11838, 11629, 1536011974, 11846, 11629, 15360, 11958, 11838, 11629, 15360, 11950, 11838, 11637, 1536011814, 11701, 11525, 15360, 11581, 11492, 11332, 15360, 11645, 11541, 11380, 1536011806, 11701, 11533, 15360, 11902, 11806, 11637, 15360, 11950, 11862, 11717, 1536012014, 11934, 11790, 15360, 11942, 11862, 11725, 15360, 11565, 11492, 11388, 1536011292, 11191, 11015, 15360, 11231, 11111, 10950, 15360, 11159, 11047, 10894, 1536011119, 11006, 10854, 15360, 11127, 11023, 10878, 15360, 11159, 11055, 10902, 1536011135, 11031, 10894, 15360, 11111, 11006, 10878, 15360, 11095, 10990, 10870, 1536011095, 10998, 10886, 15360, 11071, 10966, 10846, 15360, 11111, 11006, 10902, 1536011191, 11095, 10974, 15360, 11268, 11159, 11031, 15360, 11284, 11191, 11063, 1536011292, 11207, 11063, 15360, 11300, 11223, 11079, 15360, 11332, 11268, 11143, 1536011316, 11255, 11127, 15360, 11316, 11255, 11143, 15360, 11308, 11239, 11127, 1536011316, 11255, 11159, 15360, 11300, 11223, 11127, 15360, 11292, 11207, 11095, 1536011300, 11223, 11111, 15360, 11300, 11223, 11095, 15360, 11300, 11223, 11095, 1536011308, 11239, 11111, 15360, 11300, 11223, 11111, 15360, 11292, 11207, 11111, 1536011264, 11167, 11071, 15360, 11215, 11127, 11047, 15360, 11135, 11055, 10966, 1536011015, 10934, 10846, 15360, 10918, 10838, 10733, 15360, 10982, 10894, 10782, 1536010974, 10886, 10766, 15360, 10982, 10894, 10766, 15360, 10958, 10862, 10749, 1536010982, 10886, 10774, 15360, 10958, 10862, 10758, 15360, 10958, 10862, 10749, 1536011015, 10910, 10790, 15360, 11023, 10910, 10774, 15360, 11079, 10958, 10806, 1536011103, 10974, 10798, 15360, 11191, 11047, 10846, 15360, 11468, 11388, 11276, 1536011846, 11765, 11637, 15360, 12006, 11918, 11782, 15360, 11998, 11910, 11782, 1536011902, 11822, 11693, 15360, 11838, 11749, 11637, 15360, 11782, 11709, 11605, 1536011806, 11741, 11645, 15360, 11782, 11717, 11629, 15360, 11773, 11717, 11621, 1536011870, 11806, 11701, 15360, 11942, 11862, 11757, 15360, 12183, 12103, 11974, 1536011974, 11894, 11765, 15360, 11476, 11404, 11308, 15360, 11268, 11143, 10966, 1536011183, 11063, 10902, 15360, 11111, 10998, 10854, 15360, 11055, 10942, 10806, 1536011023, 10910, 10766, 15360, 11047, 10934, 10782, 15360, 11039, 10926, 10782, 1536011079, 10966, 10830, 15360, 11031, 10918, 10782, 15360, 11031, 10926, 10806, 1536010990, 10894, 10782, 15360, 10974, 10886, 10790, 15360, 10966, 10870, 10774, 1536011006, 10902, 10806, 15360, 11039, 10942, 10838, 15360, 11127, 11023, 10910, 1536011175, 11079, 10958, 15360, 11191, 11087, 10958, 15360, 11207, 11095, 10958, 1536011268, 11143, 11015, 15360, 11276, 11175, 11047, 15360, 11284, 11191, 11079, 1536011292, 11191, 11079, 15360, 11276, 11175, 11079, 15360, 11239, 11135, 11031, 1536011268, 11159, 11047, 15360, 11215, 11111, 11006, 15360, 11239, 11127, 11015, 1536011255, 11143, 11031, 15360, 11223, 11119, 11015, 15360, 11199, 11103, 10998, 1536011175, 11087, 10982, 15360, 11143, 11047, 10958, 15360, 11031, 10942, 10854, 1536010958, 10878, 10790, 15360, 10910, 10830, 10741, 15360, 10942, 10862, 10758, 1536010926, 10838, 10733, 15360, 10854, 10758, 10637, 15360, 10918, 10830, 10709, 1536010910, 10822, 10717, 15360, 10942, 10846, 10749, 15360, 10942, 10854, 10741, 1536010942, 10854, 10749, 15360, 10966, 10870, 10758, 15360, 10966, 10870, 10758, 1536010958, 10854, 10733, 15360, 10998, 10886, 10741, 15360, 10942, 10830, 10677, 1536011039, 10918, 10749, 15360, 11095, 10974, 10806, 15360, 11308, 11223, 11031, 1536011468, 11396, 11292, 15360, 11605, 11533, 11428, 15360, 11701, 11621, 11525, 1536011693, 11629, 11541, 15360, 11685, 11621, 11549, 15360, 11685, 11629, 11549, 1536011629, 11565, 11484, 15360, 11589, 11533, 11444, 15360, 11364, 11308, 11191, 1536011191, 11087, 10958, 15360, 11135, 11031, 10902, 15360, 11135, 11031, 10894, 1536011055, 10950, 10830, 15360, 11015, 10910, 10782, 15360, 10958, 10854, 10733, 1536010942, 10838, 10717, 15360, 10974, 10870, 10733, 15360, 10982, 10878, 10749, 1536010990, 10886, 10758, 15360, 11015, 10910, 10798, 15360, 10966, 10862, 10758, 1536010950, 10854, 10758, 15360, 10910, 10822, 10733, 15360, 10894, 10798, 10709, 1536010902, 10814, 10725, 15360, 10934, 10846, 10758, 15360, 10910, 10822, 10733, 1536010950, 10854, 10749, 15360, 10974, 10878, 10766, 15360, 11047, 10942, 10830, 1536011095, 10990, 10878, 15360, 11167, 11055, 10942, 15360, 11199, 11103, 10990, 1536011191, 11087, 10982, 15360, 11151, 11047, 10950, 15360, 11135, 11031, 10934, 1536011095, 10998, 10902, 15360, 11143, 11047, 10950, 15360, 11079, 10990, 10894, 1536011079, 10990, 10902, 15360, 11103, 11006, 10910, 15360, 11079, 10982, 10886, 1536011023, 10926, 10822, 15360, 10982, 10894, 10798, 15360, 10958, 10870, 10782, 1536010910, 10814, 10725, 15360, 10926, 10838, 10741, 15360, 10934, 10838, 10733, 1536010950, 10854, 10749, 15360, 10886, 10798, 10709, 15360, 10910, 10814, 10709, 1536010926, 10830, 10725, 15360, 10910, 10814, 10701, 15360, 10862, 10774, 10677, 1536010950, 10854, 10733, 15360, 10926, 10830, 10717, 15360, 10926, 10838, 10725, 1536010926, 10830, 10725, 15360, 10894, 10798, 10685, 15360, 10926, 10830, 10701, 1536010958, 10854, 10717, 15360, 10934, 10830, 10685, 15360, 10950, 10846, 10709, 1536010974, 10862, 10717, 15360, 10942, 10830, 10685, 15360, 10958, 10846, 10701, 1536011006, 10894, 10749, 15360, 10950, 10846, 10725, 15360, 10958, 10862, 10741, 1536010894, 10806, 10701, 15360, 10854, 10774, 10669, 15360, 10886, 10806, 10701, 1536010862, 10790, 10693, 15360, 10878, 10806, 10717, 15360, 10982, 10902, 10798, 1536010990, 10902, 10798, 15360, 10950, 10862, 10758, 15360, 10942, 10846, 10733, 1536010870, 10774, 10669, 15360, 10894, 10798, 10693, 15360, 10918, 10830, 10725, 1536010894, 10806, 10701, 15360, 10926, 10830, 10733, 15360, 10902, 10830, 10725, 1536010870, 10790, 10693, 15360, 10886, 10814, 10725, 15360, 10814, 10741, 10661, 1536010838, 10766, 10677, 15360, 10822, 10741, 10661, 15360, 10822, 10741, 10669, 1536010862, 10790, 10709, 15360, 10846, 10758, 10669, 15360, 10894, 10798, 10693, 1536010974, 10878, 10766, 15360, 10966, 10870, 10766, 15360, 11023, 10926, 10814, 1536011079, 10974, 10862, 15360, 11006, 10910, 10814, 15360, 10950, 10862, 10766, 1536010982, 10894, 10798, 15360, 10958, 10862, 10774, 15360, 10958, 10870, 10782, 1536010910, 10830, 10741, 15360, 10950, 10862, 10766, 15360, 10982, 10886, 10790, 1536010918, 10822, 10725, 15360, 10886, 10798, 10701, 15360, 10854, 10766, 10669, 1536010894, 10806, 10709, 15360, 10926, 10830, 10725, 15360, 10926, 10830, 10725, 1536010958, 10862, 10749, 15360, 10958, 10862, 10749, 15360, 10894, 10806, 10717, 1536010902, 10814, 10717, 15360, 10878, 10790, 10677, 15360, 10942, 10838, 10717, 1536010918, 10814, 10701, 15360, 10886, 10790, 10661, 15360, 10942, 10838, 10717, 1536010950, 10854, 10725, 15360, 10950, 10854, 10725, 15360, 10910, 10814, 10693, 1536010910, 10814, 10685, 15360, 10942, 10838, 10709, 15360, 10894, 10790, 10661, 1536010910, 10806, 10669, 15360, 10822, 10725, 10597, 15360, 10749, 10661, 10541, 1536010830, 10733, 10613, 15360, 10838, 10741, 10629, 15360, 10806, 10709, 10597, 1536010854, 10766, 10653, 15360, 10862, 10774, 10669, 15360, 10798, 10725, 10629, 1536010822, 10749, 10653, 15360, 10854, 10782, 10693, 15360, 10806, 10741, 10661, 1536010862, 10790, 10701, 15360, 10870, 10790, 10685, 15360, 10870, 10790, 10693, 1536010878, 10790, 10677, 15360, 10862, 10782, 10677, 15360, 10870, 10790, 10693, 1536010870, 10782, 10685, 15360, 10894, 10814, 10709, 15360, 10886, 10814, 10709, 1536010846, 10782, 10685, 15360, 10741, 10669, 10573, 15360, 10766, 10693, 10589, 1536010709, 10637, 10541, 15360, 10741, 10669, 10589, 15360, 10741, 10677, 10589, 1536010709, 10637, 10557, 15360, 10774, 10701, 10613, 15360, 10862, 10774, 10677, 1536011006, 10918, 10806, 15360, 11006, 10902, 10782, 15360, 10974, 10870, 10749, 1536010958, 10854, 10733, 15360, 10934, 10838, 10725, 15360, 10934, 10838, 10733, 1536010934, 10838, 10725, 15360, 10886, 10790, 10685, 15360, 10854, 10766, 10661, 1536010886, 10798, 10701, 15360, 10838, 10749, 10645, 15360, 10878, 10782, 10661, 1536010822, 10725, 10613, 15360, 10822, 10717, 10605, 15360, 10846, 10749, 10629, 1536010854, 10749, 10637, 15360, 10950, 10854, 10733, 15360, 10958, 10854, 10741, 1536010910, 10806, 10693, 15360, 10926, 10822, 10693, 15360, 10934, 10838, 10725, 1536010910, 10822, 10709, 15360, 10910, 10822, 10709, 15360, 10886, 10782, 10661, 1536010910, 10814, 10677, 15360, 10910, 10806, 10677, 15360, 10926, 10822, 10685, 1536010958, 10854, 10717, 15360, 10974, 10870, 10725, 15360, 10926, 10830, 10693, 1536010926, 10830, 10693, 15360, 10918, 10822, 10693, 15360, 10934, 10838, 10701, 1536010918, 10814, 10685, 15360, 10878, 10782, 10653, 15360, 10870, 10774, 10645, 1536010838, 10749, 10629, 15360, 10806, 10717, 10605, 15360, 10822, 10733, 10621, 1536010822, 10733, 10621, 15360, 10846, 10758, 10653, 15360, 10846, 10766, 10653, 1536010822, 10741, 10629, 15360, 10806, 10733, 10629, 15360, 10806, 10725, 10621, 1536010790, 10709, 10605, 15360, 10766, 10693, 10589, 15360, 10814, 10741, 10629, 1536010846, 10766, 10653, 15360, 10838, 10758, 10653, 15360, 10878, 10790, 10677, 1536010894, 10798, 10685, 15360, 10830, 10741, 10629, 15360, 10830, 10758, 10653, 1536010798, 10725, 10629, 15360, 10806, 10733, 10629, 15360, 10717, 10637, 10525, 1536010661, 10581, 10476, 15360, 10701, 10621, 10517, 15360, 10733, 10661, 10565, 1536010782, 10685, 10557, 15360, 10862, 10758, 10613, 15360, 10974, 10862, 10725, 1536010958, 10846, 10709, 15360, 11006, 10902, 10766, 15360, 11006, 10902, 10774, 1536011039, 10934, 10814, 15360, 11006, 10902, 10790, 15360, 11006, 10910, 10790, 1536010950, 10854, 10741, 15360, 10934, 10830, 10709, 15360, 10918, 10814, 10701, 1536010854, 10758, 10653, 15360, 10918, 10814, 10701, 15360, 10870, 10766, 10645, 1536010830, 10733, 10621, 15360, 10934, 10830, 10709, 15360, 10990, 10886, 10758, 1536010950, 10838, 10717, 15360, 10910, 10814, 10701, 15360, 10926, 10822, 10693, 1536010934, 10830, 10709, 15360, 10878, 10774, 10653, 15360, 10934, 10830, 10701, 1536010926, 10822, 10693, 15360, 10878, 10782, 10661, 15360, 10878, 10782, 10661, 1536010862, 10766, 10621, 15360, 10886, 10782, 10645, 15360, 10886, 10782, 10653, 1536010926, 10822, 10701, 15360, 10902, 10806, 10685, 15360, 10926, 10822, 10701, 1536010918, 10814, 10685, 15360, 10878, 10782, 10645, 15360, 10910, 10806, 10669, 1536010854, 10758, 10621, 15360, 10886, 10790, 10645, 15360, 10854, 10758, 10629, 1536010830, 10741, 10613, 15360, 10918, 10814, 10685, 15360, 10862, 10766, 10645, 1536010830, 10741, 10613, 15360, 10806, 10717, 10597, 15360, 10741, 10661, 10557, 1536010774, 10693, 10581, 15360, 10749, 10669, 10557, 15360, 10774, 10693, 10581, 1536010766, 10685, 10573, 15360, 10790, 10709, 10597, 15360, 10782, 10701, 10589, 1536010790, 10709, 10597, 15360, 10838, 10749, 10621, 15360, 10870, 10774, 10645, 1536010894, 10790, 10661, 15360, 10878, 10782, 10653, 15360, 10846, 10741, 10613, 1536010790, 10693, 10557, 15360, 10814, 10717, 10597, 15360, 10790, 10701, 10581, 1536010741, 10645, 10525, 15360, 10717, 10629, 10509, 15360, 10774, 10685, 10573, 1536010725, 10637, 10525, 15360, 10854, 10749, 10621, 15360, 10950, 10846, 10701, 1536010966, 10854, 10709, 15360, 10934, 10814, 10677, 15360, 10926, 10822, 10701, 1536010982, 10878, 10766, 15360, 10998, 10894, 10782, 15360, 10990, 10878, 10766, 1536010998, 10894, 10782, 15360, 10998, 10886, 10774, 15360, 10998, 10886, 10758, 1536011006, 10894, 10774, 15360, 10942, 10838, 10733, 15360, 10958, 10854, 10741, 1536010958, 10854, 10749, 15360, 11006, 10902, 10790, 15360, 11015, 10902, 10798, 1536010982, 10870, 10758, 15360, 10998, 10894, 10782, 15360, 10974, 10870, 10758, 1536011006, 10902, 10790, 15360, 10998, 10894, 10774, 15360, 10974, 10870, 10758, 1536010950, 10854, 10741, 15360, 10878, 10790, 10693, 15360, 10902, 10814, 10701, 1536010918, 10822, 10709, 15360, 10838, 10733, 10613, 15360, 10878, 10782, 10661, 1536010934, 10838, 10717, 15360, 10902, 10806, 10693, 15360, 10918, 10822, 10709, 1536010926, 10830, 10709, 15360, 10838, 10733, 10605, 15360, 10910, 10806, 10661, 1536010942, 10838, 10693, 15360, 10886, 10782, 10645, 15360, 10886, 10782, 10637, 1536010854, 10749, 10621, 15360, 10926, 10830, 10709, 15360, 10966, 10862, 10741, 1536010846, 10749, 10629, 15360, 10830, 10733, 10605, 15360, 10854, 10758, 10637, 1536010822, 10725, 10605, 15360, 10886, 10790, 10661, 15360, 10902, 10806, 10669, 1536010918, 10814, 10677, 15360, 10830, 10733, 10605, 15360, 10806, 10717, 10589, 1536010870, 10774, 10645, 15360, 10934, 10838, 10709, 15360, 10958, 10862, 10733, 1536010886, 10790, 10661, 15360, 10894, 10798, 10661, 15360, 10958, 10854, 10709, 1536010934, 10830, 10709, 15360, 10814, 10717, 10581, 15360, 10862, 10758, 10613, 1536010854, 10741, 10589, 15360, 10814, 10717, 10573, 15360, 10886, 10782, 10645, 1536010814, 10725, 10597, 15360, 10862, 10766, 10637, 15360, 10910, 10806, 10669, 1536010942, 10838, 10709, 15360, 10966, 10862, 10733, 15360, 10974, 10870, 10741, 1536010974, 10870, 10749, 15360, 10958, 10862, 10749, 15360, 11031, 10934, 10822, 1536010998, 10894, 10782, 15360, 10974, 10870, 10766, 15360, 11023, 10918, 10814, 1536011039, 10926, 10822, 15360, 10958, 10846, 10741, 15360, 10918, 10814, 10693, 1536010966, 10870, 10741, 15360, 10982, 10886, 10766, 15360, 10982, 10878, 10766, 1536010942, 10846, 10733, 15360, 10958, 10862, 10758, 15360, 10950, 10854, 10758, 1536010934, 10830, 10717, 15360, 10966, 10862, 10733, 15360, 10942, 10846, 10725, 1536010934, 10846, 10733, 15360, 10934, 10846, 10733, 15360, 10878, 10798, 10693, 1536010886, 10798, 10693, 15360, 10910, 10814, 10709, 15360, 10942, 10846, 10733, 1536010838, 10733, 10597, 15360, 10878, 10774, 10645, 15360, 10918, 10822, 10701, 1536010878, 10782, 10653, 15360, 10894, 10790, 10661, 15360, 10934, 10838, 10725, 1536010958, 10854, 10725, 15360, 10966, 10862, 10733, 15360, 10910, 10806, 10685, 1536010982, 10878, 10758, 15360, 10942, 10854, 10749, 15360, 10934, 10838, 10733, 1536010918, 10814, 10701, 15360, 10894, 10798, 10669, 15360, 10894, 10798, 10669, 1536010814, 10725, 10605, 15360, 10902, 10798, 10669, 15360, 10814, 10725, 10605, 1536010894, 10798, 10685, 15360, 10958, 10862, 10749, 15360, 10910, 10814, 10701, 1536010910, 10806, 10685, 15360, 10918, 10814, 10693, 15360, 10926, 10822, 10709, 1536010894, 10790, 10661, 15360, 10902, 10806, 10677, 15360, 10902, 10806, 10685, 1536010934, 10838, 10717, 15360, 10934, 10838, 10701, 15360, 10934, 10838, 10717, 1536010950, 10854, 10725, 15360, 10894, 10798, 10661, 15360, 10862, 10749, 10597, 1536010894, 10798, 10677, 15360, 10878, 10782, 10661, 15360, 10926, 10838, 10717, 1536010926, 10838, 10717, 15360, 10918, 10822, 10709, 15360, 10934, 10838, 10733, 1536010926, 10838, 10733, 15360, 10958, 10870, 10766, 15360, 10942, 10854, 10749, 1536010958, 10870, 10774, 15360, 10974, 10878, 10774, 15360, 10958, 10854, 10741, 1536010950, 10846, 10741, 15360, 10950, 10854, 10758, 15360, 10934, 10838, 10733, 1536010942, 10846, 10725, 15360, 10966, 10862, 10741, 15360, 10926, 10838, 10733, 1536010958, 10862, 10749, 15360, 10910, 10822, 10709, 15360, 10942, 10854, 10758, 1536010926, 10838, 10733, 15360, 10910, 10822, 10717, 15360, 10934, 10838, 10733, 1536010934, 10846, 10733, 15360, 10902, 10814, 10709, 15360, 10926, 10830, 10717, 1536010918, 10822, 10709, 15360, 10838, 10749, 10637, 15360, 10878, 10790, 10677, 1536010942, 10846, 10733, 15360, 10926, 10822, 10701, 15360, 10958, 10862, 10749, 1536010886, 10790, 10685, 15360, 10918, 10814, 10693, 15360, 10910, 10814, 10693, 1536010902, 10806, 10701, 15360, 10878, 10774, 10637, 15360, 10798, 10693, 10565, 1536010822, 10725, 10597, 15360, 10934, 10838, 10709, 15360, 10958, 10854, 10725, 1536010886, 10790, 10669, 15360, 10910, 10806, 10677, 15360, 10886, 10782, 10645, 1536010830, 10725, 10597, 15360, 10822, 10717, 10581, 15360, 10862, 10758, 10637, 1536010878, 10782, 10669, 15360, 10926, 10822, 10709, 15360, 10974, 10878, 10774, 1536010966, 10870, 10758, 15360, 10918, 10822, 10709, 15360, 10846, 10749, 10645, 1536010894, 10798, 10693, 15360, 10918, 10822, 10709, 15360, 10974, 10878, 10774, 1536010918, 10822, 10717, 15360, 10982, 10886, 10774, 15360, 10974, 10878, 10758, 1536010950, 10854, 10741, 15360, 10958, 10854, 10725, 15360, 10982, 10886, 10766, 1536010918, 10822, 10701, 15360, 10878, 10782, 10669, 15360, 10886, 10790, 10669, 1536010934, 10838, 10717, 15360, 10950, 10854, 10741, 15360, 10934, 10838, 10733, 1536010982, 10886, 10782, 15360, 10886, 10798, 10701, 15360, 10870, 10782, 10685, 1536010894, 10814, 10717, 15360, 10910, 10822, 10725, 15360, 10934, 10838, 10733, 1536010950, 10846, 10741, 15360, 10934, 10838, 10725, 15360, 10934, 10846, 10749, 1536010902, 10814, 10717, 15360, 10878, 10790, 10677, 15360, 10878, 10782, 10669, 1536010854, 10766, 10645, 15360, 10838, 10749, 10629, 15360, 10902, 10814, 10701, 1536010910, 10814, 10693, 15360, 10902, 10798, 10669, 15360, 10910, 10806, 10677, 1536010886, 10782, 10653, 15360, 10854, 10749, 10629, 15360, 10870, 10774, 10653, 1536010974, 10870, 10758, 15360, 10990, 10878, 10758, 15360, 10918, 10822, 10709, 1536010926, 10838, 10725, 15360, 10958, 10854, 10733, 15360, 10894, 10790, 10653, 1536010822, 10725, 10605, 15360, 10878, 10782, 10661, 15360, 10974, 10870, 10749, 1536010902, 10806, 10677, 15360, 10934, 10838, 10725, 15360, 10870, 10774, 10653, 1536010798, 10701, 10581, 15360, 10854, 10749, 10621, 15360, 10894, 10798, 10669, 1536010934, 10822, 10685, 15360, 10942, 10830, 10701, 15360, 10910, 10806, 10669, 1536010870, 10758, 10629, 15360, 10886, 10774, 10645, 15360, 10950, 10838, 10701, 1536010966, 10870, 10749, 15360, 10886, 10790, 10685, 15360, 10870, 10782, 10677, 1536010934, 10838, 10733, 15360, 10934, 10838, 10725, 15360, 10822, 10725, 10621, 1536010878, 10790, 10677, 15360, 10894, 10798, 10693, 15360, 10822, 10733, 10629, 1536010894, 10798, 10685, 15360, 10998, 10902, 10790, 15360, 11015, 10918, 10806, 1536010950, 10854, 10741, 15360, 10950, 10846, 10741, 15360, 10934, 10838, 10733, 1536010942, 10846, 10749, 15360, 10910, 10822, 10725, 15360, 10846, 10758, 10653, 1536010878, 10790, 10685, 15360, 10894, 10798, 10701, 15360, 10862, 10774, 10669, 1536010814, 10725, 10621, 15360, 10846, 10758, 10645, 15360, 10870, 10774, 10661, 1536010870, 10774, 10677, 15360, 10878, 10790, 10693, 15360, 10878, 10782, 10677, 1536010830, 10741, 10637, 15360, 10870, 10782, 10677, 15360, 10966, 10870, 10766, 1536011015, 10918, 10814, 15360, 10910, 10814, 10701, 15360, 10942, 10846, 10725, 1536010950, 10846, 10725, 15360, 10942, 10838, 10725, 15360, 10934, 10830, 10701, 1536010910, 10798, 10677, 15360, 10886, 10782, 10653, 15360, 10838, 10733, 10597, 1536010902, 10806, 10669, 15360, 10830, 10733, 10613, 15360, 10838, 10741, 10621, 1536010838, 10741, 10621, 15360, 10894, 10798, 10669, 15360, 10934, 10830, 10685, 1536010886, 10790, 10669, 15360, 10902, 10806, 10685, 15360, 10854, 10749, 10637, 15360]);

class SimplifyUtils {
  static getSimplyfiedObject(object, simplifyRate) {
    if (!(object instanceof THREE__namespace.Mesh || object instanceof THREE__namespace.Line) || !object.geometry) {
      return object;
    }
    const modifier = new SimplifyModifier_js.SimplifyModifier();
    const numberOfVerticesToRemove = this.getNumberOfVerticesToRemove(object.geometry, simplifyRate);
    if (numberOfVerticesToRemove > 0) {
      const clonedObj = object.clone(true);
      clonedObj.geometry = modifier.modify(clonedObj.geometry.clone(), numberOfVerticesToRemove);
      return clonedObj;
    }
    return object;
  }
  static getNumberOfVerticesToRemove(geometry, simplifyRate) {
    let count = 0;
    if (geometry instanceof THREE__namespace.BufferGeometry) {
      if (geometry.index) {
        count = geometry.attributes.position.count;
      }
    }
    const result = Math.floor(count * simplifyRate);
    if (count < 20) {
      return 0;
    }
    return result;
  }
}

const _SkyboxUtils = class {
  static createSkyOfGradientRamp(radius = 4e3, widthSegments = 32, heightSegments = 15, skyCenter = new THREE__namespace.Vector3()) {
    const uniforms = {
      topColor: { value: new THREE__namespace.Color(8828661) },
      skylineColor: { value: new THREE__namespace.Color(16777215) },
      bottomColor: { value: new THREE__namespace.Color(10066329) },
      offset: { value: 400 },
      exponent: { value: 0.9 },
      skyCenter: { value: skyCenter || new THREE__namespace.Vector3() }
    };
    const skyGeo = new THREE__namespace.SphereGeometry(radius, widthSegments, heightSegments);
    const skyMat = new THREE__namespace.ShaderMaterial({
      uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      side: THREE__namespace.BackSide
    });
    const sky = new THREE__namespace.Mesh(skyGeo, skyMat);
    sky.matrixAutoUpdate = false;
    sky.name = this.NAME;
    sky.userData.selectable = false;
    return sky;
  }
  static createSkyOfGradientRampByObjectsInScene(scene, objectUuids) {
    if (!scene) {
      return new THREE__namespace.Mesh();
    }
    const bbox = SceneUtils.getObjectsBoundingBox(scene, objectUuids);
    return _SkyboxUtils.createSkyOfGradientRampByBoundingBox(bbox);
  }
  static createSkyOfGradientRampByBoundingBox(bbox) {
    const distance = bbox.max.x - bbox.min.x + (bbox.max.y - bbox.min.y) + (bbox.max.z - bbox.min.z);
    let radius = distance * 2;
    if (radius < _SkyboxUtils.MIN_SKY_RADIUS) {
      radius = _SkyboxUtils.MIN_SKY_RADIUS;
    } else if (radius > _SkyboxUtils.MAX_SKY_RADIUS) {
      radius = _SkyboxUtils.MAX_SKY_RADIUS;
    }
    const center = new THREE__namespace.Vector3();
    bbox.getCenter(center);
    const sky = _SkyboxUtils.createSkyOfGradientRamp(radius, void 0, void 0, center);
    sky.position.set(center.x, 0, center.z);
    return sky;
  }
  static async createSkyFromTextures(subFolder = "cloudy") {
    const loader = new THREE__namespace.CubeTextureLoader();
    loader.setPath(`images/skybox/${subFolder}/`);
    const pictures = ["right.jpg", "left.jpg", "top.jpg", "bottom.jpg", "front.jpg", "back.jpg"];
    return new Promise((resolve, reject) => {
      loader.load(pictures, (t) => resolve(t));
    });
  }
};
let SkyboxUtils = _SkyboxUtils;
SkyboxUtils.NAME = "SKYBOX";
SkyboxUtils.MIN_SKY_RADIUS = 4e3;
SkyboxUtils.MAX_SKY_RADIUS = 2e4;
SkyboxUtils.vertexShader = `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`;
SkyboxUtils.fragmentShader = `
    uniform vec3 topColor;
    uniform vec3 skylineColor;
    uniform vec3 bottomColor;
    uniform float offset;
    uniform float exponent;
    uniform vec3 skyCenter;
    varying vec3 vWorldPosition;
    void main() {
      vec3 position = vec3(vWorldPosition.x - skyCenter.x, vWorldPosition.y - skyCenter.y, vWorldPosition.z - skyCenter.z);
      float h = normalize( position + offset ).y;
      vec3 color;
      if (h > 0.0) {
        color = mix( skylineColor, topColor, max( pow( max( h, 0.0 ), exponent ), 0.0 ) );
      } else {
        color = mix( skylineColor, bottomColor, max( pow( max( -h, 0.0 ), exponent ), 0.0 ) );
      }
      gl_FragColor = vec4(color , 1.0 );
    }`;

function __getPointBaseLength() {
  const testDiv = document.createElement("div");
  testDiv.setAttribute("style", "height: 1in; visibility: hidden; position: absolute; margin: 0; padding: 0;");
  document.body.appendChild(testDiv);
  const baseLen = testDiv.clientHeight;
  const inchToMeter = 0.0254;
  return inchToMeter / baseLen;
}
const unitConversionByMeter = {
  file: 1,
  m: 1,
  mm: 1e-3,
  cm: 0.01,
  ft: 0.3048,
  in: 0.0254,
  pt: __getPointBaseLength()
};
const unitLabel = {
  file: "m",
  m: "m",
  mm: "mm",
  cm: "cm",
  ft: "ft",
  in: "in",
  pt: "pt"
};
const _getSuffix = (power) => {
  if (power === 2) {
    return "\xB2";
  }
  if (power === 3) {
    return "\xB3";
  }
  return "";
};
const getUnitStr = (unit, power = 1) => {
  return unitLabel[unit] + _getSuffix(power);
};
const getLengthValueByUnit = (value, sourceUnit, targetUnit, power = 1) => {
  if (targetUnit === null || targetUnit === void 0) {
    targetUnit = sourceUnit;
  }
  if (targetUnit === sourceUnit) {
    return {
      value,
      unit: getUnitStr(targetUnit)
    };
  } else {
    const targetValue = value * Math.pow(unitConversionByMeter[sourceUnit] / unitConversionByMeter[targetUnit], power);
    return {
      value: targetValue,
      unit: getUnitStr(targetUnit) + _getSuffix(power)
    };
  }
};

function useTextures() {
  const obj = {
    loader: new THREE.TextureLoader(),
    count: 0,
    textures: [],
    loadProgress: 0,
    loadTextures,
    dispose
  };
  return obj;
  function loadTextures(images, cb) {
    obj.count = images.length;
    obj.textures.splice(0);
    obj.loadProgress = 0;
    Promise.all(images.map(loadTexture)).then(cb);
  }
  function loadTexture(img, index) {
    return new Promise((resolve) => {
      obj.loader.load(
        img.src,
        (texture) => {
          obj.loadProgress += 1 / obj.count;
          obj.textures[index] = texture;
          resolve(texture);
        }
      );
    });
  }
  function dispose() {
    obj.textures.forEach((t) => t.dispose());
  }
}

exports.AmbientLight = AmbientLight;
exports.BasicMaterial = BasicMaterial;
exports.BokehPass = BokehPass;
exports.Box = Box;
exports.BoxGeometry = BoxGeometry;
exports.BufferGeometry = Geometry;
exports.Camera = PerspectiveCamera;
exports.Circle = Circle;
exports.CircleGeometry = CircleGeometry;
exports.ComposerInjectionKey = ComposerInjectionKey;
exports.Cone = Cone;
exports.ConeGeometry = ConeGeometry;
exports.CoordinateAxesViewport = CoordinateAxesViewport;
exports.CubeCamera = CubeCamera;
exports.CubeTexture = CubeTexture;
exports.Cylinder = Cylinder;
exports.CylinderGeometry = CylinderGeometry;
exports.DirectionalLight = DirectionalLight;
exports.Dodecahedron = Dodecahedron;
exports.DodecahedronGeometry = DodecahedronGeometry;
exports.EffectComposer = EffectComposer;
exports.EffectPass = EffectPass;
exports.ExportUtils = ExportUtils;
exports.ExtrudeGeometry = ExtrudeGeometry;
exports.FXAAPass = FXAAPass;
exports.FbxModel = FBX;
exports.FilmPass = FilmPass;
exports.GltfModel = GLTF;
exports.Group = Group;
exports.HalftonePass = HalftonePass;
exports.HemisphereLight = HemisphereLight;
exports.Icosahedron = Icosahedron;
exports.IcosahedronGeometry = IcosahedronGeometry;
exports.Image = Image;
exports.InstancedMesh = InstancedMesh;
exports.LambertMaterial = LambertMaterial;
exports.Lathe = Lathe;
exports.LatheGeometry = LatheGeometry;
exports.MatcapMaterial = MatcapMaterial;
exports.Material = BaseMaterial;
exports.MaterialInjectionKey = MaterialInjectionKey;
exports.MaterialUtils = MaterialUtils;
exports.Mesh = Mesh;
exports.MeshInjectionKey = MeshInjectionKey;
exports.Object3D = Object3D;
exports.ObjectUtils = ObjectUtils;
exports.Octahedron = Octahedron;
exports.OctahedronGeometry = OctahedronGeometry;
exports.OrthographicCamera = OrthographicCamera;
exports.PerspectiveCamera = PerspectiveCamera;
exports.PhongMaterial = PhongMaterial;
exports.PhysicalMaterial = PhysicalMaterial;
exports.Plane = Plane;
exports.PlaneGeometry = PlaneGeometry;
exports.PmremUtils = PmremUtils;
exports.PointLight = PointLight;
exports.Points = Points;
exports.PointsMaterial = PointsMaterial;
exports.Polyhedron = Polyhedron;
exports.PolyhedronGeometry = PolyhedronGeometry;
exports.Raycaster = Raycaster;
exports.RectAreaLight = RectAreaLight;
exports.RenderPass = RenderPass;
exports.Renderer = Renderer;
exports.RendererInjectionKey = RendererInjectionKey;
exports.Ring = Ring;
exports.RingGeometry = RingGeometry;
exports.SMAAPass = SMAAPass;
exports.SSAOPass = SSAOPass;
exports.Scene = Scene;
exports.SceneInjectionKey = SceneInjectionKey;
exports.SceneUtils = SceneUtils;
exports.ShaderMaterial = ShaderMaterial;
exports.ShadowMaterial = ShadowMaterial;
exports.ShapeGeometry = ShapeGeometry;
exports.SimplifyUtils = SimplifyUtils;
exports.SkyboxUtils = SkyboxUtils;
exports.Sphere = Sphere;
exports.SphereGeometry = SphereGeometry;
exports.SpotLight = SpotLight;
exports.Sprite = Sprite;
exports.StandardMaterial = StandardMaterial;
exports.SubSurfaceMaterial = SubSurfaceMaterial;
exports.Tetrahedron = Tetrahedron;
exports.TetrahedronGeometry = TetrahedronGeometry;
exports.Text = Text;
exports.Texture = Texture;
exports.TiltShiftPass = TiltShiftPass;
exports.ToonMaterial = ToonMaterial;
exports.Torus = Torus;
exports.TorusGeometry = TorusGeometry;
exports.TorusKnot = TorusKnot;
exports.TorusKnotGeometry = TorusKnotGeometry;
exports.TroisJSVuePlugin = TroisJSVuePlugin;
exports.Tube = Tube;
exports.TubeGeometry = TubeGeometry;
exports.UnrealBloomPass = UnrealBloomPass;
exports.VideoTexture = VideoTexture;
exports.Viewer3DUtils = Viewer3DUtils;
exports.Views = Views;
exports.ZoomBlurPass = ZoomBlurPass;
exports.applyObjectProps = applyObjectProps;
exports.bindObjectProp = bindObjectProp;
exports.bindObjectProps = bindObjectProps;
exports.bindProp = bindProp;
exports.bindProps = bindProps;
exports.createApp = createApp;
exports.decimalPrecisionRange = decimalPrecisionRange;
exports.getLengthValueByUnit = getLengthValueByUnit;
exports.getMatcapUrl = getMatcapUrl;
exports.getUnitStr = getUnitStr;
exports.lerp = lerp;
exports.limit = limit;
exports.propsValues = propsValues;
exports.setFromProp = setFromProp;
exports.showPrecisionValue = showPrecisionValue;
exports.unitConversionByMeter = unitConversionByMeter;
exports.unitLabel = unitLabel;
exports.useTextures = useTextures;
//# sourceMappingURL=trois.js.map
