# Contributing to Always Ready Tools (ART)

First off, thank you for considering contributing!  
ART exists to empower communities with resilient, decentralized, and secure tools for dispatch, training, and coordination.  
We welcome contributions that strengthen these goals — from code, to documentation, to training content.

---

## How You Can Contribute

### Code Contributions
- Bug fixes  
- Security patches  
- New features aligned with the [Feature Roadmap](/README.md#phased-build-plan)  
- Performance and accessibility improvements  

### Documentation
- Improving clarity of setup guides (README, Getting Started)  
- Adding or updating training content (Academy-related)  
- Translating documentation for multilingual accessibility  

### Community
- Reporting vulnerabilities (see [SECURITY.md])  
- Proposing new training modules for volunteers and pod leaders  
- Sharing lessons learned in deployments (in compliance with [DATA_POLICY.md])  

---

## Development Workflow

1. **Fork the repo**  
   - `admin-dispatch` for national admin-level tools  
   - `regional-dispatch-template` for regional deployments  

2. **Create a feature branch**  
   - Use a descriptive name: `feature/trustlist-audit`, `fix/offline-sync`, etc.  

3. **Make changes**  
   - Follow the coding style guide in `packages/` (lint rules enforced)  
   - Keep commits atomic and well-documented  

4. **Run tests**  
   - Ensure `pnpm test` passes before pushing  
   - Include new tests if adding a feature or fixing a bug  

5. **Submit a Pull Request (PR)**  
   - Target the `main` branch  
   - Clearly describe the change and reference related issues  
   - Confirm that your PR does not introduce PII leaks across boundaries  

---

## Code of Conduct

All contributors are expected to follow our [CODE_OF_CONDUCT.md].  
Harassment, hate, or attempts to compromise community safety will not be tolerated.

---

## Data Safety Rules (Critical)

- Never commit PII (volunteer names, contact info, incident logs).  
- Do not propose features that centralize regional data.  
- Always validate changes against [DATA_POLICY.md].  
- If unsure, ask before submitting.  

---

## Commit & PR Guidelines

- Use **conventional commit messages** (e.g., `fix:`, `feat:`, `docs:`).  
- Group related changes into a single PR.  
- Keep PRs small and focused (big changes should be broken into phases).  
- Mark security-sensitive PRs as `[SECURITY]` in the title.  

---

## Issue Reporting

- **Bugs:** Use the issue template, include steps to reproduce.  
- **Features:** Start a discussion first; proposals should align with project principles.  
- **Security Issues:** Never open a public issue — follow [SECURITY.md] reporting process.  

---

## Review Process

- Each PR requires at least **one approval** from a maintainer.  
- Sensitive areas (migrations, auth, security docs) require approval from a **CODEOWNER**.  
- Discussions may happen in-line on GitHub or in secure comms if needed.  

---

## Local Development

1. Clone the repo:  
   - `git clone https://github.com/[org]/admin-dispatch`  
   - `git clone https://github.com/[org]/regional-dispatch-template`  

2. Install dependencies:  
   - `pnpm install`  

3. Start dev server:  
   - `pnpm dev`  

4. Run migrations (regional example):  
   - `pnpm run db:migrate`  

---

## Recognition

Contributors will be credited in:  
- Release notes  
- `CONTRIBUTORS.md` (if opted in)  
- Community updates  

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see [LICENSE]).  

---

## Final Note

ART is not just software — it’s an organizing tool.  
Your contributions directly help communities stay safe, resilient, and always ready.  
