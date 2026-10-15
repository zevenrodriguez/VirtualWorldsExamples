using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.PackageManager.UI;
using UnityEditor.SceneManagement;
using UnityEditor.XR.Management;
using UnityEditor.XR.Management.Metadata;
using UnityEditor.XR.OpenXR.Features;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.XR.Interaction.Toolkit.Interactables;
using UnityEngine.XR.Management;
using UnityEngine.XR.OpenXR;

namespace VirtualWorlds.EditorTools
{
    /// <summary>
    /// One-time project setup for the Hands Grab & Throw example.
    /// Everything here can also be done by hand - see README.md for the manual steps.
    ///
    /// Menu: Virtual Worlds > Setup > ...
    /// </summary>
    public static class HandsGrabThrowSetup
    {
        const string k_XRIPackage = "com.unity.xr.interaction.toolkit";
        const string k_ScenePath = "Assets/Scenes/GrabAndThrow.unity";
        const string k_MaterialsFolder = "Assets/Materials";

        // OpenXR features we turn on. All of these ship with Unity's own packages
        // (com.unity.xr.openxr and com.unity.xr.hands) - no Meta SDK required.
        static readonly string[] k_CommonFeatures =
        {
            // Note: XR Hands uses "...handtrackingsubsystem". The older "...input.handtracking" ID
            // belongs to the Microsoft Hand Interaction profile, which we do NOT want.
            "com.unity.openxr.feature.input.handtrackingsubsystem", // XR Hands: Hand Tracking Subsystem
            "com.unity.openxr.feature.input.metahandtrackingaim",  // XR Hands: Meta Hand Tracking Aim (pinch/aim pose)
            "com.unity.openxr.feature.input.handinteraction",      // Hand Interaction Profile
            "com.unity.openxr.feature.input.oculustouch",          // Oculus Touch Controller Profile (controllers still work)
            "com.unity.openxr.feature.input.metaquestplus",        // Meta Quest Touch Plus Controller Profile (Quest 3 controllers)
        };

        static readonly string[] k_AndroidOnlyFeatures =
        {
            "com.unity.openxr.feature.metaquest",                  // Meta Quest Support (part of Unity's OpenXR plugin)
        };

        [MenuItem("Virtual Worlds/Setup/1. Import XR Samples", priority = 1)]
        public static void ImportSamples()
        {
            // Order matters: Hands Interaction Demo depends on Starter Assets.
            ImportSample(k_XRIPackage, "Starter Assets");
            ImportSample(k_XRIPackage, "XR Interaction Simulator");
            ImportSample(k_XRIPackage, "Hands Interaction Demo");
            AssetDatabase.Refresh();
            Debug.Log("[VW Setup] Samples imported. Wait for scripts to compile, then run step 2.");
        }

        [MenuItem("Virtual Worlds/Setup/2. Configure OpenXR for Quest + Hands", priority = 2)]
        public static void ConfigureXR()
        {
            ConfigureXRForTarget(BuildTargetGroup.Standalone); // Play mode in the Editor / Quest Link
            ConfigureXRForTarget(BuildTargetGroup.Android);    // Standalone Quest 3 build
            ConfigureAndroidPlayerSettings();
            ConfigureSimulator(true);
            AssetDatabase.SaveAssets();
            Debug.Log("[VW Setup] OpenXR configured for Windows (Link) and Android (Quest).");
        }

        [MenuItem("Virtual Worlds/Setup/3. Build Grab And Throw Scene", priority = 3)]
        public static void BuildScene()
        {
            var rigPrefab = FindPrefab("XR Origin Hands (XR Rig)");
            if (rigPrefab == null)
            {
                Debug.LogError("[VW Setup] Could not find 'XR Origin Hands (XR Rig)' prefab. Run step 1 first.");
                return;
            }

            var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);

            // The XR rig brings its own camera, so remove the default one.
            var defaultCamera = GameObject.Find("Main Camera");
            if (defaultCamera != null)
                UnityEngine.Object.DestroyImmediate(defaultCamera);

            // Player rig (head + tracked hands + controllers).
            var rig = (GameObject)PrefabUtility.InstantiatePrefab(rigPrefab);
            rig.transform.position = Vector3.zero;

            var floorMat = CreateMaterial("Floor", new Color(0.35f, 0.38f, 0.42f));
            var tableMat = CreateMaterial("Table", new Color(0.55f, 0.4f, 0.25f));
            var cubeMat = CreateMaterial("GrabCube", new Color(0.9f, 0.2f, 0.2f));
            var targetMat = CreateMaterial("Target", new Color(0.95f, 0.8f, 0.2f));

            // Floor: a Plane is 10 x 10 meters at scale 1.
            var floor = GameObject.CreatePrimitive(PrimitiveType.Plane);
            floor.name = "Floor";
            floor.transform.localScale = new Vector3(3f, 1f, 3f);
            floor.GetComponent<Renderer>().sharedMaterial = floorMat;

            // Table in front of the player (Unity units are meters).
            var table = GameObject.CreatePrimitive(PrimitiveType.Cube);
            table.name = "Table";
            table.transform.position = new Vector3(0f, 0.4f, 0.6f);
            table.transform.localScale = new Vector3(1.2f, 0.8f, 0.6f);
            table.GetComponent<Renderer>().sharedMaterial = tableMat;

            // The cube you can grab and throw.
            var cube = GameObject.CreatePrimitive(PrimitiveType.Cube);
            cube.name = "Grab Cube";
            cube.transform.position = new Vector3(0f, 0.85f, 0.5f);
            cube.transform.localScale = Vector3.one * 0.08f;
            cube.GetComponent<Renderer>().sharedMaterial = cubeMat;

            var body = cube.AddComponent<Rigidbody>();
            body.mass = 0.5f;
            body.interpolation = RigidbodyInterpolation.Interpolate;
            body.collisionDetectionMode = CollisionDetectionMode.ContinuousDynamic;

            var grab = cube.AddComponent<XRGrabInteractable>();
            grab.movementType = XRBaseInteractable.MovementType.VelocityTracking;
            grab.throwOnDetach = true;
            grab.useDynamicAttach = true; // hold the cube where your hand touched it

            cube.AddComponent<RespawnIfDropped>();

            // A small stack of boxes to throw at.
            var targets = new GameObject("Targets");
            targets.transform.position = new Vector3(0f, 0f, 3f);
            for (var row = 0; row < 3; row++)
            {
                for (var col = 0; col < 3 - row; col++)
                {
                    var box = GameObject.CreatePrimitive(PrimitiveType.Cube);
                    box.name = $"Target {row}-{col}";
                    box.transform.SetParent(targets.transform, false);
                    box.transform.localScale = Vector3.one * 0.25f;
                    box.transform.localPosition = new Vector3((col - (2 - row) * 0.5f) * 0.27f, 0.125f + row * 0.25f, 0f);
                    box.GetComponent<Renderer>().sharedMaterial = targetMat;
                    box.AddComponent<Rigidbody>().mass = 0.3f;
                }
            }

            Directory.CreateDirectory(Path.GetDirectoryName(k_ScenePath));
            EditorSceneManager.SaveScene(scene, k_ScenePath);
            EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(k_ScenePath, true) };
            Debug.Log($"[VW Setup] Saved {k_ScenePath} and set it as the only scene in Build Settings.");
        }

        [MenuItem("Virtual Worlds/Simulator/Enable XR Interaction Simulator", priority = 20)]
        public static void EnableSimulator() => ConfigureSimulator(true);

        [MenuItem("Virtual Worlds/Simulator/Disable XR Interaction Simulator (use Quest Link)", priority = 21)]
        public static void DisableSimulator() => ConfigureSimulator(false);

        // ---- Batch mode entry points (used to generate this project from the command line) ----

        public static void BatchImportSamples()
        {
            ImportSamples();
        }

        public static void BatchConfigureAndBuild()
        {
            ConfigureXR();
            BuildScene();
            AssetDatabase.SaveAssets();
        }

        // ---- Helpers ----

        static void ImportSample(string packageName, string displayName)
        {
            var sample = Sample.FindByPackage(packageName, string.Empty)
                .FirstOrDefault(s => s.displayName == displayName);

            if (string.IsNullOrEmpty(sample.displayName))
            {
                Debug.LogError($"[VW Setup] Sample '{displayName}' not found in {packageName}.");
                return;
            }

            if (sample.isImported)
            {
                Debug.Log($"[VW Setup] Sample '{displayName}' already imported.");
                return;
            }

            sample.Import(Sample.ImportOptions.HideImportWindow | Sample.ImportOptions.OverridePreviousImports);
            Debug.Log($"[VW Setup] Imported sample '{displayName}'.");
        }

        static void ConfigureXRForTarget(BuildTargetGroup group)
        {
            var perTarget = GetOrCreateXRSettings();
            if (!perTarget.HasManagerSettingsForBuildTarget(group))
                perTarget.CreateDefaultManagerSettingsForBuildTarget(group);

            var generalSettings = perTarget.SettingsForBuildTarget(group);
            generalSettings.InitManagerOnStart = true;

            var manager = perTarget.ManagerSettingsForBuildTarget(group);
            XRPackageMetadataStore.AssignLoader(manager, typeof(OpenXRLoader).FullName, group);

            FeatureHelpers.RefreshFeatures(group);
            var featureIds = group == BuildTargetGroup.Android
                ? k_CommonFeatures.Concat(k_AndroidOnlyFeatures).ToArray()
                : k_CommonFeatures;

            foreach (var id in featureIds)
            {
                var feature = FeatureHelpers.GetFeatureWithIdForBuildTarget(group, id);
                if (feature == null)
                {
                    Debug.LogWarning($"[VW Setup] OpenXR feature '{id}' not found for {group}.");
                    continue;
                }

                feature.enabled = true;
                EditorUtility.SetDirty(feature);
            }

            var openXRSettings = OpenXRSettings.GetSettingsForBuildTargetGroup(group);
            if (openXRSettings != null)
            {
                // HoloLens-only profile; it shares an ID with XR Hands' old feature ID, so make sure it is off.
                var microsoftHands = openXRSettings.GetFeature<UnityEngine.XR.OpenXR.Features.Interactions.MicrosoftHandInteraction>();
                if (microsoftHands != null)
                {
                    microsoftHands.enabled = false;
                    EditorUtility.SetDirty(microsoftHands);
                }

                // Quest uses the "Depth 16 bit" + "Multiview" defaults fine; just make sure the
                // render mode is single pass instanced/multiview for performance.
                openXRSettings.renderMode = OpenXRSettings.RenderMode.SinglePassInstanced;
                EditorUtility.SetDirty(openXRSettings);
            }
        }

        static XRGeneralSettingsPerBuildTarget GetOrCreateXRSettings()
        {
            EditorBuildSettings.TryGetConfigObject(XRGeneralSettings.settingsKey, out XRGeneralSettingsPerBuildTarget settings);
            if (settings != null)
                return settings;

            var guid = AssetDatabase.FindAssets("t:XRGeneralSettingsPerBuildTarget").FirstOrDefault();
            if (guid != null)
                settings = AssetDatabase.LoadAssetAtPath<XRGeneralSettingsPerBuildTarget>(AssetDatabase.GUIDToAssetPath(guid));

            if (settings == null)
            {
                Directory.CreateDirectory("Assets/XR");
                settings = ScriptableObject.CreateInstance<XRGeneralSettingsPerBuildTarget>();
                AssetDatabase.CreateAsset(settings, "Assets/XR/XRGeneralSettingsPerBuildTarget.asset");
                AssetDatabase.SaveAssets();
            }

            EditorBuildSettings.AddConfigObject(XRGeneralSettings.settingsKey, settings, true);
            return settings;
        }

        static void ConfigureAndroidPlayerSettings()
        {
            var android = NamedBuildTarget.Android;
            PlayerSettings.SetScriptingBackend(android, ScriptingImplementation.IL2CPP);
            PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARM64;
            PlayerSettings.Android.minSdkVersion = (AndroidSdkVersions)32; // Quest 3 requires API 32+
            PlayerSettings.SetUseDefaultGraphicsAPIs(BuildTarget.Android, false);
            PlayerSettings.SetGraphicsAPIs(BuildTarget.Android, new[] { GraphicsDeviceType.Vulkan });
            PlayerSettings.colorSpace = ColorSpace.Linear;
            PlayerSettings.productName = "VW Hands Grab Throw";
            PlayerSettings.SetApplicationIdentifier(android, "edu.miami.virtualworlds.handsgrabthrow");
        }

        /// <summary>
        /// The XR Interaction Simulator lets you test hands with keyboard + mouse in Play mode.
        /// Turn it OFF when testing with a real Quest over Link, or the simulator will fight the headset.
        /// </summary>
        static void ConfigureSimulator(bool enabled)
        {
            // XRDeviceSimulatorSettings is internal to XRI, so we edit it through its serialized fields
            // (same as ticking the box in Project Settings > XR Plug-in Management > XR Interaction Toolkit).
            var settingsType = Type.GetType(
                "UnityEngine.XR.Interaction.Toolkit.Inputs.Simulation.XRDeviceSimulatorSettings, Unity.XR.Interaction.Toolkit");
            var instance = settingsType?.GetProperty("Instance",
                System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static |
                System.Reflection.BindingFlags.FlattenHierarchy)?.GetValue(null) as ScriptableObject;

            if (instance == null)
            {
                Debug.LogWarning("[VW Setup] Could not find XR Interaction Simulator settings. " +
                    "Set it in Project Settings > XR Plug-in Management > XR Interaction Toolkit.");
                return;
            }

            var so = new SerializedObject(instance);
            so.FindProperty("m_AutomaticallyInstantiateSimulatorPrefab").boolValue = enabled;
            so.FindProperty("m_AutomaticallyInstantiateInEditorOnly").boolValue = true;
            so.FindProperty("m_UseClassic").boolValue = false;

            var simulatorPrefab = FindPrefab("XR Interaction Simulator");
            if (simulatorPrefab != null)
                so.FindProperty("m_SimulatorPrefab").objectReferenceValue = simulatorPrefab;

            so.ApplyModifiedPropertiesWithoutUndo();
            EditorUtility.SetDirty(instance);
            AssetDatabase.SaveAssets();
            Debug.Log($"[VW Setup] XR Interaction Simulator {(enabled ? "ENABLED" : "DISABLED")}.");
        }

        static GameObject FindPrefab(string name)
        {
            foreach (var guid in AssetDatabase.FindAssets($"\"{name}\" t:Prefab", new[] { "Assets/Samples" }))
            {
                var path = AssetDatabase.GUIDToAssetPath(guid);
                if (Path.GetFileNameWithoutExtension(path) == name)
                    return AssetDatabase.LoadAssetAtPath<GameObject>(path);
            }

            return null;
        }

        static Material CreateMaterial(string name, Color color)
        {
            Directory.CreateDirectory(k_MaterialsFolder);
            var path = $"{k_MaterialsFolder}/{name}.mat";
            var existing = AssetDatabase.LoadAssetAtPath<Material>(path);
            if (existing != null)
                return existing;

            var mat = new Material(Shader.Find("Universal Render Pipeline/Lit"));
            mat.SetColor("_BaseColor", color);
            AssetDatabase.CreateAsset(mat, path);
            return mat;
        }
    }
}
