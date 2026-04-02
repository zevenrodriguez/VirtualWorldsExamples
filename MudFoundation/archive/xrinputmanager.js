#pragma lifecycle(startup, update, dispose)

// ─── Constants ────────────────────────────────────────────────────────────────
const GRIP = 0;
const RAY_LENGTH = 15;
const XR_MOVE_SPEED = 2.0;

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

// ─── Interaction Utilities ────────────────────────────────────────────────────

/**
 * Returns the first intersection hit if the ray is over the object, otherwise null.
 * @param {RaycastOutput} raycast
 * @param {THREE.Object3D} object
 * @returns {THREE.Intersection | null}
 */
function isHovering(raycast, object) {
    const hits = raycast.raycaster.intersectObject(object, true);
    return hits.length > 0 ? hits[0] : null;
}

// Stores the latest raycast output per hand — null if that controller is not active
const controllers = { left: null, right: null };

// Internal state for hover enter/exit tracking — keyed by "side+objectUUID"
const _hoverState = new Map();

/**
 * Call each frame. Fires onEnter/onExit once on transition.
 * @param {RaycastOutput}    raycast - controllers.left or controllers.right
 * @param {THREE.Object3D}   object
 * @param {(hit, raycast) => void} onEnter - called with the intersection hit and raycast
 * @param {(raycast) => void}      onExit  - called with the raycast
 */
function trackHover(raycast, object, onEnter, onExit) {
    const side = raycast === controllers.left ? 'left' : 'right';
    const key  = side + object.uuid;
    const hit  = isHovering(raycast, object);
    const prev = _hoverState.get(key) ?? null;

    if (hit && !prev) onEnter(hit, raycast);
    if (!hit && prev) onExit(prev, raycast);

    _hoverState.set(key, hit ?? null);
}

// ─── Scene Setup ──────────────────────────────────────────────────────────────
const leftRay = makeRayLine(0x0000ff);
const rightRay = makeRayLine(0x0000ff);

const testCube = cast(scene.getObjectByName("testCube"), THREE.Object3D);


// ─── Lifecycle ────────────────────────────────────────────────────────────────
function startup() {
    Input.xr.start();
}

function update(delta, time) {
    if (Input.xr.count() < 1) return;

    for (let i = 0; i < Input.xr.count(); i++) {
        const raycast = Input.xr.raycast(i);
        const hand = Input.xr.handedness(i);

        // Track raycast per hand and update ray visuals
        if (hand === 'left') { controllers.left = raycast; updateRayLine(leftRay, raycast); }
        if (hand === 'right') { controllers.right = raycast; updateRayLine(rightRay, raycast); }

        // ── Locomotion (left stick) ───────────────────────────────────────────
        if (hand === 'left') {
            const axes = Input.xr.axes(i);
            if (axes && axes.length >= 4) {
                const move = new THREE.Vector3(-axes[2] * XR_MOVE_SPEED * delta, 0, -axes[3] * XR_MOVE_SPEED * delta);
                move.applyQuaternion(avatarPOV.quaternion);
                avatarRig.position.add(move);
            }
        }

        // Track hover on testCube for each controller
        if (raycast) {
            trackHover(raycast, testCube,
                (hit) => { 
                    hit.object.material.color.set(0xff0000); 
                },
                (lastHit)  => { 
                    lastHit.object.material.color.set(0x00ff00); 
                }
            );
        }

    }
}

function dispose() {
    Input.xr.stop();
}
