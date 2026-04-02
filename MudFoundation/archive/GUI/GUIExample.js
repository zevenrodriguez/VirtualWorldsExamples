#pragma import (MudText, MudButton)
#pragma lifecycle(startup, update, dispose)

// Place two flat planes in the MUD scene editor and name them "statusLabel" and "actionButton".
// Their position, rotation, and scale are set visually in the editor —
// the GUI library takes over the material at runtime.

const statusLabel = MudText({
    sceneMesh:       cast(scene.getObjectByName("statusLabel"), THREE.Mesh),
    text:            'Status: idle',
    textColor:       '#ffffff',
    backgroundColor: '#111111',
    borderColor:     '#444444',
});

const actionButton = MudButton({
    sceneMesh:            cast(scene.getObjectByName("actionButton"), THREE.Mesh),
    text:                 'Press Me',
    textColor:            '#ffffff',
    backgroundColor:      '#2255cc',
    hoverBackgroundColor: '#4477ff',
    borderColor:          '#99bbff',
    hoverBorderColor:     '#ffffff',
});

// ─── Button callback ──────────────────────────────────────────────────────────
let clickCount = 0;

actionButton.onClick = (_hit) => {
    clickCount++;
    statusLabel.setText(`Clicked: ${clickCount}`);
    console.log('Button clicked', clickCount);
};

// ─── Lifecycle ────────────────────────────────────────────────────────────────
function startup() {
    Input.xr.start();
}

function update(delta) {
    if (Input.xr.count() < 1) return;

    for (let i = 0; i < Input.xr.count(); i++) {
        if (Input.xr.handedness(i) !== 'right') continue;

        const raycast = Input.xr.raycast(i);
        raycast.raycaster.ray.origin.copy(raycast.position);
        raycast.raycaster.ray.direction.copy(raycast.direction).normalize();

        actionButton.update(
            raycast,
            () => Input.xr.isButtonPressed(i, 0),
            () => Input.xr.isButtonReleased(i, 0)
        );
    }
}

function dispose() {
    Input.xr.stop();
    actionButton.reset();
}
