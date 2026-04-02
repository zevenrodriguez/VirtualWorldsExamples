#pragma lifecycle(startup, update, dispose)

// ─── Constants ────────────────────────────────────────────────────────────────
const MOVE_SPEED = 2.0;

// ─── Scratch vector — reused every frame to avoid allocation ─────────────────
const _move = new THREE.Vector3();

function startup() {
}

function update(delta) {
    if (Input.xr.count() < 1) return;

    for (let i = 0; i < Input.xr.count(); i++) {
        if (Input.xr.handedness(i) !== 'left') continue;

        const axes = Input.xr.axes(i);
        if (!axes || axes.length < 4) continue;

        const strafe  = axes[2];  // left/right
        const forward = axes[3];  // forward/back

        if (strafe === 0 && forward === 0) continue;

        // Build a flat movement vector in camera-relative space
        _move.set(
            -strafe  * MOVE_SPEED * delta,
             0,
            -forward * MOVE_SPEED * delta
        );

        // Rotate by the headset/POV orientation so forward is where you're looking
        _move.applyQuaternion(avatarPOV.quaternion);

        // Keep movement flat — no flying up/down
        _move.y = 0;

        avatarRig.position.add(_move);
    }
}

function dispose() {
}
