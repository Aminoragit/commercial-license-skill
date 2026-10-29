# License review matrix

Triage levels prioritize engineering review. They are not legal conclusions or a statement that a license prohibits commercial activity. An explicit requested allowlist can elevate otherwise permissive metadata to `high` for a policy mismatch.

| Declaration | Default | Facts that determine the next action |
|---|---|---|
| MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD, MIT-0, Zlib, BSL-1.0, CC0-1.0, Unlicense | allow | Verify the artifact's grant; retain required texts/attribution. Inspect Apache NOTICE, modification and patent conditions. `allow` is only a metadata triage result. |
| LGPL | review | Exact version, covered modifications, linking and relinking rights, reverse engineering permissions and distribution; dynamic linking is not the only possible compliance path. |
| MPL, EPL, CDDL | review | Covered files/modules, changes, distribution and compatibility. Do not equate file-level obligations with publishing unrelated application files. |
| GPL, EUPL | high | What is conveyed, what forms a covered/combined work, source offers and installation information where applicable. Charging money is not inherently forbidden. |
| AGPL | critical | Exact terms, modifications and remote interaction, in addition to distribution obligations. Do not claim that every network deployment always has identical obligations. |
| SSPL | critical | Inspect service-specific source requirements; do not treat SSPL as interchangeable with AGPL or as OSI-approved. |
| BUSL-1.1, Elastic, PolyForm, Commons Clause, non-commercial/custom terms | critical | Exact version, additional use grant, change date/license if applicable, hosted-service restrictions, commercial permission and any purchased entitlement. BSL-1.0 is the different Boost Software License. |
| Exceptions, unknown IDs, LicenseRef, conflicting/missing evidence | review or higher base severity | Fetch exact text and provenance. `WITH` never automatically reduces risk. A known restrictive conflict retains the stronger severity. |

SaaS can still ship client-side JS, SDKs, containers or on-premise components. A separate process, dynamic link or network call is not a blanket exemption. Assess the artifact delivered and the integration facts instead of the marketing label.

Fonts, images, icons, data and model weights need separate grants. For example, SIL OFL can impose reserved-name and redistribution conditions; Creative Commons licenses differ on attribution, non-commercial and share-alike conditions. Never transfer a package's software license onto its bundled artwork by assumption. The CLI does not have a comprehensive asset-license taxonomy.

Primary sources (consult exact text at review time): [SPDX expressions](https://spdx.github.io/spdx-spec/v2.3.1/SPDX-license-expressions/), [GPL-3.0 text](https://spdx.org/licenses/GPL-3.0-only.html), [AGPL-3.0 text](https://spdx.org/licenses/AGPL-3.0-only.html), [LGPL-3.0 text](https://spdx.org/licenses/LGPL-3.0-only.html), [Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0).
