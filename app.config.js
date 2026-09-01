export default {
  "expo": {
    "owner": "mustafa11s-team",
    "name": "waypoint-app",
    "slug": "mustafa-khericha",
    "scheme": "waypoint",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.waypoint.app",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.waypoint.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro",
      "output": "server"
    },
    "plugins": [
      [
        "expo-share-intent",
        {
          "ios": {
            "bundleId": "com.waypoint.share"
          }
        }
      ],
      [
        "@rnmapbox/maps",
        {
          "RNMapboxMapsDownloadToken": process.env.MAPBOX_SECRET_TOKEN || "",
          "RNMapboxMapsVersion": "11.4.0"
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "addaeb48-d0d3-4936-9dc0-e8d957da7214"
      }
    }
  }
};
