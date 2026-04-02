
 #pragma import (RaycastObjects, ToggleObjects, togglePanel);


// Lifecycle directive - defines which functions to call at different stages
#pragma lifecycle(startup, update, dispose)

// Get the DOM element from the renderer (usually the canvas)
const domElement = renderer.domElement;

let curCube = RaycastObjects.get("cube");

let resetPress = false;

function CheckTarget(target){
    const { raycaster } = Input.mouse.raycast(camera);
    // Intersect the ray with the target object and its children
    const intercept = raycaster.intersectObject(target, true);
    const isHovering = intercept.length > 0; // True if mouse is over any part of the target
    return isHovering;
}

// Called once when the system or scene starts
function startup() {
    Input.mouse.start();  // Initialize mouse input handling
    // Input.keyboard.start();
    // Input.touch.start();
}

// Called every frame (e.g. 60 times per second) to update state
function update() {
    domElement.style.cursor = 'default';  // Reset the cursor to default every frame

       if(CheckTarget(curCube) == true ){
        domElement.style.cursor = 'pointer';
        if(Input.mouse.isButtonPressed(MouseButton.Left) && resetPress == false){
            togglePanel(ToggleObjects.get("cubeText"));
            resetPress = true;
        }
    }else{
      
    }

    if(Input.mouse.isButtonReleased(MouseButton.Left)){
            resetPress = false;
        }

    

}

// Called when the system or scene is being cleaned up
function dispose() {
    Input.mouse.stop();  // Stop mouse input handling and clean up
    // Input.keyboard.stop();
    // Input.touch.stop();
}