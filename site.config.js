/**
 * site.config.js — FirstNest app configuration
 *
 * All environment-level and feature-flag values live here.
 * Change this file to reconfigure the app without touching business logic.
 */

const SITE_CONFIG = {
  site: {
    title:       'FirstNest',
    tagline:     'Find your first home in Tampere',
    baseUrl:     'https://uusikoti.vercel.app',
    locale:      'fi-FI',
    currency:    'EUR',
  },

  storage: {
    favouritesKey: 'firstnest_local_favourites',
    chatHistoryKey: 'firstnest_ai_chat',
  },

  features: {
    aiChat:             true,
    mortgageCalculator: true,
    mapView:            true,
    areaComparison:     true,
  },

  api: {
    /** Vercel serverless function — relative path works on all environments */
    chatEndpoint: '/api/chat',
  },

  map: {
    defaultCenter: [61.4978, 23.7610], // Tampere
    defaultZoom:   12,
  },
};
