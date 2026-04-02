#pragma import (MudText, MudButton)

// ─── Create GUI elements ──────────────────────────────────────────────────────
const statusLabel = MudText({
    sceneMesh:       cast(scene.getObjectByName("statusLabel"), THREE.Mesh),
    text:            'Select a material',
    textColor:       '#ffffff',
    backgroundColor: '#111111',
    borderColor:     '#444444',
});

const actionButton = MudButton({
    sceneMesh:            cast(scene.getObjectByName("actionButton"), THREE.Mesh),
    text:                 'Apply Material',
    textColor:            '#ffffff',
    backgroundColor:      '#2255cc',
    hoverBackgroundColor: '#4477ff',
    borderColor:          '#99bbff',
    hoverBorderColor:     '#ffffff',
});

// ─── Info panel (hidden by default) ──────────────────────────────────────────
const infoPanel = MudText({
    sceneMesh:       cast(scene.getObjectByName("infoPanel"), THREE.Mesh),
    text:            'Hello from MudGUI!',
    textColor:       '#ffffff',
    backgroundColor: '#1a3a1a',
    borderColor:     '#44aa44',
});

infoPanel.mesh.visible = false;

// ─── Store in map for shared access ──────────────────────────────────────────
const GUIElements = new Map();
GUIElements.set("statusLabel", statusLabel);
GUIElements.set("actionButton", actionButton);
GUIElements.set("infoPanel",    infoPanel);

#pragma export (GUIElements);
