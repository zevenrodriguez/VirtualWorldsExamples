/*
 * Interactable Objects Module
 *
 * This module:
 * 1. Finds objects in the scene
 * 2. Stores them in Maps for easy access
 * 3. Provides a function to toggle UI panels
 */


// ─── Get Objects from the Scene ───────────────────────────────────────────────
// Find the 3D objects (things you can click/interact with)
const cube = cast(scene.getObjectByName("cube"), THREE.Object3D);
const sphere = cast(scene.getObjectByName("sphere"), THREE.Object3D);

// Find the UI panels (text displays that show/hide)
const cubeTextPanel = cast(scene.getObjectByName("cubeText"), THREE.Object3D);
const sphereTextPanel = cast(scene.getObjectByName("sphereText"), THREE.Object3D);

// ─── Store Objects in Maps ───────────────────────────────────────────────────
// Maps are like dictionaries - they store key-value pairs
// We store the objects so other modules can get them by name

/**
 * Map of clickable/raycastable objects
 * Access with: RaycastObjects.get("cube") or RaycastObjects.get("sphere")
 */
const RaycastObjects = new Map();
RaycastObjects.set("cube", cube);
RaycastObjects.set("sphere", sphere);

/**
 * Map of UI panels that can be toggled on/off
 * Access with: ToggleObjects.get("cubeText") or ToggleObjects.get("sphereText")
 */
const ToggleObjects = new Map();
ToggleObjects.set("cubeText", cubeTextPanel);
ToggleObjects.set("sphereText", sphereTextPanel);

// ─── Toggle Function ──────────────────────────────────────────────────────────
/**
 * Show or hide a UI panel (toggle its visibility).
 *
 * @param {THREE.Object3D} panelObject - The object to show/hide
 */
function togglePanel(panelObject) {
    panelObject.visible = !panelObject.visible;  // Flip true to false, false to true
}

// ─── Initialize ──────────────────────────────────────────────────────────────
// Hide the text panels when the scene starts
togglePanel(cubeTextPanel);
togglePanel(sphereTextPanel);

#pragma export (RaycastObjects, ToggleObjects, togglePanel);

