// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Update Log And Main Menu                                                      ██
// ██  The Update Log text, the rules panel and the main menu.                       ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

// Update Log entries are grouped by week, not by day. Each entry's "date" is the Monday that
// starts the week the work was done in, and everything done that week (Monday-Sunday) gets
// added to that same entry rather than getting its own dated line. Within a week, notes are
// further grouped by category (see UPDATE_LOG_CATEGORY_ORDER) so related fixes read together
// instead of as one flat chronological list.
const UPDATE_LOG_CATEGORY_ORDER = [
  'Opponents',
  'Item cards',
  'Dealership',
  'Card tuning',
  'Match game',
  'Visual',
  'Audio',
  'Misc',
];
// prettier-ignore
const UPDATE_LOG = [
  { date: '2026-09-21', categories: {
    Opponents: [
      ('Fixed a bug where a few opponents were showing their attack\'s name instead of their own ' +
        '(River Otter was displaying as "River Otter Nip", for example).'),
      'Drifting Jellyfish is now a regular stop on the map; the tougher swarm version only shows up as an Elite.',
      ('Opponent hover tooltips on the map now just show HP and how many cards they draw per ' +
        'turn, instead of a generic (and often wrong) attack requirement.'),
      'Fixed a real bug behind the "(1 card)" text some opponents were showing instead of "Any card".',
      ('Armor no longer counts toward an opponent\'s HP total. Any opponent whose armor ' +
        'regenerates each turn now shows a small blue "+X armor" note next to its HP bar, and armor regen no longer caps out.'),
      ('Added a Difficulty rating (Easy/Moderate/Hard/Brutal) to Stop Details so you can gauge a ' +
        'fight before engaging. Tougher opponents now pay out more coins and gems.'),
      ('Feral Beach Cat Colony, Swamp Mosquito Cloud, Malarial Fog Swarm, Feral Hog Sounder, ' +
        'Fire Ant Mound, Biting Deer Fly Cloud, Sewer Rat Nest, and Dock Crab Swarm are now split into a ' +
        'regular single version and a tougher two-item Elite version, matching how Drifting Jellyfish already worked.'),
      'Stop Details now always shows the coins and gems you will actually get.',
      'Lost Sunglasses Glare renamed to Lost Sunglasses. Lobster Trap renamed from Loose Lobster Trap.',
      ('Reduced how often the map sends you into the same opponent twice within one world - ' +
        'conflicting nodes on the same branch now get swapped for a different opponent. This is a big ' +
        'reduction, not a total guarantee: when a world\'s opponent pool runs low, an occasional repeat ' +
        'can still slip through.'),
      'Elite fights now pay a small Career Points bonus on top of their usual coins and gems.',
      ('Added 10 Easter egg opponents that can show up as regular fights on any world: ' +
        'Procurement, City Auditor, Bionic Brett, Fisherman Chris, Chelsy, Drew, Jen, Haley, Nala, and Eevee.'),
    ],
    'Item cards': [
      ('Fixed attack and item labels that were saying things like "(1 cards)" - they now read ' +
        '"Any card" or "Any 2 cards".'),
      ('Item power ratings and shop prices for damage and lightning items now account for how ' +
        'likely their requirement actually is to come up, not just their raw numbers. Highway 7 Shortcut ' +
        'and Short Circuit were the worst offenders and got repriced along with a few others.'),
      ('Diamond Lane Convoy renamed to Diamond Convoy and reworked: it now only needs 1 Diamond ' +
        'to fire (used to silently require 3), does summation damage, and gets +25% more if you play 3 or more Diamonds.'),
      ('Fixed the "Up to 4" wording on Diamond/Club/Spade/Heart Convoy-style items, which was ' +
        'misleading about how many of the suit you actually need - it now says "At least N" when a minimum count is required.'),
      ('Ice items (Coolant Burst, AC Overload, Frozen Brake Line) reworked: they no longer deal ' +
        'damage, and now let you pick which of the opponent\'s Items to freeze instead of picking one at ' +
        'random. A frozen Item shows the same frost overlay and thaw countdown your own frozen Items ' +
        'already use, and it thaws on its own as its owner works through it over their next few turns ' +
        'instead of a flat "2 turns" lock.'),
      ('Grayed-out item cards you\'ve already used this turn now let their hover tooltips pop up ' +
        'again - they were being blocked along with the rest of the card.'),
      ('Fixed a bug that let you drop or click a card onto an Item that had already used up all ' +
        'its turns for the round - the card would just sit there doing nothing until it got handed back to you at end of turn.'),
    ],
    Dealership: [
      'Dealership layout tightened up into a proper grid.',
      ('The upgrade shops (Tuning Garage, Chop Shop, Overdrive Bay) can each only show up once ' +
        'per world, so you will not run into the same one twice on a route. The Dealership can still show up twice.'),
      'Equipped items now line up on the left like the cards you can buy, instead of being centered.',
      ('Visiting a new node\'s Dealership now always reshuffles to a fresh set of 6 items; ' +
        're-entering the same node\'s Dealership without moving keeps what you had.'),
      ('The guaranteed armor card (and whatever storage card came with it) no longer always land ' +
        'in the same shop slots - their position is randomized like everything else.'),
    ],
    'Card tuning': [
      ('Tuning Garage cleaned up: dropped the redundant subtitle text, renamed the page to ' +
        '"Tuning Garage," and grouped the three card upgrades and the item-tuning list into their own ' +
        'boxed, narrower panels that match the item card look.'),
      ('Overdrive Bay cleaned up: tighter spacing between each item and its upgrade button, ' +
        'dropped the brackets around "+1 Use Per Turn," and removed the redundant item name line that ' +
        'repeated what the card already shows.'),
    ],
    'Match game': [
      ('Fixed the Fleet Carnival matching game showing 50 Career Points for a Black Joker match ' +
        'when it actually pays 25.'),
      'Red Joker and Black Joker now use distinct colors, so the two are easy to tell apart at a glance.',
      ('World 1 now has a real shot (about 50%) of putting the Carnival matching game somewhere ' +
        'on your route before you even reach the Fleet Compound. It can still show up anywhere else too, at its normal odds.'),
      ('Fixed a bug where playing the map\'s Grid Anomaly matching game could lock you out of ' +
        'the separate Carnival Matching Game at the Fleet Compound, and vice versa. The two are now ' +
        'tracked completely separately.'),
    ],
    Visual: [
      'Spades and clubs are easier to tell apart at a glance now.',
      ('Item card bonus text is now gold instead of purple, for better contrast against the ' +
        'curse and base card backgrounds.'),
      ('The fuel-heal warning now pops up near your hand instead of the top of the screen, and ' +
        'its text is shorter. Also fixed a bug where clicking it (and some other buttons) could pop a ' +
        'tooltip into the top-left corner of the screen.'),
      ('Map nodes you\'ve already cleared, or can\'t currently reach, now show grayed-out icons ' +
        'so it\'s obvious at a glance where you\'ve been and where you can go next. They\'re still clickable for info.'),
      'Update Log section headers (Opponents, Item cards, Visual, etc.) no longer render in all caps.',
      ('The "Made by Drew" / feedback line is now part of the same box as the main menu instead ' +
        'of sitting in its own separate box underneath it.'),
      ('Removed bold from the hoverable, dotted-underline keywords on item cards (Poison, Burn, ' +
        'Curse, Hex, Ice, Draw, Charges, and the suit/hand names in requirement text) so they read ' +
        'consistently - some were bold and some weren\'t.'),
      ('Fixed a CSS bug that was quietly overriding the Red/Black Joker card colors with plain ' +
        'white, so they still looked identical even after the earlier fix. Red Joker cards now show a ' +
        'clear red background, and Black Joker cards use a dark charcoal (not pure black) so the joker icon stays visible.'),
    ],
    Misc: [
      ('Behind the scenes: the game code is now split into small files so future changes are faster and safer.'),
      ('Offline play: after one visit with internet, the game and its pictures are saved on the device so it '+
        'works with no WiFi, such as on a flight.'),
      ('Code cleanup: very long lines are now wrapped, unused code and old notes are removed, and every major '+
        'section has a dark boxed title so it is easy to find.'),
      ('Career Points now pay out as one bonus at the end of a run based on how far you got, ' +
        'instead of a little bit for every kill. Perfect Kills earn a small Career Points bonus of their own too.'),
      ('Combat Training now makes you actually click each step to move on, and only shows up ' +
        'your first time through. It also reads less like a weapons manual.'),
      ('Home screen cleanup: smaller credit line, shorter feedback ask, and the credit/feedback ' +
        'bar now sits above the Update Log instead of below it. Update Log is now grouped by category ' +
        'instead of one flat list.'),
      ('Fleet Compound\'s Inn renamed to Body Shop. Removed the old "rest and refuel" explainer ' +
        'text; each button now just shows its live cost (health repair reads "+30 Health," then "+30 ' +
        'Health = 20 coins" after your first free use that visit, and so on).'),
      ('Fixed a bug where the refuel button\'s cost and the fuel it actually gave you didn\'t ' +
        'match what the button said. Refuel is now a flat 5 coins per fuel, capped at 10 fuel per visit.'),
      ('The Chop Shop, Overdrive Bay, Tuning Garage, Body Shop, and Fleet Compound Dungeon now ' +
        'all share the same Back/Upgrades button placement and colors.'),
      ('Chop Shop: narrower layout, renamed header to "Chop Shop," shorter description text, ' +
        'larger coin-cost text, and items now line up along the top of their row instead of being vertically centered.'),
      ('Fleet Compound Dungeon: now matches the other shop pages\' buttons and colors, only ' +
        'locks for the world you left it in (not the whole run), reduced its fuel and gem payouts, added ' +
        'Energy rewards, and added a difficulty label to each battle.'),
      ('Run Ended screen redesigned: a red "Run Ended" header in place of the old "Back to Base,' +
        '" plus a full run summary (world reached, Career Points, best world reached, opponents and ' +
        'Elites beaten this run and lifetime, items used, upgrades obtained). Also fixed the confusing ' +
        '"+20 points for reaching [world]" wording - it was just naming the world you were on, not a ' +
        'real bonus reason, so it\'s now shown as plain data instead.'),
      ('Added the Fleet Plinko Board: a new bonus stop at the Fleet Compound. Drop chips down a ' +
        'peg board for coins, gems, or fuel, with the option to keep pushing your luck for a bigger haul ' +
        'or bank what you\'ve got - one bad drop wipes the current haul. Playable once per world, same ' +
        'as the Carnival matching game.'),
      ('Fleet Plinko: reshaped the board into an actual pyramid with a proper staggered peg ' +
        'layout, so drops bounce unpredictably across the whole width instead of mostly falling straight ' +
        'down. You now pick from 3 fixed drop slots (Left, Center, Right) instead of a freeform drop ' +
        'position. Also dropped the redundant "Fleet Compound" label from the board screen and renamed ' +
        'its Leave button to "Back to Compound" to match the rest of the game.'),
      ('Added three new bonus stops at the Fleet Compound, alongside Plinko: Fleet Blackjack ' +
        '(three hands, one shared Hit/Bank decision - each hand\'s reward is set before you draw, and a ' +
        'bust forfeits that hand\'s reward while the others keep going), Fleet Poker (build three 5-card ' +
        'hands from fifteen dealt cards, once a card is placed it can\'t be moved, then reveal against ' +
        'three hidden computer hands one at a time), and the Fleet Auction (bid against two computer ' +
        'bidders with different styles for one of three mystery lots, paying a small fee to inspect a ' +
        'lot before you commit). All three play once per world, same as Plinko and the Carnival matching game.'),
      ('Fleet Plinko rebuilt: pegs now fill the entire board edge-to-edge instead of a narrow ' +
        'pyramid, so a chip can no longer drift down an empty side margin to a near-guaranteed safe ' +
        'landing (or get stuck there). Game Over columns now start at the center and spread outward the ' +
        'more you keep dropping, so you can no longer win indefinitely - by round 13 the whole board is ' +
        'Game Over. The three drop lanes are now clearly flagged above the board.'),
    ],
  } },
  { date: '2026-09-28', categories: {
    Burn: [
      ('Burn is reworked. Burning an Item now makes the number on that Item card go up every ' +
        'turn instead of fading. Burned Item cards turn red and show the burn and how much it grows each turn.'),
      ('Detonate button: on a burning opponent Item you can cash it in right away for what it ' +
        'has built up so far, or wait and let it grow. The bigger it gets, the less likely the opponent is to use that Item.'),
      ('If a burning Item is fired, the attack still lands, but its owner takes the burn damage. ' +
        'The same now goes for you: when an opponent burns one of your Items, firing it still attacks, but you take the burn.'),
      'Updated the burn notes and tooltips to explain the new rules.',
      ('A burning opponent Item now keeps its red stripes and burn amount on the card, with the ' +
        'Detonate button right on it.'),
      'Your own burning Items now get the same red stripes.',
    ],
    Minigames: [
      ('Fleet Plinko: the left and right drop buttons now release the chip over a peg like the ' +
        'center one, so it no longer falls straight down.'),
      ('Fleet Blackjack: the final hands and the dealer stay on screen after you stand, and a ' +
        'popup says what you won. Click Collect to finish.'),
      'Fleet Poker: the cards are bigger. The computer\'s hands now stay hidden until you have placed all nine cards.',
      'Fleet Auction: your coin count is now always shown next to the other bidders.',
    ],
    'Body Shop': [
      'The Body Shop is narrower, and Refuel and Dent Repair are now tight one-line rows with smaller buttons.',
      ('Refuel gets more expensive the more you buy in one world. The first 10 fuel cost 5 coins ' +
        'each, then every extra fuel costs 5 more than the last. The price resets in the next world. The ' +
        'Service Station follows the same rule, counted together with the Body Shop.'),
    ],
    'New worlds': [
      ('World 7, Port Everglades, is here with 21 regular opponents, 3 elites and a boss. Its ' +
        'regulars mix every kind of damage. The boss is the Harbormaster, who throws away his hand every ' +
        'turn and draws new cards.'),
      ('World 8, The Fleet Compound, is here too with 21 regulars, 3 elites and the Evil ' +
        'Mechanic as boss. Beating World 8 is now the end of the campaign.'),
    ],
    Difficulty: [
      'The biggest single hit an opponent can land is now 99.',
      ('Opponent difficulty was reworked from the Difficulty Lab. Opponents that hit far too ' +
        'soft or far too hard for their world are nudged toward a healthy range, and opponents already ' +
        'inside it are left alone. Elites now have 2 to 3 items and bosses 3 to 4.'),
      ('Early fights last longer. Opponents have more health in World 1 and the bonus fades out ' +
        'by World 4, and every world now also builds up a little across its rows.'),
      ('Every difficulty number now lives in one settings block at the top of the game file. A ' +
        'dev-only Difficulty Tuning screen (name your fleet devmode to see it) lets you test changes, ' +
        'start a run in any world, and read a fight log that records how each real fight went compared ' +
        'with the engine estimate.'),
    ],
    'Career Points': [
      ('The home and vehicle pick screens now say a loss costs you everything except Career ' +
        'Points. Pick Your Vehicle also has Back and Spend Career Points buttons.'),
      ('The Career Points page is narrower, the bars have their own color so the rows do not ' +
        'blend together, and the three section headers are gone in favor of one long list that keeps the color coding.'),
      ('Most upgrades now unlock after you have earned a set number of Career Points in total, ' +
        'and every upgrade costs 50 percent more.'),
      ('Removed the Admin Vehicle Pair Bonus upgrade. Career Points no longer buy anything that ' +
        'makes an item card hit harder, and any Career Points you spent on it are refunded.'),
    ],
    Tutorial: [
      ('The first battle is now staged. You start with a 2, two 9s, a King and an Ace against an ' +
        'opponent with exactly 48 health, and the steps run in a new order: pick your cards, load an ' +
        'item, attack, end turn. A second turn with the King and Ace finishes it for a Perfect Win.'),
    ],
    Battle: [
      'Poison from opponents now lands on you instead of on themselves.',
      'The win popup is much tighter, and a Perfect Win now says Perfect Win!',
      ('Your health bar and the opponent\'s health bar are now the same size, and Grumpy Sea ' +
        'Turtle and other opponents that draw when hit say *Draws 1 when hit* under their bar.'),
      ('You can sort the opponent\'s face-up cards by value or suit, same as your own hand. ' +
        'Face-down cards stay at the end so sorting never gives them away.'),
      ('Opponents that throw away their hand every turn or make you discard now show a Heads Up ' +
        'note when you tap their stop and again when the fight starts. Grid Storm is removed.'),
      ('Ice item cards now say Frozen and how many points it takes to thaw (for example Frozen ' +
        'Brake Line says Frozen: 14 to thaw) instead of Ice.'),
      'Perfect Wins give +1 fuel, now shown on the map popup and the result screen.',
    ],
    'Supply Cache': [
      ('The Supply Cache choice screen is easier to read. The made-up names are gone, each ' +
        'choice just says what you win with the downside underneath, and the third choice is now free.'),
    ],
    Opponents: [
      ('Added Anthony as a new Easter egg opponent, with two new Items: Torque Check (needs a ' +
        'Pair) and Diagnostic Deep-Dive (needs cards totaling 7+, draws a card immediately).'),
      'The World 1 boss is now Big Al, with new attack names to match and a larger, centered picture.',
      ('Opponents in every world have new names. Angry Citizen moved to World 3 as an Elite, and ' +
        'World 8 now has two Elites.'),
      'Attack names, notes and icons were rewritten for the renamed opponents so they match their new names.',
      'Runs saved before the rename load with the new opponent names and pictures.',
      'Procurement moved from World 8 to World 3 and is now a regular opponent there, with less HP to fit.',
      ('Fortune Teller\'s Kiosk, Blown A/C Compressor and Broken Parking Meter now have a second ' +
        'Item. When the Item to its left did not fire, the opponent throws out its whole hand and draws ' +
        'that many cards plus 2 next turn, so they attack more often the longer they wait.'),
      ('NayNay and Logi Bear replace Chiller Vent and Iced-Up Evaporator Coil in World 5. Each ' +
        'can also show up once in World 1 as an Easter egg.'),
      ('The World 5 boss is now The Walk-In Walker, a person who got locked in the freezer and ' +
        'came out different. Runs saved earlier load with the new name and picture.'),
    ],
    'Item cards': [
      ('Diamond Convoy and other single-suit cards now say 1-4 diamond cards instead of Any ' +
        'diamond, so it is clear you can play more than one.'),
      ('The words Even and Odd on item cards (Splinter Snap, Odd Shift and others) are now bold ' +
        'and colored, with a hover popup. Even is 2, 4, 6, 8, 10 and Queen. Odd is Ace, 3, 5, 7, 9, Jack and King.'),
      ('Lightning now uses one shared roll from 0 to 100 percent for you and the opponent, and ' +
        'your status bar shows the current roll.'),
      ('Sixteen items that said Needs Two Pair but could only hold 3 cards can now hold 4, so ' +
        'they fire on an actual Two Pair.'),
      ('Fixed Thickening Fog, which could never fire because it was looking for the wrong color ' +
        'name. It now works with 2 or more Black cards.'),
      ('Impound Release now says "Once charged: Draw 4 cards each turn" right on the card, and ' +
        '"Charges at 45, then Draw 4" in the shop.'),
      ('Fixed Rapid Intervention (and any other item with a flat built-in bonus) showing "Bonus ' +
        '+30% from tuning" before it had ever actually been tuned - that wording now only shows once you ' +
        'have actually put a tuning level into it.'),
      ('Cursed Carpool and a handful of other single-card requirement items (the ones that need ' +
        'one specific card, like 3 of Clubs) now show a full-size mini playing card instead of the rank ' +
        'plus a tiny suit square, so the exact card is easier to make out at a glance.'),
      ('New simple Items: Spade, Heart, Club and Diamond Tandem (2 of a suit), plus Red Light ' +
        'Runner and Black Top Blitz (2 Red or 2 Black cards).'),
      ('New starter attacks: Brake Light Tap (2 Red cards) and Black Top Tap (2 Black cards) hit ' +
        'lightly but are easy to set up. Tow Truck, Crown Vic and ARFF now start with one instead of a Pair or Straight card.'),
    ],
    'Match game': [
      ('The Grid Anomaly popup title is centered, the pair matched popup now opens higher on the ' +
        'page, and matching a pair plays a happy sound while a miss plays a wah-wah.'),
      ('Fixed a glitch at the Fleet Compound where clearing the Carnival Matching Game board ' +
        'would just deal you a fresh board and let you keep playing (and earning) indefinitely. It now ' +
        'ends your visit once you clear it, same as Plinko, Blackjack, Poker, and the Auction. The ' +
        'map\'s own Grid Anomaly matching game stops are unaffected.'),
    ],
    Visual: [
      ('Changed the last few shouting-style labels in battle (the armor chips and the first ' +
        'poison warning) to normal capitalization.'),
      ('Pick Your Vehicle: the Golf Cart and Admin Vehicle pictures now sit lower so they line ' +
        'up with the other vehicles, and the Golf Cart no longer touches its Choose button.'),
      ('Pick Your Vehicle: each vehicle\'s special ability is now its own rounded teal Ability ' +
        'card instead of looking like an Item card, and it shows the set Energy cost (for example "4 ' +
        'Energy" or "5 Energy") without the old "+".'),
      ('The map now always has one straight line running through the middle lane from start to ' +
        'boss, with the top and bottom stops weaving in and out of it.'),
      'The Dealership popup on the map now shows a big picture and its button says Enter instead of Go Here.',
      ('Removed leftover all-caps text (Bust, Win, Push, Lose, Maxed, and a few others) so ' +
        'labels use normal capitalization.'),
      ('Stop Details popup cleaned up: dropped the redundant "Stop Details" header text, packed ' +
        'HP/Draws/Difficulty into a tight column on the left with the item cards stacked underneath (2 ' +
        'wide, wrapping to a new row), and moved the picture into the empty space on the right at full ' +
        'height. Armor is now shown as a small "+X Armor" note right next to HP instead of its own paragraph.'),
      ('Map-node and resource-icon artwork wired up and permanently baked in: Dealership, ' +
        'Service Station, Tuning Garage, Chop Shop, Overdrive Bay, Supply Cache, Fleet Compound, Fleet ' +
        'Plinko, Fleet Blackjack, Fleet Poker, and Fleet Auction all use their real pictures now (with ' +
        'an emoji fallback if an image is ever missing), and the coin/gem/fuel/energy/heart icons in the ' +
        'top bar and everywhere else are sized to match.'),
      ('Fixed a bug where the Fleet Compound (and every other non-battle map node) never ' +
        'actually used its uploaded picture on the map itself, even though the same picture worked fine ' +
        'on the Stop Details popup - the map was only ever drawing the emoji fallback. All map nodes are ' +
        'also a bit larger now so they\'re easier to tell apart at a glance.'),
      ('Tightened up the empty space above and below the world map so you\'re not scrolling past ' +
        'a couple of blank rows at the top and bottom of the screen.'),
      ('The Update Log is now collapsible - click a week to expand or collapse it, and click the ' +
        '"Update Log" header to collapse the whole section.'),
      'The Hazards folder now has 190 opponent pictures.',
    ],
    Audio: [
      ('Added a sound for armor blocking a hit - plays whether you\'re hitting an opponent with ' +
        'armor or they\'re hitting you while you have armor.'),
      ('Damage numbers now stay on screen about a second longer, and if you take more than one ' +
        'hit at once, the numbers stack in a vertical list instead of piling up on top of each other.'),
    ],
    Dealership: [
      ('In World 1 the Dealership always stocks two easy Items (2 of a suit, or 2 Red or Black ' +
        'cards), and in Worlds 2 and 3 it stocks one.'),
    ],
    Map: [
      ('Fixed World 3 letting you route around the Fleet Compound. Every route now passes ' +
        'through it, same as the other worlds. A World 3 run in progress that has not reached the Compound yet is fixed too.'),
      'The rest stop is now called Service Station everywhere.',
    ],
  } },
  { date: '2026-10-05', categories: {
    Vehicles: [
      ('Starting vehicles were reworked so each one you unlock feels stronger or plays ' +
        'differently than the one before it. Each has a new set of starting Items, an ability and a head start perk.'),
      ('Twelve new vehicles: Riding Mower, Beach Rescue ATV, Police Motorcycle, Skid Steer, ' +
        'Backhoe, Dump Truck, Garbage Truck, Pressure Washer Truck, Grapple Truck, Ocean Rescue Truck, ' +
        'High Water Rescue Truck and Ambulance. Each has its own way to play.'),
      ('Vehicles unlock more slowly now. Beating each world unlocks one, 100 Perfect Wins and 25 ' +
        'Elites unlock one each, and the rest unlock as you earn Career Points in total.'),
      ('The Admin vehicle has no fuel. You pay 5 coins to move to each stop, and if you cannot ' +
        'pay you lose 10 HP, like running out of fuel. It starts with 20 extra coins, and fuel you would ' +
        'find is turned into coins.'),
      ('New abilities: redraw your hand, wash every effect off your Items, double your next ' +
        'attack, fire every Item an extra time, dump your hand for damage, soften the opponent\'s next ' +
        'hits, show the opponent\'s hand, and a once-per-run revive that you choose to use.'),
      ('Some vehicles run on health. Hot Pursuit and Defibrillator cost HP to fire, and Donut ' +
        'Break, Adrenaline Drip and the healing abilities pay it back.'),
      'Pick Your Vehicle now shows a Perk card as well as the ability card.',
    ],
    'Item cards': [
      'Item cards with a multiplier now show the summation symbol too, like Attack \u03a3 \u00d72, so it is clear what is being multiplied.',
      'Opponent Item cards now show the damage they really do, so a card that says 8 hits for 8.',
      ('Items that name a poker hand now fire on exactly that hand. A Pair Item no longer works ' +
        'with Three of a Kind, a Straight Item no longer works with a Straight Flush, and so on. A Flush ' +
        'of one suit that is also in a row counts as a Straight Flush.'),
      ('Freeze, Burn, Curse and Hex now stay on the battle screen with no popup. Press Attack, ' +
        'tap one of the opponent\'s Items, then press the same button, which now reads Freeze, Burn, ' +
        'Curse or Hex, to lock it in. Cancel keeps your cards, so you can look over their Items first.'),
      'Your starting Item cards no longer pay out less than the sum of their cards, unless they are poison.',
      ('New Items: Full Pallet, Roof Rack, Hose Slam and a set of new vehicle Items. Some can ' +
        'fire several times a turn, and some cost HP or heal you when fired.'),
    ],
    Opponents: [
      'Anchor Drag now always hits for its listed damage instead of being weakened by difficulty scaling.',
      ('Opponent Items that name a hand now fire on exactly that hand. Feral Beach Cat\'s Claw ' +
        'Skirmish needs Two Pair, so it no longer fires on a straight or a straight flush.'),
      'Opponents with draw on hit no longer show up before the Fleet Compound in World 1.',
      ('Frozen opponent Items now thaw the way yours do. The opponent feeds spare cards into the ' +
        'ice, keeps the cards its best attack needs, and the battle log shows which cards it used. A ' +
        'frozen Item cannot fire until it has thawed.'),
      'Opponents no longer hex your Items for now. Their old hex Items hit like normal attacks instead.',
      'Bosses have less health than before, and the World 3 and World 4 bosses no longer freeze your Items.',
    ],
    'Item cards': [
      'Item cards and the battle log no longer use exclamation marks, like Bonus +50% if Pair.',
    ],
    'Match game': [
      'Match game prizes now use the same colors, icons and font as the resource bar at the top, for pairs and for the end of visit total.',
    ],
    Visual: [
      'Home Screen polish: the Fleet Compound picture now sits under the title, the first-to-beat shoutouts moved down above this log, Best Run and High Score share one size on one line each, the home screen tip is a bright yellow banner you can tap anywhere on, the name box sits next to New Run at the same height with Career Point Upgrades below, and Made by Drew and the feedback line are cleaner.',
      'Home Screen cleanup: the Career Points note moved to a one time popup after your first win, the stats now show how far you got (World, name and stop) and your high score, and the Career Points count is on the upgrades button.',
      'The Welcome line is gone. The name box just says Your name.',
      'New tip on the Home Screen for phones that explains how to add the game to your Home Screen on iPhone or Android.',
      'The Fleet Compound menu now fits on one screen on a phone, with two places side by side.',
      'The match game is now called Fleet Matching Game everywhere, so it fits on one line.',
      'New Home Screen icon on iPhone: the Fleet Compound garage instead of a plain F. Delete and re-add the Home Screen icon to see it.',
      'A Perfect Win now shows only Perfect Win! at the top, without the Battle Won line above it.',
      'The Dealership now shows its Item cards three across on phones.',
    ],
    Misc: [
      ('The first battle of every run is now the same: Spring Breaker with 48 health and the same starting hand, ' +
        'so a Perfect Win is always possible on your second turn. New players get a hint for each step, and there is a ' +
        'new armor step where you put one card into Guard Rail.'),
      ('You can now move your save to another browser or a Home Screen icon. On the home screen, ' +
        'open Move my save, tap Make code, copy it, then paste it into the same box on the other one and tap Load code.'),
      ('Fleet Plinko: Game Over spots now move to new places on every drop instead of growing ' +
        'out from the center. The pegs are packed much tighter so a chip keeps bouncing all the way down,' +
        ' and the walls between the bottom slots now sit directly under pegs so a chip cannot get stuck.'),
      ('Fleet Blackjack: the dealer now plays three hands, one facing each of yours, with one ' +
        'card showing on each. Your hands pay out on their own, so a strong dealer hand will not take ' +
        'all three. A true blackjack now beats a dealer 21 made with more cards. Rewards are bigger, and ' +
        'your two hands sit on top with the third centered below so everything fits without scrolling.'),
      ('Fleet Poker: two hands on top and one centered below, with the cards you are placing at ' +
        'the top. Tap an Item prize to see its real card. The computer\'s cards stay face up once yours ' +
        'are placed, the five board cards sit in one row with the Reveal button right under them, and ' +
        'the row stays pinned to the top if you scroll.'),
      ('Fleet Compound Dungeon: the three battles are compact rows so the page fits without ' +
        'scrolling, the Battle button is on top, and the win screen is shorter with a red Cash Out button.'),
      'The map screen no longer scrolls the page when there is nothing below the map.',
      ('Prize Items from Poker or the Auction can no longer push you past your Item slots. If ' +
        'you have no open slot, the prize shows as grayed out and pays coins instead.'),
    ],
    'Match game': [
      ('The Matching Game board shrinks to fit a phone held upright, so all the cards show on ' +
        'one screen. Pair Rewards now show real cards instead of text suits.'),
    ],
    Visual: [
      ('Overdrive Bay, Tuning Garage, Chop Shop and the Run Dashboard now fit on a phone. Item ' +
        'cards sit side by side with the button between them, the Dashboard shows three Items across, ' +
        'and Chop Shop uses the same layout as the others. The blank gap above page titles is gone on ' +
        'every page, and the Back and Upgrades buttons share one line. Back on the Run Dashboard returns ' +
        'you to the page you came from.'),
      ('The battle screen has a little less space around your cards, and the frozen note under ' +
        'the opponent\'s health is gone since its Item card already shows it. The gem Draw button now ' +
        'says Hand full when your hand has no room.'),
      ('A small i button beside your vehicle ability explains what it does without using it. The ' +
        'magnifying glass is gone from the battle pictures, but you can still tap a picture to enlarge ' +
        'it, and the enlarged picture now closes with a tap anywhere or the bigger X.'),
      ('Pictures now fit their boxes on every screen, with the whole subject shown instead of ' +
        'being clipped. Logi Bear, NayNay and others are fixed, and the battle screen fits better on phones.'),
      ('On a phone held upright, the battle screen opens scrolled to your cards. Names stay on ' +
        'one line so the health bars line up, and a slim bar with both sides\' health and effects stays ' +
        'pinned at the top while you scroll. The pictures sit above it. Sort, Draw, Discard and your ' +
        'ability share one row. End Turn, the deck and a small Reveal a card button sit between the two ' +
        'hands, and the opponent\'s cards start on the right. Item cards now sit three across, and the ' +
        'top bar shows just icons and numbers during battle. The opponent\'s cards now follow your Sort, ' +
        'so its own Sort button is gone.'),
      ('Map icons are noticeably bigger and their pictures fill the circle more, so you can tell ' +
        'what each stop is at a glance.'),
      ('Battle Stop Details are tidier. Item cards sit three across, Strategic pressure has its ' +
        'own line directly under Difficulty, and the battle type tag sits beside the name.'),
      ('Run Upgrade, Forfeit Run and Run Dashboard are now the same size everywhere. Run Upgrade ' +
        'stays purple, Forfeit Run is red and Run Dashboard is gray.'),
    ],
    Map: [
      'On a phone held upright the map is taller and fills more of the screen.',
      ('Stops sit closer to the top and bottom edges of the map, the Fleet Compound is much ' +
        'larger so it stands out as the focal point, and stops you have not scouted yet are filled with ' +
        'fog until they are uncovered.'),
      'Hex Items show up much less often in the Dealership for now.',
    ],
  } },
];
