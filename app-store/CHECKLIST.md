# Treasure Sudoku — App Store Readiness Checklist

## Infrastructure
- [ ] Apple Developer Program enrollment ($99/year)
- [ ] Xcode installed and command line tools set up
- [ ] Bundle ID registered: `com.suitehart.treasuresudoku`

## Game Readiness
- [ ] Unique-solution puzzle engine (Phase 1)
- [ ] Persistent state / save progress (Phase 2)
- [ ] Modular codebase — not monolith (Phase 3)
- [ ] Build tooling setup (Vite)
- [ ] Offline-first — no network dependencies for core gameplay

## iOS Wrapper
- [ ] Capacitor iOS project initialized (Phase 5)
- [ ] App runs in iOS Simulator
- [ ] Native plugins integrated (haptics, splash screen, status bar)
- [ ] Respects safe areas (notch, home indicator)
- [ ] Smooth 60fps performance

## App Store Assets
- [ ] App icon designed (1024x1024 PNG, no transparency, no rounded corners)
- [ ] Screenshots captured — 6.7" (iPhone 15 Pro Max)
- [ ] Screenshots captured — 6.5" (iPhone 11 Pro Max)
- [ ] Screenshots captured — 5.5" (iPhone 8 Plus)

## Compliance
- [x] Supabase keys removed from source code
- [x] Privacy policy drafted
- [ ] Privacy policy hosted at public URL
- [x] App Store metadata drafted (name, subtitle, description, keywords)
- [ ] Age rating questionnaire completed (target: 4+)
- [ ] Privacy Nutrition Labels configured in App Store Connect
- [x] .gitignore updated for iOS development
- [x] Redundant files cleaned up

## Testing
- [ ] TestFlight internal testing (Elizabeth + Lauren)
- [ ] All critical bugs fixed
- [ ] TestFlight external beta (optional)

## Submission
- [ ] Full compliance checklist passed
- [ ] Elizabeth's explicit approval to submit
- [ ] Submitted through App Store Connect
