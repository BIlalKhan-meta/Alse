package com.blitzapp.alenga

import com.arthenica.ffmpegkit.FFmpegKit
import com.arthenica.ffmpegkit.ReturnCode
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class PhotoMusicComposerModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = NAME

  private fun stripScheme(path: String): String =
    path.trim().removePrefix("file://")

  @ReactMethod
  fun trimAudioClip(inputPath: String, startMs: Double, endMs: Double, promise: Promise) {
    Thread {
      try {
        val input = stripScheme(inputPath)
        val output =
          "${reactContext.cacheDir.absolutePath}/photo_music_audio_${System.currentTimeMillis()}.m4a"
        val command = arrayOf(
          "-y",
          "-ss", "${startMs.toLong()}ms",
          "-to", "${endMs.toLong()}ms",
          "-i", input,
          "-vn",
          "-c:a", "aac",
          "-b:a", "128k",
          output,
        )
        val session = FFmpegKit.executeWithArguments(command)
        if (ReturnCode.isSuccess(session.returnCode)) {
          promise.resolve("file://$output")
        } else {
          val logs = session.allLogsAsString ?: "Audio trim failed"
          promise.reject("TRIM_AUDIO_FAILED", logs)
        }
      } catch (error: Exception) {
        promise.reject("TRIM_AUDIO_FAILED", error.message, error)
      }
    }.start()
  }

  @ReactMethod
  fun muxVideoWithAudio(videoPath: String, audioPath: String, promise: Promise) {
    Thread {
      try {
        val video = stripScheme(videoPath)
        val audio = stripScheme(audioPath)
        val output =
          "${reactContext.cacheDir.absolutePath}/photo_music_${System.currentTimeMillis()}.mp4"
        val command = arrayOf(
          "-y",
          "-i", video,
          "-i", audio,
          "-c:v", "copy",
          "-c:a", "aac",
          "-b:a", "128k",
          "-shortest",
          "-movflags", "+faststart",
          output,
        )
        val session = FFmpegKit.executeWithArguments(command)
        if (ReturnCode.isSuccess(session.returnCode)) {
          promise.resolve("file://$output")
        } else {
          val logs = session.allLogsAsString ?: "Video mux failed"
          promise.reject("MUX_FAILED", logs)
        }
      } catch (error: Exception) {
        promise.reject("MUX_FAILED", error.message, error)
      }
    }.start()
  }

  companion object {
    const val NAME = "PhotoMusicComposer"
  }
}
