using UnityEngine;
using UnityEngine.XR.Interaction.Toolkit;
using UnityEngine.XR.Interaction.Toolkit.Interactables;

public class ChangeSkybox : MonoBehaviour
{
    // Start is called once before the first execution of Update after the MonoBehaviour is created
    [SerializeField] Material iceCave;
    [SerializeField] Material eml;
    [SerializeField] XRSimpleInteractable interactable;

    bool materialChanged = false;
    void Start()
    {
        RenderSettings.skybox = eml;
        //XRSimpleInteractable interactable = GetComponent<XRSimpleInteractable>();
        interactable.selectExited.AddListener((SelectExitEventArgs args) => {
            ChangeMaterial();
        });
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public void ChangeMaterial()
    {
        if (!materialChanged)
        {
            RenderSettings.skybox = iceCave;
            materialChanged = true;
        }
        else
        {
            RenderSettings.skybox = eml;
            materialChanged = false;
        }
    }
}
