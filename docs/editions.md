# Study editions

Status: implementation requirements only. The app source and APK are not yet imported or inspected; this document does not claim completed features.

## Shared product goals

- A public website accessible by a shareable link on phones and computers.
- Work from the complete supplied app source after inspection.
- Keep the English study edition accessible alongside the mainland chemistry edition.
- Provide clear explanations, practice with answers and reasoning, and useful chemistry study interactions appropriate to high school students.
- Identify which original app features can run on the web and document any native-only features.
- Publish the supplied Android APK with a working download link once it can be read and uploaded. Keep the supplied APK distinct from any future rebuilt APK.

## English study edition

- English interface.
- High school chemistry support plus English learning.
- Validate the exact feature set against the supplied full source before implementation.

## Mainland China chemistry edition

- Simplified Chinese throughout navigation, lessons, questions, explanations, errors, help and accessibility text.
- Web locale: `zh-CN`. Use `zh_CN` in frameworks whose locale convention requires an underscore.
- Organise chemistry by the People's Education Press high school sequence rather than translating an unrelated course structure.
- Baseline course volumes: 必修第一册; 必修第二册; 选择性必修1《化学反应原理》; 选择性必修2《物质结构与性质》; 选择性必修3《有机化学基础》.
- Verify chapter and section mapping against the chosen textbook edition before labelling material aligned or complete.
- Chapter-linked practice, worked explanations, common misconceptions and revision should use mainland terminology and notation.
- Keep curriculum identifiers separate from translated interface strings so future course editions can be updated independently.
- Namespace locally stored progress by edition so the two courses do not overwrite each other's records.
- Do not require third-party font or CDN requests for essential page rendering in the mainland edition.
- Test the public URL and critical assets; measure mainland reachability before claiming access within mainland China is verified.

## Curriculum references

Publisher's high school chemistry textbook training materials include introductions to both compulsory volumes and the three selective compulsory modules:
https://www.pep.com.cn/xw/zt/px/2019/huaxue/

Publisher-hosted chemistry curriculum standard (2017 edition, revised 2020):
https://www.pep.com.cn/xw/zt/rjwy/gzkb2020/202205/P020220517517668288401.pdf

The precise textbook printing and all chapter-level mappings remain to be checked. Publisher references establish the course structure; they do not indicate publisher endorsement of this project.

## Pending validation

1. Open the complete source archive and inspect project instructions and build configuration.
2. Scan the source for credentials or local-only configuration before committing it publicly.
3. Import source and the supplied APK, preserving their identity.
4. Implement and test both course editions using the actual application architecture.
5. Deploy the website publicly and verify its returned URL and edition navigation.
