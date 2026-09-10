using UnityEngine;

public class teleportIsland : MonoBehaviour
{
    [SerializeField] Transform XRRig;
    [SerializeField] Transform teleportLocation;
    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public void teleport()
    {
        XRRig.position = teleportLocation.position;
    }
}
