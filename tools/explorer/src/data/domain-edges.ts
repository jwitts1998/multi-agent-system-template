import type { Edge } from '@xyflow/react';

export const domainEdges: Edge[] = [
  // === Orchestration -> All Tiers ===
  {
    id: 'orch-po-t1-schema',
    source: 'domain-product-orchestrator',
    target: 'domain-schema-data',
    label: 'governs',
    style: { stroke: '#34d399', strokeWidth: 1, strokeDasharray: '6 3' },
    animated: true,
  },
  {
    id: 'orch-po-t1-api',
    source: 'domain-product-orchestrator',
    target: 'domain-api-connections',
    label: 'governs',
    style: { stroke: '#34d399', strokeWidth: 1, strokeDasharray: '6 3' },
    animated: true,
  },
  {
    id: 'orch-po-t1-auth',
    source: 'domain-product-orchestrator',
    target: 'domain-auth-identity',
    label: 'governs',
    style: { stroke: '#34d399', strokeWidth: 1, strokeDasharray: '6 3' },
    animated: true,
  },
  {
    id: 'orch-po-t1-infra',
    source: 'domain-product-orchestrator',
    target: 'domain-infrastructure',
    label: 'governs',
    style: { stroke: '#34d399', strokeWidth: 1, strokeDasharray: '6 3' },
    animated: true,
  },

  // === Tier 2 -> Tier 1 dependencies ===
  // Maps
  { id: 'dep-maps-schema', source: 'domain-maps-geo', target: 'domain-schema-data', label: 'uses' },
  { id: 'dep-maps-api', source: 'domain-maps-geo', target: 'domain-api-connections', label: 'uses' },
  { id: 'dep-maps-auth', source: 'domain-maps-geo', target: 'domain-auth-identity', label: 'uses' },
  // Messaging
  { id: 'dep-msg-schema', source: 'domain-messaging', target: 'domain-schema-data', label: 'uses' },
  { id: 'dep-msg-api', source: 'domain-messaging', target: 'domain-api-connections', label: 'uses' },
  { id: 'dep-msg-auth', source: 'domain-messaging', target: 'domain-auth-identity', label: 'uses' },
  // Search
  { id: 'dep-search-schema', source: 'domain-search-discovery', target: 'domain-schema-data', label: 'uses' },
  { id: 'dep-search-api', source: 'domain-search-discovery', target: 'domain-api-connections', label: 'uses' },
  // Payments
  { id: 'dep-pay-schema', source: 'domain-payments-billing', target: 'domain-schema-data', label: 'uses' },
  { id: 'dep-pay-api', source: 'domain-payments-billing', target: 'domain-api-connections', label: 'uses' },
  { id: 'dep-pay-auth', source: 'domain-payments-billing', target: 'domain-auth-identity', label: 'uses' },
  // Notifications
  { id: 'dep-notif-schema', source: 'domain-notifications', target: 'domain-schema-data', label: 'uses' },
  { id: 'dep-notif-api', source: 'domain-notifications', target: 'domain-api-connections', label: 'uses' },
  { id: 'dep-notif-auth', source: 'domain-notifications', target: 'domain-auth-identity', label: 'uses' },
  // Media
  { id: 'dep-media-schema', source: 'domain-media-content', target: 'domain-schema-data', label: 'uses' },
  { id: 'dep-media-api', source: 'domain-media-content', target: 'domain-api-connections', label: 'uses' },
  { id: 'dep-media-auth', source: 'domain-media-content', target: 'domain-auth-identity', label: 'uses' },

  // === Tier 3 -> Tier 1 dependencies ===
  { id: 'dep-perf-infra', source: 'domain-performance', target: 'domain-infrastructure', label: 'uses' },
  { id: 'dep-analytics-schema', source: 'domain-analytics-telemetry', target: 'domain-schema-data', label: 'uses' },
  { id: 'dep-analytics-api', source: 'domain-analytics-telemetry', target: 'domain-api-connections', label: 'uses' },

  // === Tier 3 consults Tier 2 (dashed, consulting relationships) ===
  // Animation consults feature domains
  {
    id: 'consult-anim-maps',
    source: 'domain-animation-motion',
    target: 'domain-maps-geo',
    label: 'consults',
    style: { stroke: '#a78bfa', strokeWidth: 1, strokeDasharray: '4 4' },
  },
  {
    id: 'consult-anim-msg',
    source: 'domain-animation-motion',
    target: 'domain-messaging',
    label: 'consults',
    style: { stroke: '#a78bfa', strokeWidth: 1, strokeDasharray: '4 4' },
  },
  {
    id: 'consult-anim-media',
    source: 'domain-animation-motion',
    target: 'domain-media-content',
    label: 'consults',
    style: { stroke: '#a78bfa', strokeWidth: 1, strokeDasharray: '4 4' },
  },
  // Accessibility consults feature domains
  {
    id: 'consult-a11y-maps',
    source: 'domain-accessibility',
    target: 'domain-maps-geo',
    label: 'consults',
    style: { stroke: '#a78bfa', strokeWidth: 1, strokeDasharray: '4 4' },
  },
  {
    id: 'consult-a11y-msg',
    source: 'domain-accessibility',
    target: 'domain-messaging',
    label: 'consults',
    style: { stroke: '#a78bfa', strokeWidth: 1, strokeDasharray: '4 4' },
  },
  {
    id: 'consult-a11y-search',
    source: 'domain-accessibility',
    target: 'domain-search-discovery',
    label: 'consults',
    style: { stroke: '#a78bfa', strokeWidth: 1, strokeDasharray: '4 4' },
  },
  {
    id: 'consult-a11y-media',
    source: 'domain-accessibility',
    target: 'domain-media-content',
    label: 'consults',
    style: { stroke: '#a78bfa', strokeWidth: 1, strokeDasharray: '4 4' },
  },
  // Performance consults feature domains
  {
    id: 'consult-perf-maps',
    source: 'domain-performance',
    target: 'domain-maps-geo',
    label: 'consults',
    style: { stroke: '#a78bfa', strokeWidth: 1, strokeDasharray: '4 4' },
  },
  {
    id: 'consult-perf-msg',
    source: 'domain-performance',
    target: 'domain-messaging',
    label: 'consults',
    style: { stroke: '#a78bfa', strokeWidth: 1, strokeDasharray: '4 4' },
  },
  {
    id: 'consult-perf-search',
    source: 'domain-performance',
    target: 'domain-search-discovery',
    label: 'consults',
    style: { stroke: '#a78bfa', strokeWidth: 1, strokeDasharray: '4 4' },
  },
  {
    id: 'consult-perf-media',
    source: 'domain-performance',
    target: 'domain-media-content',
    label: 'consults',
    style: { stroke: '#a78bfa', strokeWidth: 1, strokeDasharray: '4 4' },
  },
  // Analytics consults feature domains
  {
    id: 'consult-analytics-search',
    source: 'domain-analytics-telemetry',
    target: 'domain-search-discovery',
    label: 'consults',
    style: { stroke: '#a78bfa', strokeWidth: 1, strokeDasharray: '4 4' },
  },
  {
    id: 'consult-analytics-pay',
    source: 'domain-analytics-telemetry',
    target: 'domain-payments-billing',
    label: 'consults',
    style: { stroke: '#a78bfa', strokeWidth: 1, strokeDasharray: '4 4' },
  },
  {
    id: 'consult-analytics-notif',
    source: 'domain-analytics-telemetry',
    target: 'domain-notifications',
    label: 'consults',
    style: { stroke: '#a78bfa', strokeWidth: 1, strokeDasharray: '4 4' },
  },

  // === Domain Router -> all domains (subtle) ===
  {
    id: 'router-schema',
    source: 'domain-router',
    target: 'domain-schema-data',
    style: { stroke: '#34d399', strokeWidth: 0.5, strokeDasharray: '2 4' },
  },
  {
    id: 'router-api',
    source: 'domain-router',
    target: 'domain-api-connections',
    style: { stroke: '#34d399', strokeWidth: 0.5, strokeDasharray: '2 4' },
  },
  {
    id: 'router-auth',
    source: 'domain-router',
    target: 'domain-auth-identity',
    style: { stroke: '#34d399', strokeWidth: 0.5, strokeDasharray: '2 4' },
  },
  {
    id: 'router-infra',
    source: 'domain-router',
    target: 'domain-infrastructure',
    style: { stroke: '#34d399', strokeWidth: 0.5, strokeDasharray: '2 4' },
  },
  {
    id: 'router-maps',
    source: 'domain-router',
    target: 'domain-maps-geo',
    style: { stroke: '#34d399', strokeWidth: 0.5, strokeDasharray: '2 4' },
  },
  {
    id: 'router-msg',
    source: 'domain-router',
    target: 'domain-messaging',
    style: { stroke: '#34d399', strokeWidth: 0.5, strokeDasharray: '2 4' },
  },
  {
    id: 'router-search',
    source: 'domain-router',
    target: 'domain-search-discovery',
    style: { stroke: '#34d399', strokeWidth: 0.5, strokeDasharray: '2 4' },
  },
  {
    id: 'router-pay',
    source: 'domain-router',
    target: 'domain-payments-billing',
    style: { stroke: '#34d399', strokeWidth: 0.5, strokeDasharray: '2 4' },
  },
  {
    id: 'router-notif',
    source: 'domain-router',
    target: 'domain-notifications',
    style: { stroke: '#34d399', strokeWidth: 0.5, strokeDasharray: '2 4' },
  },
  {
    id: 'router-media',
    source: 'domain-router',
    target: 'domain-media-content',
    style: { stroke: '#34d399', strokeWidth: 0.5, strokeDasharray: '2 4' },
  },
];
