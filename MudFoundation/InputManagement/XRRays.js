#pragma lifecycle(startup, update, dispose)

// ─── Constants ────────────────────────────────────────────────────────────────
const RAY_LENGTH = 15;  // How far the ray visualization extends from the controller

// ─── Helper Vector ───────────────────────────────────────────────────────────
// We reuse this vector each frame instead of creating a new one (better performance)
const rayEndPosition = new THREE.Vector3();

// ─── Ray Storage ──────────────────────────────────────────────────────────────
// Store the left and right ray objects
let leftRay = null;
let rightRay = null;

/**
 * Create a visible ray line from an XR controller.
 * This creates a thin line in 3D space showing where the controller is pointing.
 *
 * @param {number} color - CSS hex color (e.g., 0xff0000 for red)
 * @param {number} length - How long the ray should be
 * @returns {Object} Object with .line (the THREE.Line) and .length properties
 */
function makeRayLine(color = 0x0000ff, length = RAY_LENGTH) {
    // Create the geometry (two points: start and end)
    const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),  // Start of the ray
        new THREE.Vector3(0, 0, 0)   // End of the ray (will be updated each frame)
    ]);

    // Create the material (the visual properties of the line)
    const material = new THREE.LineBasicMaterial({ color });

    // Create the actual line object
    const line = new THREE.Line(geometry, material);
    line.frustumCulled = false;  // Always render, even if off-screen

    // Add the line to the scene so we can see it
    scene.add(line);

    return { line, length };
}

/**
 * Update the ray line to match the current controller position and direction.
 * Call this every frame for each controller.
 *
 * @param {Object} rayLine - The ray object created by makeRayLine()
 * @param {RaycastOutput} raycast - The raycast data (position, direction) from Input.xr.raycast()
 */
function updateRayLine(rayLine, raycast) {
    // Calculate where the ray ends
    rayEndPosition
        .copy(raycast.direction)           // Start with the direction the controller points
        .normalize()                        // Make it a unit vector (length = 1)
        .multiplyScalar(rayLine.length)    // Stretch it to the desired length
        .add(raycast.position);             // Move it to the controller's position

    // Update the line's geometry to draw from controller to ray end point
    const positions = rayLine.line.geometry.attributes.position;
    positions.setXYZ(0, raycast.position.x, raycast.position.y, raycast.position.z);
    positions.setXYZ(1, rayEndPosition.x, rayEndPosition.y, rayEndPosition.z);
    positions.needsUpdate = true;  // Tell Three.js the geometry changed
}

// Called once when the system starts - create the rays
function startup() {
    // Create left controller ray (blue)
    leftRay = makeRayLine(0x0000FF);

    // Create right controller ray (red)
    rightRay = makeRayLine(0xFF0000);
}

// Called every frame - update the rays
function update() {
    // Update left controller ray
    const leftRaycast = Input.xr.raycast(0);
    updateRayLine(leftRay, leftRaycast);

    // Update right controller ray
    const rightRaycast = Input.xr.raycast(1);
    updateRayLine(rightRay, rightRaycast);
}

// Called when the system shuts down - clean up
function dispose() {
    if (leftRay) {
        scene.remove(leftRay.line);
        leftRay = null;
    }

    if (rightRay) {
        scene.remove(rightRay.line);
        rightRay = null;
    }
}

#pragma export (startup, update, dispose);

