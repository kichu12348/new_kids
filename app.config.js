module.exports = {
  name: "Kids Art Studio",
  slug: "kid_raw_new",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  scheme: "kidraw",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.zenturiotech.kidraw",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.zenturiotech.kidraw",
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  // plugins: [
  //   [
  //     "react-native-fast-tflite",
  //     {
  //       "enableCoreMLDelegate": true,
  //       "enableAndroidGpuLibraries": true
  //     }
  //   ]
  // ],
  extra: {
    eas: {
      projectId: "34036a49-01c7-487e-8c70-e71c0721e9c7",
    },
  },
};
