import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import RNBootSplash

import FirebaseCore
import FirebaseMessaging
import PushKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate, MessagingDelegate, PKPushRegistryDelegate
{
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  /// PushKit only delivers while something owns the registry, so keep it here
  /// rather than relying on RNVoipPushNotificationManager's local instance.
  private var voipRegistry: PKPushRegistry?

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

    RNCallKeep.setup([
      "appName": "Alse",
      "maximumCallGroups": "1",
      "maximumCallsPerCallGroup": "1",
      "supportsVideo": true,
    ])
    let registry = PKPushRegistry(queue: .main)
    registry.delegate = self
    registry.desiredPushTypes = [.voIP]
    voipRegistry = registry
    print("[VoIP] PushKit registry created")

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

  // Deep links: alse://user/{id} from share landing / browser.
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    if RNCallKeep.application(app, open: url, options: options) {
      return true
    }
    return RCTLinkingManager.application(app, open: url, options: options)
  }

  func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let callKeepHandled = RNCallKeep.application(
      application,
      continue: userActivity,
      restorationHandler: { objects in
        restorationHandler(objects as? [UIUserActivityRestoring])
      }
    )
    if callKeepHandled {
      return true
    }
    return RCTLinkingManager.application(
      application,
      continue: userActivity,
      restorationHandler: restorationHandler
    )
  }

  func pushRegistry(
    _ registry: PKPushRegistry,
    didUpdate credentials: PKPushCredentials,
    for type: PKPushType
  ) {
    let token = credentials.token.map { String(format: "%02.2hhx", $0) }.joined()
    print("[VoIP] didUpdatePushCredentials token=\(token)")
    RNVoipPushNotificationManager.didUpdate(
      credentials,
      forType: type.rawValue
    )
  }

  func pushRegistry(
    _ registry: PKPushRegistry,
    didInvalidatePushTokenFor type: PKPushType
  ) {}

  func pushRegistry(
    _ registry: PKPushRegistry,
    didReceiveIncomingPushWith payload: PKPushPayload,
    for type: PKPushType,
    completion: @escaping () -> Void
  ) {
    let data = payload.dictionaryPayload
    let uuid = (data["uuid"] as? String)
      ?? (data["call_id"] as? String)
      ?? UUID().uuidString
    let notificationType = (
      (data["notification_type"] as? String) ?? (data["type"] as? String) ?? ""
    ).lowercased()
    let callerName = (data["name"] as? String)
      ?? (data["callerName"] as? String)
      ?? "Incoming Call"
    let handle = (data["handle"] as? String)
      ?? (data["caller_id"] as? String)
      ?? "alse"
    let callType = (
      (data["call_type"] as? String) ?? (data["callType"] as? String) ?? "video"
    ).lowercased()
    let hasVideo = callType != "audio"

    // JS releases this via VoipPushNotification.onVoipNotificationCompleted.
    // PushKit's completion must run exactly once, so CallKeep gets nil below.
    RNVoipPushNotificationManager.addCompletionHandler(uuid, completionHandler: completion)
    RNVoipPushNotificationManager.didReceiveIncomingPush(with: payload, forType: type.rawValue)

    RNCallKeep.reportNewIncomingCall(
      uuid,
      handle: handle,
      handleType: "generic",
      hasVideo: hasVideo,
      localizedCallerName: callerName,
      supportsHolding: true,
      supportsDTMF: true,
      supportsGrouping: false,
      supportsUngrouping: false,
      fromPushKit: true,
      payload: data,
      withCompletionHandler: nil
    )

    if notificationType == "call_cancelled" || notificationType == "call_cancel" {
      RNCallKeep.endCall(withUUID: uuid, reason: 2)
    }
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
