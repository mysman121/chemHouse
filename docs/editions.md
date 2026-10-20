# Study editions

## Implemented website

Source: `public/index.html`. This is an original standalone web implementation. The supplied Android source archive and APK have not yet been inspected or imported; Android feature parity is unverified.

### English edition

- Web locale `en`.
- 15 chemistry lessons plus 3 academic English lessons.
- 36 multiple-choice practice questions with feedback and reasoning.
- Chemistry pathways: foundations; reactions and everyday chemistry; reaction principles; structure and properties; organic chemistry.
- English topics: process descriptions and passive voice; evidence-based academic answers; scientific reading and logical connectors.

### Mainland chemistry edition

- Web locale `zh-CN`; select “人教版 · 简体中文”.
- 15 chemistry lessons and 30 original practice questions.
- Simplified Chinese navigation, lesson explanations, feedback, calculators, notes, empty states and accessibility labels.
- Language switching remains visible; the English edition's English-only lessons are excluded from Chinese navigation and routes.
- Essential rendering uses no third-party fonts, CDN scripts or remote assets.

The course uses the five-volume structure presented in the publisher's **2019 textbook training resources**:

| Course volume | Starter topics available |
| --- | --- |
| 必修第一册 | 物质分类与分散系；物质的量；氧化还原；金属与离子反应；原子结构与周期律 |
| 必修第二册 | 硫、氮及其化合物；反应与能量；有机物入门；可持续发展 |
| 选择性必修1《化学反应原理》 | 化学平衡；水溶液中的离子平衡 |
| 选择性必修2《物质结构与性质》 | 电子排布；化学键与分子间作用力 |
| 选择性必修3《有机化学基础》 | 烃与同分异构现象；烃的含氧衍生物 |

These are broad module pathways, **not a verified chapter/section/page concordance**. The current website is an introductory selection and does not cover the whole textbook or guarantee alignment with a particular 2026 printing or local exam syllabus. All explanations and questions are original; no textbook pages are reproduced. The project is not affiliated with the publisher.

Publisher reference:
https://www.pep.com.cn/xw/zt/px/2019/huaxue/

## Shared behavior

- Browser-local progress and notes are stored separately under `chemhouse-v1-en` and `chemhouse-v1-zh`.
- Accuracy counts the latest recorded answer for each distinct question. Repeated clicks on an answered question do not change scores. Retrying clears records for the selected set.
- Incorrect latest answers appear in the notebook; a correct retry removes the item.
- Notes can be exported as UTF-8 text. User-entered notes are escaped before rendering.
- Notes are not uploaded, synced across devices, or backed up by a server.

## Pending work

1. Inspect and safely import the supplied full source and APK when file execution is available.
2. Compare the original app with the website and document any native-only functions.
3. Verify exact textbook edition and chapter-level mappings before claiming full alignment.
4. Expand original course content and questions.
5. Complete browser visual testing, deploy and verify the actual public URL.
6. Test actual mainland reachability before making accessibility claims.
