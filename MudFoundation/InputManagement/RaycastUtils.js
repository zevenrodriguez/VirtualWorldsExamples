
/**
 * Track when a raycast enters, hovers over, and exits an object using callbacks.
 * Calls onEnter when the ray first touches the object
 * Calls onHover every frame while the ray is over the object
 * Calls onExit when the ray leaves the object
 *
 * @param {RaycastOutput} raycast - The raycast data (position, direction, raycaster)
 * @param {THREE.Object3D} targetObject - The 3D object to check for intersection
 * @param {Function} onEnter - Callback when ray enters: (hit) => {...}
 * @param {Function} onHover - Callback every frame while hovering: (hit) => {...}
 * @param {Function} onExit - Callback when ray exits: (hit) => {...}
 * @param {Map} hoverState - Map to track current hover state (reused across frames)
 */
function trackHover(raycast, targetObject, onEnter, onHover, onExit, hoverState) {
    // Check if the ray is hitting the object
    const hits = raycast.raycaster.intersectObject(targetObject, true);
    const isCurrentlyHitting = hits.length > 0;
    const currentHit = isCurrentlyHitting ? hits[0] : null;

    // Get the previous frame's state for this object
    const stateKey = targetObject.uuid;
    const wasHittingLastFrame = hoverState.get(stateKey) !== undefined;

    // Fire onEnter when transitioning from no hit to hit
    if (isCurrentlyHitting && !wasHittingLastFrame) {
        onEnter(currentHit);
    }

    // Fire onHover every frame while hitting
    if (isCurrentlyHitting) {
        onHover(currentHit);
    }

    // Fire onExit when transitioning from hit to no hit
    if (!isCurrentlyHitting && wasHittingLastFrame) {
        const lastFrameHit = hoverState.get(stateKey);
        onExit(lastFrameHit);
    }

    // Update state for next frame
    if (isCurrentlyHitting) {
        hoverState.set(stateKey, currentHit);
    } else {
        hoverState.delete(stateKey);
    }
}

#pragma export (trackHover);
