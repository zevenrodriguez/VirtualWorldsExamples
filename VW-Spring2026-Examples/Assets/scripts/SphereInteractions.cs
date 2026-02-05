using UnityEngine;
using UnityEngine.XR.Interaction.Toolkit;
using UnityEngine.XR.Interaction.Toolkit.Interactables;
using TMPro;

public class SphereInteractions : MonoBehaviour
{
    // Start is called once before the first execution of Update after the MonoBehaviour is created
    /* multi
    line
    comments*/

    [SerializeField] TMP_Text counterText;
    [SerializeField] Material red;
    int counter = 0;
    void Start()
    {
        Debug.Log("SphereInteractions script has started.");
        XRSimpleInteractable interactable = GetComponent<XRSimpleInteractable>();
        interactable.selectEntered.AddListener(PrintMessage);
        interactable.selectExited.AddListener((SelectExitEventArgs args) =>
        {
            Debug.Log("Sphere has been deselected!");
        });
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    void PrintMessage(SelectEnterEventArgs arg)
    {
        Debug.Log("Sphere has been selected!");
        counter = counter + 1;
        counterText.text = counter.ToString();
        if(counter > 10 && counter < 20)
        {
            GetComponent<Renderer>().material = red;
        }else if(counter >= 20)
        {
            //gameObject.SetActive(false);
            //GetComponent<Collider>().enabled = false;
            GetComponent<Rigidbody>().AddForce(Vector3.forward * 500);
        }
    }
}
