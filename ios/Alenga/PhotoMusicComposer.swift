import Foundation
import AVFoundation

@objc(PhotoMusicComposer)
class PhotoMusicComposer: NSObject {

  @objc static func requiresMainQueueSetup() -> Bool {
    false
  }

  private func stripScheme(_ path: String) -> String {
    if path.hasPrefix("file://"), let url = URL(string: path) {
      return url.path
    }
    return path
  }

  @objc(trimAudioClip:startMs:endMs:resolver:rejecter:)
  func trimAudioClip(
    _ inputPath: String,
    startMs: NSNumber,
    endMs: NSNumber,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    let path = stripScheme(inputPath)
    let inputURL = URL(fileURLWithPath: path)
    let asset = AVURLAsset(url: inputURL)

    guard let exportSession = AVAssetExportSession(
      asset: asset,
      presetName: AVAssetExportPresetAppleM4A
    ) else {
      reject("TRIM_AUDIO_FAILED", "Could not create audio export session", nil)
      return
    }

    let start = CMTimeMakeWithSeconds(startMs.doubleValue / 1000.0, preferredTimescale: 1000)
    let end = CMTimeMakeWithSeconds(endMs.doubleValue / 1000.0, preferredTimescale: 1000)
    exportSession.timeRange = CMTimeRange(start: start, end: end)

    let outputURL = URL(fileURLWithPath: NSTemporaryDirectory())
      .appendingPathComponent("photo_music_audio_\(Int(Date().timeIntervalSince1970)).m4a")
    try? FileManager.default.removeItem(at: outputURL)

    exportSession.outputURL = outputURL
    exportSession.outputFileType = .m4a

    exportSession.exportAsynchronously {
      DispatchQueue.main.async {
        switch exportSession.status {
        case .completed:
          resolve(outputURL.absoluteString)
        case .failed, .cancelled:
          reject(
            "TRIM_AUDIO_FAILED",
            exportSession.error?.localizedDescription ?? "Audio trim failed",
            exportSession.error
          )
        default:
          reject("TRIM_AUDIO_FAILED", "Unexpected audio export status", nil)
        }
      }
    }
  }

  @objc(muxVideoWithAudio:audioPath:resolver:rejecter:)
  func muxVideoWithAudio(
    _ videoPath: String,
    audioPath: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    let videoURL = URL(fileURLWithPath: stripScheme(videoPath))
    let audioURL = URL(fileURLWithPath: stripScheme(audioPath))
    let videoAsset = AVURLAsset(url: videoURL)
    let audioAsset = AVURLAsset(url: audioURL)

    let composition = AVMutableComposition()
    var insertError: NSError?

    if let videoTrack = videoAsset.tracks(withMediaType: .video).first,
       let compositionVideoTrack = composition.addMutableTrack(
         withMediaType: .video,
         preferredTrackID: kCMPersistentTrackID_Invalid
       ) {
      try? compositionVideoTrack.insertTimeRange(
        CMTimeRange(start: .zero, duration: videoAsset.duration),
        of: videoTrack,
        at: .zero
      )
    } else {
      reject("MUX_FAILED", "No video track found", nil)
      return
    }

    if let audioTrack = audioAsset.tracks(withMediaType: .audio).first,
       let compositionAudioTrack = composition.addMutableTrack(
         withMediaType: .audio,
         preferredTrackID: kCMPersistentTrackID_Invalid
       ) {
      do {
        try compositionAudioTrack.insertTimeRange(
          CMTimeRange(start: .zero, duration: videoAsset.duration),
          of: audioTrack,
          at: .zero
        )
      } catch {
        insertError = error as NSError
      }
    }

    if let insertError {
      reject("MUX_FAILED", insertError.localizedDescription, insertError)
      return
    }

    let outputURL = URL(fileURLWithPath: NSTemporaryDirectory())
      .appendingPathComponent("photo_music_\(Int(Date().timeIntervalSince1970)).mp4")
    try? FileManager.default.removeItem(at: outputURL)

    guard let exportSession = AVAssetExportSession(
      asset: composition,
      presetName: AVAssetExportPresetHighestQuality
    ) else {
      reject("MUX_FAILED", "Could not create video export session", nil)
      return
    }

    exportSession.outputURL = outputURL
    exportSession.outputFileType = .mp4

    exportSession.exportAsynchronously {
      DispatchQueue.main.async {
        switch exportSession.status {
        case .completed:
          resolve(outputURL.absoluteString)
        case .failed, .cancelled:
          reject(
            "MUX_FAILED",
            exportSession.error?.localizedDescription ?? "Video mux failed",
            exportSession.error
          )
        default:
          reject("MUX_FAILED", "Unexpected video export status", nil)
        }
      }
    }
  }
}
