# New Architecture (TurboModules) Compatibility Notes

This project has **New Architecture enabled** (`RCTNewArchEnabled = true` in Info.plist). This causes compatibility issues with older native modules that use the legacy bridge. Document workarounds here as they're discovered.

## react-native-tts

### BOOL conversion bug
The `react-native-tts` JS wrapper passes JavaScript `boolean` values to native methods with Objective-C `BOOL*` parameters. The New Architecture bridge cannot convert these, causing a runtime crash.

**Affected methods:** `setDefaultRate(rate, skipTransform)`, `stop(onWordBoundary)`

**Workaround:** Call `NativeModules.TextToSpeech` directly for these methods instead of using the `Tts` wrapper. In Jest (where `NativeModules` is undefined), fall back to the wrapper since mocks handle it fine.

```typescript
import {NativeModules} from 'react-native';
const TTSNative = NativeModules.TextToSpeech;

// Instead of: Tts.setDefaultRate(0.45)
TTSNative.setDefaultRate(0.45, true);

// Instead of: Tts.stop()
TTSNative.stop(false);
```

### Unsupported `tts-error` event
The native module only supports these events: `tts-start`, `tts-finish`, `tts-pause`, `tts-resume`, `tts-progress`, `tts-cancel`.

Registering a listener for `tts-error` crashes the app under New Architecture. Do not use it.

### Promises may not resolve
Config methods like `setDefaultRate` and `setIgnoreSilentSwitch` return Promises that may never resolve under New Architecture. Use fire-and-forget (do not `await` them).

## General guidance
- When adding new native modules, test on-device with New Architecture enabled. Jest mocks will hide bridge compatibility issues.
- If a native module method crashes with a type conversion error, check the Objective-C method signature for `BOOL*` params and call `NativeModules.<ModuleName>` directly as a workaround.
