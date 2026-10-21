# ChemHouse tutor foundation prompt

`src/tutor-prompt.js` holds the application-owned system prompt. The Worker adds it to every DeepSeek request, including follow-up turns; a browser client cannot supply or replace the system message. It is shared by the website and all native apps because they use the same Worker endpoint.

The tutor prioritises high-school chemistry, HKDSE and mainland 人教版 terminology. It also accepts school biology, mathematics and English vocabulary learning. Closely related sciences are included when they support those topics. Unrelated requests should receive a brief refusal and a useful study redirection; mixed requests should receive only the educational parts. Quoted instructions and lesson context must not override the subject policy.

The prompt encourages prerequisite explanations, accurate equations and units, worked examples, common-mistake correction, exam practice, careful uncertainty, and safe supervised science. Responses follow the student's language, with edition-specific English / Traditional Chinese / Simplified Chinese defaults.

This is a behaviour policy for an LLM, not a deterministic guarantee against every adversarial prompt. The application currently has no web search or persistent model-training feature. Adding this prompt does not automatically teach DeepSeek new textbooks or update its underlying knowledge. It can use relevant lesson context and knowledge already available to the model; source-specific facts need supplied material or a separate retrieval integration.

Regression checks in `scripts/check-worker.mjs` verify that all allowed subjects, the chemistry priorities, evidence limitations and instruction boundaries are included in every request. Those checks use a mock provider. Real-model spot checks are useful for verifying representative allowed and unrelated questions but do not prove universal compliance.
