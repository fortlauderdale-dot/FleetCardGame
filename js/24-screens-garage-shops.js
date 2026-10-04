// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Screens: Overdrive Bay                                                        ██
// ██  Adding uses per turn to your Items.                                           ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

function overdriveBayScreen() {
  const holoCompareBlock = (beforeHTML, afterHTML, cost, cta) =>
    `<div class="holoRow" style="display:flex;` +
    `align-items:center;gap:12px;justify-content:center;width:100%;margin:10px 0">
      <div style="flex:0 0 auto">${beforeHTML}</div>
      <div class="holoMid" style="display:flex;flex:0 0 auto;flex-direction:column;` +
    `align-items:center;justify-content:center;gap:6px">
        <span style="font-size:26px;color:var(--amber);line-height:1">➔</span>
        ${cta}
        <span class="price" style="white-space:nowrap">${cost} coins</span>
      </div>
      <div style="flex:0 0 auto">${afterHTML}</div>
    </div>`;
  const uniqueItemIds = [...new Set(RUN.hero.items)].filter(
    (id) => ITEMS[id] && ITEMS[id].kind !== 'storage' && ITEMS[id].usesPerTurnPerLevel
  );
  const rows = uniqueItemIds
    .map((id) => {
      const item = ITEMS[id];
      const usesLvl = itemUsesLevel(id),
        usesMaxed = usesLvl >= ITEM_MAX_USES_LEVEL;
      const usesCost = usesMaxed ? 0 : itemUsesTuneCost(usesLvl);
      const usesNow = itemUsesCap(item, usesLvl);
      const before = renderStandardItemCard(item, { usesBadgeText: `${usesNow}` });
      let after = before;
      if (!usesMaxed) {
        RUN.itemUsesLevels[id] = usesLvl + 1;
        after = renderStandardItemCard(item, { usesBadgeText: `${itemUsesCap(item, usesLvl + 1)}` });
        RUN.itemUsesLevels[id] = usesLvl;
      }
      const cta = usesMaxed
        ? `<span class="note">Maxed</span>`
        : `<button class="wo-btn amber" data-usesup="${id}" ` +
          `style="padding:6px 10px;font-size:12px;` +
          `white-space:nowrap" ${RUN.chips < usesCost ? 'disabled' : ''}>+1 Use Per Turn</button>`;
      return `<div class="shopcard holoCard" style="padding:14px 16px">
      ${holoCompareBlock(before, after, usesMaxed ? '—' : usesCost, cta)}
      ${
        usesLvl > 0
          ? `<div style="text-align:center"><button class="wo-btn gray" ` +
            `data-usesdown="${id}" style="padding:6px 10px;font-size:12px">Refund</button></div>`
          : ''
      }
    </div>`;
    })
    .join('');
  return (
    `<div id="overdrive-viewport">${noticeHTML()}<div class="wo"><div class="wo-stripe">` +
    `</div><div class="wo-body">
    <h1>Overdrive <em>Bay</em></h1>${currencyBar()}
    <div style="display:flex;gap:8px;margin:10px 0">
      <button class="wo-btn facilityExitBtn" id="leaveOverdriveBtn" ` +
    `style="flex:1">${RETURN_TO_CASTLE_MENU ? 'Back to Compound' : roadExitLabel()}</button>
      <button class="wo-btn purple" id="openRunUpgradeFromOverdriveBtn" style="flex:1">Upgrades</button>
    </div>
    <div style="margin:12px 0">${rows || '<div class="note">No eligible Items equipped.</div>'}</div>
  </div></div></div>`
  );
}


// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Screens: Chop Shop                                                            ██
// ██  Converting Items and adding card slots.                                       ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

function chopShopScreen(returnTo) {
  const rows = RUN.hero.items
    .map((itemId, index) => {
      const item = ITEMS[itemId];
      if (!item) return '';
      if (item.kind === 'storage') return '';
      const instanceKey = `${itemId}_${index}`;
      const current = RUN.itemKindOverride[instanceKey] || RUN.itemKindOverride[itemId];
      const alreadyModified = !!current;
      const original = renderStandardItemCard(item, {});
      const convertCost = itemKindConvertCost();

      // One row per conversion, same shape as the Overdrive Bay and Tuning Garage: original card, an arrow above
      // the button with the coin price under it, then the converted card. Two cards per row so it fits a phone.
      let convertBlockHTML;
      if (alreadyModified) {
        convertBlockHTML =
          `<div class="note" style="text-align:center;width:100%">Already ` +
          `modified to <b>${current}</b>. No further modification this run.</div>`;
      } else {
        convertBlockHTML = ['poison', 'burn', 'curse']
          .map((k) => {
            const previewCard = renderStandardItemCard(item, { kindOverride: k });
            return (
              `<div class="holoRow" style="display:flex;align-items:center;` +
              `justify-content:center;gap:12px;margin:8px 0">
          <div style="flex:0 0 auto">${original}</div>
          <div class="holoMid" style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:0 0 auto">
            <span style="font-size:24px;color:var(--amber);line-height:1">➔</span>
            <button class="wo-btn ${k === 'poison' ? 'green' : k === 'burn' ? 'red' : 'purple'}" ` +
              `data-kindconvert="${itemId}" data-item-index="${index}" data-kindto="${k}" style="padding:6px ` +
              `10px;font-size:12px" ${RUN.chips < convertCost ? 'disabled' : ''}>Convert to ${k[0].toUpperCase() + k.slice(1)}</button>
            <span class="price" style="font-size:12px;white-space:nowrap">${convertCost} coins</span>
          </div>
          <div style="flex:0 0 auto">${previewCard}</div>
        </div>`
            );
          })
          .join('');
      }

      return `<div class="shopcard holoCard">${convertBlockHTML}</div>`;
    })
    .join('');
  const utilityRows = RUN.hero.items
    .map((id, i) => {
      if (id === 'drawstone') {
        const l = utilityLevel(id),
          cost = l >= 3 ? 0 : Math.round(60 * Math.pow(2, l));
        return (
          `<div class="shopcard"><b>Drawstone Requirement Upgrade</b><div class="note">` +
          `Current: ${Math.max(4, 7 - l)}. Upgrade lowers the requirement by 1, down to 4.</div><button ` +
          `class="wo-btn purple" ` +
          `data-utilityup="drawstone" ${l >= 3 || RUN.chips < cost ? 'disabled' : ''}>${l >= 3 ? 'Maxed' : 'Lower Requirement (' + cost + ' coins)'}</button>` +
          `</div>`
        );
      }
      if (id === 'impound_release') {
        const l = utilityLevel(id),
          cost = l >= 2 ? 0 : Math.round(75 * Math.pow(2, l));
        return (
          `<div class="shopcard"><b>Impound Release Charge Upgrade</b><div class="note">` +
          `Current: ${Math.max(35, 45 - l * 5)}. Upgrade lowers the threshold by 5, down to 35.</div>` +
          `<button class="wo-btn purple" ` +
          `data-utilityup="impound_release" ${l >= 2 || RUN.chips < cost ? 'disabled' : ''}>${
            l >= 2 ? 'Maxed' : 'Lower Charge Threshold ' + '(' + cost + ' coins)'
          }</button>` +
          `</div>`
        );
      }
      return '';
    })
    .join('');
  return (
    `<div id="chopshop-viewport">${noticeHTML()}<div class="wo"><div class="wo-stripe">` +
    `</div><div class="wo-body">
    <h1>Chop <em>Shop</em></h1>${currencyBar()}
    <div style="display:flex;gap:8px;margin:10px 0">
      <button class="wo-btn facilityExitBtn" id="leaveChopShopBtn" ` +
    `style="flex:1">${RETURN_TO_CASTLE_MENU ? 'Back to Compound' : roadExitLabel()}</button>
      <button class="wo-btn purple" id="openRunUpgradeFromChopShopBtn" style="flex:1">Upgrades</button>
    </div>
    <div class="note" style="margin:10px 0">Convert an item to poison, burn, or curse.</div>
    <div style="margin:12px 0">${rows || '<div class="note">No Items available.</div>'}${utilityRows}</div>
  </div></div></div>`
  );
}
