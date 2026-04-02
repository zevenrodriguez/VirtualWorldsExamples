#pragma import (makeRayLine, updateRayLine, RayInteractor, RaycastObjects, ToggleObjects, togglePanel)
#pragma lifecycle(startup, update, dispose)


const targetCube = RaycastObjects.get("cube");
const cubePanelUI = ToggleObjects.get("cubeText");

// ─── Ray Lines ────────────────────────────────────────────────────────────────
let leftRay = null;
let rightRay = null;

// ─── Controllers ──────────────────────────────────────────────────────────────
const controllers = { left: null, right: null, leftIndex: -1, rightIndex: -1 };

// ─── Hover State ──────────────────────────────────────────────────────────────
let leftControllerHoverState = new Map();
let rightControllerHoverState = new Map();


function startup() {
    Input.xr.start();

    leftRay = makeRayLine(0x0000FF);
    rightRay = makeRayLine(0xFF0000);
}

function update(delta, time) {
    if (Input.xr.count() < 1) return;

    controllers.left = null;
    controllers.right = null;

    for (let i = 0; i < Input.xr.count(); i++) {
        const raycast = Input.xr.raycast(i);
        const hand = Input.xr.handedness(i);

        if (hand === 'left') { controllers.left = raycast; controllers.leftIndex = i; updateRayLine(leftRay, raycast); }
        if (hand === 'right') { controllers.right = raycast; controllers.rightIndex = i; updateRayLine(rightRay, raycast); }
    }

    // ─── Left Controller ───────────────────────────────────────────────────────
    if (controllers.left) {
        controllers.left.raycaster.ray.origin.copy(controllers.left.position);
        controllers.left.raycaster.ray.direction.copy(controllers.left.direction).normalize();
        RayInteractor(
            controllers.left,
            () => Input.xr.isButtonPressed(controllers.leftIndex, 1),   // returns true while trigger is held
            () => Input.xr.isButtonReleased(controllers.leftIndex, 1),  // returns true the frame trigger is released
            RaycastObjects.get("cube"),
            (_hit) => { console.log("Left controller hover entered"); }, // ray just started hitting the cube
            (_hit) => {  },                                              // ray is hovering over the cube every frame
            (_hit) => { console.log("Left controller hover exited"); },  // ray stopped hitting the cube
            () => { togglePanel(ToggleObjects.get("cubeText")); },       // trigger pressed and released while hovering — toggle the panel
            leftControllerHoverState
        );
    }

    // ─── Right Controller ──────────────────────────────────────────────────────
    if (controllers.right) {
        controllers.right.raycaster.ray.origin.copy(controllers.right.position);
        controllers.right.raycaster.ray.direction.copy(controllers.right.direction).normalize();
        RayInteractor(
            controllers.right,
            () => Input.xr.isButtonPressed(controllers.rightIndex, 1),   // returns true while trigger is held
            () => Input.xr.isButtonReleased(controllers.rightIndex, 1),  // returns true the frame trigger is released
            RaycastObjects.get("cube"),
            (_hit) => { console.log("Right controller hover entered"); }, // ray just started hitting the cube
            (_hit) => { },                                                // ray is hovering over the cube every frame
            (_hit) => { console.log("Right controller hover exited"); },  // ray stopped hitting the cube
            () => { togglePanel(ToggleObjects.get("cubeText")); },        // trigger pressed and released while hovering — toggle the panel
            rightControllerHoverState
        );
    }
}

function dispose() {
    Input.xr.stop();

    if (leftRay?.line) scene?.remove(leftRay.line);
    if (rightRay?.line) scene?.remove(rightRay.line);
}
