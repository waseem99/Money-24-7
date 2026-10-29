import {buildScriptVersion} from './script-pack.mjs';

export function moneyEssentialsRatesEdition(broadcastDate = '2026-10-29') {
  const sources = [
    {
      sourceId: 'src-sbp-policy-note',
      url: 'https://example.com/sources/sbp-policy-note',
      title: 'Central bank policy communication (fixture)',
      observedAt: '2026-10-28T10:00:00+05:00',
      publishedAt: '2026-10-28T09:30:00+05:00',
      marketSession: 'PK-local',
      currency: 'PKR',
      units: 'percent',
      rights: 'licensed-snapshot',
    },
    {
      sourceId: 'src-pkr-money-market',
      url: 'https://example.com/sources/pkr-money-market',
      title: 'PKR money-market snapshot (fixture)',
      observedAt: '2026-10-28T16:00:00+05:00',
      publishedAt: '2026-10-28T16:00:00+05:00',
      marketSession: 'PK-close',
      currency: 'PKR',
      units: 'percent',
      rights: 'licensed-snapshot',
    },
  ];
  const claims = [
    {
      claimId: 'c-policy-stance',
      kind: 'fact',
      text: 'Policy communication in the fixture note restates the current stance without a new cut.',
      sourceIds: ['src-sbp-policy-note'],
    },
    {
      claimId: 'c-mm-print',
      kind: 'fact',
      text: 'Illustrative overnight money-market print is 12.40 percent in the fixture snapshot.',
      sourceIds: ['src-pkr-money-market'],
      numericValue: 12.4,
      unit: 'percent',
    },
    {
      claimId: 'c-watchpoint',
      kind: 'analysis',
      text: 'Households should separate policy rate headlines from what banks actually charge on new loans.',
      sourceIds: ['src-sbp-policy-note', 'src-pkr-money-market'],
    },
  ];
  return buildScriptVersion({
    episodeId: `me-rates-${broadcastDate}`,
    programme: 'Money Essentials',
    edition: 'Rates Primer',
    broadcastDate,
    version: 1,
    script: {
      language: 'ur-en',
      opening: 'Assalam o alaikum — Money Essentials, rates edition for 29 October. Main bat simple: headline policy aur bank pricing ek cheez nahi.',
      body: 'Pehli claim: fixture policy note mein stance restated hai, naya cut nahi. Doosri: money-market snapshot overnight print 12.40 percent dikhata hai — yeh illustrative figure hai, live quote nahi. Isliye jab koi kehay rate gir gaya, poochhein: kaunsa rate, kis product par, aur kab effective?',
      closing: 'Watchpoint: next scheduled communication se pehle personal loan offers ko policy headline se match karke dekhein. Shukriya.',
      estimatedDurationSec: 300,
      presenterId: 'amina-ur',
      lookId: 'studio-day-01',
    },
    sources,
    claims,
    charts: [{
      chartId: 'chart-mm',
      title: 'Illustrative overnight money-market print',
      claimIds: ['c-mm-print'],
      note: 'Label source time; never present as live ticker.',
    }],
    broll: [{
      sceneId: 'br-city-morning',
      description: 'Neutral Karachi morning city plate, no logos or prices in frame.',
      aspectRatio: '16:9',
      targetDurationSec: 4,
    }],
    sourceCutoff: '2026-10-28T16:00:00+05:00',
    sourceExpiry: '2026-10-30T18:00:00+05:00',
  });
}

export function marketwatchBriefAsiaEdition(broadcastDate = '2026-10-29') {
  const sources = [
    {
      sourceId: 'src-asia-index-open',
      url: 'https://example.com/sources/asia-index-open',
      title: 'Asia cash equity open snapshot (fixture)',
      observedAt: '2026-10-29T09:15:00+05:00',
      publishedAt: '2026-10-29T09:10:00+05:00',
      marketSession: 'Asia-open',
      currency: 'USD',
      units: 'index-points',
      rights: 'licensed-snapshot',
    },
    {
      sourceId: 'src-brent-morning',
      url: 'https://example.com/sources/brent-morning',
      title: 'Brent morning marker (fixture)',
      observedAt: '2026-10-29T09:00:00+05:00',
      publishedAt: '2026-10-29T09:00:00+05:00',
      marketSession: 'global-energy',
      currency: 'USD',
      units: 'USD/bbl',
      rights: 'licensed-snapshot',
    },
  ];
  const claims = [
    {
      claimId: 'c-asia-open-bias',
      kind: 'fact',
      text: 'Fixture Asia open snapshot shows a mixed bias across major cash benchmarks.',
      sourceIds: ['src-asia-index-open'],
    },
    {
      claimId: 'c-brent',
      kind: 'fact',
      text: 'Illustrative Brent morning marker is 78.50 USD per barrel in the fixture.',
      sourceIds: ['src-brent-morning'],
      numericValue: 78.5,
      unit: 'USD/bbl',
    },
    {
      claimId: 'c-pk-link',
      kind: 'analysis',
      text: 'For Pakistan viewers, energy marker moves matter more today than a single equity headline.',
      sourceIds: ['src-brent-morning', 'src-asia-index-open'],
    },
  ];
  return buildScriptVersion({
    episodeId: `mwb-asia-${broadcastDate}`,
    programme: 'MarketWatch Brief',
    edition: 'Asia Open',
    broadcastDate,
    version: 1,
    script: {
      language: 'en',
      opening: 'Good morning — MarketWatch Brief, Asia open edition for 29 October. We are not calling a US close; this is an Asia-session open pack.',
      body: 'Asia cash opens look mixed in the fixture snapshot — treat that as a session open read, not a day verdict. Brent morning marker in the pack is 78.50 dollars a barrel, illustrative only. If you trade or cover Pakistan energy costs, that marker is the tighter watchpoint than one equity index swing.',
      closing: 'Closing watchpoint: revisit energy and Asia risk into the Europe handoff; do not label intraday prints as a close. Thanks for watching.',
      estimatedDurationSec: 300,
      presenterId: 'nora-en',
      lookId: 'studio-day-01',
    },
    sources,
    claims,
    charts: [{
      chartId: 'chart-brent',
      title: 'Illustrative Brent morning marker',
      claimIds: ['c-brent'],
      note: 'Show source timestamp; not a live ticker.',
    }],
    broll: [{
      sceneId: 'br-trading-floor-wide',
      description: 'Wide muted trading-floor atmosphere, no readable tickers.',
      aspectRatio: '16:9',
      targetDurationSec: 5,
    }],
    sourceCutoff: '2026-10-29T09:15:00+05:00',
    sourceExpiry: '2026-10-29T14:00:00+05:00',
  });
}

export function twoDistinctEditions(broadcastDate = '2026-10-29') {
  const a = moneyEssentialsRatesEdition(broadcastDate);
  const b = marketwatchBriefAsiaEdition(broadcastDate);
  if (a.episodeId === b.episodeId || a.scriptSha === b.scriptSha) {
    throw new Error('fixture editions must be distinct');
  }
  return [a, b];
}
