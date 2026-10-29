# Melissa Time: The Great Birthday Rescue, Volume 2

A private birthday game for Melissa's 54th, and a remastered sequel to
[Volume 1](https://ploug76.github.io/melissaette-bday-c38938/). Volume 1 is unchanged.
The game isn't indexed: robots.txt has `Disallow: /` and the page has a noindex meta tag.

**Play:** https://ploug76.github.io/melissaette-bday-c38938-vol-2/

## What's in it
- **6 painted lands × 9 candles = 54 candles.** Willowbrook Village, Sunset Wildflower Fields, Rushing River Falls,
  Crystal Cavern, Frosted Peaks and Humbug Castle. Each land has parallax layers, light rays, particles, rain and
  lightning, a dark cave with a light map, and ice physics.
- **6 bosses.** Smudge the Raccoon, Queen Buzzbelle, Captain Snapjaw, Glimmerfang, Frostbeard the Yeti and Baron Humbug,
  who has 3 phases. Beat each boss to free a Party Pal from the cage. Freed pals follow Melissa home.
- **Cinematic intro and finale.** The finale is a birthday party with karaoke lyrics, sung to the public-domain
  "Happy Birthday" melody.
- **Original soundtrack.** A WebAudio synth score with one original tune per land, plus a boss theme and a final-boss theme.
- **No game over.** If you run out of hearts, you go back to the last checkpoint and lose 500 points.

## Controls
- **Touch.** There's no on-screen D-pad. Swipe and hold anywhere to move, and swipe up to jump (double jump in the air).
  Swipe down to ground-pound or drop through a platform. Use the **JUMP** and **✨ SPARKLE** buttons too.
- **Keyboard.** Arrow keys or WASD move. Space or Up jumps, X sparkles and Down ground-pounds. P pauses, M mutes.
- **Game controller.** Uses the Gamepad API, so it works with USB or Bluetooth controllers on desktop and phones.
  The left stick or d-pad moves, A jumps, X sparkles and Start pauses. In menus, A confirms and B goes back.
  Controllers can be plugged in or out at any time, and a toast confirms the connection.

## Build
`./build.sh` turns `src.html` into `index.html`. It adds private OG tags, the share dock and the shared leaderboard,
and bumps the service worker cache.
Art is rebuilt from generated sources with `tools/build_art.py`. Cover images come from `tools/cover.py`.
