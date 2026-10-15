using UnityEngine;

/// <summary>
/// Puts an object back where it started if it falls too low (e.g. thrown off the floor)
/// so students never lose the cube.
/// </summary>
public class RespawnIfDropped : MonoBehaviour
{
    [Tooltip("If the object falls below this height (meters), it is sent back to its start position.")]
    public float minHeight = -2f;

    Vector3 startPosition;
    Quaternion startRotation;
    Rigidbody body;

    void Start()
    {
        startPosition = transform.position;
        startRotation = transform.rotation;
        body = GetComponent<Rigidbody>();
    }

    void Update()
    {
        if (transform.position.y < minHeight)
            Respawn();
    }

    public void Respawn()
    {
        transform.SetPositionAndRotation(startPosition, startRotation);

        if (body != null)
        {
            body.linearVelocity = Vector3.zero;
            body.angularVelocity = Vector3.zero;
        }
    }
}
