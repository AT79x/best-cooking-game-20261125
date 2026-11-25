# Warung Nasi Goreng

![Warung Nasi Goreng](https://make.fun/bounty/best-cooking-game-20261125-0137)

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/AT79x/best-cooking-game-20261125/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/AT79x/best-cooking-game-20261125/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

An original Indonesian street-food stall game for the make.fun
[best cooking game bounty](https://make.fun/bounty/best-cooking-game-20261125-0137).

Customers walk up to your warung with an order on the board. Pick ingredients
from the counter (click, or keys 1–6), cook them in the wok (Space), and serve
the finished plate before the customer's patience runs out. Fast serves build
a combo; a customer who waits too long storms off and costs a heart. The round
lasts 120 seconds — how many plates can you serve?

## Play

Serve `game/` with any static server and open `game/index.html` in desktop
Chrome. No network requests: every script, style and sound is a file under
`game/` or synthesised in code.

- Click an ingredient (or press 1–6) to add it to the wok
- Space (or click the wok) to cook — at least 2 ingredients
- Click a plate, then click the customer (or press S) to serve
- Arrow keys / WASD move the chef, E picks the ingredient under the chef
- P pauses, R restarts

## Layout

- `main.ts` — the entry program: copies `game/` and `screenshots/` to
  `/output` and writes `dossier.json`
- `game/index.html`, `game/style.css` — the page
- `game/src/config.js` — recipes, ingredients, timings, layout
- `game/src/world.js` — the rules: orders, cooking, serving, timer, score
- `game/src/render.js` — everything drawn on canvas
- `game/src/input.js` — keyboard and mouse
- `game/src/audio.js` — synthesised sounds (WebAudio, no files)
- `game/src/shots.js` — deterministic screenshot scenes
- `game/src/rng.js` — seeded random numbers
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

## Screenshots

`screenshots/` holds 4 real renders of the game's own code, staged by
`?shot=kitchen|ingredients|assembly|serve` (see `shots.json`).

## License

MIT — see `LICENSE`.

---
Built with [make.fun](https://make.fun) — referral code `t4a9a15t`.
