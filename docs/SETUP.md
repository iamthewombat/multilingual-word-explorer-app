# Setup — bringing the native plan into the existing repo

These files are documentation/scaffolding for the native React Native app.

## 1) Copy into your repo
Copy these into the root of `iamthewombat/multilingual-word-explorer-app`:
- `CLAUDE.md`
- `docs/PRD.md`
- `docs/REFERENCE_APP.md`
- `docs/TECH_SPEC.md`
- `docs/BACKLOG.md`
- `docs/ACCEPTANCE_TESTS.md`
- `.claude/commands/*` (optional but useful)

## 2) Create the RN app folder
From your repo root:
```bash
npx react-native@latest init WordExplorer --template react-native-template-typescript
mv WordExplorer ios-app
cd ios-app
npm install
cd ios
pod install
cd ..
```

## 3) Run on device
```bash
npx react-native run-ios --device
```

## 4) Claude Code workflow
From repo root:
- run `/init` (if you haven't already)
- ensure `CLAUDE.md` exists (it is the guardrail file)
- use `/next` to implement tasks from `docs/BACKLOG.md`
