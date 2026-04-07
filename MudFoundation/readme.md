# MudFoundation — Project Documentation

This guide explains how to use the scripts in the `MudScripts` folder to build interactive 3D/XR scenes. The scripts are organized in two layers: **foundation modules** that define reusable building blocks, and **scene scripts** that wire everything together into a working experience.

---

## How the Scripts Fit Together

```
┌─ Foundation modules ──────────────────────────────────────────────────────┐
│  MudGUI.js               — MudText and MudButton (GUI primitives)         │
│  RaycastInteractorObject.js — RayInteractor (per-object hover/click)      │
│  XRRays.js               — makeRayLine / updateRayLine (visible ray beams)│
└───────────────────────────────────────────────────────────────────────────┘
                                    ↓ imported by
┌─ Scene setup modules ─────────────────────────────────────────────────────┐
│  GUIElements.js          — creates the GUI elements (label, button, panel)│
│  HelperFunctions.js      — utility functions (togglePanel)                │
│  Interactables.js        — registers scene objects into shared Maps       │
└───────────────────────────────────────────────────────────────────────────┘
                                    ↓ imported by
┌─ Input scripts ───────────────────────────────────────────────────────────┐
│  MouseRaycast.js         — wires mouse input → interactors                │
│  XRRaycast.js            — wires XR controller input → interactors        │
│  XRRigMove.js            — moves the player rig with the left thumbstick  │
└───────────────────────────────────────────────────────────────────────────┘
```

Scripts share values across files using `#pragma import` and `#pragma export` directives.

---

## GUIElements.js

This script creates all the GUI elements for the scene and stores them in a `Map` so any other script can look them up by name.

### Imports / Exports

```js
#pragma import (MudText, MudButton)   // uses the GUI primitives from MudGUI.js
#pragma export (GUIElements)          // exposes the Map to other scripts
```

### What it creates

| Key | Type | Initial state | Description |
|---|---|---|---|
| `"statusLabel"` | `MudText` | Visible | A read-only text display panel |
| `"actionButton"` | `MudButton` | Visible | A clickable button with hover styling |
| `"infoPanel"` | `MudText` | **Hidden** | A secondary info panel, hidden until toggled |

### Accessing elements from another script

```js
#pragma import (GUIElements)

// Read-only labels
const statusLabel = GUIElements.get("statusLabel");
statusLabel.setText("Player entered the zone!");

// Toggle the info panel
const infoPanel = GUIElements.get("infoPanel");
infoPanel.mesh.visible = true;   // show
infoPanel.mesh.visible = false;  // hide

// Get the button (see MudButton section for full usage)
const actionButton = GUIElements.get("actionButton");
```

---

## MudGUI.js — GUI Primitives

`MudGUI.js` defines two factory functions: `MudText` and `MudButton`. These are the building blocks used in `GUIElements.js`. You do not need to edit `MudGUI.js` directly — use the exported `GUIElements` Map in your scripts.

### `MudText(options)` — Rendered text panel

Creates a flat 3D plane that displays word-wrapped, styled text, driven by a canvas texture.

**Usage — attach to an existing scene mesh (most common):**

```js
const label = MudText({
    sceneMesh:       cast(scene.getObjectByName("myLabel"), THREE.Mesh),
    text:            'Hello world',
    textColor:       '#ffffff',
    backgroundColor: '#111111',
    borderColor:     '#444444',
});
```

When `sceneMesh` is supplied, `MudText` reads the mesh's world position, rotation, and bounding-box size, then replaces it with a canvas-textured plane in the same location. The original mesh is hidden automatically.

**Usage — create a free-floating panel:**

```js
const label = MudText({ text: 'Hello', width: 0.4, height: 0.15 });
scene.add(label.mesh);  // you must add it to the scene yourself
```

**All options:**

| Option | Type | Default | Description |
|---|---|---|---|
| `sceneMesh` | `THREE.Mesh` | `null` | Existing scene mesh to inherit position/size from |
| `text` | `string` | `''` | Text to display (auto word-wraps) |
| `width` | `number` | `0.4` | Panel width in world units (ignored when `sceneMesh` is set) |
| `height` | `number` | `0.15` | Panel height in world units (ignored when `sceneMesh` is set) |
| `resolution` | `number` | `512` | Canvas texture width in pixels |
| `fontSize` | `number` | `48` | Font size in canvas pixels |
| `fontFamily` | `string` | `'Arial'` | Font family |
| `textColor` | `string` | `'#ffffff'` | Text color (CSS hex) |
| `backgroundColor` | `string` | `'#222222'` | Panel background fill |
| `borderColor` | `string` | `'#555555'` | Border stroke color |
| `borderWidth` | `number` | `6` | Border stroke width in canvas pixels |
| `borderRadius` | `number` | `24` | Corner radius in canvas pixels |

**Return value — `MudText` instance:**

| Property / Method | Description |
|---|---|
| `label.mesh` | The `THREE.Mesh` in the scene. Use this to set `visible`, parent, etc. |
| `label.setText(text)` | Update the displayed text and redraw the texture |

```js
label.setText("Score: 42");
label.mesh.visible = false;  // hide
label.mesh.visible = true;   // show
```

---

### `MudButton(options)` — Interactive button

`MudButton` wraps `MudText` and adds built-in hover and click handling via an internal `RayInteractor`. It has two usage patterns depending on whether you are using it from mouse or XR code.

**Creating a button:**

```js
const btn = MudButton({
    sceneMesh:            cast(scene.getObjectByName("myButton"), THREE.Mesh),
    text:                 'Click Me',
    textColor:            '#ffffff',
    backgroundColor:      '#2255cc',
    hoverBackgroundColor: '#4477ff',
    borderColor:          '#99bbff',
    hoverBorderColor:     '#ffffff',
});
```

**Additional options (on top of all `MudText` options):**

| Option | Type | Default | Description |
|---|---|---|---|
| `backgroundColor` | `string` | `'#2255cc'` | Normal background color |
| `hoverBackgroundColor` | `string` | `'#4477ff'` | Background color while hovered |
| `borderColor` | `string` | `'#99bbff'` | Normal border color |
| `hoverBorderColor` | `string` | `'#ffffff'` | Border color while hovered |

**Return value — `MudButton` instance:**

| Property / Method | Signature | Description |
|---|---|---|
| `btn.mesh` | `THREE.Mesh` | The panel mesh in the scene |
| `btn.setText(text)` | `(string) → void` | Update the button label |
| `btn.onClick` | `(_hit) → void` | Assign your click handler here |
| `btn.hover()` | `() → void` | Manually apply the hover appearance |
| `btn.unhover()` | `() → void` | Revert to the normal appearance |
| `btn.update(raycast, isPressed, isReleased)` | see below | Drive the button from a raycast each frame |
| `btn.reset()` | `() → void` | Clear hover/press state |
| `btn._interactor` | `RayInteractor` | The internal interactor (used by XR code) |

#### Pattern A — Mouse (call `btn.update()` directly)

The button manages its own hover state. Assign `onClick` then call `btn.update()` every frame:

```js
const actionButton = GUIElements.get("actionButton");

actionButton.onClick = (_hit) => {
    infoPanel.mesh.visible = !infoPanel.mesh.visible;
};

// Override hover callbacks if you need side-effects (e.g. cursor change)
actionButton._interactor.onEnter = (_hit) => {
    actionButton.hover();
    domElement.style.cursor = 'pointer';
};
actionButton._interactor.onExit = (_hit) => {
    actionButton.unhover();
    domElement.style.cursor = 'default';
};

function update() {
    const mouseRaycast = Input.mouse.raycast(camera);
    const isPressed    = () => Input.mouse.isButtonPressed(MouseButton.Left);
    const isReleased   = () => Input.mouse.isButtonReleased(MouseButton.Left);

    actionButton.update(mouseRaycast, isPressed, isReleased);  // drives the internal interactor
}
```

#### Pattern B — XR (create separate `RayInteractor` instances per hand)

For XR you need two interactors (one per controller). Call `hover()` / `unhover()` manually and forward `onClick` yourself:

```js
const actionButton      = GUIElements.get("actionButton");
const leftBtnInteractor  = new RayInteractor(actionButton.mesh);
const rightBtnInteractor = new RayInteractor(actionButton.mesh);

leftBtnInteractor.onEnter  = (_hit) => { actionButton.hover(); };
leftBtnInteractor.onExit   = (_hit) => { actionButton.unhover(); };
leftBtnInteractor.onClick  = (_hit) => { console.log('clicked'); };

rightBtnInteractor.onEnter = (_hit) => { actionButton.hover(); };
rightBtnInteractor.onExit  = (_hit) => { actionButton.unhover(); };
rightBtnInteractor.onClick = (_hit) => { console.log('clicked'); };

// Then in update(), feed each hand's raycast to its own interactor:
leftBtnInteractor.update(leftRaycast, lPressed, lReleased);
rightBtnInteractor.update(rightRaycast, rPressed, rReleased);
```

---

## HelperFunctions.js

A small utility module exporting a single helper.

### `togglePanel(panelObject)`

Flips the visibility of any `THREE.Object3D`. If it is visible it becomes hidden; if hidden it becomes visible.

```js
#pragma import (togglePanel)

togglePanel(ToggleObjects.get("cubeText"));  // show if hidden, hide if shown
togglePanel(infoPanel.mesh);                 // works on MudText/MudButton meshes too
```

| Parameter | Type | Description |
|---|---|---|
| `panelObject` | `THREE.Object3D` | Any scene object |

---

## Interactables.js

Finds objects in the scene by name and stores them in shared `Map`s so other scripts can access them without needing direct references.

### Exports

```js
#pragma export (RaycastObjects, ToggleObjects)
```

### `RaycastObjects` — clickable/hoverable scene objects

```js
RaycastObjects.get("cube")    // → THREE.Object3D
RaycastObjects.get("sphere")  // → THREE.Object3D
```

### `ToggleObjects` — UI panels that can be shown/hidden

```js
ToggleObjects.get("cubeText")    // → THREE.Object3D  (starts hidden)
ToggleObjects.get("sphereText")  // → THREE.Object3D  (starts hidden)
```

Both panels are hidden on startup — `Interactables.js` calls `togglePanel()` on each during initialization.

### Registering a new interactable object

1. Name the object in your scene editor (e.g. `"myBox"`).
2. In `Interactables.js`, add the registration:

```js
const myBox = cast(scene.getObjectByName("myBox"), THREE.Object3D);
RaycastObjects.set("myBox", myBox);
```

3. In `MouseRaycast.js` or `XRRaycast.js`, create an interactor for it (see below).

---

## MouseRaycast.js

Connects **mouse input** to the interactable objects. This is the script for desktop/browser interaction.

### Lifecycle

```
startup()       → called once on scene load — starts mouse capture
update()        → called every frame — casts a ray and updates interactors
dispose()       → called on scene teardown — stops mouse capture and resets state
```

### `RayInteractor` — core hover/click primitive

Defined in `RaycastInteractorObject.js` and used throughout the project. You create one instance per target object and call `update()` every frame.

```js
const interactor = new RayInteractor(targetObject);

// Assign any of the four callbacks (all default to no-ops):
interactor.onEnter = (_hit) => { /* ray first touches the object this frame */ };
interactor.onHover = (_hit) => { /* ray is over the object — fires every frame */ };
interactor.onExit  = (_hit) => { /* ray just left the object */ };
interactor.onClick = (_hit) => { /* trigger pressed and released while hovering */ };

// In your update loop:
interactor.update(raycast, isPressed, isReleased);
```

The `_hit` argument in all callbacks is a Three.js intersection record. Key properties:

| Property | Description |
|---|---|
| `_hit.object` | The specific mesh that was intersected |
| `_hit.point` | `THREE.Vector3` — world-space hit location |
| `_hit.distance` | Distance from ray origin to hit point |

**`RayInteractor` methods:**

| Method | Description |
|---|---|
| `update(raycast, isPressed, isReleased)` | Must be called every frame. `isPressed` and `isReleased` are `() => boolean` functions |
| `reset()` | Clears hover/press state and fires `onExit` if the object was currently hovered |

### Mouse Input API

| Call | Returns | Description |
|---|---|---|
| `Input.mouse.start()` | `void` | Begin capturing mouse events |
| `Input.mouse.stop()` | `void` | Stop capturing mouse events |
| `Input.mouse.raycast(camera)` | raycast object | Cast a ray from the current mouse position through the camera |
| `Input.mouse.isButtonPressed(MouseButton.Left)` | `boolean` | `true` every frame the left button is held |
| `Input.mouse.isButtonReleased(MouseButton.Left)` | `boolean` | `true` on the single frame the left button is released |

### Full wiring example

```js
#pragma import (RayInteractor, RaycastObjects, ToggleObjects, togglePanel, GUIElements)
#pragma lifecycle(startup, update, dispose)

const domElement   = renderer.domElement;
const actionButton = GUIElements.get("actionButton");
const infoPanel    = GUIElements.get("infoPanel");

// ── Cube interactor ──────────────────────────────────────────────────────────
const cubeInteractor = new RayInteractor(RaycastObjects.get("cube"));
cubeInteractor.onEnter = (_hit) => { domElement.style.cursor = 'pointer'; };
cubeInteractor.onExit  = (_hit) => { domElement.style.cursor = 'default'; };
cubeInteractor.onClick = (_hit) => { togglePanel(ToggleObjects.get("cubeText")); };

// ── Sphere interactor ────────────────────────────────────────────────────────
const sphereInteractor = new RayInteractor(RaycastObjects.get("sphere"));
sphereInteractor.onEnter = (_hit) => {
    _hit.object.material.color.set(0xff6600);
    ToggleObjects.get("sphereText").visible = true;
    domElement.style.cursor = 'pointer';
};
sphereInteractor.onExit = (_hit) => {
    _hit.object.material.color.set(0xffffff);
    ToggleObjects.get("sphereText").visible = false;
    domElement.style.cursor = 'default';
};

// ── Button — uses the button's built-in interactor ───────────────────────────
// Override its hover callbacks to add cursor changes, then set onClick directly
actionButton._interactor.onEnter = (_hit) => { actionButton.hover();   domElement.style.cursor = 'pointer'; };
actionButton._interactor.onExit  = (_hit) => { actionButton.unhover(); domElement.style.cursor = 'default'; };
actionButton.onClick             = (_hit) => { infoPanel.mesh.visible = !infoPanel.mesh.visible; };

function startup() {
    Input.mouse.start();
}

function update() {
    const mouseRaycast = Input.mouse.raycast(camera);
    const isPressed    = () => Input.mouse.isButtonPressed(MouseButton.Left);
    const isReleased   = () => Input.mouse.isButtonReleased(MouseButton.Left);

    cubeInteractor.update(mouseRaycast, isPressed, isReleased);
    sphereInteractor.update(mouseRaycast, isPressed, isReleased);
    actionButton.update(mouseRaycast, isPressed, isReleased);  // drives its internal interactor
}

function dispose() {
    Input.mouse.stop();
    cubeInteractor.reset();
    sphereInteractor.reset();
    actionButton.reset();
    domElement.style.cursor = 'default';
}
```

> **Note:** For `MudButton`, call `actionButton.update(...)` rather than creating a separate `RayInteractor`. For plain scene objects (`cube`, `sphere`), create your own `RayInteractor` instances.

---

## XRRaycast.js

The XR equivalent of `MouseRaycast.js` — connects **left and right XR controllers** to the interactable objects and draws a visible ray beam from each controller.

### XR Ray Lines (from `XRRays.js`)

Two helpers manage the visible laser-pointer lines:

#### `makeRayLine(color, length)`

Creates a Three.js `Line` object and adds it to the scene.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `color` | `number` | `0x0000ff` | Hex color for the ray line |
| `length` | `number` | `15` | Length of the ray in world units |

Returns `{ line, length }`. Store the result and pass it to `updateRayLine` every frame.

```js
const leftRay  = makeRayLine(0x0000FF);  // blue
const rightRay = makeRayLine(0xFF0000);  // red
```

#### `updateRayLine(rayLine, raycast)`

Updates the line's start and end points to match a controller's current position and direction. Call once per frame per controller.

| Parameter | Type | Description |
|---|---|---|
| `rayLine` | `{ line, length }` | The object returned by `makeRayLine` |
| `raycast` | raycast object | The controller's raycast data from `Input.xr.raycast(i)` |

```js
updateRayLine(leftRay, raycast);
```

### XR Controller Input API

| Call | Returns | Description |
|---|---|---|
| `Input.xr.start()` | `void` | Begin listening for XR controller input |
| `Input.xr.stop()` | `void` | Stop listening |
| `Input.xr.count()` | `number` | Number of active controllers (0–2) |
| `Input.xr.raycast(i)` | raycast object | Raycast data for controller at index `i` |
| `Input.xr.handedness(i)` | `'left'` \| `'right'` | Which hand controller `i` belongs to |
| `Input.xr.axes(i)` | `number[]` | Thumbstick axis values for controller `i` |
| `Input.xr.isButtonPressed(i, button)` | `boolean` | `true` every frame button is held (`0` = trigger) |
| `Input.xr.isButtonReleased(i, button)` | `boolean` | `true` on the single frame button is released |

### Interactor pattern for XR

Because there are two controllers, each scene object needs **two** `RayInteractor` instances — one for each hand. They are fed their respective controller's raycast data each frame:

```js
const leftInteractor  = new RayInteractor(RaycastObjects.get("cube"));
const rightInteractor = new RayInteractor(RaycastObjects.get("cube"));

leftInteractor.onClick  = (_hit) => { togglePanel(ToggleObjects.get("cubeText")); };
rightInteractor.onClick = (_hit) => { togglePanel(ToggleObjects.get("cubeText")); };
```

### Full wiring example

```js
#pragma import (makeRayLine, updateRayLine, RayInteractor, RaycastObjects, ToggleObjects, togglePanel, GUIElements)
#pragma lifecycle(startup, update, dispose)

let leftRay  = null;
let rightRay = null;
const controllers = { left: null, right: null, leftIndex: -1, rightIndex: -1 };

// ── Cube: one interactor per hand ────────────────────────────────────────────
const leftInteractor  = new RayInteractor(RaycastObjects.get("cube"));
const rightInteractor = new RayInteractor(RaycastObjects.get("cube"));

leftInteractor.onClick  = (_hit) => { togglePanel(ToggleObjects.get("cubeText")); };
rightInteractor.onClick = (_hit) => { togglePanel(ToggleObjects.get("cubeText")); };

// ── Sphere: change color on hover ────────────────────────────────────────────
const leftSphereInteractor  = new RayInteractor(RaycastObjects.get("sphere"));
const rightSphereInteractor = new RayInteractor(RaycastObjects.get("sphere"));

leftSphereInteractor.onEnter  = (_hit) => { _hit.object.material.color.set(0xff6600); ToggleObjects.get("sphereText").visible = true; };
leftSphereInteractor.onExit   = (_hit) => { _hit.object.material.color.set(0xffffff); ToggleObjects.get("sphereText").visible = false; };
rightSphereInteractor.onEnter = (_hit) => { _hit.object.material.color.set(0xff6600); ToggleObjects.get("sphereText").visible = true; };
rightSphereInteractor.onExit  = (_hit) => { _hit.object.material.color.set(0xffffff); ToggleObjects.get("sphereText").visible = false; };

// ── Button: standalone interactors call hover()/unhover() manually ───────────
const actionButton       = GUIElements.get("actionButton");
const leftBtnInteractor  = new RayInteractor(actionButton.mesh);
const rightBtnInteractor = new RayInteractor(actionButton.mesh);

leftBtnInteractor.onEnter  = (_hit) => { actionButton.hover(); };
leftBtnInteractor.onExit   = (_hit) => { actionButton.unhover(); };
leftBtnInteractor.onClick  = (_hit) => { console.log('clicked'); };
rightBtnInteractor.onEnter = (_hit) => { actionButton.hover(); };
rightBtnInteractor.onExit  = (_hit) => { actionButton.unhover(); };
rightBtnInteractor.onClick = (_hit) => { console.log('clicked'); };

function startup() {
    Input.xr.start();
    leftRay  = makeRayLine(0x0000FF);  // blue ray for left controller
    rightRay = makeRayLine(0xFF0000);  // red  ray for right controller
}

function update() {
    if (Input.xr.count() < 1) return;

    controllers.left  = null;
    controllers.right = null;

    for (let i = 0; i < Input.xr.count(); i++) {
        const raycast = Input.xr.raycast(i);
        const hand    = Input.xr.handedness(i);

        if (hand === 'left') {
            controllers.left      = raycast;
            controllers.leftIndex = i;
            updateRayLine(leftRay, raycast);
        }
        if (hand === 'right') {
            controllers.right      = raycast;
            controllers.rightIndex = i;
            updateRayLine(rightRay, raycast);
        }
    }

    if (controllers.left) {
        // Sync the raycaster with the controller's current position and direction
        controllers.left.raycaster.ray.origin.copy(controllers.left.position);
        controllers.left.raycaster.ray.direction.copy(controllers.left.direction).normalize();

        const lPressed  = () => Input.xr.isButtonPressed(controllers.leftIndex, 0);
        const lReleased = () => Input.xr.isButtonReleased(controllers.leftIndex, 0);
        leftInteractor.update(controllers.left, lPressed, lReleased);
        leftSphereInteractor.update(controllers.left, lPressed, lReleased);
        leftBtnInteractor.update(controllers.left, lPressed, lReleased);
    }

    if (controllers.right) {
        controllers.right.raycaster.ray.origin.copy(controllers.right.position);
        controllers.right.raycaster.ray.direction.copy(controllers.right.direction).normalize();

        const rPressed  = () => Input.xr.isButtonPressed(controllers.rightIndex, 0);
        const rReleased = () => Input.xr.isButtonReleased(controllers.rightIndex, 0);
        rightInteractor.update(controllers.right, rPressed, rReleased);
        rightSphereInteractor.update(controllers.right, rPressed, rReleased);
        rightBtnInteractor.update(controllers.right, rPressed, rReleased);
    }
}

function dispose() {
    Input.xr.stop();
    leftInteractor.reset();       rightInteractor.reset();
    leftSphereInteractor.reset(); rightSphereInteractor.reset();
    leftBtnInteractor.reset();    rightBtnInteractor.reset();

    if (leftRay?.line)  scene?.remove(leftRay.line);
    if (rightRay?.line) scene?.remove(rightRay.line);
}
```

---

## XRRigMove.js

Moves the player through the scene using the **left thumbstick**. Movement direction is always relative to where the headset is facing, and vertical movement is suppressed so the player stays on the ground.

### Lifecycle

```
startup(delta)  → empty, reserved for future setup
update(delta)   → called every frame — reads thumbstick axes and moves the rig
dispose()       → empty, reserved for future cleanup
```

> `delta` is the time in seconds since the last frame. Multiplying speed by `delta` makes movement frame-rate independent.

### Configuration

```js
const MOVE_SPEED = 2.0;  // world units per second — edit this to change movement speed
```

### How movement is calculated

Each frame the script:

1. Checks whether any controller is the left hand.
2. Reads thumbstick axes `[2]` (strafe) and `[3]` (forward/back).
3. Builds a movement vector scaled by `MOVE_SPEED * delta`.
4. Rotates that vector by `avatarPOV.quaternion` so forward is always where the headset points.
5. Zeroes the `y` component to prevent flying.
6. Adds the result to `avatarRig.position`.

```js
const MOVE_SPEED = 2.0;

const _move = new THREE.Vector3();  // reused every frame to avoid allocation

function update(delta) {
    if (Input.xr.count() < 1) return;

    for (let i = 0; i < Input.xr.count(); i++) {
        if (Input.xr.handedness(i) !== 'left') continue;

        const axes   = Input.xr.axes(i);
        if (!axes || axes.length < 4) continue;

        const strafe  = axes[2];  // thumbstick left/right
        const forward = axes[3];  // thumbstick up/down

        if (strafe === 0 && forward === 0) continue;

        _move.set(
            -strafe  * MOVE_SPEED * delta,
             0,
            -forward * MOVE_SPEED * delta
        );

        _move.applyQuaternion(avatarPOV.quaternion);  // rotate to headset direction
        _move.y = 0;                                  // stay flat

        avatarRig.position.add(_move);
    }
}
```

### Key globals

| Variable | Type | Description |
|---|---|---|
| `avatarRig` | `THREE.Object3D` | The root XR rig. Moving this moves the entire player. |
| `avatarPOV` | `THREE.Object3D` | The headset / camera. Its quaternion gives the player's current facing direction. |
| `delta` | `number` | Seconds elapsed since the previous frame (provided by the engine). |

### Thumbstick axis layout

| Index | Physical axis | Positive direction |
|---|---|---|
| `axes[2]` | Horizontal (strafe) | Right |
| `axes[3]` | Vertical (forward/back) | Back |

### Adjusting speed

Change `MOVE_SPEED` at the top of the file:

```js
const MOVE_SPEED = 4.0;  // faster
const MOVE_SPEED = 1.0;  // slower
```

---

## Quick Reference — Common Patterns

### Show/hide a panel on click

```js
interactor.onClick = (_hit) => {
    togglePanel(ToggleObjects.get("cubeText"));
};

// or toggle a MudText panel directly:
interactor.onClick = (_hit) => {
    infoPanel.mesh.visible = !infoPanel.mesh.visible;
};
```

### Change an object's color on hover

```js
interactor.onEnter = (_hit) => { _hit.object.material.color.set(0xff6600); };
interactor.onExit  = (_hit) => { _hit.object.material.color.set(0xffffff); };
```

### Update a GUI text label

```js
const label = GUIElements.get("statusLabel");
label.setText("You clicked the cube!");
```

### Add a new interactable object

1. Name the object in your scene editor (e.g. `"myBox"`).
2. In `Interactables.js`, register it:

```js
const myBox = cast(scene.getObjectByName("myBox"), THREE.Object3D);
RaycastObjects.set("myBox", myBox);
```

3. In `MouseRaycast.js`, create an interactor and wire it up:

```js
const myBoxInteractor = new RayInteractor(RaycastObjects.get("myBox"));
myBoxInteractor.onEnter = (_hit) => { domElement.style.cursor = 'pointer'; };
myBoxInteractor.onExit  = (_hit) => { domElement.style.cursor = 'default'; };
myBoxInteractor.onClick = (_hit) => { console.log("myBox clicked!"); };

// in update():
myBoxInteractor.update(mouseRaycast, isPressed, isReleased);

// in dispose():
myBoxInteractor.reset();
```

4. For XR, add a left and right interactor following the same pattern in `XRRaycast.js`.
