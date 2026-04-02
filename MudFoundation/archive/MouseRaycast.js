#pragma import (RaycastObjects, ToggleObjects, togglePanel, RayInteractor)
#pragma lifecycle(startup, update, dispose)

// Get the canvas element for cursor updates
const domElement = renderer.domElement;

// Called once when the system starts
function startup() {
    Input.mouse.start();
}

// Track the hover state for mouse interactions
let mouseHoverState = new Map();

// Called every frame to update mouse interaction
function update() {
    // Get the mouse raycast data
    const mouseRaycast = Input.mouse.raycast(camera);

    // Track hover state and call callbacks
    RayInteractor(
        mouseRaycast,
        () => Input.mouse.isButtonPressed(MouseButton.Left),   // returns true while left mouse button is held
        () => Input.mouse.isButtonReleased(MouseButton.Left),  // returns true the frame left mouse button is released
        RaycastObjects.get("cube"),
        (hit) => { domElement.style.cursor = 'pointer'; },    // ray just started hitting the cube — show pointer cursor
        (hit) => { },                                          // ray is hovering over the cube every frame
        (hit) => { domElement.style.cursor = 'default'; },    // ray stopped hitting the cube — restore default cursor
        (hit) => { togglePanel(ToggleObjects.get("cubeText")); }, // left click released while hovering — toggle the panel
        mouseHoverState
    );
}

// Called when the system shuts down
function dispose() {
    Input.mouse.stop();
}


