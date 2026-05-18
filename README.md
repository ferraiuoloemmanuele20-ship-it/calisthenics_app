# Calisthenics Progression Trainer

A mobile-first React + TypeScript app for adaptive upper-body calisthenics workouts. The app excludes leg training, stores settings/history/progression in `localStorage`, and uses a conservative progression system based on post-workout feedback.

## Features

- First-launch onboarding for available equipment: pull-up bar, parallel bars, and rings.
- Level selection: Base, Intermediate, and Advanced.
- Adaptive upper-body workout generation for Pull, Push, Shoulders, Core, and optional Skill/Control work.
- Active workout checklist with progress indicator.
- Feedback flow: Easy, Good, Hard.
- Persistent completed workout history and progression state via `localStorage`.
- Settings screen for changing equipment/level and resetting progress.
- Mobile-first card and large-button interface using Tailwind-style utility classes.

## Project structure

```text
src/main.tsx
src/App.tsx
src/index.css
src/data/exerciseLibrary.ts
src/utils/progressionEngine.ts
src/utils/workoutGenerator.ts
src/screens/*
src/components/*
```

## Scripts

```bash
npm install
npm run dev
npm run build
```

This repository includes local file-based runtime packages under `vendor/` so the required commands work in restricted environments without fetching packages from the npm registry.
