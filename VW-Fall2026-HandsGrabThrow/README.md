# Hands: Grab & Throw a Cube

A minimal XR Interaction Toolkit example: use **your hands** (or controllers) to pick up a red cube and throw it at a stack of boxes.

- **Unity:** 6000.6.0f1 (URP)
- **Headset:** Meta Quest 3
- **Uses only Unity packages.** We do not use any Meta SDK packages (no Meta XR Core SDK, no Oculus XR Plugin, no Unity OpenXR: Meta).

| Package | Version | Why |
|---|---|---|
| XR Interaction Toolkit | 3.6.0 | Grab interactable, XR Origin rig, hand interactors, simulator |
| XR Hands | 1.9.0 | Reads hand joint data from the headset |
| OpenXR Plugin | 1.18.0 | Talks to the Quest (includes the **Meta Quest Support** feature) |
| XR Plug-in Management | 4.7.0 | Starts XR when you press Play / launch the app |

---

## Open the scene

Open **Assets/Scenes/GrabAndThrow.unity**.

| Object | What it is |
|---|---|
| `XR Origin Hands (XR Rig)` | The player: camera + tracked hands + controllers (from the *Hands Interaction Demo* sample) |
| `Grab Cube` | **Rigidbody** + **XR Grab Interactable** + `RespawnIfDropped` |
| `Table`, `Floor` | Plain cubes/planes with colliders |
| `Targets` | Boxes with Rigidbodies to knock over |

### What makes the cube throwable

Select **Grab Cube** and look at **XR Grab Interactable**:

- **Movement Type = Velocity Tracking.** The cube is moved by physics velocity, so it keeps its speed when you let go.
- **Throw On Detach = on.** When released, the cube gets your hand's velocity.
- **Use Dynamic Attach = on.** The cube is held where you grabbed it instead of snapping to your palm.

It needs a **Rigidbody** and a **Collider**, and that's it.

---

## Three ways to test

### 1. XR Interaction Simulator (no headset)

The simulator is turned on in this project. Press **Play** and a small control panel appears in the Game view.

| Key | Action |
|---|---|
| **[** / **]** | Control the left / right device. **Press the same key again to switch between Controller and Hand** |
| **Tab** | Cycle what you control: both hands, left, right, head |
| **H** | Control the head |
| **W A S D**, **Q / E** | Move forward/left/back/right, down/up |
| **Right mouse (hold) + move** | Rotate the selected device |
| **R** | Reset positions |
| **K** | Hand **Grab** pose (use this to pick up the cube) |
| **M** / **N** / **L** / **P** / **O** | Pinch / Poke / Thumb / Fist / Open hand poses |

Bindings come from `XR Interaction Simulator Controls` and `XR Interaction Hand Controls` in the simulator sample folder. The on-screen panel also lists them.

**To grab with hands:** the simulator starts in *controller* mode. Press **]** to select the right device, then press **]** again to turn it into a **hand**. Move it to the cube with **WASD/QE**, press **K** to grab, and press **O** to release.
Throwing with a mouse is awkward. The simulator is best for checking that **grab works**. Test throwing on the headset.

### 2. Quest Link / Air Link (play in Editor with real hands, **recommended**)

1. Install the **Meta Quest Link** PC app (desktop software only, not a Unity package).
2. In the Link app: **Settings → Beta → Developer runtime features** and **Hand tracking over Link**: ON. Also set Meta Quest Link as the **active OpenXR runtime** (Settings → General).
3. In Unity: **Virtual Worlds → Simulator → Disable XR Interaction Simulator (use Quest Link)**. Otherwise the simulator fights the headset.
4. Put on the headset, connect Link, then press **Play** in Unity.

Turn the simulator back on with **Virtual Worlds → Simulator → Enable XR Interaction Simulator**.

### 3. Build to the Quest 3

1. **File → Build Profiles → Android → Switch Platform** (first time takes a while).
2. Put the Quest in **Developer Mode** and plug it in over USB.
3. **Edit → Project Settings → XR Plug-in Management → Project Validation**: click **Fix All** if anything is listed.
4. **Build And Run**.
5. On the headset, make sure **Settings → Movement Tracking → Hand and body tracking** is on.

---

## How the project was configured

These steps are already done. To redo them, use the **Virtual Worlds → Setup** menu, which runs `Assets/Editor/HandsGrabThrowSetup.cs`. To do it by hand in a new project:

1. **Package Manager**: install *XR Interaction Toolkit* and *XR Hands*.
2. In the *XR Interaction Toolkit* package → **Samples**, import: **Starter Assets**, **XR Interaction Simulator**, **Hands Interaction Demo**.
3. **Project Settings → XR Plug-in Management**:
   - **Windows tab:** check **OpenXR**.
   - **Android tab:** check **OpenXR**.
4. **XR Plug-in Management → OpenXR**, on **both** the Windows and Android tabs:
   - Interaction Profiles: **Hand Interaction Profile**, **Oculus Touch Controller Profile**, **Meta Quest Touch Plus Controller Profile**
   - Features: **Hand Tracking Subsystem**, **Meta Hand Tracking Aim**
   - Android only: **Meta Quest Support**
5. **XR Plug-in Management → XR Interaction Toolkit**: check **Use XR Interaction Simulator in scenes**.
6. **Player Settings (Android)**: IL2CPP, ARM64, Minimum API Level 32, Graphics API Vulkan.
7. Drag **Samples/XR Interaction Toolkit/3.6.0/Hands Interaction Demo/Prefabs/XR Origin Hands (XR Rig)** into the scene and delete the Main Camera.
8. Make a cube, add **Rigidbody** + **XR Grab Interactable**, set Movement Type to **Velocity Tracking**.

> ⚠️ Don't enable **Microsoft Hand Interaction Profile**. It's for HoloLens and isn't needed for Quest.

---

## Try it yourself

1. Add a second grabbable object (a sphere). What's the minimum you have to add?
2. Change the cube's **Rigidbody → Mass** to 5. How does throwing feel?
3. Change **Movement Type** to **Instantaneous**. Can you still throw? Why not?
4. Turn **Throw On Detach** off. What happens when you let go?
5. Write a script that counts how many target boxes have fallen over.
