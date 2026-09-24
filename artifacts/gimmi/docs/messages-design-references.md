# Messages design research

These sources were reviewed together for the Messages screen. Apple's guidance is the platform authority; the social-product sources inform information hierarchy and findability, not a new visual template for Gimmi.

1. [Apple HIG — Layout](https://developer.apple.com/design/human-interface-guidelines/layout) — group controls and content clearly, with space doing more work than decoration.
2. [Apple HIG — Typography](https://developer.apple.com/design/human-interface-guidelines/typography) — keep identity and conversation text legible, with a quiet hierarchy for metadata.
3. [Apple HIG — Segmented controls](https://developer.apple.com/design/human-interface-guidelines/segmented-controls) — use equal-width, clearly labeled choices for two alternate views.
4. [Apple HIG — Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars) — use bottom tabs for navigation between app sections, not for actions within Messages.
5. [Apple HIG — Motion](https://developer.apple.com/design/human-interface-guidelines/motion) — motion should communicate state; respect Reduce Motion.
6. [Apple HIG — Search fields](https://developer.apple.com/design/human-interface-guidelines/search-fields) — make finding a conversation a direct, familiar action.
7. [Nielsen Norman Group — The role of animation in UX](https://www.nngroup.com/articles/animation-purpose-ux/) — use brief, unobtrusive motion for feedback rather than spectacle.
8. [Nielsen Norman Group — Visual hierarchy in UX](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/) — direct attention with contrast, scale, and grouping.
9. [UX Magazine — Seven UX best practices of community design](https://uxmag.com/articles/seven-ux-best-practices-of-community-design) — give people and their contributions clear identity.
10. [UX Magazine — Handling message overload in social apps](https://uxmag.com/articles/handling-message-overload-in-social-apps) — make messages easy to find and distinguish.
11. [Okoone — How to build messaging apps people actually want to use](https://www.okoone.com/spark/product-design-research/how-to-build-messaging-apps-people-actually-want-to-use) — prioritize clarity, speed, consistency, and real feedback in conversations.
12. [Laws of UX — Fitts's Law](https://lawsofux.com/fittss-law/) — keep pill segments and tab targets comfortably tappable.

## Decisions for this page

- The two pills fade independently when switching; no thumb travels or flashes across the track. Reduce Motion removes the fade.
- A reusable borderless top header and a borderless bottom navigation keep the screen quiet. The search field and segment track use fully rounded ends.
- Reuse a single inbox-row component for Messages and Call Log. Give the person and latest activity priority over the timestamp.
- The Call Log shows outgoing **preview attempts**, not completed voice or video calls. Actual calls are not connected.
- Do not use these sources to restyle the rest of the app before Messages is reviewed.