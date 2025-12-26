# Notification System Documentation

## Overview

This document describes the notification quantity update system, APIs used, and button configurations for each route in the ConnectingHeart webapp.

---

## 1. Notification Count System

### 1.1 Notification Types

```typescript
type NotificationType =
  | 'interestReceived'
  | 'interestSent'
  | 'unlockedProfiles'
  | 'iDeclined'
  | 'theyDeclined'
  | 'shortlistedProfile'
  | 'ignoredProfile'
  | 'blockedProfile'
```

### 1.2 Notification Counts Structure

```typescript
type NotificationCounts = {
  interestReceived: number
  interestSent: number
  unlockedProfiles: number
  iDeclined: number
  theyDeclined: number
  shortlisted: number
  ignored: number
  blocked: number
  total: number  // Sum of all above counts
}
```

---

## 2. APIs for Fetching Notification Counts

All these APIs return a `notificationCount` field which represents **unseen/new** notifications.

| Notification Type    | GET API Endpoint                            | Response Field Used      |
|---------------------|---------------------------------------------|--------------------------|
| Interest Received   | `interest/getInterests`                     | `notificationCount`      |
| Interest Sent       | `dashboard/getMyInterestedProfiles`         | `notificationCount`      |
| Unlocked Profiles   | `dashboard/getMyUnlockedProfiles`           | `notificationCount`      |
| I Declined          | `dashboard/getMyDeclinedProfiles`           | `notificationCount`      |
| They Declined       | `dashboard/getUsersWhoHaveDeclinedMe`       | `notificationCount`      |
| Shortlisted         | `dashboard/getMyShortlistedProfiles`        | `notificationCount`      |
| Ignored             | `dashboard/getAllIgnoredProfiles`           | `notificationCount`      |
| Blocked             | `dashboard/getMyBlockedProfiles`            | `notificationCount`      |

### Response Format

```typescript
type NotificationCountResponse = {
  code: string
  status: string
  message: string
  notificationCount?: number        // Unseen/new notification count
  shortlistedProfilesData?: unknown[]
  ignoreListData?: unknown[]
  filteredProfiles?: unknown[]      // Array of profile data
}
```

---

## 3. API for Updating Notification Count (Mark as Seen)

When user visits a notification page, call this API to mark notifications as "seen".

### Endpoint

```
POST dashboard/updateNotificationCount
```

### Request Payload

```typescript
type UpdateNotificationPayload = {
  ids: string[]              // Array of profile IDs to mark as seen
  type: NotificationType     // Type of notification
}
```

### Example Request

```json
{
  "ids": ["profile_id_1", "profile_id_2", "profile_id_3"],
  "type": "interestReceived"
}
```

### Response

```typescript
type UpdateNotificationResponse = {
  status: string
  message: string
}
```

---

## 4. Profile Action APIs

### 4.1 Interest Actions

| Action           | Method | Endpoint                    | Payload                                    |
|-----------------|--------|-----------------------------|--------------------------------------------|
| Send Interest   | POST   | `interest/sendInterest`     | `{ targetId: string }`                     |
| Unsend Interest | POST   | `interest/unsendInterest`   | `{ receiver_id: string }`                  |
| Accept Interest | POST   | `interest/updateInterest`   | `{ _id: string, status: "accept" }`        |
| Decline Interest| POST   | `interest/updateInterest`   | `{ _id: string, status: "reject" }`        |

### 4.2 Profile Management Actions

| Action           | Method | Endpoint                              | Payload |
|-----------------|--------|---------------------------------------|---------|
| Shortlist       | GET    | `dashboard/shortlist/{profileId}`     | -       |
| Unshortlist     | GET    | `dashboard/unshortlist/{profileId}`   | -       |
| Ignore          | GET    | `dashboard/ignoreProfile/{profileId}` | -       |
| Unignore        | GET    | `dashboard/unIgnoreProfile/{profileId}`| -      |
| Unblock         | GET    | `dashboard/unblockprofile/{profileId}`| -       |

---

## 5. Routes and Button Configurations

### 5.1 Route: `/dashboard/interestreceived` - Interest Received Page

| Property           | Value                               |
|-------------------|-------------------------------------|
| **Endpoint**      | `interest/getInterests`             |
| **Notification Type** | `interestReceived`              |
| **Button Type**   | **Dual Button (Accept/Decline)**    |
| **Accept Action** | `interest/updateInterest` with `status: "accept"` |
| **Decline Action**| `interest/updateInterest` with `status: "reject"` |

**Button UI:**
- ✅ **Accept Interest** (Green circle with checkmark)
- ❌ **Decline** (Gray circle with X mark)

---

### 5.2 Route: `/dashboard/interestsent` - Interest Sent Page

| Property           | Value                               |
|-------------------|-------------------------------------|
| **Endpoint**      | `dashboard/getMyInterestedProfiles` |
| **Notification Type** | `interestSent`                  |
| **Button Type**   | **Single Button**                   |
| **Button Label**  | "Cancel Interest"                   |
| **Action Type**   | `unsend-interest`                   |
| **Action API**    | `POST interest/unsendInterest`      |

**Button UI:**
- 🚫 **Cancel Interest** (Yellow circle with prohibition icon)

---

### 5.3 Route: `/dashboard/unlockedprofiles` - Unlocked Profiles Page

| Property           | Value                               |
|-------------------|-------------------------------------|
| **Endpoint**      | `dashboard/getMyUnlockedProfiles`   |
| **Notification Type** | `unlockedProfiles`              |
| **Button Type**   | **Default 3-Button Layout**         |

**Button UI:**
- ✈️ **Send Interest** → `POST interest/sendInterest`
- ⭐ **Shortlist** → `GET dashboard/shortlist/{profileId}`
- ❌ **Ignore** → `GET dashboard/ignoreProfile/{profileId}`

---

### 5.4 Route: `/dashboard/ideclined` - I Declined Page

| Property           | Value                               |
|-------------------|-------------------------------------|
| **Endpoint**      | `dashboard/getMyDeclinedProfiles`   |
| **Notification Type** | `iDeclined`                     |
| **Button Type**   | **Single Button**                   |
| **Button Label**  | "Accept Again"                      |
| **Action Type**   | `accept-again`                      |
| **Action API**    | `POST interest/updateInterest` with `status: "accept"` |

**Button UI:**
- ✅ **Accept Again** (Green circle with checkmark)

---

### 5.5 Route: `/dashboard/theydeclined` - They Declined Page

| Property           | Value                               |
|-------------------|-------------------------------------|
| **Endpoint**      | `dashboard/getUsersWhoHaveDeclinedMe`|
| **Notification Type** | `theyDeclined`                  |
| **Button Type**   | **No Buttons (hideButtons: true)**  |

**Button UI:** None (cards are view-only)

---

### 5.6 Route: `/dashboard/shortlist` - Shortlisted Profiles Page

| Property           | Value                               |
|-------------------|-------------------------------------|
| **Endpoint**      | `dashboard/getMyShortlistedProfiles`|
| **Notification Type** | `shortlistedProfile`            |
| **Button Type**   | **Single Button**                   |
| **Button Label**  | "Remove from Shortlist"             |
| **Action Type**   | `unshortlist`                       |
| **Action API**    | `GET dashboard/unshortlist/{profileId}` |

**Button UI:**
- 🚫 **Remove from Shortlist** (Yellow circle with prohibition icon)

---

### 5.7 Route: `/dashboard/ignored` - Ignored Profiles Page

| Property           | Value                               |
|-------------------|-------------------------------------|
| **Endpoint**      | `dashboard/getAllIgnoredProfiles`   |
| **Notification Type** | `ignoredProfile`                |
| **Button Type**   | **Single Button**                   |
| **Button Label**  | "Remove"                            |
| **Action Type**   | `unignore`                          |
| **Action API**    | `GET dashboard/unIgnoreProfile/{profileId}` |

**Button UI:**
- 🚫 **Remove** (Yellow circle with prohibition icon)

---

### 5.8 Route: `/dashboard/blocked` - Blocked Profiles Page

| Property           | Value                               |
|-------------------|-------------------------------------|
| **Endpoint**      | `dashboard/getMyBlockedProfiles`    |
| **Notification Type** | `blockedProfile`                |
| **Button Type**   | **Single Button**                   |
| **Button Label**  | "Unblock"                           |
| **Action Type**   | `unblock`                           |
| **Action API**    | `GET dashboard/unblockprofile/{profileId}` |

**Button UI:**
- 🚫 **Unblock** (Gray circle with prohibition icon)

---

## 6. Implementation Flow

### 6.1 Fetching Notification Counts (On App Load / Dashboard)

```
1. Call all 8 GET APIs in parallel using Promise.all()
2. Extract notificationCount from each response
3. Sum all counts for total badge count
4. Store in NotificationCountContext for global access
```

### 6.2 Marking Notifications as Seen (On Page Visit)

```
1. User visits a notification page (e.g., /dashboard/interestreceived)
2. Fetch profiles from the respective endpoint
3. Extract all profile IDs from the response
4. Call POST dashboard/updateNotificationCount with:
   - ids: [array of all profile IDs]
   - type: corresponding notification type (e.g., "interestReceived")
5. This marks all notifications as "seen" and reduces the badge count
```

### 6.3 Updating Count After Profile Action

```
1. User performs an action (e.g., Accept Interest)
2. Call the respective action API
3. On success:
   - Refetch the profile list
   - Optionally call updateNotificationCount with remaining profile IDs
   - The count will automatically update on next fetch
```

---

## 7. Quick Reference: Route → API → Button Mapping

| Route                              | GET API                                  | Notification Type     | Button Config                |
|------------------------------------|------------------------------------------|-----------------------|------------------------------|
| `/dashboard/interestreceived`      | `interest/getInterests`                  | `interestReceived`    | Dual: Accept/Decline         |
| `/dashboard/interestsent`          | `dashboard/getMyInterestedProfiles`      | `interestSent`        | Single: Cancel Interest      |
| `/dashboard/unlockedprofiles`      | `dashboard/getMyUnlockedProfiles`        | `unlockedProfiles`    | Default: Send/Shortlist/Ignore|
| `/dashboard/ideclined`             | `dashboard/getMyDeclinedProfiles`        | `iDeclined`           | Single: Accept Again         |
| `/dashboard/theydeclined`          | `dashboard/getUsersWhoHaveDeclinedMe`    | `theyDeclined`        | Hidden (none)                |
| `/dashboard/shortlist`             | `dashboard/getMyShortlistedProfiles`     | `shortlistedProfile`  | Single: Remove from Shortlist|
| `/dashboard/ignored`               | `dashboard/getAllIgnoredProfiles`        | `ignoredProfile`      | Single: Remove               |
| `/dashboard/blocked`               | `dashboard/getMyBlockedProfiles`         | `blockedProfile`      | Single: Unblock              |

---

## 8. API Response Examples

### 8.1 Get Interests Response (Interest Received)

```json
{
  "code": "CH200",
  "status": "success",
  "message": "Interests fetched successfully",
  "notificationCount": 3,
  "filteredProfiles": [
    {
      "_id": "profile_id_1",
      "name": "John Doe",
      "age": 28,
      ...
    }
  ]
}
```

### 8.2 Update Notification Count Request

```json
POST /dashboard/updateNotificationCount
{
  "ids": ["profile_id_1", "profile_id_2"],
  "type": "interestReceived"
}
```

### 8.3 Update Notification Count Response

```json
{
  "status": "success",
  "message": "Notification count updated successfully"
}
```

### 8.4 Send Interest Request

```json
POST /interest/sendInterest
{
  "targetId": "profile_id_123"
}
```

### 8.5 Accept/Decline Interest Request

```json
POST /interest/updateInterest
{
  "_id": "interest_id_or_profile_id",
  "status": "accept"  // or "reject"
}
```

### 8.6 Unsend Interest Request

```json
POST /interest/unsendInterest
{
  "receiver_id": "profile_id_123"
}
```

---

## 9. Hooks Summary

| Hook                          | Purpose                                          |
|------------------------------|--------------------------------------------------|
| `useNotificationCounts`      | Fetch all notification counts on app load        |
| `useUpdateNotificationCount` | Mark notifications as seen when visiting a page  |
| `useProfileActions`          | Execute profile actions (send/accept/decline/etc)|
| `useProfiles`                | Fetch paginated profile list for a given endpoint|

---

## 10. Context Provider

```typescript
// NotificationCountContext provides:
{
  counts: NotificationCounts,  // All notification counts
  loading: boolean,            // Loading state
  refetch: () => void          // Function to refresh counts
}
```

Use `useNotificationCountContext()` hook to access notification counts anywhere in the app.

---

## 11. Notes for Implementation

1. **Notification Count Badge**: Show `counts.total` on the notification bell icon in header/sidebar.

2. **Individual Route Badges**: Show individual count (e.g., `counts.interestReceived`) next to each menu item.

3. **Mark as Seen**: Always call `updateNotificationCount` when user visits a notification page to reduce the badge count.

4. **Refetch After Actions**: After performing any action, call `refetch()` from the context to update global notification counts.

5. **Silent Refetch**: Use `refetch({ silent: true })` for background updates without showing loading state.
