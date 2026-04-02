#pragma import (MudText, MudButton, RayInteractor, RaycastObjects, ToggleObjects, togglePanel)
#pragma lifecycle(startup, update, dispose)

const domElement = renderer.domElement;

// ─── Scene object interactors ─────────────────────────────────────────────────
const cubeInteractor = new RayInteractor(RaycastObjects.get("cube"));

cubeInteractor.onEnter = (_hit) => { domElement.style.cursor = 'pointer'; };
cubeInteractor.onExit  = (_hit) => { domElement.style.cursor = 'default'; };
cubeInteractor.onClick = (_hit) => { togglePanel(ToggleObjects.get("cubeText")); };

// ─── GUI Elements ─────────────────────────────────────────────────────────────
// Place two flat planes in the MUD scene editor named "statusLabel" and "actionButton"

const statusLabel = MudText({
    sceneMesh:       cast(scene.getObjectByName("statusLabel"), THREE.Mesh),
    text:            'Status: idle',
    textColor:       '#ffffff',
    backgroundColor: '#111111',
    borderColor:     '#444444',
});

const actionButton = MudButton({
    sceneMesh:            cast(scene.getObjectByName("actionButton"), THREE.Mesh),
    text:                 'Click Me',
    textColor:            '#ffffff',
    backgroundColor:      '#2255cc',
    hoverBackgroundColor: '#4477ff',
    borderColor:          '#99bbff',
    hoverBorderColor:     '#ffffff',
});

// ─── Button callback ──────────────────────────────────────────────────────────
let clickCount = 0;

actionButton.onClick = (_hit) => {
    clickCount++;
    statusLabel.setText(`Clicked: ${clickCount}`);
    console.log('Button clicked', clickCount);
};

// ─── Cursor feedback on button hover ─────────────────────────────────────────
const _btnEnter = actionButton._interactor.onEnter;
const _btnExit  = actionButton._interactor.onExit;

actionButton._interactor.onEnter = (hit) => {
    domElement.style.cursor = 'pointer';
    _btnEnter(hit);
};

actionButton._interactor.onExit = (hit) => {
    domElement.style.cursor = 'default';
    _btnExit(hit);
};

// ─── Lifecycle ────────────────────────────────────────────────────────────────
function startup() {
    Input.mouse.start();
}

function update() {
    const mouseRaycast = Input.mouse.raycast(camera);
    const isPressed    = () => Input.mouse.isButtonPressed(MouseButton.Left);
    const isReleased   = () => Input.mouse.isButtonReleased(MouseButton.Left);

    cubeInteractor.update(mouseRaycast, isPressed, isReleased);
    actionButton.update(mouseRaycast, isPressed, isReleased);
}

function dispose() {
    Input.mouse.stop();
    cubeInteractor.reset();
    actionButton.reset();
    domElement.style.cursor = 'default';
}
