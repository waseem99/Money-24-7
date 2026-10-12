// Stocks newsroom edition: immutable editorial reference, no media generation.
export const EDITION = Object.freeze({
  network: 'Stocks',
  date: '2026-10-12',
  title: "Oil Pressure, Bank Earnings and Wall Street's Next Test",
  totalSeconds: 260,
  live: false,
  logoPlacement: 'top-left-only',
  backgroundLogo: false,
  mainCast: {
    NORA: {onAirName:'Nora Ellery', role:'Lead Anchor', heygenLookId:'5ee67ac453c34ffebd71e8eedb47b2fe', lookName:'Liza Office 6', voiceId:'330290724a1b470fb63153f34d4c0183', voiceName:'Annie - Lifelike', engine:'avatar_iv'},
    MARCUS: {onAirName:'Marcus Varden', role:'Senior Markets Editor', heygenLookId:'de9f36c26bd841c891489a0c9d6174de', lookName:'Lasse Office 3', voiceId:'00e3d285aba44b27a83c47c02c9c2d9c', voiceName:'Orson - Firm & Measured', engine:'avatar_iv'}
  },
  correspondent: {status:'casting-unapproved', proposedLookId:'f230ac8a52b541089ec91d4c73148225', publicLook:'Zaina Modern Corporate 2'},
  sources: {
    R1: 'https://www.reuters.com/business/us-stock-futures-muted-oil-stays-above-100-ahead-earnings-2026-10-12/',
    R2: 'https://www.reuters.com/world/china/global-markets-wrapup-1-2026-10-12/',
    GS: 'https://www.goldmansachs.com/investor-relations/financials/quarterly-earnings-releases',
    CITI: 'https://www.citigroup.com/global/news/press-release/2026/citi-third-quarter-2026-earnings-call',
    BLS: 'https://www.bls.gov/schedule/2026/10_sched_list.htm',
    SIFMA: 'https://www.sifma.org/news/press-releases/sifma-fixed-income-market-close-recommendations-in-the-u-s-the-u-k-and-japan-for-u-s-columbus-day-and-japan-health-and-sports-day-holidays-2026'
  },
  marketSnapshot: {
    source:'R1', observedAt:'2026-10-12T09:40:00-04:00', status:'reported-snapshot-not-live',
    indexes:[{name:'Dow Jones',value:51761.98,changePct:0.21},{name:'S&P 500',value:7817.68,changePct:0.08},{name:'Nasdaq Composite',value:27355.94,changePct:-0.04}],
    sectors:[{name:'Energy',changePct:1.8},{name:'Communication services',changePct:1.1},{name:'Technology',changePct:-0.2}]
  }
});
export const SHOTS = Object.freeze([
  {id:1,start:0,end:6,speaker:null,camera:'ident',graphic:'OIL / EARNINGS / INFLATION',sources:['R1','BLS'],script:''},
  {id:2,start:6,end:22,speaker:'NORA',camera:'desk-wide',graphic:'WALL STREET FACES A BUSY WEEK',sources:['R1','BLS'],script:"Good morning. This is Stocks, and I'm Nora Ellery. Wall Street is opening the week almost flat, but beneath the surface, oil, big bank earnings and Wednesday's inflation report are pulling investors in different directions."},
  {id:3,start:22,end:35,speaker:'MARCUS',camera:'analyst-close',graphic:'MIXED OPEN / OIL PRESSURE',sources:['R1'],script:"And that split matters, Nora. The Dow is edging up; the S&P 500 is barely moving, while the Nasdaq has slipped. Technology is facing pressure even as energy shares advance."},
  {id:4,start:35,end:48,speaker:'NORA',camera:'anchor-close',graphic:'US EQUITIES / 09:40 ET',sources:['R1'],script:"Let's put numbers on that. At nine-forty Eastern, exactly how divided was the session, and where was the strength? Let's use the same confirmed snapshot for all three indexes."},
  {id:5,start:48,end:67,speaker:'MARCUS',camera:'indices-chart',graphic:'DOW +0.21% / S&P +0.08% / NASDAQ -0.04%',sources:['R1'],script:"The Dow gained zero point two one percent, the S&P zero point zero eight percent, and the Nasdaq edged down zero point zero four percent. That's Reuters' nine-forty Eastern snapshot. The key point is these indexes aren't moving together."},
  {id:6,start:67,end:84,speaker:'MARCUS',camera:'sector-wall',graphic:'ENERGY +1.8% / COMM SERVICES +1.1% / TECH -0.2%',sources:['R1'],script:"Look at sector leadership. Energy gained one point eight percent, communication services rose one point one, and technology declined zero point two. That's an energy-led cushion, not a broad technology rally."},
  {id:7,start:84,end:97,speaker:'NORA',camera:'remote-handoff',graphic:'ENERGY / GLOBAL MARKETS',sources:['R2'],script:"The reason energy is doing well is also the reason the market is uneasy. Let's bring in our markets correspondent for the oil story."},
  {id:8,start:97,end:117,speaker:'REMOTE',camera:'remote-window',graphic:'BRENT AROUND $106 / BBL / REPORTED SNAPSHOT',sources:['R2'],script:"Nora, Brent crude was trading around a hundred and six dollars a barrel on Monday, up roughly one point three percent in the Reuters global-markets report. The move followed renewed worries about supply and disruption in the Gulf. Traders are balancing those risks against uncertain diplomatic announcements."},
  {id:9,start:117,end:130,speaker:'NORA',camera:'remote-split',graphic:'WHY HIGHER OIL MATTERS',sources:['R2'],script:"And why should equity investors care about that oil price beyond energy shares? What happens to airlines, manufacturers and consumers if higher fuel costs stick around?"},
  {id:10,start:130,end:147,speaker:'REMOTE',camera:'remote-analysis',graphic:'OIL / TRANSPORT / COSTS / INFLATION',sources:['R2'],script:"Because fuel costs travel through the economy. They affect shipping, manufacturers and household budgets. If elevated oil feeds into inflation, it could keep borrowing costs higher for longer. That's the risk markets are weighing now."},
  {id:11,start:147,end:161,speaker:'MARCUS',camera:'analyst-close',graphic:'US FIXED INCOME: HOLIDAY CLOSE / OCT 12',sources:['SIFMA'],script:"There's a timing twist today: the US bond market is closed for Columbus Day. So we're not presenting a fresh Treasury-yield quote. That makes upcoming data and earnings even more important."},
  {id:12,start:161,end:185,speaker:'MARCUS',camera:'analyst-wall',graphic:'TUE OCT 13: GS + CITI / Q3 EARNINGS FORECAST +30.6%',sources:['GS','CITI','R1'],script:"Starting tomorrow, major banks report third-quarter earnings. Goldman Sachs and Citi are scheduled Tuesday. Investors will listen for what executives say about lending, credit losses and demand. Reuters cites an LSEG estimate of thirty point six percent year-on-year earnings growth for the S&P 500, but that's a forecast, not a reported result."},
  {id:13,start:185,end:204,speaker:'NORA',camera:'cpi-intro',graphic:'WED OCT 14 / 08:30 ET / SEPTEMBER CPI RELEASE',sources:['BLS'],script:"Then comes Wednesday's inflation test. The Bureau of Labor Statistics will publish September's consumer price index at eight-thirty Eastern on October fourteenth. Marcus, why does that report carry so much weight?"},
  {id:14,start:204,end:224,speaker:'MARCUS',camera:'cpi-explainer',graphic:'CPI ABOVE EXPECTATIONS / CPI BELOW EXPECTATIONS',sources:['BLS'],script:"It can change assumptions about interest rates and how investors value future earnings. A hotter reading could revive inflation concerns; a softer one could ease them. Neither outcome is known yet, so any forecast must remain clearly labeled as a forecast."},
  {id:15,start:224,end:242,speaker:'NORA',camera:'desk-wide',graphic:'OIL / BANK EARNINGS / CPI',sources:['R1','R2','BLS'],script:"So here's what we know and what we're watching: oil is already pressuring sentiment, bank reports arrive Tuesday, and inflation lands Wednesday. Marcus, what's your single takeaway for this week?"},
  {id:16,start:242,end:252,speaker:'MARCUS',camera:'analyst-close',graphic:'WHAT TO WATCH NEXT',sources:['R1','BLS'],script:"Watch the evidence, not the noise: earnings guidance, energy prices and the inflation surprise. Those will set the next tone."},
  {id:17,start:252,end:260,speaker:'NORA',camera:'desk-signoff',graphic:'THANK YOU FOR WATCHING',sources:['R1'],script:"I'm Nora Ellery, with Marcus Varden. This is Stocks. Thanks for watching."}
]);
export const PROOF = Object.freeze({
  kind:'two-turn-quality-gate',
  shots:[15,16],
  avatarEngine:'avatar_iv',
  resolution:'1080p',
  maxPlannedGeneratedSeconds:30,
  estimatedMaximumUSD:1.50,
  note:'One approved speaker clip per role; validate lip sync and dialogue before full production. Not an account billing cap.'
});
