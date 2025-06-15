"use strict";
/**
 * MCP Email Tools for GoHighLevel Integration
 * Exposes email campaign and template management capabilities to the MCP server
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailTools = void 0;
/**
 * Email Tools Class
 * Implements MCP tools for email campaigns and templates
 */
class EmailTools {
    ghlClient;
    constructor(ghlClient) {
        this.ghlClient = ghlClient;
    }
    /**
     * Get all email tool definitions for MCP server
     */
    getToolDefinitions() {
        return [
            {
                name: 'get_email_campaigns',
                description: 'Get a list of email campaigns from GoHighLevel.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            description: 'Filter campaigns by status.',
                            enum: ['active', 'pause', 'complete', 'cancelled', 'retry', 'draft', 'resend-scheduled'],
                            default: 'active'
                        },
                        limit: {
                            type: 'number',
                            description: 'Maximum number of campaigns to return.',
                            default: 10
                        },
                        offset: {
                            type: 'number',
                            description: 'Number of campaigns to skip for pagination.',
                            default: 0
                        }
                    }
                }
            },
            {
                name: 'create_email_template',
                description: 'Create a new email template in GoHighLevel.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            description: 'Title of the new template.'
                        },
                        html: {
                            type: 'string',
                            description: 'HTML content of the template.'
                        },
                        isPlainText: {
                            type: 'boolean',
                            description: 'Whether the template is plain text.',
                            default: false
                        }
                    },
                    required: ['title', 'html']
                }
            },
            {
                name: 'get_email_templates',
                description: 'Get a list of email templates from GoHighLevel.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        limit: {
                            type: 'number',
                            description: 'Maximum number of templates to return.',
                            default: 10
                        },
                        offset: {
                            type: 'number',
                            description: 'Number of templates to skip for pagination.',
                            default: 0
                        }
                    }
                }
            },
            {
                name: 'update_email_template',
                description: 'Update an existing email template in GoHighLevel.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        templateId: {
                            type: 'string',
                            description: 'The ID of the template to update.'
                        },
                        html: {
                            type: 'string',
                            description: 'The updated HTML content of the template.'
                        },
                        previewText: {
                            type: 'string',
                            description: 'The updated preview text for the template.'
                        }
                    },
                    required: ['templateId', 'html']
                }
            },
            {
                name: 'delete_email_template',
                description: 'Delete an email template from GoHighLevel.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        templateId: {
                            type: 'string',
                            description: 'The ID of the template to delete.'
                        }
                    },
                    required: ['templateId']
                }
            }
        ];
    }
    /**
     * Execute email tool based on tool name and arguments
     */
    async executeTool(name, args) {
        switch (name) {
            case 'get_email_campaigns':
                return this.getEmailCampaigns(args);
            case 'create_email_template':
                return this.createEmailTemplate(args);
            case 'get_email_templates':
                return this.getEmailTemplates(args);
            case 'update_email_template':
                return this.updateEmailTemplate(args);
            case 'delete_email_template':
                return this.deleteEmailTemplate(args);
            default:
                throw new Error(`Unknown email tool: ${name}`);
        }
    }
    async getEmailCampaigns(params) {
        try {
            const response = await this.ghlClient.getEmailCampaigns(params);
            if (!response.success || !response.data) {
                throw new Error(response.error?.message || 'Failed to get email campaigns.');
            }
            return {
                success: true,
                campaigns: response.data.schedules,
                total: response.data.total,
                message: `Successfully retrieved ${response.data.schedules.length} email campaigns.`
            };
        }
        catch (error) {
            throw new Error(`Failed to get email campaigns: ${error}`);
        }
    }
    async createEmailTemplate(params) {
        try {
            const response = await this.ghlClient.createEmailTemplate(params);
            if (!response.success || !response.data) {
                throw new Error(response.error?.message || 'Failed to create email template.');
            }
            return {
                success: true,
                template: response.data,
                message: `Successfully created email template.`
            };
        }
        catch (error) {
            throw new Error(`Failed to create email template: ${error}`);
        }
    }
    async getEmailTemplates(params) {
        try {
            const response = await this.ghlClient.getEmailTemplates(params);
            if (!response.success || !response.data) {
                throw new Error(response.error?.message || 'Failed to get email templates.');
            }
            return {
                success: true,
                templates: response.data,
                message: `Successfully retrieved ${response.data.length} email templates.`
            };
        }
        catch (error) {
            throw new Error(`Failed to get email templates: ${error}`);
        }
    }
    async updateEmailTemplate(params) {
        try {
            const response = await this.ghlClient.updateEmailTemplate(params);
            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to update email template.');
            }
            return {
                success: true,
                message: 'Successfully updated email template.'
            };
        }
        catch (error) {
            throw new Error(`Failed to update email template: ${error}`);
        }
    }
    async deleteEmailTemplate(params) {
        try {
            const response = await this.ghlClient.deleteEmailTemplate(params);
            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to delete email template.');
            }
            return {
                success: true,
                message: 'Successfully deleted email template.'
            };
        }
        catch (error) {
            throw new Error(`Failed to delete email template: ${error}`);
        }
    }
}
exports.EmailTools = EmailTools;
