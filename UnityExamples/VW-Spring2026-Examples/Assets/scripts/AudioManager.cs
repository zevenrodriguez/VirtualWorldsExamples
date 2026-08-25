using UnityEngine;

public class AudioManager : MonoBehaviour
{
    AudioSource audioSource;
    [SerializeField] AudioClip good;
    [SerializeField] AudioClip bad;

    void Start()
    {
        audioSource = GetComponent<AudioSource>();
    }

    // Update is called once per frame
    void Update()
    {

    }

    public void playClip(string clip)
    {
        if (clip == "good")
        {
            audioSource.clip = good;
            audioSource.Play();
        } else if (clip == "bad") {
            audioSource.clip = bad;
            audioSource.Play();
        }
    }
}