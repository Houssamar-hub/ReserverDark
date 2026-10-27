/**
 * @file conversationMemory.js
 * @description Manages session-based conversation context and cumulative search criteria
 * to support multi-turn conversational refinements without state loss.
 */

import crypto from 'crypto';

class ConversationMemory {
  constructor() {
    // In-memory session store: Map<sessionId, SessionState>
    this.sessions = new Map();
    // Maximum messages to retain per session
    this.maxHistoryLength = 12;
    // Session expiration (2 hours)
    this.ttlMs = 2 * 60 * 60 * 1000;

    // Periodic sweep for expired sessions
    setInterval(() => this._cleanupExpired(), 15 * 60 * 1000).unref();
  }

  /**
   * Generates or normalizes a sessionId
   */
  getOrCreateSession(sessionId = null, userId = null) {
    let id = sessionId;
    if (!id || typeof id !== 'string') {
      id = (userId ? `usr_${userId}_` : 'sess_') + crypto.randomUUID();
    }

    if (!this.sessions.has(id)) {
      this.sessions.set(id, {
        id,
        userId: userId || null,
        criteria: {
          transactionType: null,
          city: null,
          minPrice: null,
          maxPrice: null,
          propertyType: null,
          minBedrooms: null,
          minBathrooms: null,
          minGuests: null,
          amenities: [],
        },
        history: [],
        lastUpdated: Date.now(),
      });
    }

    const session = this.sessions.get(id);
    session.lastUpdated = Date.now();
    return session;
  }

  /**
   * Updates cumulative criteria based on refinements
   */
  mergeCriteria(sessionId, newCriteria = {}) {
    const session = this.getOrCreateSession(sessionId);

    // Merge logic: preserve existing if new is null/undefined
    const merged = { ...session.criteria };

    if (newCriteria.transactionType !== undefined && newCriteria.transactionType !== null) {
      merged.transactionType = newCriteria.transactionType;
    }
    if (newCriteria.city) {
      merged.city = newCriteria.city;
    }
    if (newCriteria.propertyType) {
      merged.propertyType = newCriteria.propertyType;
    }
    if (newCriteria.maxPrice !== undefined && newCriteria.maxPrice !== null) {
      merged.maxPrice = newCriteria.maxPrice;
    }
    if (newCriteria.minPrice !== undefined && newCriteria.minPrice !== null) {
      merged.minPrice = newCriteria.minPrice;
    }
    if (newCriteria.minBedrooms !== undefined && newCriteria.minBedrooms !== null) {
      merged.minBedrooms = newCriteria.minBedrooms;
    }
    if (newCriteria.minBathrooms !== undefined && newCriteria.minBathrooms !== null) {
      merged.minBathrooms = newCriteria.minBathrooms;
    }
    if (newCriteria.minGuests !== undefined && newCriteria.minGuests !== null) {
      merged.minGuests = newCriteria.minGuests;
    }

    // Amenities: set union
    if (Array.isArray(newCriteria.amenities) && newCriteria.amenities.length > 0) {
      const set = new Set([...merged.amenities, ...newCriteria.amenities]);
      merged.amenities = Array.from(set);
    }

    session.criteria = merged;
    return merged;
  }

  /**
   * Appends messages to history
   */
  appendMessage(sessionId, role, content) {
    const session = this.getOrCreateSession(sessionId);
    session.history.push({
      role,
      content,
      timestamp: new Date().toISOString(),
    });

    if (session.history.length > this.maxHistoryLength) {
      session.history = session.history.slice(-this.maxHistoryLength);
    }
  }

  /**
   * Resets session memory
   */
  resetSession(sessionId) {
    if (this.sessions.has(sessionId)) {
      this.sessions.delete(sessionId);
    }
    return this.getOrCreateSession(sessionId);
  }

  _cleanupExpired() {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastUpdated > this.ttlMs) {
        this.sessions.delete(id);
      }
    }
  }
}

export const conversationMemory = new ConversationMemory();
export default conversationMemory;
