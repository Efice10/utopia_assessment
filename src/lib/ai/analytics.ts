/**
 * AI Analytics Module
 *
 * Provides anomaly detection, workload analysis, and insights generation
 * for the AI assistant.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// Types for analytics data
export interface AnomalyDetectionResult {
  hasAnomalies: boolean;
  anomalies: Anomaly[];
  summary: string;
}

export interface Anomaly {
  type: 'revenue_drop' | 'revenue_spike' | 'order_volume_drop' | 'order_volume_spike' | 'completion_rate_drop' | 'technician_overload' | 'stale_orders';
  severity: 'low' | 'medium' | 'high';
  description: string;
  value: number;
  expectedValue: number;
  deviation: number;
  affectedEntities?: string[];
  recommendation: string;
}

export interface WorkloadAnalysisResult {
  technicians: TechnicianWorkload[];
  summary: string;
  recommendations: string[];
  imbalanceDetected: boolean;
}

export interface TechnicianWorkload {
  id: string;
  name: string;
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  utilizationRate: number;
  capacityStatus: 'underutilized' | 'balanced' | 'overloaded';
  avgCompletionTime: number | null;
}

export interface InsightsResult {
  insights: Insight[];
  generatedAt: string;
  period: string;
}

export interface Insight {
  category: 'performance' | 'revenue' | 'efficiency' | 'risk' | 'opportunity';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  recommendation?: string;
  metrics?: Record<string, number>;
}

/**
 * Detect anomalies in operational data
 */
export async function detectAnomalies(
  supabase: SupabaseClient,
  options: { daysToAnalyze?: number; sensitivity?: 'low' | 'medium' | 'high' } = {}
): Promise<AnomalyDetectionResult> {
  const { daysToAnalyze = 30, sensitivity = 'medium' } = options;
  const anomalies: Anomaly[] = [];

  // Sensitivity thresholds
  const thresholds = {
    low: { deviation: 0.4, staleDays: 14 },
    medium: { deviation: 0.25, staleDays: 7 },
    high: { deviation: 0.15, staleDays: 3 },
  };
  const threshold = thresholds[sensitivity];

  try {
    // Fetch historical data
    const now = new Date();
    const periodStart = new Date(now.getTime() - daysToAnalyze * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(periodStart.getTime() - daysToAnalyze * 24 * 60 * 60 * 1000);

    // Current period orders
    const { data: currentOrders } = await supabase
      .from('orders')
      .select('id, status, quoted_price, created_at, assigned_technician_id')
      .gte('created_at', periodStart.toISOString());

    // Previous period orders for comparison
    const { data: previousOrders } = await supabase
      .from('orders')
      .select('id, status, quoted_price, created_at')
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', periodStart.toISOString());

    // Get technicians
    const { data: technicians } = await supabase
      .from('users')
      .select('id, name')
      .eq('role', 'technician')
      .eq('is_active', true);

    const currentOrderList = currentOrders || [];
    const previousOrderList = previousOrders || [];
    const technicianList = technicians || [];

    // Calculate metrics
    const currentRevenue = currentOrderList
      .filter((o) => ['job_done', 'reviewed', 'closed'].includes(o.status))
      .reduce((sum, o) => sum + (o.quoted_price || 0), 0);

    const previousRevenue = previousOrderList
      .filter((o) => ['job_done', 'reviewed', 'closed'].includes(o.status))
      .reduce((sum, o) => sum + (o.quoted_price || 0), 0);

    const currentCompleted = currentOrderList.filter((o) =>
      ['job_done', 'reviewed', 'closed'].includes(o.status)
    ).length;
    const previousCompleted = previousOrderList.filter((o) =>
      ['job_done', 'reviewed', 'closed'].includes(o.status)
    ).length;

    // 1. Revenue anomaly detection
    if (previousRevenue > 0) {
      const revenueChange = (currentRevenue - previousRevenue) / previousRevenue;

      if (revenueChange < -threshold.deviation) {
        anomalies.push({
          type: 'revenue_drop',
          severity: Math.abs(revenueChange) > 0.5 ? 'high' : Math.abs(revenueChange) > 0.3 ? 'medium' : 'low',
          description: `Revenue dropped by ${Math.abs(revenueChange * 100).toFixed(1)}% compared to the previous period`,
          value: currentRevenue,
          expectedValue: previousRevenue,
          deviation: Math.abs(revenueChange),
          recommendation: 'Review cancelled orders, check for pricing issues, and consider promotional activities.',
        });
      } else if (revenueChange > threshold.deviation) {
        anomalies.push({
          type: 'revenue_spike',
          severity: revenueChange > 0.5 ? 'high' : 'medium',
          description: `Revenue increased by ${(revenueChange * 100).toFixed(1)}% compared to the previous period`,
          value: currentRevenue,
          expectedValue: previousRevenue,
          deviation: revenueChange,
          recommendation: 'Identify what drove this increase and consider replicating successful strategies.',
        });
      }
    }

    // 2. Order volume anomaly detection
    if (previousOrderList.length > 0) {
      const volumeChange = (currentOrderList.length - previousOrderList.length) / previousOrderList.length;

      if (volumeChange < -threshold.deviation) {
        anomalies.push({
          type: 'order_volume_drop',
          severity: Math.abs(volumeChange) > 0.5 ? 'high' : 'medium',
          description: `Order volume dropped by ${Math.abs(volumeChange * 100).toFixed(1)}% compared to the previous period`,
          value: currentOrderList.length,
          expectedValue: previousOrderList.length,
          deviation: Math.abs(volumeChange),
          recommendation: 'Review marketing efforts, check for seasonal patterns, and consider outreach campaigns.',
        });
      } else if (volumeChange > threshold.deviation) {
        anomalies.push({
          type: 'order_volume_spike',
          severity: volumeChange > 0.5 ? 'high' : 'medium',
          description: `Order volume increased by ${(volumeChange * 100).toFixed(1)}% compared to the previous period`,
          value: currentOrderList.length,
          expectedValue: previousOrderList.length,
          deviation: volumeChange,
          recommendation: 'Ensure sufficient technician capacity and maintain service quality.',
        });
      }
    }

    // 3. Completion rate anomaly
    const currentCompletionRate = currentOrderList.length > 0
      ? currentCompleted / currentOrderList.length
      : 0;
    const previousCompletionRate = previousOrderList.length > 0
      ? previousCompleted / previousOrderList.length
      : 0;

    if (previousCompletionRate > 0 && currentCompletionRate < previousCompletionRate - threshold.deviation) {
      anomalies.push({
        type: 'completion_rate_drop',
        severity: currentCompletionRate < 0.5 ? 'high' : 'medium',
        description: `Completion rate dropped from ${(previousCompletionRate * 100).toFixed(1)}% to ${(currentCompletionRate * 100).toFixed(1)}%`,
        value: currentCompletionRate * 100,
        expectedValue: previousCompletionRate * 100,
        deviation: Math.abs(currentCompletionRate - previousCompletionRate) * 100,
        recommendation: 'Review in-progress orders for bottlenecks and check technician availability.',
      });
    }

    // 4. Technician overload detection
    const technicianOrderCounts: Record<string, number> = {};
    for (const order of currentOrderList) {
      if (order.assigned_technician_id) {
        technicianOrderCounts[order.assigned_technician_id] =
          (technicianOrderCounts[order.assigned_technician_id] || 0) + 1;
      }
    }

    const avgOrdersPerTech = Object.values(technicianOrderCounts).reduce((a, b) => a + b, 0) /
      Math.max(technicianList.length, 1);

    const overloadedTechs = Object.entries(technicianOrderCounts)
      .filter(([, count]) => count > avgOrdersPerTech * 1.5)
      .map(([id]) => technicianList.find((t) => t.id === id)?.name || id);

    if (overloadedTechs.length > 0) {
      anomalies.push({
        type: 'technician_overload',
        severity: overloadedTechs.length > technicianList.length / 2 ? 'high' : 'medium',
        description: `${overloadedTechs.length} technician(s) are overloaded: ${overloadedTechs.join(', ')}`,
        value: Math.max(...Object.values(technicianOrderCounts)),
        expectedValue: avgOrdersPerTech,
        deviation: (Math.max(...Object.values(technicianOrderCounts)) - avgOrdersPerTech) / avgOrdersPerTech,
        affectedEntities: overloadedTechs,
        recommendation: 'Consider redistributing work or hiring additional technicians.',
      });
    }

    // 5. Stale orders detection
    const staleThreshold = new Date(now.getTime() - threshold.staleDays * 24 * 60 * 60 * 1000);
    const staleOrders = currentOrderList.filter(
      (o) => ['new', 'assigned'].includes(o.status) && new Date(o.created_at) < staleThreshold
    );

    if (staleOrders.length > 0) {
      anomalies.push({
        type: 'stale_orders',
        severity: staleOrders.length > 5 ? 'high' : staleOrders.length > 2 ? 'medium' : 'low',
        description: `${staleOrders.length} order(s) have been pending for more than ${threshold.staleDays} days`,
        value: staleOrders.length,
        expectedValue: 0,
        deviation: staleOrders.length,
        recommendation: 'Review and assign these orders immediately or follow up with customers.',
      });
    }

    // Generate summary
    const highSeverity = anomalies.filter((a) => a.severity === 'high').length;
    const mediumSeverity = anomalies.filter((a) => a.severity === 'medium').length;

    let summary = '';
    if (anomalies.length === 0) {
      summary = 'No significant anomalies detected. Operations are running smoothly.';
    } else {
      summary = `Detected ${anomalies.length} anomaly(ies): ${highSeverity} high priority, ${mediumSeverity} medium priority. Immediate attention recommended.`;
    }

    return {
      hasAnomalies: anomalies.length > 0,
      anomalies,
      summary,
    };
  } catch (error) {
    console.error('Error detecting anomalies:', error);
    return {
      hasAnomalies: false,
      anomalies: [],
      summary: 'Unable to analyze anomalies due to an error.',
    };
  }
}

/**
 * Analyze technician workload distribution
 */
export async function analyzeWorkload(
  supabase: SupabaseClient,
  options: { includeInactive?: boolean } = {}
): Promise<WorkloadAnalysisResult> {
  const { includeInactive = false } = options;

  try {
    // Get technicians
    let query = supabase
      .from('users')
      .select('id, name, is_active')
      .eq('role', 'technician');

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data: technicians } = await query;

    // Get all orders with technician assignments
    const { data: orders } = await supabase
      .from('orders')
      .select('id, status, assigned_technician_id, created_at, updated_at')
      .not('assigned_technician_id', 'is', null);

    const technicianList = technicians || [];
    const orderList = orders || [];

    // Calculate workload for each technician
    const workloads: TechnicianWorkload[] = technicianList.map((tech) => {
      const techOrders = orderList.filter((o) => o.assigned_technician_id === tech.id);
      const pendingOrders = techOrders.filter((o) => ['new', 'assigned'].includes(o.status)).length;
      const inProgressOrders = techOrders.filter((o) => o.status === 'in_progress').length;
      const completedOrders = techOrders.filter((o) =>
        ['job_done', 'reviewed', 'closed'].includes(o.status)
      ).length;
      const totalOrders = techOrders.length;

      // Calculate utilization rate (pending + in_progress / total capacity)
      // Assuming capacity is based on completed orders ratio
      const activeOrders = pendingOrders + inProgressOrders;
      const utilizationRate = totalOrders > 0 ? activeOrders / Math.max(totalOrders, 1) : 0;

      // Determine capacity status
      let capacityStatus: 'underutilized' | 'balanced' | 'overloaded';
      if (utilizationRate < 0.3) {
        capacityStatus = 'underutilized';
      } else if (utilizationRate > 0.8) {
        capacityStatus = 'overloaded';
      } else {
        capacityStatus = 'balanced';
      }

      return {
        id: tech.id,
        name: tech.name,
        totalOrders,
        pendingOrders,
        inProgressOrders,
        completedOrders,
        utilizationRate,
        capacityStatus,
        avgCompletionTime: null, // Would need service_records data
      };
    });

    // Detect imbalance
    const activeWorkloads = workloads.filter((w) => w.totalOrders > 0);
    const avgUtilization = activeWorkloads.length > 0
      ? activeWorkloads.reduce((sum, w) => sum + w.utilizationRate, 0) / activeWorkloads.length
      : 0;

    const imbalanceThreshold = 0.4;
    const imbalanced = activeWorkloads.filter(
      (w) => Math.abs(w.utilizationRate - avgUtilization) > imbalanceThreshold
    );

    // Generate recommendations
    const recommendations: string[] = [];

    const overloaded = workloads.filter((w) => w.capacityStatus === 'overloaded');
    const underutilized = workloads.filter((w) => w.capacityStatus === 'underutilized');

    if (overloaded.length > 0) {
      recommendations.push(
        `Consider redistributing work from ${overloaded.map((w) => w.name).join(', ')} to balance workload.`
      );
    }

    if (underutilized.length > 0 && overloaded.length > 0) {
      recommendations.push(
        `Transfer pending orders from overloaded technicians to ${underutilized.map((w) => w.name).join(', ')}.`
      );
    }

    if (workloads.some((w) => w.pendingOrders > 5)) {
      recommendations.push('Some technicians have high pending order counts. Review and prioritize assignments.');
    }

    // Generate summary
    let summary = '';
    if (imbalanced.length > 0) {
      summary = `Workload imbalance detected. ${overloaded.length} technician(s) overloaded, ${underutilized.length} underutilized.`;
    } else {
      summary = 'Workload is well-distributed across technicians.';
    }

    return {
      technicians: workloads,
      summary,
      recommendations,
      imbalanceDetected: imbalanced.length > 0,
    };
  } catch (error) {
    console.error('Error analyzing workload:', error);
    return {
      technicians: [],
      summary: 'Unable to analyze workload due to an error.',
      recommendations: [],
      imbalanceDetected: false,
    };
  }
}

/**
 * Generate operational insights
 */
export async function generateInsights(
  supabase: SupabaseClient,
  options: { period?: 'day' | 'week' | 'month' } = {}
): Promise<InsightsResult> {
  const { period = 'week' } = options;
  const insights: Insight[] = [];

  try {
    // Calculate date range based on period
    const now = new Date();
    let periodStart: Date;
    let periodLabel: string;

    switch (period) {
      case 'day':
        periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        periodLabel = 'Last 24 hours';
        break;
      case 'month':
        periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        periodLabel = 'Last 30 days';
        break;
      default:
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        periodLabel = 'Last 7 days';
    }

    // Fetch orders for the period
    const { data: orders } = await supabase
      .from('orders')
      .select('id, status, quoted_price, created_at, service_type, assigned_technician_id')
      .gte('created_at', periodStart.toISOString());

    // Fetch technicians
    const { data: technicians } = await supabase
      .from('users')
      .select('id, name')
      .eq('role', 'technician')
      .eq('is_active', true);

    const orderList = orders || [];
    const technicianList = technicians || [];

    // Calculate basic metrics
    const totalOrders = orderList.length;
    const completedOrders = orderList.filter((o) =>
      ['job_done', 'reviewed', 'closed'].includes(o.status)
    ).length;
    const totalRevenue = orderList
      .filter((o) => ['job_done', 'reviewed', 'closed'].includes(o.status))
      .reduce((sum, o) => sum + (o.quoted_price || 0), 0);
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    // 1. Performance Insights
    if (completionRate >= 80) {
      insights.push({
        category: 'performance',
        title: 'Excellent Completion Rate',
        description: `${completionRate.toFixed(1)}% of orders completed this period. Team is performing well.`,
        impact: 'high',
        actionable: false,
        metrics: { completionRate },
      });
    } else if (completionRate < 50) {
      insights.push({
        category: 'performance',
        title: 'Low Completion Rate',
        description: `Only ${completionRate.toFixed(1)}% of orders completed. This may indicate bottlenecks.`,
        impact: 'high',
        actionable: true,
        recommendation: 'Review in-progress orders and identify blockers. Consider reassigning resources.',
        metrics: { completionRate },
      });
    }

    // 2. Revenue Insights
    const avgOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;
    if (avgOrderValue > 0) {
      insights.push({
        category: 'revenue',
        title: 'Average Order Value',
        description: `Average completed order value is RM ${avgOrderValue.toFixed(2)}.`,
        impact: 'medium',
        actionable: false,
        metrics: { avgOrderValue, totalRevenue },
      });
    }

    // 3. Service Type Distribution
    const serviceTypeCounts: Record<string, number> = {};
    for (const order of orderList) {
      const type = order.service_type || 'others';
      serviceTypeCounts[type] = (serviceTypeCounts[type] || 0) + 1;
    }

    const topServiceType = Object.entries(serviceTypeCounts).sort((a, b) => b[1] - a[1])[0];
    if (topServiceType) {
      insights.push({
        category: 'efficiency',
        title: 'Top Service Type',
        description: `${topServiceType[0].replace('_', ' ')} is the most common service (${topServiceType[1]} orders, ${((topServiceType[1] / totalOrders) * 100).toFixed(1)}%).`,
        impact: 'low',
        actionable: true,
        recommendation: 'Consider specializing technicians for this service type to improve efficiency.',
        metrics: { [topServiceType[0]]: topServiceType[1] },
      });
    }

    // 4. Risk Insights - Stale orders
    const staleThreshold = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const staleOrders = orderList.filter(
      (o) => ['new', 'assigned'].includes(o.status) && new Date(o.created_at) < staleThreshold
    );

    if (staleOrders.length > 0) {
      insights.push({
        category: 'risk',
        title: 'Stale Orders Detected',
        description: `${staleOrders.length} order(s) pending for more than 3 days. Risk of customer dissatisfaction.`,
        impact: staleOrders.length > 3 ? 'high' : 'medium',
        actionable: true,
        recommendation: 'Prioritize these orders and contact customers to provide updates.',
        metrics: { staleOrders: staleOrders.length },
      });
    }

    // 5. Opportunity Insights - Unassigned orders
    const unassignedOrders = orderList.filter((o) => o.status === 'new');
    if (unassignedOrders.length > 0) {
      insights.push({
        category: 'opportunity',
        title: 'Unassigned Orders',
        description: `${unassignedOrders.length} new order(s) waiting for technician assignment.`,
        impact: 'medium',
        actionable: true,
        recommendation: 'Assign technicians promptly to improve response time.',
        metrics: { unassignedOrders: unassignedOrders.length },
      });
    }

    // 6. Technician Performance Opportunity
    if (technicianList.length > 0) {
      const techPerformance: Record<string, number> = {};
      for (const order of orderList.filter((o) => o.assigned_technician_id)) {
        techPerformance[order.assigned_technician_id as string] =
          (techPerformance[order.assigned_technician_id as string] || 0) + 1;
      }

      const topTechId = Object.entries(techPerformance).sort((a, b) => b[1] - a[1])[0];
      if (topTechId) {
        const topTech = technicianList.find((t) => t.id === topTechId[0]);
        if (topTech) {
          insights.push({
            category: 'performance',
            title: 'Top Performer',
            description: `${topTech.name} has the most orders this period (${topTechId[1]} orders).`,
            impact: 'low',
            actionable: true,
            recommendation: 'Recognize this achievement and consider using this technician for mentoring.',
            metrics: { orders: topTechId[1] },
          });
        }
      }
    }

    return {
      insights,
      generatedAt: now.toISOString(),
      period: periodLabel,
    };
  } catch (error) {
    console.error('Error generating insights:', error);
    return {
      insights: [],
      generatedAt: new Date().toISOString(),
      period: 'Unknown',
    };
  }
}

/**
 * Format anomaly detection result for AI context
 */
export function formatAnomaliesForContext(result: AnomalyDetectionResult): string {
  if (!result.hasAnomalies) {
    return `## Anomaly Detection\n${result.summary}`;
  }

  const anomalyList = result.anomalies
    .map((a) => {
      const severity = a.severity.toUpperCase();
      return `- [${severity}] **${a.type.replace(/_/g, ' ')}**: ${a.description}\n  Recommendation: ${a.recommendation}`;
    })
    .join('\n');

  return `## Anomaly Detection\n${result.summary}\n\n### Detected Anomalies\n${anomalyList}`;
}

/**
 * Format workload analysis for AI context
 */
export function formatWorkloadForContext(result: WorkloadAnalysisResult): string {
  const techList = result.technicians
    .map((t) => {
      const status = t.capacityStatus === 'overloaded' ? '⚠️' : t.capacityStatus === 'underutilized' ? '💤' : '✅';
      return `- ${status} **${t.name}**: ${t.totalOrders} orders (${t.pendingOrders} pending, ${t.inProgressOrders} in progress, ${t.completedOrders} completed)`;
    })
    .join('\n');

  const recommendations = result.recommendations.length > 0
    ? `\n\n### Recommendations\n${result.recommendations.map((r) => `- ${r}`).join('\n')}`
    : '';

  return `## Workload Analysis\n${result.summary}\n\n### Technician Workloads\n${techList}${recommendations}`;
}

/**
 * Format insights for AI context
 */
export function formatInsightsForContext(result: InsightsResult): string {
  if (result.insights.length === 0) {
    return `## Operational Insights\nNo significant insights for ${result.period}.`;
  }

  const groupedInsights: Record<string, typeof result.insights> = {
    performance: [],
    revenue: [],
    efficiency: [],
    risk: [],
    opportunity: [],
  };

  for (const insight of result.insights) {
    groupedInsights[insight.category].push(insight);
  }

  const sections = Object.entries(groupedInsights)
    .filter(([, items]) => items.length > 0)
    .map(([category, items]) => {
      const title = category.charAt(0).toUpperCase() + category.slice(1);
      const itemsList = items
        .map((i) => {
          const impact = i.impact === 'high' ? '🔴' : i.impact === 'medium' ? '🟡' : '🟢';
          const action = i.actionable ? ' (Actionable)' : '';
          return `- ${impact} **${i.title}**${action}: ${i.description}${i.recommendation ? `\n  Recommendation: ${i.recommendation}` : ''}`;
        })
        .join('\n');
      return `### ${title}\n${itemsList}`;
    })
    .join('\n\n');

  return `## Operational Insights (${result.period})\n\n${sections}`;
}
