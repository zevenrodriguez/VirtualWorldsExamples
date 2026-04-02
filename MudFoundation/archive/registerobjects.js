/*
* A directive that allows connection to lifecycle hooks.
*/

const cube = cast(scene.getObjectByName("cube"), THREE.Object3D);
const sphere = cast(scene.getObjectByName("sphere"), THREE.Object3D);

const cubeText = cast(scene.getObjectByName("cubeText"), THREE.Object3D);
const sphereText = cast(scene.getObjectByName("sphereText"), THREE.Object3D);

//console.log(cube.name);

let RaycastObjects = new Map();
RaycastObjects.set(cube.name, cube);
RaycastObjects.set(sphere.name, sphere);

let ToggleObjects = new Map();
ToggleObjects.set(cubeText.name, cubeText);
ToggleObjects.set(sphereText.name, sphereText);

function togglePanel(obj){
    //console.log(obj.visible);
     obj.visible = !obj.visible;
}

togglePanel(cubeText);
togglePanel(sphereText);

//let InteractableObjects = new Map();
//InteractableObjects.set(cube.name, {"raycast" : cube, "panel": cubeText});
// const InteractableObjects = new Set();

// InteractableObjects.add( {"raycast" : cube, "panel": cubeText});
// console.log(InteractableObjects[0]["raycast"]);



 #pragma export (RaycastObjects, ToggleObjects, togglePanel);
