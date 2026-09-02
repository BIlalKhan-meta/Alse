import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import RNBootSplash

import FirebaseCore
import FirebaseMessaging

@main
class AppDelegate: UIResponder, UIApplicationDelegate, MessagingDelegate
{
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    FirebaseApp.configure()

    // Do NOT set UNUserNotificationCenter.delegate here.
    // Owning the center swallows taps so RN Firebase / Notifee never receive
    // onNotificationOpenedApp / getInitialNotification. Foreground banners are
    // shown via Notifee from JS (messaging().onMessage).
    Messaging.messaging().delegate = self

    // Register with APNs early so FCM can map the device token.
    application.registerForRemoteNotifications()

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "Alenga",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    #if DEBUG
      Messaging.messaging().setAPNSToken(deviceToken, type: .sandbox)
    #else
      Messaging.messaging().setAPNSToken(deviceToken, type: .prod)
    #endif

    let tokenParts = deviceToken.map { String(format: "%02.2hhx", $0) }
    print("[APNs] didRegisterForRemoteNotifications token=\(tokenParts.joined())")
  }

  func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {
    print("[APNs] didFailToRegisterForRemoteNotifications error=\(error.localizedDescription)")
  }

  func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
    print("[FCM] MessagingDelegate token=\(fcmToken ?? "nil")")
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
    #if DEBUG
      RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
      Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }

  // Keep LaunchScreen visible until JS calls BootSplash.hide (avoids white gap while Metro loads).
  override func customize(_ rootView: RCTRootView) {
    super.customize(rootView)
    RNBootSplash.initWithStoryboard("LaunchScreen", rootView: rootView)
  }
}
