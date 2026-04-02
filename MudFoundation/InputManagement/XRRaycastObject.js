#pragma import (makeRayLine, updateRayLine, RayInteractor, RaycastObjects, ToggleObjects, togglePanel)
#pragma lifecycle(startup, update, dispose)

// ─── Ray Lines ────────────────────────────────────────────────────────────────
let leftRay = null;
let rightRay = null;

// ─── Controllers ──────────────────────────────────────────────────────────────
const controllers = { left: null, right: null, leftIndex: -1, rightIndex: -1 };

// ─── Interactors ──────────────────────────────────────────────────────────────
const leftInteractor  = new RayInteractor(RaycastObjects.get("cube"));
const rightInteractor = new RayInteractor(RaycastObjects.get("cube"));

leftInteractor.onEnter  = (_hit) => { console.log("Left controller hover entered"); };
leftInteractor.onExit   = (_hit) => { console.log("Left controller hover exited"); };
leftInteractor.onClick  = (_hit) => { console.log("Left controller clicked"); togglePanel(ToggleObjects.get("cubeText")); };

rightInteractor.onEnter = (_hit) => { console.log("Right controller hover entered"); };
rightInteractor.onExit  = (_hit) => { console.log("Right controller hover exited"); };
rightInteractor.onClick = (_hit) => { console.log("Right controller clicked"); togglePanel(ToggleObjects.get("cubeText")); };


function startup() {
    Input.xr.start();

    leftRay  = makeRayLine(0x0000FF);
    rightRay = makeRayLine(0xFF0000);
}

function update(delta, time) {
    if (Input.xr.count() < 1) return;

    controllers.left  = null;
    controllers.right = null;

    for (let i = 0; i < Input.xr.count(); i++) {
        const raycast = Input.xr.raycast(i);
        const hand    = Input.xr.handedness(i);

        if (hand === 'left')  { controllers.left  = raycast; controllers.leftIndex  = i; updateRayLine(leftRay,  raycast); }
        if (hand === 'right') { controllers.right = raycast; controllers.rightIndex = i; updateRayLine(rightRay, raycast); }
    }

    if (controllers.left) {
        controllers.left.raycaster.ray.origin.copy(controllers.left.position);
        controllers.left.raycaster.ray.direction.copy(controllers.left.direction).normalize();

        leftInteractor.update(
            controllers.left,
            () => Input.xr.isButtonPressed(controllers.leftIndex, 0),
            () => Input.xr.isButtonReleased(controllers.leftIndex, 0)
        );
    }

    if (controllers.right) {
        controllers.right.raycaster.ray.origin.copy(controllers.right.position);
        controllers.right.raycaster.ray.direction.copy(controllers.right.direction).normalize();

        rightInteractor.update(
            controllers.right,
            () => Input.xr.isButtonPressed(controllers.rightIndex, 0),
            () => Input.xr.isButtonReleased(controllers.rightIndex, 0)
        );
    }
}

function dispose() {
    Input.xr.stop();

    leftInteractor.reset();
    rightInteractor.reset();

    if (leftRay?.line)  scene?.remove(leftRay.line);
    if (rightRay?.line) scene?.remove(rightRay.line);
}
