#pragma import (makeRayLine, updateRayLine, trackHover, RaycastObjects, ToggleObjects, togglePanel)
#pragma lifecycle(startup, update, dispose)

let XRButtonTrigger = 1;

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

// ─── Button State ─────────────────────────────────────────────────────────────
let leftButtonPressed = false;
let rightButtonPressed = false;

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
        trackHover(
            controllers.left,
            targetCube,
            (_hit) => { console.log("Left controller hover entered"); },
            (_hit) => {},
            (_hit) => { console.log("Left controller hover exited"); },
            leftControllerHoverState
        );

        if (Input.xr.isButtonPressed(controllers.leftIndex, XRButtonTrigger) && !leftButtonPressed) {
            togglePanel(cubePanelUI);
            leftButtonPressed = true;
        }

        if (Input.xr.isButtonReleased(controllers.leftIndex, XRButtonTrigger)) {
            leftButtonPressed = false;
        }
    }

    // ─── Right Controller ──────────────────────────────────────────────────────
    if (controllers.right) {
        controllers.right.raycaster.ray.origin.copy(controllers.right.position);
        controllers.right.raycaster.ray.direction.copy(controllers.right.direction).normalize();
        trackHover(
            controllers.right,
            targetCube,
            (_hit) => { console.log("Right controller hover entered"); },
            (_hit) => {},
            (_hit) => { console.log("Right controller hover exited"); },
            rightControllerHoverState
        );

        if (Input.xr.isButtonPressed(controllers.rightIndex, XRButtonTrigger) && !rightButtonPressed) {
            togglePanel(cubePanelUI);
            rightButtonPressed = true;
        }

        if (Input.xr.isButtonReleased(controllers.rightIndex, XRButtonTrigger)) {
            rightButtonPressed = false;
        }
    }
}

function dispose() {
    Input.xr.stop();

    if (leftRay?.line) scene?.remove(leftRay.line);
    if (rightRay?.line) scene?.remove(rightRay.line);
}
