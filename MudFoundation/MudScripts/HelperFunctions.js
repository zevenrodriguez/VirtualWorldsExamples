// ─── Toggle Function ──────────────────────────────────────────────────────────
/**
 * Show or hide a UI panel (toggle its visibility).
 *
 * @param {THREE.Object3D} panelObject - The object to show/hide
 */
function togglePanel(panelObject) {
    panelObject.visible = !panelObject.visible;  // Flip true to false, false to true
}

#pragma export (togglePanel);


