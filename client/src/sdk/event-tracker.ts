import { TrackEventParams, TrackEventResponse } from './types';

export class EventTracker {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  /**
   * Track an XP event for a user
   * @param params The event parameters
   * @returns Promise with the tracking result
   */
  async trackEvent(params: TrackEventParams): Promise<TrackEventResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to track event',
        };
      }

      return data as TrackEventResponse;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Add an event listener to track user actions
   * @param element The DOM element to listen to
   * @param eventType The DOM event type (e.g., 'click', 'submit')
   * @param gamiEvent The Gami event name to track
   * @param userId The user ID
   * @param metadataFn Optional function to extract metadata from the event
   */
  addEventTracker(
    element: HTMLElement | null,
    eventType: string,
    gamiEvent: string,
    userId: string,
    metadataFn?: (event: Event) => Record<string, any>
  ): void {
    if (!element) {
      console.warn(`Element not found for tracking ${gamiEvent}`);
      return;
    }

    element.addEventListener(eventType, async (event) => {
      const metadata = metadataFn ? metadataFn(event) : {};
      
      await this.trackEvent({
        userId,
        event: gamiEvent,
        metadata,
      });
    });
  }
}
