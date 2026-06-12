import { apiRequest } from "./apiClient";
import type { PaginatedResponse } from "../types/api";
import type {
  ConsultationCreateResponse,
  ConsultationDetail,
  ConsultationDeleteResponse,
  ConsultationInput,
  ConsultationListItem,
  ConsultationUpdateInput,
  ConsultationUpdateResponse,
} from "../types/consultation";

export function createConsultation(input: ConsultationInput) {
  return apiRequest<ConsultationCreateResponse>("/api/consultations", {
    method: "POST",
    body: input,
  });
}

export function getConsultations() {
  return apiRequest<PaginatedResponse<ConsultationListItem>>("/api/consultations");
}

export function getConsultation(consultationId: string) {
  return apiRequest<ConsultationDetail>(`/api/consultations/${consultationId}`);
}

export function updateConsultation(
  consultationId: string,
  input: ConsultationUpdateInput,
) {
  return apiRequest<ConsultationUpdateResponse>(`/api/consultations/${consultationId}`, {
    method: "PATCH",
    body: input,
  });
}

export function deleteConsultation(consultationId: string) {
  return apiRequest<ConsultationDeleteResponse>(`/api/consultations/${consultationId}`, {
    method: "DELETE",
  });
}
