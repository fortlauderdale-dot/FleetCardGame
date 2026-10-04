// Fleet Duel offline support. Saves the game page and every picture on the first visit,
// so the game keeps working with no internet (a flight, for example).
// Bump CACHE_VERSION whenever pictures or game files change so phones download the new ones.
const CACHE_VERSION = 'fleet-duel-v3';
const GAME_FILES = [
  'css/01-base.css',
  'css/02-battle-board.css',
  'css/03-cards.css',
  'css/04-map.css',
  'css/05-stop-details.css',
  'css/06-phone-battle.css',
  'css/07-minigames.css',
  'css/08-phone-layout.css',
  'css/09-minigames-layout.css',
  'js/01-cards-and-hands.js',
  'js/02-effects-and-icons.js',
  'js/03-item-rules.js',
  'js/04-item-catalog.js',
  'js/05-vehicles.js',
  'js/06-card-display.js',
  'js/07-opponents.js',
  'js/08-profile-and-saves.js',
  'js/09-opponents-more.js',
  'js/10-difficulty-settings.js',
  'js/11-difficulty-table.js',
  'js/12-difficulty-engine.js',
  'js/13-map-and-run.js',
  'js/14-game-plinko.js',
  'js/15-game-blackjack.js',
  'js/16-game-poker.js',
  'js/17-game-auction.js',
  'js/18-game-matching.js',
  'js/19-garage-and-run-end.js',
  'js/20-battle-logic.js',
  'js/21-battle-actions.js',
  'js/22-screens-map.js',
  'js/23-screens-battle.js',
  'js/24-screens-garage-shops.js',
  'js/25-update-log.js',
  'js/26-main-menu.js',
  'js/27-picture-fitting.js',
  'js/28-render-and-events.js',
  'js/29-startup.js',
];
const PICTURES = [
  'Hazards/aggressive-shopper.png',
  'Hazards/alpha-frigatebird.png',
  'Hazards/ammonia-leak.png',
  'Hazards/angry-citizen-mob.png',
  'Hazards/angry-parts-clerk.png',
  'Hazards/anthony.png',
  'Hazards/bait-barge.png',
  'Hazards/banana-spider.png',
  'Hazards/barnacle-buoy.png',
  'Hazards/barnacle-crusted-hull.png',
  'Hazards/bionic-brett.png',
  'Hazards/blown-a-c-compressor.png',
  'Hazards/boardwalk-tourist.png',
  'Hazards/bog-sinkmud.png',
  'Hazards/breakroom-fish-heater.png',
  'Hazards/broken-boardwalk-plank.png',
  'Hazards/broken-ev-charger.png',
  'Hazards/broken-parking-meter.png',
  'Hazards/broken-ticket-dispenser.png',
  'Hazards/brush-fire-smoke.png',
  'Hazards/bull-gator.png',
  'Hazards/bullfrog-ambush.png',
  'Hazards/burmese-python.png',
  'Hazards/cane-toad.png',
  'Hazards/chain-hoist.png',
  'Hazards/chelsy.png',
  'Hazards/city-auditor.png',
  'Hazards/city-bus-running-late.png',
  'Hazards/clumsy-inventory-stocker.png',
  'Hazards/code-enforcer.png',
  'Hazards/cold-stunned-iguana.png',
  'Hazards/cottonmouth-viper.png',
  'Hazards/crew-van.png',
  'Hazards/customs-inspector.png',
  'Hazards/customs-k-9-beagle.png',
  'Hazards/customs-sweep-team.png',
  'Hazards/dark-traffic-signal.png',
  'Hazards/debris-pile.png',
  'Hazards/delayed-delivery-driver.png',
  'Hazards/delivery-vespa.png',
  'Hazards/dock-crab-swarm.png',
  'Hazards/dock-crab.png',
  'Hazards/dockside-ice-machine.png',
  'Hazards/downed-power-line.png',
  'Hazards/drawbridge.png',
  'Hazards/drew.png',
  'Hazards/drifting-container-ship.png',
  'Hazards/drifting-jellyfish-swarm.png',
  'Hazards/drifting-jellyfish.png',
  'Hazards/dumpster-fire.png',
  'Hazards/eevee.png',
  'Hazards/evil-mechanic.png',
  'Hazards/expired-fire-extinguisher.png',
  'Hazards/falling-coconut.png',
  'Hazards/falling-palm-frond.png',
  'Hazards/feral-beach-cat-colony.png',
  'Hazards/feral-beach-cat.png',
  'Hazards/feral-hog.png',
  'Hazards/fire-ant-mound.png',
  'Hazards/fire-ant.png',
  'Hazards/fisherman-chris.png',
  'Hazards/flickering-streetlamp.png',
  'Hazards/flipped-dumpster.png',
  'Hazards/flooded-pothole.png',
  'Hazards/four-pm-thunderstorm.png',
  'Hazards/free-downtown-wi-fi.png',
  'Hazards/fuel-dock-siphoner.png',
  'Hazards/fuel-island-fire.png',
  'Hazards/fuel-tanker.png',
  'Hazards/gantry-crane-in-a-storm.png',
  'Hazards/gridlock-commuter.png',
  'Hazards/gridlocked-intersection.png',
  'Hazards/grumpy-sea-turtle.png',
  'Hazards/haley.png',
  'Hazards/harbor-tug.png',
  'Hazards/harbormaster.png',
  'Hazards/hermit-crab-stolen-shell.png',
  'Hazards/hungry-parking-meter.png',
  'Hazards/icy-pallet-jack.png',
  'Hazards/illegally-parked-semi.png',
  'Hazards/injury-lawyer-billboard.png',
  'Hazards/inventory-clerk.png',
  'Hazards/jen.png',
  'Hazards/joker-black.png',
  'Hazards/joker-map.png',
  'Hazards/joker-red.png',
  'Hazards/key-losing-service-writer.png',
  'Hazards/king-tide-flood.png',
  'Hazards/late-cruise-passenger.png',
  'Hazards/lifeguard-tower-sentinel.png',
  'Hazards/live-bait-bucket.png',
  'Hazards/live-shot-news-van.png',
  'Hazards/lobster-trap.png',
  'Hazards/logi-bear.png',
  'Hazards/lost-sunglasses.png',
  'Hazards/loud-street-performer.png',
  'Hazards/love-bug-swarm.png',
  'Hazards/love-bug.png',
  'Hazards/lunch-stealing-coworker.png',
  'Hazards/malarial-fog.png',
  'Hazards/malfunctioning-ice-machine.png',
  'Hazards/marine-patrol-boat.png',
  'Hazards/mega-yacht-wake.png',
  'Hazards/melting-pallet.png',
  'Hazards/midday-heat.png',
  'Hazards/mooring-cleat.png',
  'Hazards/mosquito-cloud.png',
  'Hazards/nala.png',
  'Hazards/naynay.png',
  'Hazards/new-river-water-taxi.png',
  'Hazards/nuisance-gator.png',
  'Hazards/oblivious-commuter.png',
  'Hazards/oblivious-vlogger.png',
  'Hazards/osha-inspector.png',
  'Hazards/over-caffeinated-lube-tech.png',
  'Hazards/overloaded-forklift.png',
  'Hazards/overloaded-scrap-truck.png',
  'Hazards/overworked-logistics-worker.png',
  'Hazards/overzealous-metal-detectorist.png',
  'Hazards/overzealous-valet.png',
  'Hazards/pallet-wrapper.png',
  'Hazards/parking-enforcer.png',
  'Hazards/parking-pay-station.png',
  'Hazards/patrol-helicopter.png',
  'Hazards/pelican-eyeing-your-lunch.png',
  'Hazards/pickpocket.png',
  'Hazards/power-tripping-bouncer.png',
  'Hazards/procurement.png',
  'Hazards/pufferfish.png',
  'Hazards/raccoon-gang.png',
  'Hazards/reckless-scanner-gun.png',
  'Hazards/reckless-surfboard.png',
  'Hazards/rental-jet-ski-menace.png',
  'Hazards/repo-tow-truck.png',
  'Hazards/rest-stop-raccoon.png',
  'Hazards/rideshare-driver.png',
  'Hazards/rip-current.png',
  'Hazards/river-otter.png',
  'Hazards/rogue-beach-umbrella.png',
  'Hazards/rogue-delivery-drone.png',
  'Hazards/rogue-wave.png',
  'Hazards/rude-parts-manager.png',
  'Hazards/runaway-beach-ball.png',
  'Hazards/runaway-bicycle.png',
  'Hazards/runaway-creeper.png',
  'Hazards/runaway-forklift.png',
  'Hazards/runaway-kite.png',
  'Hazards/runaway-pressure-washer-wand.png',
  'Hazards/runaway-valet-cart.png',
  'Hazards/runaway-yard-mule.png',
  'Hazards/sargassum-sea-creature.png',
  'Hazards/sawgrass.png',
  'Hazards/screaming-dispatcher.png',
  'Hazards/screaming-dockmaster.png',
  'Hazards/shop-cat.png',
  'Hazards/shrimp-boat-net-snag.png',
  'Hazards/shrinkwrap-boulder.png',
  'Hazards/sidewalk-influencer.png',
  'Hazards/sign-spinner.png',
  'Hazards/sinkhole.png',
  'Hazards/sinking-charter-yacht.png',
  'Hazards/sketchy-valet-driver.png',
  'Hazards/smash-and-grab-crew.png',
  'Hazards/snagged-anchor-chain.png',
  'Hazards/snapping-gator.png',
  'Hazards/snowbird-in-the-left-lane.png',
  'Hazards/spring-breaker.png',
  'Hazards/steaming-manhole.png',
  'Hazards/storm-drain.png',
  'Hazards/stormwater-pump.png',
  'Hazards/stuck-bay-door.png',
  'Hazards/sunburnt-tourist.png',
  'Hazards/sunken-airboat.png',
  'Hazards/swamp-gas.png',
  'Hazards/swamp-mosquito.png',
  'Hazards/tangled-fishing-net.png',
  'Hazards/territorial-seagull.png',
  'Hazards/third-shift-mechanic.png',
  'Hazards/thirsty-leeches.png',
  'Hazards/timeshare-salesman.png',
  'Hazards/towed-sailboat.png',
  'Hazards/transformer-on-a-pole.png',
  'Hazards/unlicensed-detailer.png',
  'Hazards/unpermitted-sandcastle.png',
  'Hazards/unsafe-welder.png',
  'Hazards/unused-rogue-wave.png',
  'Hazards/walk-in-walker.png',
  'Hazards/water-moccasin.png',
  'Hazards/wild-hog-herd.png',
  'Hazards/wobbly-container-straddle.png',
  'Hazards/wobbly-rental-kayak.png',
  'Icons/career-points.png',
  'Icons/coin.png',
  'Icons/energy.png',
  'Icons/fog-bank.png',
  'Icons/fuel.png',
  'Icons/gem.png',
  'Icons/heart.png',
  'Icons/node-chop-shop.png',
  'Icons/node-dealership.png',
  'Icons/node-fleet-auction.png',
  'Icons/node-fleet-blackjack.png',
  'Icons/node-fleet-compound.png',
  'Icons/node-fleet-plinko.png',
  'Icons/node-fleet-poker.png',
  'Icons/node-overdrive-bay.png',
  'Icons/node-service-station.png',
  'Icons/node-supply-cache.png',
  'Icons/node-tuning-garage.png',
  'Transitions/world-1-complete.jpg',
  'Transitions/world-2-complete.jpg',
  'Transitions/world-3-complete.jpg',
  'Transitions/world-4-complete.jpg',
  'Transitions/world-5-complete.jpg',
  'Transitions/world-6-complete.jpg',
  'Transitions/world-7-complete.jpg',
  'Vehicles/admin-vehicle.png',
  'Vehicles/arff.png',
  'Vehicles/beach-tractor.png',
  'Vehicles/bearcat.png',
  'Vehicles/castle-champion.png',
  'Vehicles/castle-guard.png',
  'Vehicles/castle-overlord.png',
  'Vehicles/crown-vic.png',
  'Vehicles/fire-truck.png',
  'Vehicles/forklift.png',
  'Vehicles/fuel-tanker.png',
  'Vehicles/golf-cart.png',
  'Vehicles/large-suv.png',
  'Vehicles/tow-truck.png',
  'Vehicles/work-truck.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(async (cache) => {
      await cache.add('./').catch(() => {});
      await cache.add('./index.html').catch(() => {});
      // One picture failing should not stop the rest from saving.
      for (const file of [...GAME_FILES, ...PICTURES]) {
        await cache.add(file).catch(() => {});
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE_VERSION).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Pages and game code try the internet first so updates show up right away.
  const isPage = event.request.mode === 'navigate';
  const isCode = /\.(js|css)(\?|$)/.test(event.request.url);
  if (isCode) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(
    isPage
      ? // Pages: try the internet first so updates show up, use the saved copy when offline.
        fetch(event.request)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put('./index.html', copy));
            return res;
          })
          .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
      : // Everything else: use the saved copy first, save new things as they load (fonts, for example).
        caches.match(event.request).then(
          (hit) =>
            hit ||
            fetch(event.request).then((res) => {
              if (res && (res.ok || res.type === 'opaque')) {
                const copy = res.clone();
                caches.open(CACHE_VERSION).then((c) => c.put(event.request, copy));
              }
              return res;
            })
        )
  );
});
