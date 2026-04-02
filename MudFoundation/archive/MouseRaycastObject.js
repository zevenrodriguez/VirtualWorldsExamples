#pragma import (RaycastObjects, ToggleObjects, togglePanel, RayInteractor)
#pragma lifecycle(startup, update, dispose)

const domElement = renderer.domElement;

// ─── Interactor ───────────────────────────────────────────────────────────────
const cubeInteractor = new RayInteractor(RaycastObjects.get("cube"));

cubeInteractor.onEnter = (_hit) => { domElement.style.cursor = 'pointer'; };
cubeInteractor.onExit  = (_hit) => { domElement.style.cursor = 'default'; };
cubeInteractor.onClick = (_hit) => { togglePanel(ToggleObjects.get("cubeText")); };


function startup() {
    Input.mouse.start();
}

function update() {
    const mouseRaycast = Input.mouse.raycast(camera);

    cubeInteractor.update(
        mouseRaycast,
        () => Input.mouse.isButtonPressed(MouseButton.Left),
        () => Input.mouse.isButtonReleased(MouseButton.Left)
    );
}

function dispose() {
    Input.mouse.stop();
    cubeInteractor.reset();
}
