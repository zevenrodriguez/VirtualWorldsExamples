#pragma import (XRRays, trackHover, RaycastObjects, ToggleObjects, togglePanel)
#pragma lifecycle(startup, update, dispose)

// Track hover state for left and right controllers
let leftControllerHoverState = new Map();
let rightControllerHoverState = new Map();

// Track if buttons are pressed
let leftButtonPressed = false;
let rightButtonPressed = false;

let XRButtonTrigger = 1; // Assuming trigger is button index 1, adjust if needed

/**
 * Called once when the system starts.
 * Initialize XR input and create ray visualizations.
 */

 // Get the cube object to interact with
    const targetCube = RaycastObjects.get("cube");
    const cubePanelUI = ToggleObjects.get("cubeText");


function startup() {
    // Start XR input system
    Input.xr.start();

    // Create the ray visualizations
    XRRays.startup();
}

/**
 * Called every frame to update XR interactions.
 * Updates ray visualizations and checks for hover/click events.
 */
function update(delta,time) {
    // Update the ray visualizations
    XRRays.update();

   

          // ─── Left Controller ───────────────────────────────────────────────────────
        const leftRaycast = Input.xr.raycast(0);

        // Track hover state on left controller
        trackHover(
            leftRaycast,
            targetCube,
            // onEnter callback
            (hit) => {
                console.log("Left controller hovering");
            },
            // onHover callback
            (hit) => {
                // Called every frame while hovering
            },
            // onExit callback
            (hit) => {
                console.log("Left controller stopped hovering");
            },
            leftControllerHoverState
        );

        // Toggle UI panel on left trigger press
        if (Input.xr.isButtonPressed(0, XRButtonTrigger) && !leftButtonPressed) {
            togglePanel(cubePanelUI);
            leftButtonPressed = true;
        }

        // Reset button flag when released
        if (Input.xr.isButtonReleased(0, XRButtonTrigger)) {
            leftButtonPressed = false;
        }

        // ─── Right Controller ──────────────────────────────────────────────────────
        const rightRaycast = Input.xr.raycast(1);

        // Track hover state on right controller
        trackHover(
            rightRaycast,
            targetCube,
            // onEnter callback
            (hit) => {
                console.log("Right controller hovering");
            },
            // onHover callback
            (hit) => {
                // Called every frame while hovering
            },
            // onExit callback
            (hit) => {
                console.log("Right controller stopped hovering");
            },
            rightControllerHoverState
        );

        // Toggle UI panel on right trigger press
        if (Input.xr.isButtonPressed(1, XRButtonTrigger) && !rightButtonPressed) {
            togglePanel(cubePanelUI);
            rightButtonPressed = true;
        }

        // Reset button flag when released
        if (Input.xr.isButtonReleased(1, XRButtonTrigger)) {
            rightButtonPressed = false;
        }
    
}

/**
 * Called when the system shuts down.
 * Clean up XR input and remove ray visualizations.
 */
function dispose() {
    // Clean up ray visualizations
    XRRays.dispose();

    // Stop XR input system
    Input.xr.stop();
}

#pragma export (startup, update, dispose);

