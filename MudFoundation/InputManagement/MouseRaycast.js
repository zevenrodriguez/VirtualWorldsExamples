#pragma import (RaycastObjects, ToggleObjects, togglePanel, trackHover)
#pragma lifecycle(startup, update, dispose)

// Get the canvas element for cursor updates
const domElement = renderer.domElement;

// Get the cube object to interact with
const targetCube = RaycastObjects.get("cube");
const cubePanelUI = ToggleObjects.get("cubeText");

// Track if we already pressed the button (prevents rapid toggling)
let isClickPressed = false;

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
    trackHover(
        mouseRaycast,
        targetCube,
        // onEnter callback
        (hit) => {
            domElement.style.cursor = 'pointer';
        },
        // onHover callback
        (hit) => {
            // Toggle the UI panel on click (only while hovering over cube)
            if (Input.mouse.isButtonPressed(MouseButton.Left) && !isClickPressed) {
                togglePanel(cubePanelUI);
                isClickPressed = true;
            }
        },
        // onExit callback
        (hit) => {
            domElement.style.cursor = 'default';
        },
        mouseHoverState
    );

    // Reset click flag when button is released
    if (Input.mouse.isButtonReleased(MouseButton.Left)) {
        isClickPressed = false;
    }
}

// Called when the system shuts down
function dispose() {
    Input.mouse.stop();
}


