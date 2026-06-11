{
  "configurations": {
    "android.emu.debug": {
      "binaryPath": "android/app/build/outputs/apk/debug/app-debug.apk",
      "build": "cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug && cd ..",
      "command": {
        "test": "enabled"
      },
      "device": {
        "avdName": "Pixel_4_API_34"
      },
      "artifacts": {
        "plugins": {
          "logcat": {
            "keepOnlyOnFailure": true
          }
        }
      }
    },
    "android.emu.release": {
      "binaryPath": "android/app/build/outputs/apk/release/app-release.apk",
      "build": "cd android && ./gradlew assembleRelease assembleReleaseAndroidTest -DtestBuildType=release && cd ..",
      "command": {
        "test": "enabled"
      },
      "device": {
        "avdName": "Pixel_4_API_34"
      }
    },
    "ios.sim.debug": {
      "binaryPath": "ios/build/Build/Products/Debug-iphonesimulator/SpiceGardenDriver.app",
      "build": "xcodebuild -workspace ios/SpiceGardenDriver.xcworkspace -scheme SpiceGardenDriver -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build",
      "command": {
        "test": "enabled"
      },
      "device": {
        "type": "iPhone 15 Pro Max"
      }
    },
    "ios.sim.release": {
      "binaryPath": "ios/build/Build/Products/Release-iphonesimulator/SpiceGardenDriver.app",
      "build": "xcodebuild -workspace ios/SpiceGardenDriver.xcworkspace -scheme SpiceGardenDriver -configuration Release -sdk iphonesimulator -derivedDataPath ios/build",
      "command": {
        "test": "enabled"
      },
      "device": {
        "type": "iPhone 15 Pro Max"
      }
    }
  }
}