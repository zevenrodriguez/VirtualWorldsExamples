using UnityEngine;
using UnityEngine.XR.Interaction.Toolkit;
using UnityEngine.XR.Interaction.Toolkit.Interactables;

public class MovePosition : MonoBehaviour
{
    // Start is called once before the first execution of Update after the MonoBehaviour is created
    [SerializeField] Transform positionObject;
    [SerializeField] Transform origin;
    void Start()
    {
        XRSimpleInteractable pOInteractable = GetComponent<XRSimpleInteractable>();
       //messagePrint.selectEntered.AddListener(PrintMessage);
       pOInteractable.selectEntered.AddListener((SelectEnterEventArgs arg)=>{
        Debug.Log("move position");
         origin.position = positionObject.position;
        });

    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
