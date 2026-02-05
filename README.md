# Native LaTeX Renderer for React Native Expo

A LaTeX rendering solution for React Native Expo (Android only) with Unicode fallback rendering.

## Important: Development Build Required

> **This module uses custom native Android code and will NOT work in Expo Go.**

You **must** use a development build:

```bash
npx expo prebuild
npx expo run:android
```

**Expo Go** is the stock Expo app - it cannot load custom native modules.  
**Development build** compiles native code into the app binary.

## Current Implementation

The app uses **Unicode fallback rendering** which converts LaTeX to readable math symbols:

| LaTeX | Rendered As |
|-------|-------------|
| `$a^2 + b^2 = c^2$` | a² + b² = c² |
| `$\frac{a}{b}$` | (a)/(b) |
| `$\int_a^b f(x)dx$` | ∫[a][b] f(x)dx |
| `$\sqrt{x}$` | √(x) |
| `$\sin^2 x + \cos^2 x$` | sin² x + cos² x |
| `$x \neq 1$` | x ≠ 1 |
| `$\alpha, \beta, \pi$` | α, β, π |

## Why Native JLaTeXMath Rendering Is Not Working

The native JLaTeXMath library (`ru.noties:jlatexmath-android`) is included but not rendering due to:

### 1. **Missing Initialization**
JLaTeXMath requires explicit initialization with Android context before first use:
```kotlin
JLatexMathAndroid.init(context)
```
This call is not being made in the current Expo module setup.

### 2. **Font Resource Loading**
JLaTeXMath bundles TrueType fonts for math symbols. When packaged as an Expo module, the asset path resolution differs from standard Android apps, causing fonts to fail loading silently.

### 3. **Expo Module Context Differences**
The `AppContext` provided by Expo Modules API differs from a standard Android `Context`, which may affect resource loading in JLaTeXMath's internal asset manager.

### Potential Fixes (Not Implemented)
1. Add `JLatexMathAndroid.init(context)` in module initialization
2. Copy font files to `android/src/main/assets/fonts/`
3. Override JLaTeXMath's resource loader to use Expo's asset system
4. Use alternative library like `io.github.nicholaswilde:mathview`

## Features (Current Implementation)

- **Unicode math rendering** - LaTeX converted to readable symbols
- **Mixed content parsing** - handles text + inline/block math
- **Currency detection** - `$500` rendered as text, not math
- **Error handling** - invalid LaTeX shows gracefully
- **FlatList optimized** - memoization for performance

## Installation & Running

```bash
# Install dependencies
npm install

# Generate native Android project
npx expo prebuild

# Run development build
npx expo run:android

# Build release APK
cd android && ./gradlew assembleRelease
```

## Usage

```tsx
import { LatexView } from './modules/latex-view';

<LatexView
  content="The formula is $E = mc^2$ and $$A = \pi r^2$$"
  textSize={16}
  textColor="#333333"
/>
```

## File Structure

```
himashu/
├── App.tsx                     # Demo with 15 samples
├── modules/latex-view/
│   ├── android/                # Native Kotlin (unused currently)
│   └── src/
│       ├── LatexView.tsx       # React component + fallback
│       └── parseLatex.ts       # Parser with currency detection
└── README.md
```

## Known Limitations

1. **No bitmap rendering** - Uses Unicode text instead of rendered images
2. **Complex expressions limited** - Nested fractions show as text
3. **No precise alignment** - Block equations are centered but not pixel-perfect
4. **Android only** - iOS would require different implementation
