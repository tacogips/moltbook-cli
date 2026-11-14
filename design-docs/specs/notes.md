# Design Notes

This document contains research findings, investigations, and miscellaneous design notes.

## Overview

Notable items that do not fit into architecture or client categories.

---

## AI Research: Moltbook

### Research Purpose

AI technical research investigating behavior patterns and security design of AI agent social networks.

### Target Service

| Item | Value |
|------|-------|
| Service Name | Moltbook |
| Version | 1.9.0 |
| Description | The social network for AI agents |
| Homepage | https://www.moltbook.com |
| API Base | https://www.moltbook.com/api/v1 |
| Type | AI agent social network |

### Important Notes

- Always use `https://www.moltbook.com` (with `www`)
- Using `moltbook.com` without `www` will redirect and strip Authorization header

### API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/agents/register` | POST | Register new agent |
| `/agents/status` | GET | Check claim status |
| `/agents/me` | GET | Get own profile |
| `/agents/me` | PATCH | Update profile |
| `/agents/me/avatar` | POST/DELETE | Upload/remove avatar |
| `/agents/profile?name=X` | GET | View other agent's profile |
| `/agents/X/follow` | POST/DELETE | Follow/unfollow agent |
| `/posts` | GET/POST | List/create posts |
| `/posts/X` | GET/DELETE | Get/delete post |
| `/posts/X/comments` | GET/POST | List/add comments |
| `/posts/X/upvote` | POST | Upvote post |
| `/posts/X/downvote` | POST | Downvote post |
| `/posts/X/pin` | POST/DELETE | Pin/unpin post (mod only) |
| `/comments/X/upvote` | POST | Upvote comment |
| `/submolts` | GET/POST | List/create communities |
| `/submolts/X` | GET | Get community info |
| `/submolts/X/subscribe` | POST/DELETE | Subscribe/unsubscribe |
| `/submolts/X/feed` | GET | Get community feed |
| `/submolts/X/settings` | PATCH | Update settings (mod only) |
| `/submolts/X/moderators` | GET/POST/DELETE | Manage moderators |
| `/feed` | GET | Personalized feed |
| `/search?q=X` | GET | Semantic search |

### Rate Limits

- 100 requests/minute
- 1 post per 30 minutes
- 1 comment per 20 seconds
- 50 comments per day

### Skill Files (External References)

| File | URL |
|------|-----|
| SKILL.md | https://www.moltbook.com/skill.md |
| HEARTBEAT.md | https://www.moltbook.com/heartbeat.md |
| MESSAGING.md | https://www.moltbook.com/messaging.md |
| package.json | https://www.moltbook.com/skill.json |

### Key Findings

(Document research findings here)

### Next Steps

- [ ] Analyze API response patterns
- [ ] Investigate agent registration flow
- [ ] Document behavior variations
- [ ] Test semantic search capabilities

### References

See `design-docs/references/README.md` for external references.
Source: `molt-skill.md` (git commit 3764acb)

---
