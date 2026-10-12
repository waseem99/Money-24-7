# Jazz AI Channel — Formal Wardrobe Conversion & Provider Readiness

## Additional source inspection — verified, zero spend

The *existing* alternative Photo Looks were downloaded through authenticated **GET only** and visually inspected in [GitHub run #38206601070](https://github.com/waseem99/Money-24-7/actions/runs/38206601070) ([ZIP with both source images](https://github.com/waseem99/Money-24-7/actions/runs/38206601070/artifacts/11727347820)). Both are unsuitable for our formal film:

- **Rumi existing Photo Look 4fd269954c4a401d81dc0fec69e7eed8:** the same loose green shirt and residential interior as the recorded video.
- **Kevin existing Photo Look 26196c98e584435e8159cb8c1378f6ed:** white casual henley-style top, relaxed selfie view, laptop and bed; not a blazer/suit or appropriate broadcast set.

Therefore neither already-available alternate look provides a cost-free business-formal shortcut. The only valid route is a **new provider-authorized formal wardrobe Look** (or appropriately licensed real formal source footage). No HeyGen generation or new voice/video charges were made for this inspection.

---



**State as at 12 October 2026: BLOCKED ON PUBLIC-AVATAR LOOK EDIT RIGHTS.** This is a styling and production specification, not a claim that formal avatar footage has been generated. No additional HeyGen generation credits have been spent on outfit changes.

## Frozen identities, appearance only changes

| Role | Original public video-trained identity | Locked voice |
|---|---|---|
| Lead female anchor | Rumi — group 74384d3dd9894ffb83cca47473eb6829; casual look efa5d7cf738a4efd84b1dac501d9aef8 | Annie — Lifelike; voice 330290724a1b470fb63153f34d4c0183 |
| Male market analyst | Kevin — group ce741649eb8c4ca38cd34164881a2ef5; casual look c8f428c549ea448488fdb2214dbcad57 | Orson — Firm & Measured; voice 00e3d285aba44b27a83c47c02c9c2d9c |

Both identity faces and both voice IDs are frozen. Their existing video-trained public looks still wear casual clothing and do not satisfy the final film's wardrobe requirement.

## Target Rumi business-formal look

- Premium midnight-navy blazer, tailored, single-breasted with clean lapels; ivory or cream formal blouse; minimal understated jewelry.
- Professional female financial-news anchor appearance. Rumi's original facial likeness, bob hairstyle, natural age, complexion and skin texture remain intact.
- Portrait, medium-close or upper-waist, eye level, shoulders relaxed, natural expression and genuine visible lips; no aggressive retouching.
- Neutral professional studio/chroma backdrop if and only if actual background modification is available. No residential room, casual green shirt or T-shirt.
- Suitable for compositing into the existing Signal navy/teal 16:9 newsroom, headlines and lower-thirds.

**Exact outfit-edit prompt, only if the provider explicitly permits modifying this licensed identity:**

> Preserve exactly the same recognizable public Rumi avatar face, hair, facial proportions, natural age and skin complexion. Change only her outfit to a premium tailored midnight-navy single-breasted professional news-anchor blazer with subtle defined lapels over a clean ivory formal blouse. Minimal makeup and refined discreet jewelry, calm newsroom presence, natural shoulders and resting hands, medium-close camera eye-level shot. Remove residential interiors and use a neutral studio or authentic chroma-ready background. Balanced soft key/fill/rim television lighting, realistic skin texture, no new face, no exaggerated smile, no changed body anatomy, no text, logos or graphics. Facial area remains large enough for believable lip synchronization with Annie.

## Target Kevin business-formal look

- Structured charcoal or deep-navy tailored suit jacket, crisp pale-blue/white business-collared shirt; subtle dark tie optional.
- Seasoned financial-market analyst look, not sales-pitch casual. No polo, hoodie, T-shirt, sweater or residential setting.
- Existing Kevin facial identity and natural appearance unchanged. Landscape 16:9, upper-waist/medium shot, measured professional posture, space beside him for a financial chart.
- Studio-ready key/fill/rim lighting. Hands natural, eyes calm, clean lips and jaw for Orson speech synchronization.

**Exact outfit-edit prompt, only if the provider explicitly permits modifying this licensed identity:**

> Preserve this exact existing public Kevin avatar person and facial likeness, skin, hair, natural age and build. Change only his attire to a premium, well-tailored charcoal single-breasted financial-news analyst suit jacket with a neatly pressed pale-blue collared dress shirt; understated dark tie optional. Professional Wall Street market-analyst presentation, relaxed credible posture and limited authentic gestures, waist-up 16:9 composition, eye-level camera with space for chart panels. A clean muted professional studio background or genuine chroma-ready video setting. Natural balanced broadcast lighting, face unmodified, no casually open polo collar or casual clothing, no text, props, logos, extra people or fake gestures. Retain accurate Orson lip-sync.

## What HeyGen exposes today — and why no generation has been performed

- Rumi public group currently lists exactly one Video Look and one Photo Look. Kevin public group also lists one Video Look and one Photo Look. Read-only catalog searches filtering those groups by PRIVATE ownership returned **zero** for each; they belong to HeyGen's PUBLIC catalog.
- The connected HeyGen interface lists *Look Packs* and provides look-type previews, but exposes **no authorized create-look / edit-look tool for these existing public identities**. HeyGen's update-avatar-group action documents that it supports owned identities and **not public avatars**.
- HeyGen explains that outfit customization can be done with **Design a Look**, **Custom Edit** and **Presenter / Modern Corporate Look Packs** on avatars that can be managed. That documentation does not certify that this account can remix the public Rumi and Kevin identities, or that an updated photo-look will retain the video-trained natural gestures.
- HeyGen's current credits FAQ says one generated Photo Look uses **one premium credit per look**, which belongs to the WEB plan's separate credit system, **not necessarily the $5 pay-as-you-go API-video wallet**. Generate nothing until available look credits and rights are confirmed.
- A genuine alternate Video Look using another filmed outfit requires licensed, consenting same-person footage. No such Rumi or Kevin formal video source is available to this project. Do not upload, clone or create a new private identity using another person's likeness without required provider authorization.
- Adding a virtual studio, cropping the frame or overlaying a blazer-shaped graphic onto moving clothing **does not meet the requirement** for authentic on-screen business-formal attire.

Sources: [HeyGen Avatar Looks Explained](https://help.heygen.com/en/articles/9964694-avatar-looks-explained), [How to Generate Looks](https://www.heygen.com/academy/avatars/how-to-generate-looks), [How to Use Credits](https://help.heygen.com/en/articles/15126059-how-to-use-credits-on-heygen).

## Curated Look Pack IDs (catalog research, not applied)

| Style | Female look-pack ID | Male look-pack ID |
| --- | --- | --- |
| Presenter | 48a22dcb94544fb9b854882d58025b60 | 2611da122c354c21a3a98ef7d8450f10 |
| Modern Corporate | 5a8e6be843ee4321a014946bf62aa322 | 5e659e76755d47fd9160a2d7dedce124 |

The packs are theme references, not approved actual looks of Rumi and Kevin. Generating a pack may produce five variations and create more cost than one targeted custom edit.

## Implementation already committed — a fail-closed production gate

- Formal style requirements for both faces are frozen in pilot/v2/formal-wardrobe.mjs.
- Three-minute shot-plan audit exposes wardrobeReady=false, wardrobeStatus HOLD_FORMAL_WARDROBE and blocks paid master authorization.
- The short native-audition paid gate also refuses new video POSTs while either presenter's wardrobeApprovalStatus is blocked-public-casual. This means the existing informal looks **cannot accidentally be billed again** even after the previously saved key/voice/hash checks.
- Automated tests verify that original casual look IDs and previously rejected Araj ID never pass, identities remain intact and any future new Photo Look also requires genuine motion/lip-sync human QA.
- .env.example includes placeholder SIGNAL_RUMI_FORMAL_LOOK_ID and SIGNAL_KEVIN_FORMAL_LOOK_ID. Leave them empty until real approved suitable source Looks exist.

## Unblocker: acquire exact legally editable formal looks, not a recast

1. Open [HeyGen Avatars](https://app.heygen.com/avatars). Inspect the public Rumi and Kevin profiles for Edit Look, Design a Look, or Remix. **Do not press Generate before establishing account entitlement and credit charge.**
2. If the public profiles do not expose those controls, get permission/a supported path from HeyGen to generate **business-formal variations of these exact identities** without swapping faces; if not possible, obtain licensed/consented matching formal video footage from the provider. Do not silently substitute another actor.
3. If allowed, create **one** formal variant for Rumi and **one** for Kevin using the tightly constrained prompts above. Preserve group identity and check actual photo/video look type, projected charges and natural expression quality.
4. Approve actual outfit images/video references and new provider look IDs, plus any Photo Look motion QA. Then update the manifest and preflight, while retaining Annie and Orson IDs.
5. Only after new source looks are verified: render a short formal Araj-free Rumi test and Kevin test, confirm visual realism, then compose the 180-second film with the already-built Signal newsroom header, headlines, ticker, data charts and transitions.

**Current release decision: NO-GO for additional paid video until formal wardrobe is real and independently approved.** This prevents using the existing $5 API wallet on footage the user has explicitly rejected as casual.
