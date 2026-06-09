export const PRIORITY_WEIGHTS = {
  "Placement": 3,
  "Result": 2,
  "Event": 1
};

export const ACCESS_TOKEN = import.meta.env.VITE_API_TOKEN;
export const API_URL = "/evaluation-service/notifications";

export async function fetchNotifications(params = {}) {
  try {
    const url = new URL(API_URL, window.location.origin);
    if (params.limit) url.searchParams.append("limit", params.limit);
    if (params.page) url.searchParams.append("page", params.page);
    if (params.notification_type) url.searchParams.append("notification_type", params.notification_type);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data.notifications || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

export function sortPriorityNotifications(notifications) {
  return [...notifications].sort((a, b) => {
    const weightA = PRIORITY_WEIGHTS[a.Type] || 0;
    const weightB = PRIORITY_WEIGHTS[b.Type] || 0;

    if (weightA !== weightB) {
      return weightB - weightA;
    }

    const timeA = new Date(a.Timestamp).getTime();
    const timeB = new Date(b.Timestamp).getTime();
    return timeB - timeA;
  });
}

export async function fetchTopPriorityNotifications(topN) {
  let allData = [];
  let page = 1;
  while (page <= 5) {
    const pageData = await fetchNotifications({ limit: 10, page: page });
    if (pageData.length === 0) break;
    allData = [...allData, ...pageData];
    page++;
  }
  
  const sorted = sortPriorityNotifications(allData);
  return sorted.slice(0, topN);
}
