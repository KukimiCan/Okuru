import { apiRequest } from "./apiClient";
import type { PaginatedResponse } from "../types/api";
import type {
  Story,
  StoryDeleteResponse,
  StoryInput,
  StoryListItem,
  StoryListQuery,
  StoryUpdateResponse,
} from "../types/story";

function toQueryString(query: StoryListQuery = {}) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export function getStories(query?: StoryListQuery) {
  return apiRequest<PaginatedResponse<StoryListItem>>(`/api/stories${toQueryString(query)}`);
}

export function getStory(storyId: string) {
  return apiRequest<Story>(`/api/stories/${storyId}`);
}

export function createStory(input: StoryInput) {
  return apiRequest<{ id: string; created_at: string }>("/api/stories", {
    method: "POST",
    body: input,
  });
}

export function updateStory(storyId: string, input: StoryInput) {
  return apiRequest<StoryUpdateResponse>(`/api/stories/${storyId}`, {
    method: "PATCH",
    body: input,
  });
}

export function deleteStory(storyId: string) {
  return apiRequest<StoryDeleteResponse>(`/api/stories/${storyId}`, {
    method: "DELETE",
  });
}
