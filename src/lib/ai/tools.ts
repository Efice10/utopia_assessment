/**
 * AI Tools - Functions the AI can execute
 */

import {
  detectAnomalies,
  analyzeWorkload,
  generateInsights,
  formatAnomaliesForContext,
  formatWorkloadForContext,
  formatInsightsForContext,
} from './analytics';

import type { SupabaseClient } from '@supabase/supabase-js';


// Tool parameter definition
interface ToolParameter {
  type: string;
  description: string;
  required: boolean;
}

// Tool definition
interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, ToolParameter>;
}

// All available tools
export const AI_TOOLS: Record<string, ToolDefinition> = {
  create_order: {
    name: 'create_order',
    description: 'Create a new service order',
    parameters: {
      customer_name: { type: 'string', description: 'Customer name', required: true },
      phone: { type: 'string', description: 'Customer phone number', required: true },
      address: { type: 'string', description: 'Service address', required: true },
      service_type: {
        type: 'string',
        description: 'Type of service: installation, servicing, repair, gas_refill, inspection, others',
        required: true,
      },
      problem_description: { type: 'string', description: 'Description of the problem or request', required: false },
      quoted_price: { type: 'number', description: 'Quoted price in MYR', required: false },
      admin_notes: { type: 'string', description: 'Additional admin notes', required: false },
    },
  },
  update_order: {
    name: 'update_order',
    description: 'Update/edit an existing order. Only provide fields that need to be changed.',
    parameters: {
      order_id: { type: 'string', description: 'Order ID or order number to update', required: true },
      customer_name: { type: 'string', description: 'Customer name', required: false },
      phone: { type: 'string', description: 'Customer phone number', required: false },
      address: { type: 'string', description: 'Service address', required: false },
      service_type: {
        type: 'string',
        description: 'Type of service: installation, servicing, repair, gas_refill, inspection, others',
        required: false,
      },
      problem_description: { type: 'string', description: 'Description of the problem or request', required: false },
      quoted_price: { type: 'number', description: 'Quoted price in MYR', required: false },
      admin_notes: { type: 'string', description: 'Additional admin notes', required: false },
      status: {
        type: 'string',
        description: 'Order status: new, assigned, in_progress, job_done, reviewed, closed',
        required: false,
      },
    },
  },
  delete_order: {
    name: 'delete_order',
    description: 'Delete/cancel an order. Use with caution - this cannot be undone.',
    parameters: {
      order_id: { type: 'string', description: 'Order ID or order number to delete', required: true },
    },
  },
  assign_technician: {
    name: 'assign_technician',
    description: 'Assign a technician to an order',
    parameters: {
      order_id: { type: 'string', description: 'Order ID or order number', required: true },
      technician_id: { type: 'string', description: 'Technician ID or name', required: true },
    },
  },
  update_order_status: {
    name: 'update_order_status',
    description: 'Update the status of an order',
    parameters: {
      order_id: { type: 'string', description: 'Order ID or order number', required: true },
      status: {
        type: 'string',
        description: 'New status: new, assigned, in_progress, job_done, reviewed, closed',
        required: true,
      },
    },
  },
  detect_anomalies: {
    name: 'detect_anomalies',
    description: 'Analyze operational data to detect unusual patterns like revenue drops, order volume changes, technician overload, etc.',
    parameters: {
      days_to_analyze: { type: 'number', description: 'Number of days to analyze (default: 30)', required: false },
      sensitivity: { type: 'string', description: 'Detection sensitivity: low, medium, high (default: medium)', required: false },
    },
  },
  analyze_workload: {
    name: 'analyze_workload',
    description: 'Analyze technician workload distribution and identify imbalances',
    parameters: {
      include_inactive: { type: 'boolean', description: 'Include inactive technicians in analysis (default: false)', required: false },
    },
  },
  generate_insights: {
    name: 'generate_insights',
    description: 'Generate operational insights including performance, revenue, efficiency, risk, and opportunities',
    parameters: {
      period: { type: 'string', description: 'Time period for insights: day, week, month (default: week)', required: false },
    },
  },
};

// Service type mapping
const SERVICE_TYPES = ['installation', 'servicing', 'repair', 'gas_refill', 'inspection', 'others'];

// Order status mapping
const ORDER_STATUSES = ['new', 'assigned', 'in_progress', 'job_done', 'reviewed', 'closed'];

// Tool execution result
export interface ToolResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

// Execute a tool call
export async function executeTool(
  toolName: string,
  parameters: Record<string, unknown>,
  supabase: SupabaseClient
): Promise<ToolResult> {
  switch (toolName) {
    case 'create_order':
      return executeCreateOrder(parameters, supabase);
    case 'update_order':
      return executeUpdateOrder(parameters, supabase);
    case 'delete_order':
      return executeDeleteOrder(parameters, supabase);
    case 'assign_technician':
      return executeAssignTechnician(parameters, supabase);
    case 'update_order_status':
      return executeUpdateOrderStatus(parameters, supabase);
    case 'detect_anomalies':
      return executeDetectAnomalies(parameters, supabase);
    case 'analyze_workload':
      return executeAnalyzeWorkload(parameters, supabase);
    case 'generate_insights':
      return executeGenerateInsights(parameters, supabase);
    default:
      return { success: false, message: `Unknown tool: ${toolName}` };
  }
}

// Create a new order
async function executeCreateOrder(
  params: Record<string, unknown>,
  supabase: SupabaseClient
): Promise<ToolResult> {
  try {
    // Validate required fields
    if (!params.customer_name || !params.phone || !params.address || !params.service_type) {
      return {
        success: false,
        message: 'Missing required fields: customer_name, phone, address, and service_type are required.',
      };
    }

    // Validate service type
    const serviceType = String(params.service_type).toLowerCase().replace(' ', '_');
    if (!SERVICE_TYPES.includes(serviceType)) {
      return {
        success: false,
        message: `Invalid service type. Must be one of: ${SERVICE_TYPES.join(', ')}`,
      };
    }

    // Generate order number
    const orderNo = `ORD-${Date.now().toString(36).toUpperCase()}`;

    // Create the order
    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_no: orderNo,
        customer_name: String(params.customer_name),
        phone: String(params.phone),
        address: String(params.address),
        service_type: serviceType,
        problem_description: params.problem_description ? String(params.problem_description) : '',
        quoted_price: params.quoted_price ? Number(params.quoted_price) : 0,
        admin_notes: params.admin_notes ? String(params.admin_notes) : null,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        message: `Failed to create order: ${error.message}`,
      };
    }

    return {
      success: true,
      message: `Successfully created order ${orderNo} for ${params.customer_name}.`,
      data: { order: data },
    };
  } catch (error) {
    console.error('Error in create_order:', error);
    return {
      success: false,
      message: `Error creating order: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Update an existing order
async function executeUpdateOrder(
  params: Record<string, unknown>,
  supabase: SupabaseClient
): Promise<ToolResult> {
  try {
    // Validate order_id
    if (!params.order_id) {
      return {
        success: false,
        message: 'Missing required field: order_id is required.',
      };
    }

    // Find the order
    const { data: existingOrder, error: findError } = await supabase
      .from('orders')
      .select('*')
      .or(`id.eq.${params.order_id},order_no.ilike.%${params.order_id}%`)
      .single();

    if (findError ?? !existingOrder) {
      return {
        success: false,
        message: `Order not found: ${params.order_id}`,
      };
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};

    if (params.customer_name !== undefined) {
      updateData.customer_name = String(params.customer_name);
    }
    if (params.phone !== undefined) {
      updateData.phone = String(params.phone);
    }
    if (params.address !== undefined) {
      updateData.address = String(params.address);
    }
    if (params.service_type !== undefined) {
      const serviceType = String(params.service_type).toLowerCase().replace(' ', '_');
      if (!SERVICE_TYPES.includes(serviceType)) {
        return {
          success: false,
          message: `Invalid service type. Must be one of: ${SERVICE_TYPES.join(', ')}`,
        };
      }
      updateData.service_type = serviceType;
    }
    if (params.problem_description !== undefined) {
      updateData.problem_description = params.problem_description ? String(params.problem_description) : '';
    }
    if (params.quoted_price !== undefined) {
      updateData.quoted_price = params.quoted_price ? Number(params.quoted_price) : 0;
    }
    if (params.admin_notes !== undefined) {
      updateData.admin_notes = params.admin_notes ? String(params.admin_notes) : null;
    }
    if (params.status !== undefined) {
      const status = String(params.status).toLowerCase();
      if (!ORDER_STATUSES.includes(status)) {
        return {
          success: false,
          message: `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}`,
        };
      }
      updateData.status = status;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        message: 'No fields provided to update.',
      };
    }

    // Update the order
    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', existingOrder.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating order:', error);
      return {
        success: false,
        message: `Failed to update order: ${error.message}`,
      };
    }

    return {
      success: true,
      message: `Successfully updated order ${existingOrder.order_no}.`,
      data: { order: data },
    };
  } catch (error) {
    console.error('Error in update_order:', error);
    return {
      success: false,
      message: `Error updating order: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Delete an order
async function executeDeleteOrder(
  params: Record<string, unknown>,
  supabase: SupabaseClient
): Promise<ToolResult> {
  try {
    if (!params.order_id) {
      return {
        success: false,
        message: 'Missing required field: order_id is required.',
      };
    }

    // Find the order
    const { data: existingOrder, error: findError } = await supabase
      .from('orders')
      .select('id, order_no, customer_name')
      .or(`id.eq.${params.order_id},order_no.ilike.%${params.order_id}%`)
      .single();

    if (findError ?? !existingOrder) {
      return {
        success: false,
        message: `Order not found: ${params.order_id}`,
      };
    }

    // Delete the order
    const { error } = await supabase.from('orders').delete().eq('id', existingOrder.id);

    if (error) {
      console.error('Error deleting order:', error);
      return {
        success: false,
        message: `Failed to delete order: ${error.message}`,
      };
    }

    return {
      success: true,
      message: `Successfully deleted order ${existingOrder.order_no} for ${existingOrder.customer_name}.`,
      data: { deleted_order_id: existingOrder.id, order_no: existingOrder.order_no },
    };
  } catch (error) {
    console.error('Error in delete_order:', error);
    return {
      success: false,
      message: `Error deleting order: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Assign technician to order
async function executeAssignTechnician(
  params: Record<string, unknown>,
  supabase: SupabaseClient
): Promise<ToolResult> {
  try {
    if (!params.order_id || !params.technician_id) {
      return {
        success: false,
        message: 'Missing required fields: order_id and technician_id are required.',
      };
    }

    // Find the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id')
      .or(`id.eq.${params.order_id},order_no.ilike.%${params.order_id}%`)
      .single();

    if (orderError ?? !order) {
      return {
        success: false,
        message: `Order not found: ${params.order_id}`,
      };
    }

    // Find the technician
    const { data: technician, error: techError } = await supabase
      .from('users')
      .select('id, name')
      .eq('role', 'technician')
      .or(`id.eq.${params.technician_id},name.ilike.%${params.technician_id}%`)
      .single();

    if (techError ?? !technician) {
      return {
        success: false,
        message: `Technician not found: ${params.technician_id}`,
      };
    }

    // Update the order
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        technician_id: technician.id,
        status: 'assigned',
      })
      .eq('id', order.id);

    if (updateError) {
      return {
        success: false,
        message: `Failed to assign technician: ${updateError.message}`,
      };
    }

    return {
      success: true,
      message: `Successfully assigned ${technician.name} to the order.`,
      data: { order_id: order.id, technician_id: technician.id },
    };
  } catch (error) {
    console.error('Error in assign_technician:', error);
    return {
      success: false,
      message: `Error assigning technician: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Update order status
async function executeUpdateOrderStatus(
  params: Record<string, unknown>,
  supabase: SupabaseClient
): Promise<ToolResult> {
  try {
    if (!params.order_id || !params.status) {
      return {
        success: false,
        message: 'Missing required fields: order_id and status are required.',
      };
    }

    const status = String(params.status).toLowerCase();
    if (!ORDER_STATUSES.includes(status)) {
      return {
        success: false,
        message: `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}`,
      };
    }

    // Find the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id')
      .or(`id.eq.${params.order_id},order_no.ilike.%${params.order_id}%`)
      .single();

    if (orderError ?? !order) {
      return {
        success: false,
        message: `Order not found: ${params.order_id}`,
      };
    }

    // Update the order
    const { error: updateError } = await supabase.from('orders').update({ status }).eq('id', order.id);

    if (updateError) {
      return {
        success: false,
        message: `Failed to update status: ${updateError.message}`,
      };
    }

    return {
      success: true,
      message: `Successfully updated order status to ${status}.`,
      data: { order_id: order.id, status },
    };
  } catch (error) {
    console.error('Error in update_order_status:', error);
    return {
      success: false,
      message: `Error updating status: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Detect anomalies in operational data
async function executeDetectAnomalies(
  params: Record<string, unknown>,
  supabase: SupabaseClient
): Promise<ToolResult> {
  try {
    const daysToAnalyze = typeof params.days_to_analyze === 'number' ? params.days_to_analyze : 30;
    const sensitivity = (params.sensitivity as 'low' | 'medium' | 'high') || 'medium';

    const result = await detectAnomalies(supabase, { daysToAnalyze, sensitivity });
    const formattedResult = formatAnomaliesForContext(result);

    return {
      success: true,
      message: result.summary,
      data: {
        hasAnomalies: result.hasAnomalies,
        anomalyCount: result.anomalies.length,
        anomalies: result.anomalies,
        formatted: formattedResult,
      },
    };
  } catch (error) {
    console.error('Error in detect_anomalies:', error);
    return {
      success: false,
      message: `Error detecting anomalies: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Analyze technician workload
async function executeAnalyzeWorkload(
  params: Record<string, unknown>,
  supabase: SupabaseClient
): Promise<ToolResult> {
  try {
    const includeInactive = params.include_inactive === true;

    const result = await analyzeWorkload(supabase, { includeInactive });
    const formattedResult = formatWorkloadForContext(result);

    return {
      success: true,
      message: result.summary,
      data: {
        technicians: result.technicians,
        recommendations: result.recommendations,
        imbalanceDetected: result.imbalanceDetected,
        formatted: formattedResult,
      },
    };
  } catch (error) {
    console.error('Error in analyze_workload:', error);
    return {
      success: false,
      message: `Error analyzing workload: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Generate operational insights
async function executeGenerateInsights(
  params: Record<string, unknown>,
  supabase: SupabaseClient
): Promise<ToolResult> {
  try {
    const period = (params.period as 'day' | 'week' | 'month') || 'week';

    const result = await generateInsights(supabase, { period });
    const formattedResult = formatInsightsForContext(result);

    return {
      success: true,
      message: `Generated ${result.insights.length} insights for ${result.period}`,
      data: {
        insights: result.insights,
        period: result.period,
        generatedAt: result.generatedAt,
        formatted: formattedResult,
      },
    };
  } catch (error) {
    console.error('Error in generate_insights:', error);
    return {
      success: false,
      message: `Error generating insights: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Parse tool calls from AI response
export function parseToolCalls(response: string): Array<{ tool: string; params: Record<string, unknown> }> | null {
  // Look for JSON tool calls in the response - flexible regex to handle various formats
  // Handles: </tool_call >, </tool_call >, </tool_call, etc.
  const toolCallRegex = /<tool_call\s+name="([^"]+)">([\s\S]*?)(?:<\/tool_call\s*>|<\/tool_call\s*$|<\/tool_call(?![a-zA-Z]))/gi;
  const calls: Array<{ tool: string; params: Record<string, unknown> }> = [];

  let match;
  while ((match = toolCallRegex.exec(response)) !== null) {
    try {
      const [, toolName, paramsJson] = match;
      const params = JSON.parse(paramsJson.trim());
      calls.push({ tool: toolName.toLowerCase(), params });
    } catch {
      console.error('Failed to parse tool call:', match[0]);
    }
  }

  return calls.length > 0 ? calls : null;
}

// Build tools description for the system prompt
export function buildToolsDescription(): string {
  const toolDescriptions = Object.entries(AI_TOOLS)
    .map(([_name, tool]) => {
      const params = Object.entries(tool.parameters)
        .map(([pname, p]) => {
          const required = p.required ? '(required)' : '(optional)';
          return `    - ${pname}: ${p.description} ${required}`;
        })
        .join('\n');

      return `### ${tool.name}\n${tool.description}\nParameters:\n${params}`;
    })
    .join('\n\n');

  return `## Available Tools

You can perform actions by outputting tool calls in this EXACT format:
<tool_call name="tool_name">
{
  "parameter1": "value1",
  "parameter2": "value2"
}
</tool_call>

Only output one tool call at a time. Wait for the result before making another tool call.

${toolDescriptions}

## Important Guidelines
- For delete_order: Always warn the user that deletion cannot be undone and ask for confirmation before proceeding
- For update_order: Only include fields that need to be changed
- Always confirm destructive actions with the user before executing
- NEVER show the tool_call tags in your response - the system will execute them automatically`;
}
