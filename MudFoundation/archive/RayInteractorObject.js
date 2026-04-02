
/**
 * RayInteractor as a stateful object.
 * Instead of passing state (hoverState, callbacks) into a function every frame,
 * you construct one instance per target object and call update() each frame.
 *
 * Usage:
 *   const interactor = new RayInteractor(targetObject);
 *   interactor.onEnter = (hit) => { ... };
 *   interactor.onHover = (hit) => { ... };
 *   interactor.onExit  = (hit) => { ... };
 *   interactor.onClick = (hit) => { ... };
 *
 *   // In your update loop:
 *   interactor.update(raycast, isPressed, isReleased);
 */
function RayInteractor(targetObject) {
    this.targetObject = targetObject;

    // Callbacks — assign these after construction
    this.onEnter = () => {};
    this.onHover = () => {};
    this.onExit  = () => {};
    this.onClick = () => {};

    // Internal state
    this._currentHit     = null;
    this._triggerPressed = false;
}

/**
 * Call once per frame.
 * @param {RaycastOutput} raycast   - The raycast data (has .raycaster)
 * @param {Function}      isPressed  - () => boolean, true while button is held
 * @param {Function}      isReleased - () => boolean, true the frame button is released
 */
RayInteractor.prototype.update = function(raycast, isPressed, isReleased) {
    const hits = raycast.raycaster.intersectObject(this.targetObject, true);
    const isHitting  = hits.length > 0;
    const currentHit = isHitting ? hits[0] : null;
    const wasHitting = this._currentHit !== null;

    if (isHitting && !wasHitting) {
        this.onEnter(currentHit);
    }

    if (isHitting) {
        this.onHover(currentHit);

        if (isPressed() && !this._triggerPressed) {
            this._triggerPressed = true;
        }

        if (isReleased() && this._triggerPressed) {
            this.onClick(currentHit);
            this._triggerPressed = false;
        }
    }

    if (!isHitting && wasHitting) {
        this.onExit(this._currentHit);
        this._triggerPressed = false;
    }

    this._currentHit = currentHit;
};

/** Manually reset hover and press state (e.g. when the object is disabled). */
RayInteractor.prototype.reset = function() {
    if (this._currentHit !== null) {
        this.onExit(this._currentHit);
    }
    this._currentHit     = null;
    this._triggerPressed = false;
};

#pragma export (RayInteractor);
