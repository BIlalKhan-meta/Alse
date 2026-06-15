#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(PhotoMusicComposer, NSObject)

RCT_EXTERN_METHOD(trimAudioClip:(NSString *)inputPath
                  startMs:(nonnull NSNumber *)startMs
                  endMs:(nonnull NSNumber *)endMs
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(muxVideoWithAudio:(NSString *)videoPath
                  audioPath:(NSString *)audioPath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
