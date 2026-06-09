# Stage 1: Priority Sorting Approach

## Overview
The goal of this stage is to build a "Priority Inbox" that finds the top 'n' most important unread notifications. Priority is determined by a combination of the notification type's weight (`Placement > Result > Event`) and how recent it is.

## 1. Weight Assignment
First, we assign a numeric weight to each notification type. This ensures that a Placement notification is mathematically more important than a Result, and a Result is more important than an Event.

```javascript
const WEIGHTS = {
  "Placement": 3,
  "Result": 2,
  "Event": 1
};
```

## 2. Recency Calculation
We must factor in time so that a newer Event might not override a Placement, but between two Placements, the newer one wins.
We can achieve this by converting the `Timestamp` into a Unix epoch timestamp (milliseconds). 

## 3. Sorting Logic
When sorting the array of notifications, we use a custom comparator function:
1. First, we compare the weights. If Notification A has a higher weight than Notification B, A comes first.
2. If the weights are **equal** (e.g., both are Placement notifications), we then compare their timestamps. The one with the more recent timestamp (higher epoch value) comes first.

### Example Algorithm
```javascript
notifications.sort((a, b) => {
  const weightA = WEIGHTS[a.Type] || 0;
  const weightB = WEIGHTS[b.Type] || 0;

  if (weightA !== weightB) {
    return weightB - weightA; // Higher weight first
  }

  // If weights are equal, sort by newest time
  const timeA = new Date(a.Timestamp).getTime();
  const timeB = new Date(b.Timestamp).getTime();
  return timeB - timeA;
});
```

## 4. Extracting Top N
After the array is sorted using the logic above, we simply slice the first 'n' elements to get the Top N Priority Notifications.
```javascript
const top10 = sortedNotifications.slice(0, 10);
```

## Conclusion
This approach is extremely efficient. It sorts the array in-memory using an O(N log N) algorithm, which is highly performant and doesn't require complex database queries. It guarantees that the highest value items are always at the top, while breaking ties with time.
