# Mud Scripts — Student Documentation

This guide explains how to use the scripts in this folder to build interactive 3D/XR scenes. The scripts work together: some provide reusable building blocks, and others wire everything together into a working scene.

---

## How the Scripts Fit Together

```
MudGUI.js               — defines MudText and MudButton (GUI primitives)
RaycastInteractorObject.js — defines RayInteractor (hover/click logic)
XRRays.js               — defines makeRayLine / updateRayLine (visible ray beams)
        ↓ used by
GUIElements.js          — creates the GUI objects (label, button, info panel)
HelperFunctions.js      — utility functions (e.g. togglePanel)
Interactables.js        — creates the scene objects (cube, sphere) + their Maps
        ↓ used by
MouseRaycast.js         — wires mouse input → interactors
XRRaycast.js            — wires XR controller input → interactors
XRRigMove.js            — moves the player rig with the left thumbstick
```

Scripts use `#pragma import` and `#pragma export` to share values across files.

---

## GUIElements.js

This script creates the GUI elements used throughout the scene and stores them in a `Map` so other scripts can look them up by name.

### What it creates

| Name | Type | Description |
|---|---|---|
| `statusLabel` | `MudText` | A read-only text box |
| `actionButton` | `MudButton` | A clickable button |
| `infoPanel` | `MudText` | A hidden info panel (starts invisible) |

### Exports

```js
GUIElements  // Map<string, MudText | MudButton>
```

### How to use it

```js
#pragma import (GUIElements)

// Get the button
const actionButton = GUIElements.get("actionButton");

// Get the info panel
const infoPanel = GUIElements.get("infoPanel");

// Show or hide the info panel
infoPanel.mesh.visible = true;

// Change the text on the label
const statusLabel = GUIElements.get("statusLabel");
statusLabel.setText("New message here!");
```

### MudText API (from MudGUI.js)

`MudText` renders text onto a flat 3D plane using a canvas texture.

```js
const label = MudText({
    sceneMesh:       cast(scene.getObjectByName("myLabel"), THREE.Mesh), // existing mesh from scene
    text:            'Hello world',
    textColor:       '#ffffff',
    backgroundColor: '#111111',
    borderColor:     '#444444',
});
```

| Option | Type | Default | Description |
|---|---|---|---|
| `sceneMesh` | `THREE.Mesh` | `null` | Scene mesh to borrow position/size from |
| `text` | `string` | `''` | Initial text content |
| `textColor` | `string` | `'#ffffff'` | Text color (CSS hex) |
| `backgroundColor` | `string` | `'#222222'` | Background fill color |
| `borderColor` | `string` | `'#555555'` | Border color |
| `fontSize` | `number` | `48` | Font size in canvas pixels |
| `resolution` | `number` | `512` | Canvas width in pixels |

**Methods:**

```js
label.setText("Updated text");   // change the displayed text
label.mesh.visible = false;      // hide the panel
label.mesh.visible = true;       // show the panel
```

### MudButton API (from MudGUI.js)

`MudButton` extends `MudText` with hover and click behavior.

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

// Assign a click handler
btn.onClick = (_hit) => {
    console.log("Button was clicked!");
};

// In your update loop (required every frame):
btn.update(raycast, isPressed, isReleased);
```

**Methods:**

```js
btn.setText("New Label");    // change button text
btn.hover();                 // manually trigger hover appearance
btn.unhover();               // revert to normal appearance
btn.update(raycast, isPressed, isReleased); // must be called every frame
btn.reset();                 // clear hover/press state
```

---

## HelperFunctions.js

A small utility module. Currently exports one function.

### `togglePanel(panelObject)`

Flips the visibility of any 3D object — if it's visible, it hides it; if it's hidden, it shows it.

```js
#pragma import (togglePanel)

// Hide a panel that is currently visible, or show one that is hidden
togglePanel(myPanel.mesh);

// Works on any THREE.Object3D, not just GUI panels
togglePanel(scene.getObjectByName("myObject"));
```

**Parameter:**

| Parameter | Type | Description |
|---|---|---|
| `panelObject` | `THREE.Object3D` | Any scene object |

---

## Interactables.js

Finds objects in the scene and organizes them into `Map`s so other scripts can look them up by name.

### What it creates

**`RaycastObjects`** — objects that can be hovered and clicked:

```js
RaycastObjects.get("cube")    // THREE.Object3D
RaycastObjects.get("sphere")  // THREE.Object3D
```

**`ToggleObjects`** — UI panels that can be shown or hidden:

```js
ToggleObjects.get("cubeText")    // THREE.Object3D
ToggleObjects.get("sphereText")  // THREE.Object3D
```

Both panels start **hidden** — `Interactables.js` calls `togglePanel()` on them during initialization.

### How to use the Maps

```js
#pragma import (RaycastObjects, ToggleObjects)

// Get the cube to attach an interactor to it
const cube = RaycastObjects.get("cube");

// Show the panel above the sphere
ToggleObjects.get("sphereText").visible = true;

// Hide it again
ToggleObjects.get("sphereText").visible = false;
```

### Adding your own objects

To make a new object interactable, add it to the scene in your editor, then register it in `Interactables.js`:

```js
const myBox = cast(scene.getObjectByName("myBox"), THREE.Object3D);
RaycastObjects.set("myBox", myBox);
```

---

## MouseRaycast.js

Connects mouse input to the interactable objects. This is the main script for **desktop/browser** interaction.

### Lifecycle functions

This script uses `#pragma lifecycle(startup, update, dispose)` — the engine calls these automatically.

```
startup()  → called once when the scene loads
update()   → called every frame
dispose()  → called when the scene is torn down
```

### How RayInteractor works (from RaycastInteractorObject.js)

`RayInteractor` is the core building block for hover and click detection. You create one per object you want to interact with.

```js
const interactor = new RayInteractor(targetObject);  // pass the 3D object

// Assign callbacks (all optional)
interactor.onEnter = (_hit) => { /* ray just entered the object */ };
interactor.onHover = (_hit) => { /* ray is over the object (every frame) */ };
interactor.onExit  = (_hit) => { /* ray just left the object */ };
interactor.onClick = (_hit) => { /* button was pressed and released on the object */ };

// Call this every frame inside update():
interactor.update(raycast, isPressed, isReleased);
```

The `_hit` parameter passed to callbacks is a Three.js intersection object. The most useful property is `_hit.object` — the actual mesh that was hit.

**Methods:**

| Method | Description |
|---|---|
| `update(raycast, isPressed, isReleased)` | Must be called every frame |
| `reset()` | Clears hover and press state, fires `onExit` if needed |

### How MouseRaycast.js wires it all together

```js
// 1. Create an interactor for the cube
const cubeInteractor = new RayInteractor(RaycastObjects.get("cube"));

// 2. Assign callbacks
cubeInteractor.onEnter = (_hit) => { domElement.style.cursor = 'pointer'; };
cubeInteractor.onExit  = (_hit) => { domElement.style.cursor = 'default'; };
cubeInteractor.onClick = (_hit) => { togglePanel(ToggleObjects.get("cubeText")); };

// 3. In startup(), begin listening for mouse input
function startup() {
    Input.mouse.start();
}

// 4. In update(), cast a ray and feed it to each interactor
function update() {
    const mouseRaycast = Input.mouse.raycast(camera);
    const isPressed    = () => Input.mouse.isButtonPressed(MouseButton.Left);
    const isReleased   = () => Input.mouse.isButtonReleased(MouseButton.Left);

    cubeInteractor.update(mouseRaycast, isPressed, isReleased);
}

// 5. In dispose(), stop input and clean up
function dispose() {
    Input.mouse.stop();
    cubeInteractor.reset();
}
```

### Mouse Input API

| Call | Description |
|---|---|
| `Input.mouse.start()` | Begin capturing mouse events |
| `Input.mouse.stop()` | Stop capturing mouse events |
| `Input.mouse.raycast(camera)` | Returns a raycast object from the current mouse position |
| `Input.mouse.isButtonPressed(MouseButton.Left)` | `true` while the left button is held down |
| `Input.mouse.isButtonReleased(MouseButton.Left)` | `true` the frame the left button is released |

---

## XRRaycast.js

The XR equivalent of `MouseRaycast.js` — connects left and right XR controllers to the interactable objects. Also draws visible ray lines from each controller.

### Ray Line Helpers (from XRRays.js)

```js
// Create a colored ray line and add it to the scene
const leftRay  = makeRayLine(0x0000FF);  // blue
const rightRay = makeRayLine(0xFF0000);  // red

// Update the ray's position/direction every frame
updateRayLine(leftRay, raycast);
```

**`makeRayLine(color, length)`**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `color` | `number` | `0x0000ff` | Hex color for the line |
| `length` | `number` | `15` | Length of the ray in world units |

Returns `{ line, length }` — you pass this object to `updateRayLine` every frame.

**`updateRayLine(rayLine, raycast)`**

Updates the start/end points of the ray line to match the controller's current position and direction. Call this every frame inside `update()`.

### XR Controller Input API

| Call | Description |
|---|---|
| `Input.xr.start()` | Begin listening for XR controller input |
| `Input.xr.stop()` | Stop listening |
| `Input.xr.count()` | Number of active controllers (0, 1, or 2) |
| `Input.xr.raycast(i)` | Raycast data for controller at index `i` |
| `Input.xr.handedness(i)` | `'left'` or `'right'` for controller at index `i` |
| `Input.xr.axes(i)` | Thumbstick axes array for controller `i` |
| `Input.xr.isButtonPressed(i, button)` | `true` while button is held (button `0` = trigger) |
| `Input.xr.isButtonReleased(i, button)` | `true` the frame button is released |

### How XRRaycast.js wires it all together

Each object gets **two** interactors — one for each hand:

```js
// One interactor per hand per object
const leftInteractor  = new RayInteractor(RaycastObjects.get("cube"));
const rightInteractor = new RayInteractor(RaycastObjects.get("cube"));

leftInteractor.onClick = (_hit) => { togglePanel(ToggleObjects.get("cubeText")); };

function startup() {
    Input.xr.start();
    leftRay  = makeRayLine(0x0000FF);
    rightRay = makeRayLine(0xFF0000);
}

function update() {
    if (Input.xr.count() < 1) return;  // no controllers connected, skip

    for (let i = 0; i < Input.xr.count(); i++) {
        const raycast = Input.xr.raycast(i);
        const hand    = Input.xr.handedness(i);

        if (hand === 'left') {
            updateRayLine(leftRay, raycast);
            const lPressed  = () => Input.xr.isButtonPressed(i, 0);
            const lReleased = () => Input.xr.isButtonReleased(i, 0);
            leftInteractor.update(raycast, lPressed, lReleased);
        }
        if (hand === 'right') {
            updateRayLine(rightRay, raycast);
            const rPressed  = () => Input.xr.isButtonPressed(i, 0);
            const rReleased = () => Input.xr.isButtonReleased(i, 0);
            rightInteractor.update(raycast, rPressed, rReleased);
        }
    }
}
```

---

## XRRigMove.js

Moves the player through the scene using the **left thumbstick**. Movement is always relative to where the headset is facing (camera-relative), and stays flat (no flying).

### How it works

```js
const MOVE_SPEED = 2.0;  // units per second

function update(delta) {
    if (Input.xr.count() < 1) return;

    for (let i = 0; i < Input.xr.count(); i++) {
        if (Input.xr.handedness(i) !== 'left') continue;  // only left controller

        const axes    = Input.xr.axes(i);
        const strafe  = axes[2];  // thumbstick left/right → strafe
        const forward = axes[3];  // thumbstick up/down    → walk forward/back

        // Move the rig in the direction the headset is facing
        avatarRig.position.add(_move);
    }
}
```

### Key variables

| Variable | Description |
|---|---|
| `MOVE_SPEED` | How fast the player moves (units per second). Change this to adjust speed. |
| `avatarRig` | The root XR rig object. Moving this moves the whole player. |
| `avatarPOV` | The headset/camera object. Used to get the current facing direction. |
| `delta` | Time in seconds since the last frame. Multiply by speed for frame-rate independent movement. |

### Thumbstick axis layout

| Axis index | Meaning |
|---|---|
| `axes[2]` | Left/right (strafe). Positive = right |
| `axes[3]` | Forward/back. Positive = back |

### Customizing movement speed

At the top of `XRRigMove.js`, change the constant:

```js
const MOVE_SPEED = 2.0;  // increase for faster movement, decrease for slower
```

---

## Quick Reference — Common Patterns

### Show/hide a panel on click

```js
interactor.onClick = (_hit) => {
    togglePanel(ToggleObjects.get("cubeText"));
};
```

### Change an object's color on hover

```js
interactor.onEnter = (_hit) => { _hit.object.material.color.set(0xff6600); };
interactor.onExit  = (_hit) => { _hit.object.material.color.set(0xffffff); };
```

### Update a text label

```js
const label = GUIElements.get("statusLabel");
label.setText("You clicked the cube!");
```

### Add a new interactable object

1. Name the object in your scene editor (e.g. `"myBox"`)
2. In `Interactables.js`, add:
   ```js
   const myBox = cast(scene.getObjectByName("myBox"), THREE.Object3D);
   RaycastObjects.set("myBox", myBox);
   ```
3. In `MouseRaycast.js` or `XRRaycast.js`, create an interactor:
   ```js
   const myBoxInteractor = new RayInteractor(RaycastObjects.get("myBox"));
   myBoxInteractor.onClick = (_hit) => { console.log("myBox clicked!"); };
   // ...and call myBoxInteractor.update(...) in update()
   ```
