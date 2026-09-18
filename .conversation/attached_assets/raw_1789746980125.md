# Social / Community Platform --- Product & Feature Specification V1

> **Working specification based on the product discussion on 18
> September 2026**

## 1. Product Concept and Direction

The product is a real-world social and community platform inspired by
the fictional Zoo app from *Miraculous*. The commercial product will use
a completely different name and its own branding, visual identity, code,
and implementation.

An inspiration/about page may explain that the fictional Zoo concept was
an inspiration. The product must not present itself as officially
affiliated with or endorsed by *Miraculous* or its rights holders, and
it should not use *Miraculous* characters, logos, screenshots, artwork,
or other show assets without permission.

The central product model is **community-centered rather than
community-restricted**. Each user registers under one primary community.
A user may follow, message, call, video call, and otherwise interact
with users who belong to different communities. Community membership
establishes a user's primary community identity without creating a wall
between different communities.

------------------------------------------------------------------------

## 2. Core V1 Content Model

For the initial version, posts are deliberately limited to three primary
content types:

-   **Text posts**
-   **Images**
-   **Videos / clips**

Polls, questions, events, location posts, voice posts, and similar
additional content types are **not part of V1**. They may be considered
later and can be reserved as future or potential premium functionality.

Premium is initially a **coming-soon concept** rather than a fully
implemented paid feature set.

------------------------------------------------------------------------

## 3. Text Posts

A text post is **actual text rendered by the application inside a fixed
visual post container**. It is not generated into a raster image and
should remain semantically real text.

The visual presentation is intentionally similar to a square
social-media card while preserving the underlying text.

### Character limit

Current proposed maximum length:

**500 characters**

The exact final character limit can be revised later, but 500 characters
is the current working specification.

### Fixed visual presentation

The text post uses a fixed square-style presentation area.

The text must fit inside that area. If a user enters a larger amount of
text, the typography should progressively shrink to accommodate the
content rather than changing the fundamental post shape.

The intent is:

-   Short posts look spacious.
-   Longer posts become denser.
-   Text progressively becomes smaller as necessary.
-   The post remains within the fixed visual frame.

The text itself remains selectable/copyable as text where the platform
and operating system permit it. It must not be treated internally as a
screenshot or image simply because it has a background and fixed visual
presentation.

------------------------------------------------------------------------

## 4. Links in Posts

Links are permitted in:

-   Text posts
-   Image posts
-   Video posts

### Links in text posts

A detected or explicitly inserted link should be represented as a
**clickable button** rather than allowing a long URL to visually consume
most of the text area.

The link button should:

-   Be **100% of the available post-content width**
-   Be **outlined rather than filled**
-   Use the **post owner's community theme color**

The button is only the visual presentation; the underlying link remains
a real clickable link.

### Links in images and videos

Image and video posts may have captions, and links can be included in
those caption areas.

A text post does not need a separate caption because the post itself is
already the text content.

------------------------------------------------------------------------

## 5. Feed and Post Interaction

The Home page is the user's personalized feed.

It contains text posts, image posts, and video/clip posts from:

-   The user's community
-   People the user follows
-   People belonging to other communities whom the user follows

Users can:

-   Like posts
-   Comment on posts
-   Share posts
-   Mention other users in comments
-   Follow the author
-   Open comments by tapping the post itself
-   Open comments by tapping the comment icon

------------------------------------------------------------------------

## 6. Comments View

The comments experience should resemble the familiar behavior of a
TikTok-style comments presentation.

When comments are opened:

-   The post remains visible at the top.
-   The post shrinks while retaining its original form and proportions
    as much as practical.
-   The post remains in a fixed position at the top.
-   The comments underneath become the scrollable area.

Conceptually:

``` text
┌──────────────────────────┐
│       POST               │
│                          │
│  [reduced post content]  │
└──────────────────────────┘
────────────────────────────
Comments
────────────────────────────
User 1
That's amazing 😂

User 2
Congratulations!

User 3
@User1 exactly!
```

The comment area should support:

-   Comments
-   User mentions
-   Comment interaction
-   Replies where implemented
-   Normal moderation controls for the content owner

A future premium feature may allow premium users to turn comments on or
off for their posts.

------------------------------------------------------------------------

# 7. Home Page

The Home page is the main social feed.

It should contain:

-   Personalized feed
-   Text posts
-   Image posts
-   Video/clip posts
-   Likes
-   Comments
-   Shares
-   Mentions
-   Content from the user's community
-   Content from followed users in other communities
-   Access to post comments by tapping the post or comment icon

The Home page should feel like the central social experience of the
application.

------------------------------------------------------------------------

# 8. Discover Page

Discover is the primary discovery and search area.

It is where users can find:

-   People
-   Communities
-   Posts/topics
-   Currently live users
-   Topics/trending subjects

### Discover sections

#### Search

Search for:

-   People
-   Communities
-   Posts
-   Topics

#### Communities

A grid/list of communities.

#### People

Discover users.

#### Live Now

Users currently broadcasting.

#### Topics

Discoverable or trending topics.

### Cross-community discovery

Following is independent of community membership.

A user can follow anyone they choose, including users belonging to a
different community.

For example:

> A Ladybug-community user can follow a Bee-community user.

------------------------------------------------------------------------

# 9. Community Page

A community page is a **subpage reached from Discover**.

The user remains conceptually within the Discover section but navigates
into a specific community.

Example:

**Discover → Ladybug Community**

The community page can contain:

-   Community identity/header
-   Community feed
-   Community members
-   Community live content
-   Community information/about section

The community page should clearly establish the identity of that
community.

A user's primary community is part of their social identity, but
cross-community interaction remains fully supported.

------------------------------------------------------------------------

# 10. Create Page

The Create page should be simple.

It branches into the available creation flows:

-   Create text post
-   Create image post
-   Create video/clip post
-   Start a live stream

No unnecessary creation formats should be included in V1.

------------------------------------------------------------------------

# 11. Image Editing --- V1

Image editing should remain basic in V1.

Supported functionality can include:

-   Basic adjustments
-   Filters
-   Black-and-white filter
-   Drawing on the image
-   Adding text to the image

The goal is not to create a full professional image-editing suite.

More advanced editing capabilities can be considered later.

------------------------------------------------------------------------

# 12. Video Editing --- V1

Video editing should also remain simple.

V1 functionality:

-   Basic filters
-   Drawing on the video
-   Adding text to the video

Additional advanced video-editing functionality is intentionally
deferred.

------------------------------------------------------------------------

# 13. Media Presentation

Square media should naturally fit the square presentation area.

If a user uploads a non-square image or video:

-   Do **not** aggressively crop it.
-   Preserve the complete media.
-   Use blank/neutral space around the media where necessary.
-   Fit the media into the available presentation area without cutting
    off the original content.

The intended visual result should make it clear that the media was
**fitted into the available space rather than cropped to fill it**.

------------------------------------------------------------------------

# 14. Live Streaming

The live-streaming experience should follow a familiar Instagram-style
live interaction model while implementing the platform's own community
identity system.

Users can:

-   Start a live stream
-   Watch live streams
-   Comment on live streams
-   React where implemented
-   Share live streams
-   Follow the creator

### Community visibility during live

The creator's community is visible during the live.

Conceptually:

``` text
Zoe
🐝 Bee Community

🔴 LIVE
```

The community identity should be clearly associated with the creator's
live identity.

### Live comments

For V1:

-   Live comments are available.
-   Users can comment on another user's live.

For a future premium feature:

-   Premium users can turn live comments **ON or OFF**.

### Future premium live functionality

Premium users may eventually receive:

-   Live analytics
-   Audience analytics
-   Comment controls

------------------------------------------------------------------------

# 15. Community Visibility Rules

The platform should distinguish between **private person-to-person
communication** and **public community-facing content**.

### Example

Marinette belongs to the **Ladybug** community.

Zoe belongs to the **Bee** community.

Marinette can:

-   Follow Zoe
-   Message Zoe
-   Voice-call Zoe
-   Video-call Zoe
-   Interact with Zoe's content

During a normal private voice or video call:

> Zoe's community does not need to be displayed as part of the call
> interface.

The call is between the two people.

If Zoe goes live:

> Zoe's Bee community is displayed.

The community becomes visible because the live is public-facing content.

------------------------------------------------------------------------

# 16. Messages

The Messages section should intentionally feel much more like
**WhatsApp** than the public social feed.

It should support:

-   One-to-one text messaging
-   Emojis
-   Images
-   Videos
-   Voice messages
-   Reactions
-   Replies where implemented
-   Sharing posts into chats
-   Voice calls
-   Video calls
-   Group calls

The chat interface should not be overloaded with community information.

Community identity belongs primarily in:

-   Profiles
-   Community pages
-   Public posts
-   Live streams

Private communication should remain focused on the people communicating.

------------------------------------------------------------------------

# 17. Message Delivery Indicators

The messaging system should use a WhatsApp-like delivery/read model.

### One tick

**✓**

Message has been submitted/sent but has not yet been delivered to the
recipient.

### Double tick

**✓✓**

Message has been delivered to the recipient.

### Colored double tick

**✓✓**

Message has been read.

The exact visual color can follow the final application design system.

------------------------------------------------------------------------

# 18. Voice Calls

Voice calls should include the basic controls expected from a modern
calling interface:

-   Speaker
-   Mute microphone
-   End call

The platform should support:

-   One-to-one voice calls
-   Group voice calls

Group calling should allow participants to be added and managed during
the call.

------------------------------------------------------------------------

# 19. Video Calls

Video calls should include:

-   Microphone mute/unmute
-   Camera on/off
-   Speaker/audio output controls
-   End call
-   Add participants
-   Group video calls
-   Ability to hide/pause the user's own video

As with voice calls, the other participant's community does not need to
be displayed during a normal private video call.

------------------------------------------------------------------------

# 20. Profile Page

The profile page is the user's personal identity hub.

It should show:

-   Profile picture
-   Display name
-   Username
-   Primary community
-   Follower count
-   Following count
-   Follow button
-   Message button
-   Posts/media
-   Notifications button

Conceptually:

``` text
        [Profile Photo]

           Zoe
         @zoe123

       🐝 Bee Community

    1,240 Followers
      382 Following

      [Follow] [Message]

          Posts
          Media
```

### Notifications access

There should be a notification button/icon on the profile page that
takes the user to the dedicated Notifications page.

------------------------------------------------------------------------

# 21. Notifications Page

Notifications should cover at least:

### Social

-   Someone liked your post
-   Someone commented
-   Someone replied
-   Someone mentioned you
-   Someone followed you

### Community

-   Community activity
-   Community announcements

### Live

-   Someone you follow went live

### Messages and calls

-   Missed call
-   Relevant message/call activity

Notifications should be presented as a dedicated page.

They can be grouped by:

-   Today
-   Yesterday
-   Earlier

------------------------------------------------------------------------

# 22. Settings

Settings should be grouped into logical categories rather than presented
as one long unstructured list.

## Account

-   Personal information
-   Username
-   Email/phone information
-   Community/account-related settings
-   Account status

## Privacy

-   Who can follow the user
-   Who can message the user
-   Who can mention the user
-   Blocked accounts
-   Content visibility

## Security

-   Password
-   Two-factor authentication
-   Login sessions
-   Authorized/active devices

## Notifications

-   Push notifications
-   Likes/comments
-   Messages
-   Calls
-   Live notifications

## Messages & Calls

-   Read receipts
-   Last-seen/privacy controls where implemented
-   Calling preferences
-   Media-related settings

## Content

-   Content preferences
-   Sensitive-content controls
-   Muted words/users where implemented

## Subscription

-   Premium
-   Billing
-   Coming-soon premium features

## Help

-   Help center
-   Report a problem
-   Community guidelines
-   Terms
-   Privacy policy

------------------------------------------------------------------------

# 23. Premium Direction

Premium should initially be treated as a **coming-soon feature set**.

The application should be architected so premium functionality can be
introduced later without redesigning the entire application.

## Current premium candidates

### Profile

-   Profile themes
-   Advanced profile customization

### Identity

-   Premium user badge

The premium badge should be visible wherever the user's identity is
displayed in relevant social contexts.

For example:

``` text
Zoe 🟣
Hey everyone!
```

in comments.

And:

``` text
Zoe 🟣
[POST]
```

on posts.

The badge becomes a recognizable premium identity marker.

### Live

-   Live analytics
-   Audience analytics
-   Comment controls

### Comment controls

Premium users may eventually be able to choose:

> Comments ON / OFF

for their posts and live streams.

### Explicitly removed from the current premium plan

**Post themes are not part of the current premium plan and should not be
treated as a planned feature at this stage.**

------------------------------------------------------------------------

# 24. Navigation Model

The proposed primary bottom navigation is:

**Home · Discover · Create · Messages · Profile**

Live does not necessarily need a permanent bottom-navigation slot.

It can be discovered through:

-   Discover
-   Home
-   Profiles
-   Communities
-   Notifications

Community pages are subpages of Discover.

Example:

**Discover → Community → Community feed/members/live/about**

------------------------------------------------------------------------

# 25. Design System and Apple HIG Direction

The visual design should be guided by **Apple's Human Interface
Guidelines (HIG)** and Apple's system color approach.

The goal is a clean, restrained, consistent interface rather than a
flashy or heavily saturated design.

### Design requirements

-   Use Apple's documented system colors as the basis for the interface
    color system rather than inventing an unrelated palette.
-   Follow Apple's Human Interface Guidelines for controls, hierarchy,
    spacing, interaction patterns, accessibility, and consistency.
-   Maintain a restrained visual language.
-   Avoid flashy colors and unnecessary visual effects.
-   Prioritize consistency across pages and components.
-   Use the community theme color in controlled places where community
    identity is intentionally represented, such as the text-post link
    button.
-   Where appropriate, use platform/API system colors so the interface
    can adapt to appearance and accessibility settings instead of
    relying on arbitrary hard-coded colors.

The design direction is inspired by the clean feel associated with
modern Apple interfaces and the clean system-color language seen across
iOS generations.

The current Apple HIG documentation should be treated as the
implementation reference rather than treating a particular historical
iOS version as an immutable specification.

------------------------------------------------------------------------

# 26. Buttons and Shape Language

Buttons should **not** use plain square corners.

The general button language should use **rounded squircle-like
geometry**:

> A rounded rectangle with substantial corner radius that feels like a
> modern Apple-style control.

### General buttons

Use:

-   Rounded/squircle geometry
-   Comfortable internal padding
-   Consistent height
-   Clear hierarchy
-   Apple-inspired spacing

### Profile buttons

On the Profile page specifically, buttons should use:

> **Pill-shaped, highly rounded controls**

For example:

``` text
╭────────────────╮
│     Follow     │
╰────────────────╯
```

The profile page therefore uses a more circular/pill treatment while the
general application uses squircle-style controls.

------------------------------------------------------------------------

# 27. Visual Consistency Principles

The product should maintain:

-   No unnecessary flashy colors
-   Consistent spacing
-   Consistent component behavior
-   Consistent typography hierarchy
-   Consistent button geometry
-   Consistent use of Apple system colors
-   Meaningful rather than arbitrary use of community colors
-   One coherent visual language across the entire application

The application should feel like **one product**, not a collection of
unrelated screens.

------------------------------------------------------------------------

# 28. Deferred / Not V1

The following are deliberately excluded from the initial implementation:

-   Polls
-   Questions
-   Events
-   Location posts
-   Voice posts
-   Advanced video editing
-   Advanced image editing
-   Advanced creator tools
-   Post themes
-   Other complex content formats not explicitly defined above

Some deferred functionality may later become premium features, but it
should not be implemented prematurely merely to make the initial product
appear larger.

------------------------------------------------------------------------

# 29. Product Philosophy

The product should feel like a **social platform built around
communities**, not a collection of unrelated social-media features.

The core relationship is:

``` text
USER
  ↓
PRIMARY COMMUNITY
  ↓
SOCIAL GRAPH
  ↓
CONTENT
  ↓
COMMUNICATION
```

A user has one primary community identity, but the social graph remains
open.

Cross-community following and communication are fundamental to the
concept.

Public-facing experiences---profiles, posts, communities, and live
streams---can show community identity where useful.

Private person-to-person communication should remain clean and focused
on the participants.

------------------------------------------------------------------------

# 30. Example User Flow

Marinette is registered under the Ladybug community.

Zoe is registered under the Bee community.

1.  Marinette discovers Zoe through Discover.
2.  Marinette follows Zoe even though Zoe belongs to another community.
3.  Zoe's posts can appear in Marinette's feed because Marinette follows
    her.
4.  Marinette can comment on Zoe's posts.
5.  Marinette can mention other users in comments.
6.  Marinette can message Zoe in the WhatsApp-like Messages section.
7.  Marinette can voice-call Zoe.
8.  Marinette can video-call Zoe.
9.  During the private call, Zoe's community does not need to be
    displayed.
10. Zoe starts a live stream.
11. Viewers can see Zoe's Bee community identity on the live.
12. Other users can comment on the live.
13. If Zoe later has premium access, she may eventually be able to
    control whether live comments are open or closed.
14. Premium analytics can eventually show Zoe information about her live
    and audience.

------------------------------------------------------------------------

# 31. Initial Product Scope at a Glance

The initial product consists of five primary navigation areas:

1.  **Home**
2.  **Discover**
3.  **Create**
4.  **Messages**
5.  **Profile**

Additional experiences include:

-   Community pages
-   Comments
-   Notifications
-   Voice calls
-   Video calls
-   Group calls
-   Live streaming
-   Settings

### V1 content

V1 content is limited to:

-   Text
-   Images
-   Videos/clips

### Text post specification

-   Working maximum: **500 characters**
-   Fixed square-style presentation
-   Actual text, not an image
-   Dynamic text sizing to fit
-   Links supported
-   Link converted to a full-width outlined clickable button
-   Link button uses the post owner's community theme color
-   No separate caption for text posts

### Image/video specification

-   Non-square media is not forcibly cropped
-   Original content is preserved
-   Blank/neutral space can be used to fit media into the presentation
    area

### Premium

Initially:

> **Coming Soon**

Potential premium functionality:

-   Profile themes
-   Advanced profile customization
-   Premium badge
-   Live analytics
-   Audience analytics
-   Comment controls

Post themes are explicitly excluded.

------------------------------------------------------------------------

# 32. Naming and Inspiration

The product should have a **completely different commercial name from
Zoo**.

The fictional Zoo concept can be acknowledged as inspiration, but the
actual product should have:

-   Its own brand
-   Its own name
-   Its own logo
-   Its own visual identity
-   Its own code
-   Its own implementation
-   Its own legal positioning

An inspiration statement can explain the origin of the concept, provided
it is factual and does not imply official affiliation, endorsement, or
ownership by *Miraculous* rights holders.

A possible direction for an inspiration page is:

> **From Fiction to Reality**
>
> This platform was inspired by the fictional Zoo app featured in
> *Miraculous*. We loved the idea of a connected social platform built
> around communities and wanted to explore what that concept could look
> like as a real-world product.

This wording is only a starting point and should be reviewed alongside
the final branding and legal position.

------------------------------------------------------------------------

# 33. V1 Product Principle

The most important development principle is:

> **Do not build everything at once. Build the core experience
> exceptionally well.**

The first version should establish:

**Identity → Community → Discovery → Content → Communication**

Everything else can be layered onto that foundation later.

The application should be designed from the beginning so that future
premium functionality and additional content formats can be introduced
without fundamentally rebuilding the core product.

------------------------------------------------------------------------

## End of V1 Product & Feature Specification
