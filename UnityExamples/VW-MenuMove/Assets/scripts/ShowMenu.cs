using UnityEngine;
using UnityEngine.InputSystem;


public class ShowMenu : MonoBehaviour
{
    // Start is called once before the first execution of Update after the MonoBehaviour is created
        public InputActionProperty inputAction;
        [SerializeField] GameObject menu;
        bool menuToggle = false;

    void Start()
    {
        menu.SetActive(menuToggle);
    }

    // Update is called once per frame
    void Update()
    {
        if(inputAction.action.WasPressedThisFrame()){
            if(menuToggle == true){
                menuToggle = false;
            } else {
                menuToggle = true;
            }
            menu.SetActive(menuToggle);
        }

    }
}
