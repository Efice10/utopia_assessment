/**
 * AI Prompts for Operations Query Window
 *
 * This module contains prompt templates for the AI assistant
 * that answers questions about service operations.
 */

import { buildToolsDescription } from './tools';

// System prompt for the operations assistant
export const OPERATIONS_ASSISTANT_SYSTEM_PROMPT = `You are an AI assistant for Sejuk Sejuk Service, an air-conditioner service company. You help managers and admins query operational data and perform actions on service orders.

## Your Role
- Answer questions about service orders, technicians, and operations
- Create new service orders when requested
- Update/edit existing orders (customer info, address, phone, status, etc.)
- Delete orders when requested (with confirmation)
- Assign technicians to orders
- Update order status when requested
- Provide clear, concise, and accurate information
- Format responses in a readable way using markdown

## Available Data Context
You have access to the following types of operational data:
- Orders: Service requests with status, customer info, service type, pricing
- Technicians: Staff members with their assignments and performance
- Service Records: Completed jobs with work details and payments
- Branches: Company locations

## Order Status Flow
NEW → ASSIGNED → IN PROGRESS → JOB DONE → REVIEWED → CLOSED

## Service Types
- Installation: New air-conditioner installation
- Servicing: Regular maintenance/cleaning
- Repair: Fix malfunctioning unit
- Gas Refill: Recharge refrigerant
- Inspection: Check and report unit condition
- Others: Miscellaneous services

## Response Guidelines
1. Be helpful and professional
2. Use bullet points for lists
3. Include relevant numbers and metrics
4. If comparing data, use clear formatting
5. Acknowledge when data might be incomplete
6. Suggest follow-up questions when appropriate
7. When asked to perform an action, use the appropriate tool
8. For delete operations, always warn that the action cannot be undone

${buildToolsDescription()}`;

// Function to build query context with actual data
export function buildQueryContext(data: {
  orders?: unknown[];
  technicians?: unknown[];
  serviceRecords?: unknown[];
  summary?: {
    totalOrders?: number;
    completedOrders?: number;
    totalRevenue?: number;
    pendingOrders?: number;
  };
}): string {
  const parts: string[] = [];

  if (data.summary) {
    parts.push(`## Current Summary
- Total Orders: ${data.summary.totalOrders || 0}
- Completed Orders: ${data.summary.completedOrders || 0}
- Pending Orders: ${data.summary.pendingOrders || 0}
- Total Revenue: RM ${data.summary.totalRevenue?.toFixed(2) || '0.00'}`);
  }

  if (data.technicians && data.technicians.length > 0) {
    parts.push(`## Technicians Data
\`\`\`json
${JSON.stringify(data.technicians, null, 2)}
\`\`\``);
  }

  if (data.orders && data.orders.length > 0) {
    parts.push(`## Orders Data
\`\`\`json
${JSON.stringify(data.orders, null, 2)}
\`\`\``);
  }

  if (data.serviceRecords && data.serviceRecords.length > 0) {
    parts.push(`## Service Records Data
\`\`\`json
${JSON.stringify(data.serviceRecords, null, 2)}
\`\`\``);
  }

  return parts.join('\n\n');
}

// Example queries for user guidance
export const EXAMPLE_QUERIES = [
  "Create a repair order for Ahmad at 123 Jalan Merdeka, phone 012-3456789",
  "Update order ORD-ABC123 to change the address to 456 New Street",
  "Edit the phone number for order ORD-ABC123 to 019-8765432",
  "Change the status of order ORD-ABC123 to in_progress",
  "Delete order ORD-ABC123",
  "What jobs did technician Ali complete last week?",
  "How many jobs were completed today?",
  "Create a servicing order for Siti at 456 Taman Indah, phone 019-8765432",
  "What is the total revenue this month?",
  "Show me all pending orders",
];

// Query intent categories for classification
export type QueryIntent =
  | 'create_order'
  | 'update_order'
  | 'delete_order'
  | 'technician_performance'
  | 'order_summary'
  | 'revenue_query'
  | 'comparison'
  | 'status_check'
  | 'general';

export function classifyQueryIntent(query: string): QueryIntent {
  const lowerQuery = query.toLowerCase();

  // Check for action-based intents first
  if (lowerQuery.includes('delete') || lowerQuery.includes('remove') || lowerQuery.includes('cancel order')) {
    return 'delete_order';
  }

  if (lowerQuery.includes('update') || lowerQuery.includes('edit') || lowerQuery.includes('change') || lowerQuery.includes('modify')) {
    return 'update_order';
  }

  if (lowerQuery.includes('create') || lowerQuery.includes('new order') || lowerQuery.includes('add order')) {
    return 'create_order';
  }

  if (lowerQuery.includes('revenue') || lowerQuery.includes('earnings') || lowerQuery.includes('income')) {
    return 'revenue_query';
  }

  if (lowerQuery.includes('compare') || lowerQuery.includes('versus') || lowerQuery.includes('vs') || lowerQuery.includes('most') || lowerQuery.includes('highest')) {
    return 'comparison';
  }

  if (lowerQuery.includes('status') || lowerQuery.includes('pending') || lowerQuery.includes('in progress')) {
    return 'status_check';
  }

  if (lowerQuery.includes('technician') || lowerQuery.includes('ali') || lowerQuery.includes('john') || lowerQuery.includes('bala') || lowerQuery.includes('yusoff')) {
    return 'technician_performance';
  }

  if (lowerQuery.includes('how many') || lowerQuery.includes('total') || lowerQuery.includes('count') || lowerQuery.includes('summary')) {
    return 'order_summary';
  }

  return 'general';
}
