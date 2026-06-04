# License Compliance Matrix

This document outlines the classification of software licenses within `commercial-license-skill` and their associated engineering risks for commercial software development.

## Classification Levels

| Compliance Level | Description | Example Licenses | Engineering Action |
| :--- | :--- | :--- | :--- |
| **ALLOW** | Permissive licenses. Minimal obligations, commercial-safe. | MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC | Safe to use. Retain original copyright notices. |
| **REVIEW** | Copyleft with linking exceptions or dual-licensed. Requires linking analysis. | LGPL-2.1, LGPL-3.0, MPL-2.0, EPL-2.0, CDDL-1.0 | Review linking mechanism (dynamic vs static). Confirm deployment. |
| **HIGH / CRITICAL** | Strong copyleft or source-available with commercial restrictions. | GPL-2.0, GPL-3.0, AGPL-3.0, SSPL-1.0, BUSL-1.1, Commons Clause | Avoid in commercial products unless process isolation is guaranteed. |

## Quick Decision Guide

1. **SaaS (Hosted Service)**:
   - GPL, LGPL, and permissive licenses are generally safe as they do not trigger source code disclosure obligations.
   - **AGPL-3.0** and **SSPL-1.0** DO trigger obligations upon network deployment. High risk.
2. **On-Premise / Client Distribution**:
   - GPL and AGPL licenses require distributing the entire combined work's source code. High risk.
   - LGPL is permissible only if dynamically linked and the user can replace the library.
3. **Clean-Room Boundary**:
   - If replacing a copyleft component, do not review the source code of the restricted dependency to write the replacement. Write replacement based on public API signatures only.
