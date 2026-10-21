# ChemHouse study editions

The edition selector provides three independent study spaces:

| Route | Primary language | Supporting language | Curriculum |
| --- | --- | --- | --- |
| `#/hk/home` | Traditional Chinese (Hong Kong) | Optional English explanations | HKDSE topic starters and everyday challenges |
| `#/en/home` | English | Optional Traditional Chinese explanations | Same HKDSE topic starters and everyday challenges |
| `#/zh/home` | Simplified Chinese | — | People's Education Press / 人教版 five course volumes |

The Hong Kong editions contain 25 introductory lessons and 43 original questions, grouped into 12 compulsory-topic headings, three elective tasters and academic English. These are introductory notes, not complete syllabus coverage or official exam questions. Bilingual support appears in expandable sections in lessons and answer explanations. Quick challenges select an everyday chemistry lesson.

The mainland edition retains its original 15 chemistry lessons and 30 questions. Hong Kong additions do not appear in mainland modules. Existing English and Simplified Chinese notes and answers keep their original browser-storage keys; Traditional Chinese uses a separate key. DeepSeek supports all three edition identifiers and uses the selected edition as its fallback language.

Curriculum references:
- EDB Chemistry Curriculum and Assessment Guide (S4–6), June 2018 update: https://www.edb.gov.hk/attachment/en/curriculum-development/kla/science-edu/Chem_C_and_A_Guide_updated_Eng_22082018.pdf
- EDB curriculum documents: https://www.edb.gov.hk/en/curriculum-development/kla/science-edu/curriculum-documents.html
- People's Education Press course-volume reference: https://www.pep.com.cn/xw/zt/px/2019/huaxue/

Verification: `npm run check` checks all edition routes, bilingual lessons, note isolation, curriculum filtering, challenges and AI request validation. AI checks mock the upstream provider and do not verify a deployed API key.
