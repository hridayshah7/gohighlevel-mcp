"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowTools = void 0;
exports.isWorkflowTool = isWorkflowTool;
class WorkflowTools {
    apiClient;
    constructor(apiClient) {
        this.apiClient = apiClient;
    }
    getTools() {
        return [
            {
                name: 'ghl_get_workflows',
                description: 'Retrieve all workflows for a location. Workflows represent automation sequences that can be triggered by various events in the system.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        locationId: {
                            type: 'string',
                            description: 'The location ID to get workflows for. If not provided, uses the default location from configuration.'
                        }
                    },
                    additionalProperties: false
                }
            }
        ];
    }
    async executeWorkflowTool(name, params) {
        try {
            switch (name) {
                case 'ghl_get_workflows':
                    return await this.getWorkflows(params);
                default:
                    throw new Error(`Unknown workflow tool: ${name}`);
            }
        }
        catch (error) {
            console.error(`Error executing workflow tool ${name}:`, error);
            throw error;
        }
    }
    // ===== WORKFLOW MANAGEMENT TOOLS =====
    /**
     * Get all workflows for a location
     */
    async getWorkflows(params) {
        try {
            const result = await this.apiClient.getWorkflows({
                locationId: params.locationId || ''
            });
            if (!result.success || !result.data) {
                throw new Error(`Failed to get workflows: ${result.error?.message || 'Unknown error'}`);
            }
            return {
                success: true,
                workflows: result.data.workflows,
                message: `Successfully retrieved ${result.data.workflows.length} workflows`,
                metadata: {
                    totalWorkflows: result.data.workflows.length,
                    workflowStatuses: result.data.workflows.reduce((acc, workflow) => {
                        acc[workflow.status] = (acc[workflow.status] || 0) + 1;
                        return acc;
                    }, {})
                }
            };
        }
        catch (error) {
            console.error('Error getting workflows:', error);
            throw new Error(`Failed to get workflows: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.WorkflowTools = WorkflowTools;
// Helper function to check if a tool name belongs to workflow tools
function isWorkflowTool(toolName) {
    const workflowToolNames = [
        'ghl_get_workflows'
    ];
    return workflowToolNames.includes(toolName);
}
