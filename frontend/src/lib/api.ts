/**
 * IBVAP-Edge AI REST API Client Abstraction
 * Currently serves mock data, designed for seamless integration with FastAPI backend endpoints.
 */

import { ApiResponse, CameraFeed, ThreatAlert, TelemetryData } from '../types';
import { MOCK_CAMERA_FEEDS, MOCK_THREAT_ALERTS, MOCK_TELEMETRY } from '../data/mockData';

const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetchCameraFeeds(): Promise<ApiResponse<CameraFeed[]>> {
  // Toggle this flag when FastAPI backend is ready:
  const USE_MOCK = true;

  if (USE_MOCK) {
    return {
      success: true,
      data: MOCK_CAMERA_FEEDS,
      timestamp: new Date().toISOString(),
    };
  }

  const response = await fetch(`${FASTAPI_BASE_URL}/cameras`);
  return response.json();
}

export async function fetchThreatAlerts(): Promise<ApiResponse<ThreatAlert[]>> {
  const USE_MOCK = true;

  if (USE_MOCK) {
    return {
      success: true,
      data: MOCK_THREAT_ALERTS,
      timestamp: new Date().toISOString(),
    };
  }

  const response = await fetch(`${FASTAPI_BASE_URL}/threats`);
  return response.json();
}

export async function fetchTelemetry(): Promise<ApiResponse<TelemetryData>> {
  const USE_MOCK = true;

  if (USE_MOCK) {
    return {
      success: true,
      data: MOCK_TELEMETRY,
      timestamp: new Date().toISOString(),
    };
  }

  const response = await fetch(`${FASTAPI_BASE_URL}/telemetry`);
  return response.json();
}
