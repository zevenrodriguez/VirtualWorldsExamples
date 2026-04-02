
/**
 * Track when a raycast enters, hovers over, exits, and clicks an object using callbacks.
 * Calls onEnter when the ray first touches the object
 * Calls onHover every frame while the ray is over the object
 * Calls onExit when the ray leaves the object
 * Calls onClick when the input is pressed then released while hovering
 *
 * @param {RaycastOutput} raycast - The raycast data (position, direction, raycaster)
 * @param {Function} isPressed - Returns true when the input button is pressed: () => boolean
 * @param {Function} isReleased - Returns true the frame the input button is released: () => boolean
 * @param {THREE.Object3D} targetObject - The 3D object to check for intersection
 * @param {Function} onEnter - Callback when ray enters: (hit) => {...}
 * @param {Function} onHover - Callback every frame while hovering: (hit) => {...}
 * @param {Function} onExit - Callback when ray exits: (hit) => {...}
 * @param {Function} onClick - Callback when input is pressed then released while hovering: (hit) => {...}
 * @param {Map} hoverState - Map to track current hover state (reused across frames)
 */
function RayInteractor(raycast, isPressed, isReleased, targetObject, onEnter, onHover, onExit, onClick, hoverState) {
    // Check if the ray is hitting the object
    const hits = raycast.raycaster.intersectObject(targetObject, true);
    const isCurrentlyHitting = hits.length > 0;
    const currentHit = isCurrentlyHitting ? hits[0] : null;

    // Get the previous frame's state for this object
    const stateKey = targetObject.uuid;
    const pressKey = stateKey + '_pressed';
    const wasHittingLastFrame = hoverState.get(stateKey) !== undefined;
    const wasTriggerPressed = hoverState.get(pressKey) || false;

    // Fire onEnter when transitioning from no hit to hit
    if (isCurrentlyHitting && !wasHittingLastFrame) {
        onEnter(currentHit);
    }

    // Fire onHover every frame while hitting
    if (isCurrentlyHitting) {
        onHover(currentHit);

        // Track press while hovering
        if (isPressed() && !wasTriggerPressed) {
            hoverState.set(pressKey, true);
        }

        // Fire onClick on release after a press
        if (isReleased() && wasTriggerPressed) {
            onClick(currentHit);
            hoverState.delete(pressKey);
        }
    }

    // Fire onExit when transitioning from hit to no hit
    if (!isCurrentlyHitting && wasHittingLastFrame) {
        const lastFrameHit = hoverState.get(stateKey);
        onExit(lastFrameHit);
        hoverState.delete(pressKey);
    }

    // Update state for next frame
    if (isCurrentlyHitting) {
        hoverState.set(stateKey, currentHit);
    } else {
        hoverState.delete(stateKey);
    }
}

#pragma export (RayInteractor);
