"use strict";
/**
 * MCP Opportunity Tools for GoHighLevel Integration
 * Exposes opportunity management capabilities to Claude Desktop
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpportunityTools = void 0;
/**
 * Opportunity Tools Class
 * Implements MCP tools for opportunity management
 */
class OpportunityTools {
    ghlClient;
    constructor(ghlClient) {
        this.ghlClient = ghlClient;
    }
    /**
     * Get all opportunity tool definitions for MCP server
     */
    getToolDefinitions() {
        return [
            {
                name: 'search_opportunities',
                description: 'Search for opportunities in GoHighLevel CRM using various filters like pipeline, stage, contact, status, etc.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'General search query (searches name, contact info)'
                        },
                        pipelineId: {
                            type: 'string',
                            description: 'Filter by specific pipeline ID'
                        },
                        pipelineStageId: {
                            type: 'string',
                            description: 'Filter by specific pipeline stage ID'
                        },
                        contactId: {
                            type: 'string',
                            description: 'Filter by specific contact ID'
                        },
                        status: {
                            type: 'string',
                            description: 'Filter by opportunity status',
                            enum: ['open', 'won', 'lost', 'abandoned', 'all']
                        },
                        assignedTo: {
                            type: 'string',
                            description: 'Filter by assigned user ID'
                        },
                        limit: {
                            type: 'number',
                            description: 'Maximum number of opportunities to return (default: 20, max: 100)',
                            minimum: 1,
                            maximum: 100,
                            default: 20
                        }
                    }
                }
            },
            {
                name: 'get_pipelines',
                description: 'Get all sales pipelines configured in GoHighLevel',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'get_opportunity',
                description: 'Get detailed information about a specific opportunity by ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        opportunityId: {
                            type: 'string',
                            description: 'The unique ID of the opportunity to retrieve'
                        }
                    },
                    required: ['opportunityId']
                }
            },
            {
                name: 'create_opportunity',
                description: 'Create a new opportunity in GoHighLevel CRM',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Name/title of the opportunity'
                        },
                        pipelineId: {
                            type: 'string',
                            description: 'ID of the pipeline this opportunity belongs to'
                        },
                        contactId: {
                            type: 'string',
                            description: 'ID of the contact associated with this opportunity'
                        },
                        status: {
                            type: 'string',
                            description: 'Initial status of the opportunity (default: open)',
                            enum: ['open', 'won', 'lost', 'abandoned'],
                            default: 'open'
                        },
                        monetaryValue: {
                            type: 'number',
                            description: 'Monetary value of the opportunity in dollars'
                        },
                        assignedTo: {
                            type: 'string',
                            description: 'User ID to assign this opportunity to'
                        }
                    },
                    required: ['name', 'pipelineId', 'contactId']
                }
            },
            {
                name: 'update_opportunity_status',
                description: 'Update the status of an opportunity (won, lost, etc.)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        opportunityId: {
                            type: 'string',
                            description: 'The unique ID of the opportunity'
                        },
                        status: {
                            type: 'string',
                            description: 'New status for the opportunity',
                            enum: ['open', 'won', 'lost', 'abandoned']
                        }
                    },
                    required: ['opportunityId', 'status']
                }
            },
            {
                name: 'delete_opportunity',
                description: 'Delete an opportunity from GoHighLevel CRM',
                inputSchema: {
                    type: 'object',
                    properties: {
                        opportunityId: {
                            type: 'string',
                            description: 'The unique ID of the opportunity to delete'
                        }
                    },
                    required: ['opportunityId']
                }
            },
            {
                name: 'update_opportunity',
                description: 'Update an existing opportunity with new details (full update)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        opportunityId: {
                            type: 'string',
                            description: 'The unique ID of the opportunity to update'
                        },
                        name: {
                            type: 'string',
                            description: 'Updated name/title of the opportunity'
                        },
                        pipelineId: {
                            type: 'string',
                            description: 'Updated pipeline ID'
                        },
                        pipelineStageId: {
                            type: 'string',
                            description: 'Updated pipeline stage ID'
                        },
                        status: {
                            type: 'string',
                            description: 'Updated status of the opportunity',
                            enum: ['open', 'won', 'lost', 'abandoned']
                        },
                        monetaryValue: {
                            type: 'number',
                            description: 'Updated monetary value in dollars'
                        },
                        assignedTo: {
                            type: 'string',
                            description: 'Updated assigned user ID'
                        }
                    },
                    required: ['opportunityId']
                }
            },
            {
                name: 'upsert_opportunity',
                description: 'Create or update an opportunity based on contact and pipeline (smart merge)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Name/title of the opportunity'
                        },
                        pipelineId: {
                            type: 'string',
                            description: 'ID of the pipeline this opportunity belongs to'
                        },
                        contactId: {
                            type: 'string',
                            description: 'ID of the contact associated with this opportunity'
                        },
                        status: {
                            type: 'string',
                            description: 'Status of the opportunity',
                            enum: ['open', 'won', 'lost', 'abandoned'],
                            default: 'open'
                        },
                        pipelineStageId: {
                            type: 'string',
                            description: 'Pipeline stage ID'
                        },
                        monetaryValue: {
                            type: 'number',
                            description: 'Monetary value of the opportunity in dollars'
                        },
                        assignedTo: {
                            type: 'string',
                            description: 'User ID to assign this opportunity to'
                        }
                    },
                    required: ['pipelineId', 'contactId']
                }
            },
            {
                name: 'add_opportunity_followers',
                description: 'Add followers to an opportunity for notifications and tracking',
                inputSchema: {
                    type: 'object',
                    properties: {
                        opportunityId: {
                            type: 'string',
                            description: 'The unique ID of the opportunity'
                        },
                        followers: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Array of user IDs to add as followers'
                        }
                    },
                    required: ['opportunityId', 'followers']
                }
            },
            {
                name: 'remove_opportunity_followers',
                description: 'Remove followers from an opportunity',
                inputSchema: {
                    type: 'object',
                    properties: {
                        opportunityId: {
                            type: 'string',
                            description: 'The unique ID of the opportunity'
                        },
                        followers: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Array of user IDs to remove as followers'
                        }
                    },
                    required: ['opportunityId', 'followers']
                }
            }
        ];
    }
    /**
     * Execute opportunity tool based on tool name and arguments
     */
    async executeTool(name, args) {
        switch (name) {
            case 'search_opportunities':
                return this.searchOpportunities(args);
            case 'get_pipelines':
                return this.getPipelines();
            case 'get_opportunity':
                return this.getOpportunity(args.opportunityId);
            case 'create_opportunity':
                return this.createOpportunity(args);
            case 'update_opportunity_status':
                return this.updateOpportunityStatus(args.opportunityId, args.status);
            case 'delete_opportunity':
                return this.deleteOpportunity(args.opportunityId);
            case 'update_opportunity':
                return this.updateOpportunity(args);
            case 'upsert_opportunity':
                return this.upsertOpportunity(args);
            case 'add_opportunity_followers':
                return this.addOpportunityFollowers(args);
            case 'remove_opportunity_followers':
                return this.removeOpportunityFollowers(args);
            default:
                throw new Error(`Unknown opportunity tool: ${name}`);
        }
    }
    /**
     * SEARCH OPPORTUNITIES
     */
    async searchOpportunities(params) {
        try {
            // Build search parameters with correct API naming (underscores)
            const searchParams = {
                location_id: this.ghlClient.getConfig().locationId,
                limit: params.limit || 20
            };
            // Only add parameters if they have values
            if (params.query && params.query.trim()) {
                searchParams.q = params.query.trim();
            }
            if (params.pipelineId) {
                searchParams.pipeline_id = params.pipelineId;
            }
            if (params.pipelineStageId) {
                searchParams.pipeline_stage_id = params.pipelineStageId;
            }
            if (params.contactId) {
                searchParams.contact_id = params.contactId;
            }
            if (params.status) {
                searchParams.status = params.status;
            }
            if (params.assignedTo) {
                searchParams.assigned_to = params.assignedTo;
            }
            process.stderr.write(`[GHL MCP] Calling searchOpportunities with params: ${JSON.stringify(searchParams, null, 2)}\n`);
            const response = await this.ghlClient.searchOpportunities(searchParams);
            if (!response.success || !response.data) {
                const errorMsg = response.error?.message || 'Unknown API error';
                throw new Error(`API request failed: ${errorMsg}`);
            }
            const data = response.data;
            const opportunities = Array.isArray(data.opportunities) ? data.opportunities : [];
            return {
                success: true,
                opportunities,
                meta: data.meta,
                message: `Found ${opportunities.length} opportunities (${data.meta?.total || opportunities.length} total)`
            };
        }
        catch (error) {
            process.stderr.write(`[GHL MCP] Search opportunities error: ${JSON.stringify(error, null, 2)}\n`);
            throw new Error(`Failed to search opportunities: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * GET PIPELINES
     */
    async getPipelines() {
        try {
            const response = await this.ghlClient.getPipelines();
            if (!response.success || !response.data) {
                const errorMsg = response.error?.message || 'Unknown API error';
                throw new Error(`API request failed: ${errorMsg}`);
            }
            const data = response.data;
            const pipelines = Array.isArray(data.pipelines) ? data.pipelines : [];
            return {
                success: true,
                pipelines,
                message: `Retrieved ${pipelines.length} pipelines`
            };
        }
        catch (error) {
            throw new Error(`Failed to get pipelines: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * GET OPPORTUNITY BY ID
     */
    async getOpportunity(opportunityId) {
        try {
            const response = await this.ghlClient.getOpportunity(opportunityId);
            if (!response.success || !response.data) {
                const errorMsg = response.error?.message || 'Unknown API error';
                throw new Error(`API request failed: ${errorMsg}`);
            }
            return {
                success: true,
                opportunity: response.data,
                message: 'Opportunity retrieved successfully'
            };
        }
        catch (error) {
            throw new Error(`Failed to get opportunity: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * CREATE OPPORTUNITY
     */
    async createOpportunity(params) {
        try {
            const opportunityData = {
                locationId: this.ghlClient.getConfig().locationId,
                name: params.name,
                pipelineId: params.pipelineId,
                contactId: params.contactId,
                status: params.status || 'open',
                pipelineStageId: params.pipelineStageId,
                monetaryValue: params.monetaryValue,
                assignedTo: params.assignedTo,
                customFields: params.customFields
            };
            const response = await this.ghlClient.createOpportunity(opportunityData);
            if (!response.success || !response.data) {
                const errorMsg = response.error?.message || 'Unknown API error';
                throw new Error(`API request failed: ${errorMsg}`);
            }
            return {
                success: true,
                opportunity: response.data,
                message: `Opportunity created successfully with ID: ${response.data.id}`
            };
        }
        catch (error) {
            throw new Error(`Failed to create opportunity: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * UPDATE OPPORTUNITY STATUS
     */
    async updateOpportunityStatus(opportunityId, status) {
        try {
            const response = await this.ghlClient.updateOpportunityStatus(opportunityId, status);
            if (!response.success || !response.data) {
                const errorMsg = response.error?.message || 'Unknown API error';
                throw new Error(`API request failed: ${errorMsg}`);
            }
            return {
                success: true,
                message: `Opportunity status updated to ${status}`
            };
        }
        catch (error) {
            throw new Error(`Failed to update opportunity status: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * DELETE OPPORTUNITY
     */
    async deleteOpportunity(opportunityId) {
        try {
            const response = await this.ghlClient.deleteOpportunity(opportunityId);
            if (!response.success || !response.data) {
                const errorMsg = response.error?.message || 'Unknown API error';
                throw new Error(`API request failed: ${errorMsg}`);
            }
            return {
                success: true,
                message: 'Opportunity deleted successfully'
            };
        }
        catch (error) {
            throw new Error(`Failed to delete opportunity: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * UPDATE OPPORTUNITY (FULL UPDATE)
     */
    async updateOpportunity(params) {
        try {
            const updateData = {};
            // Only include fields that are provided
            if (params.name)
                updateData.name = params.name;
            if (params.pipelineId)
                updateData.pipelineId = params.pipelineId;
            if (params.pipelineStageId)
                updateData.pipelineStageId = params.pipelineStageId;
            if (params.status)
                updateData.status = params.status;
            if (params.monetaryValue !== undefined)
                updateData.monetaryValue = params.monetaryValue;
            if (params.assignedTo)
                updateData.assignedTo = params.assignedTo;
            const response = await this.ghlClient.updateOpportunity(params.opportunityId, updateData);
            if (!response.success || !response.data) {
                const errorMsg = response.error?.message || 'Unknown API error';
                throw new Error(`API request failed: ${errorMsg}`);
            }
            return {
                success: true,
                opportunity: response.data,
                message: `Opportunity updated successfully`
            };
        }
        catch (error) {
            throw new Error(`Failed to update opportunity: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * UPSERT OPPORTUNITY
     */
    async upsertOpportunity(params) {
        try {
            const upsertData = {
                locationId: this.ghlClient.getConfig().locationId,
                pipelineId: params.pipelineId,
                contactId: params.contactId,
                name: params.name,
                status: params.status || 'open',
                pipelineStageId: params.pipelineStageId,
                monetaryValue: params.monetaryValue,
                assignedTo: params.assignedTo
            };
            const response = await this.ghlClient.upsertOpportunity(upsertData);
            if (!response.success || !response.data) {
                const errorMsg = response.error?.message || 'Unknown API error';
                throw new Error(`API request failed: ${errorMsg}`);
            }
            const data = response.data;
            return {
                success: true,
                opportunity: data.opportunity,
                isNew: data.new,
                message: `Opportunity ${data.new ? 'created' : 'updated'} successfully`
            };
        }
        catch (error) {
            throw new Error(`Failed to upsert opportunity: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * ADD OPPORTUNITY FOLLOWERS
     */
    async addOpportunityFollowers(params) {
        try {
            const response = await this.ghlClient.addOpportunityFollowers(params.opportunityId, params.followers);
            if (!response.success || !response.data) {
                const errorMsg = response.error?.message || 'Unknown API error';
                throw new Error(`API request failed: ${errorMsg}`);
            }
            return {
                success: true,
                followers: response.data.followers || [],
                followersAdded: response.data.followersAdded || [],
                message: `Added ${response.data.followersAdded?.length || 0} followers to opportunity`
            };
        }
        catch (error) {
            throw new Error(`Failed to add opportunity followers: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * REMOVE OPPORTUNITY FOLLOWERS
     */
    async removeOpportunityFollowers(params) {
        try {
            const response = await this.ghlClient.removeOpportunityFollowers(params.opportunityId, params.followers);
            if (!response.success || !response.data) {
                const errorMsg = response.error?.message || 'Unknown API error';
                throw new Error(`API request failed: ${errorMsg}`);
            }
            return {
                success: true,
                followers: response.data.followers || [],
                followersRemoved: response.data.followersRemoved || [],
                message: `Removed ${response.data.followersRemoved?.length || 0} followers from opportunity`
            };
        }
        catch (error) {
            throw new Error(`Failed to remove opportunity followers: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.OpportunityTools = OpportunityTools;
