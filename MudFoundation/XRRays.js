#pragma lifecycle()

// ─── Constants ────────────────────────────────────────────────────────────────
const RAY_LENGTH = 15;

// ─── Ray Visuals ──────────────────────────────────────────────────────────────
// Scratch vector — reused every frame to avoid per-frame allocation
const _rayEnd = new THREE.Vector3();

/**
 * Creates a visible ray line and adds it to the scene.
 * @param {number} color  - Hex color e.g. 0x0000FF
 * @param {number} length - Length of the visible ray
 * @returns {{ line: THREE.Line, length: number }}
 */
function makeRayLine(color = 0x0000ff, length = RAY_LENGTH) {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color }));
    line.frustumCulled = false;
    scene.add(line);
    return { line, length };
}

/**
 * Updates the ray line each frame to match the controller's raycast.
 * @param {{ line: THREE.Line, length: number }} rayLine
 * @param {RaycastOutput} raycast - Result of Input.xr.raycast(index)
 */
function updateRayLine(rayLine, raycast) {
    _rayEnd.copy(raycast.direction).normalize().multiplyScalar(rayLine.length).add(raycast.position);

    const pos = rayLine.line.geometry.attributes.position;
    pos.setXYZ(0, raycast.position.x, raycast.position.y, raycast.position.z);
    pos.setXYZ(1, _rayEnd.x, _rayEnd.y, _rayEnd.z);
    pos.needsUpdate = true;
}

#pragma export (makeRayLine, updateRayLine, RAY_LENGTH);
