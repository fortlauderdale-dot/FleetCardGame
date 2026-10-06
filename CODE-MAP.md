# Fleet Duel code map

The game is split into small files so a change only needs the files it touches.
Files load in number order. Everything shares the same global scope, so a name
defined in one file can be used in any file after it (and inside functions at any time).
Each file starts with a dark boxed title. Search for `██` to jump between sections.

## Scripts (js/)

| File | What is inside |
|---|---|
| 01-cards-and-hands | World names, cards and decks, poker hand ranking |
| 02-effects-and-icons | Sounds, screen flashes, damage popups, opponent difficulty rating, icons and picture helper |
| 03-item-rules | Attack catalog, Item conditions, glossary, damage and upgrade math |
| 04-item-catalog | Every Item card (player and opponent) |
| 05-vehicles | Vehicle roster and starter Items |
| 06-card-display | How Item cards and vehicle ability cards are drawn |
| 07-opponents | Opponent roster by world |
| 08-profile-and-saves | Permanent upgrades, player profile, run save, battle save |
| 09-opponents-more | Map route builder, opponent scaling, World 7 and 8 opponents |
| 10-difficulty-settings | Difficulty dials (the numbers to tweak) |
| 11-difficulty-table | Threat table data (very large, rarely edited by hand) |
| 11b-shared-items | Opponent Items that are the same card with a different name (shared card plus names) |
| 12-difficulty-engine | Code that tunes opponents from the table, difficulty screen |
| 13-map-and-run | Picking stop types for a world, run state, travel, stop handling |
| 14 to 18 | Fleet Plinko, Blackjack, Poker, Auction, Matching Game |
| 19-garage-and-run-end | Tuning Garage, Supply Cache, ending or forfeiting a run |
| 20-battle-logic | Starting a fight, drawing cards, curses, burns, freezes, targeting |
| 21-battle-actions | Selecting cards, firing Items, opponent turns, winning |
| 22-screens-map | Top bar, map, Stop Details popup |
| 23-screens-battle | Run Upgrades, battle screen, shops, results, vehicle picker |
| 24-screens-garage-shops | Overdrive Bay and Chop Shop screens |
| 25-update-log | The Update Log text (edit here for every change) |
| 26-main-menu | Update Log display, rules panel, main menu |
| 27-picture-fitting | Scales pictures to fill their boxes |
| 28-render-and-events | render(), battle layout helpers, button wiring |
| 29-startup | Hover tips, first screen, boot |
| 30-music | Music tracks per world, looping player, crossfade, music button and volume, credits |

## Styles (css/)

| File | What is inside |
|---|---|
| 01-base | Page, buttons, resource bar, popups, general layout |
| 02-battle-board | Run bar buttons, battle board, opponent and player sides |
| 03-cards | Playing cards and Item cards |
| 04-map | Map stops, picture fitting, fog |
| 05-stop-details | Stop Details popup, Item card sizing, screens |
| 06-phone-battle | Battle screen on a phone held upright |
| 07-minigames | Plinko, Blackjack, Poker, Auction styles |
| 08-phone-layout | Tighter spacing on phones |
| 09-minigames-layout | Blackjack and Poker hand layout |

## Common changes and the files they touch

- New or changed Item card: 04-item-catalog, 03-item-rules (if a new condition), 25-update-log
- New opponent: 07-opponents or 09-opponents-more, 04-item-catalog (its attacks), 25-update-log
- New vehicle: 05-vehicles, 04-item-catalog (starter Items), 25-update-log
- Map look or behavior: 22-screens-map, 04-map.css, 13-map-and-run
- Battle screen look: 23-screens-battle, 02-battle-board.css, 06-phone-battle.css
- Battle rules: 20-battle-logic, 21-battle-actions
- Difficulty numbers: 10-difficulty-settings
- New music track: music/ folder, MUSIC_TRACKS in 30-music, sw.js (file list and CACHE_VERSION), 25-update-log
- Bonus games: the matching file in 14 to 18 and 07-minigames.css

## Offline play

sw.js saves every file and picture on the first visit. When a file is added or
renamed, add it to the lists at the top of sw.js and change CACHE_VERSION.
