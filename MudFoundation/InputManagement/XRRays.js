// ─── Constants ────────────────────────────────────────────────────────────────
const RAY_LENGTH = 15;

// ─── Helper Vector ───────────────────────────────────────────────────────────
const rayEndPosition = new THREE.Vector3();

function makeRayLine(color = 0x0000ff, length = RAY_LENGTH) {
    if (!scene) {
        console.error("Scene not initialized");
        return null;
    }

    const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -length)
    ]);

    const material = new THREE.LineBasicMaterial({ color, linewidth: 2 });

    const line = new THREE.Line(geometry, material);
    line.frustumCulled = false;

    scene.add(line);

    return { line, length };
}

function updateRayLine(rayLine, raycast) {
    if (!rayLine || !raycast) return;

    rayEndPosition
        .copy(raycast.direction)
        .normalize()
        .multiplyScalar(rayLine.length)
        .add(raycast.position);

    const positions = rayLine.line.geometry.attributes.position;
    positions.setXYZ(0, raycast.position.x, raycast.position.y, raycast.position.z);
    positions.setXYZ(1, rayEndPosition.x, rayEndPosition.y, rayEndPosition.z);
    positions.needsUpdate = true;
}

#pragma export (makeRayLine, updateRayLine);
