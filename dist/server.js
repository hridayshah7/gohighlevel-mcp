"use strict";
/**
 * GoHighLevel MCP Server
 * Main entry point for the Model Context Protocol server
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const dotenv = __importStar(require("dotenv"));
const ghl_api_client_1 = require("./clients/ghl-api-client");
const contact_tools_js_1 = require("./tools/contact-tools.js");
const conversation_tools_js_1 = require("./tools/conversation-tools.js");
const blog_tools_js_1 = require("./tools/blog-tools.js");
const opportunity_tools_js_1 = require("./tools/opportunity-tools.js");
const calendar_tools_js_1 = require("./tools/calendar-tools.js");
const email_tools_js_1 = require("./tools/email-tools.js");
const location_tools_js_1 = require("./tools/location-tools.js");
const email_isv_tools_js_1 = require("./tools/email-isv-tools.js");
const social_media_tools_js_1 = require("./tools/social-media-tools.js");
const media_tools_js_1 = require("./tools/media-tools.js");
const object_tools_js_1 = require("./tools/object-tools.js");
const association_tools_js_1 = require("./tools/association-tools.js");
const custom_field_v2_tools_js_1 = require("./tools/custom-field-v2-tools.js");
const workflow_tools_js_1 = require("./tools/workflow-tools.js");
const survey_tools_js_1 = require("./tools/survey-tools.js");
const store_tools_js_1 = require("./tools/store-tools.js");
const products_tools_js_1 = require("./tools/products-tools.js");
const payments_tools_js_1 = require("./tools/payments-tools.js");
const invoices_tools_js_1 = require("./tools/invoices-tools.js");
// Load environment variables
dotenv.config();
/**
 * Main MCP Server class
 */
class GHLMCPServer {
    server;
    ghlClient;
    contactTools;
    conversationTools;
    blogTools;
    opportunityTools;
    calendarTools;
    emailTools;
    locationTools;
    emailISVTools;
    socialMediaTools;
    mediaTools;
    objectTools;
    associationTools;
    customFieldV2Tools;
    workflowTools;
    surveyTools;
    storeTools;
    productsTools;
    paymentsTools;
    invoicesTools;
    constructor() {
        // Initialize MCP server with capabilities
        this.server = new index_js_1.Server({
            name: 'ghl-mcp-server',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        // Initialize GHL API client
        this.ghlClient = this.initializeGHLClient();
        // Initialize tools
        this.contactTools = new contact_tools_js_1.ContactTools(this.ghlClient);
        this.conversationTools = new conversation_tools_js_1.ConversationTools(this.ghlClient);
        this.blogTools = new blog_tools_js_1.BlogTools(this.ghlClient);
        this.opportunityTools = new opportunity_tools_js_1.OpportunityTools(this.ghlClient);
        this.calendarTools = new calendar_tools_js_1.CalendarTools(this.ghlClient);
        this.emailTools = new email_tools_js_1.EmailTools(this.ghlClient);
        this.locationTools = new location_tools_js_1.LocationTools(this.ghlClient);
        this.emailISVTools = new email_isv_tools_js_1.EmailISVTools(this.ghlClient);
        this.socialMediaTools = new social_media_tools_js_1.SocialMediaTools(this.ghlClient);
        this.mediaTools = new media_tools_js_1.MediaTools(this.ghlClient);
        this.objectTools = new object_tools_js_1.ObjectTools(this.ghlClient);
        this.associationTools = new association_tools_js_1.AssociationTools(this.ghlClient);
        this.customFieldV2Tools = new custom_field_v2_tools_js_1.CustomFieldV2Tools(this.ghlClient);
        this.workflowTools = new workflow_tools_js_1.WorkflowTools(this.ghlClient);
        this.surveyTools = new survey_tools_js_1.SurveyTools(this.ghlClient);
        this.storeTools = new store_tools_js_1.StoreTools(this.ghlClient);
        this.productsTools = new products_tools_js_1.ProductsTools(this.ghlClient);
        this.paymentsTools = new payments_tools_js_1.PaymentsTools(this.ghlClient);
        this.invoicesTools = new invoices_tools_js_1.InvoicesTools(this.ghlClient);
        // Setup MCP handlers
        this.setupHandlers();
    }
    /**
     * Initialize GoHighLevel API client with configuration
     */
    initializeGHLClient() {
        // Load configuration from environment
        const config = {
            accessToken: process.env.GHL_API_KEY || '',
            baseUrl: process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com',
            version: '2021-07-28',
            locationId: process.env.GHL_LOCATION_ID || ''
        };
        // Validate required configuration
        if (!config.accessToken) {
            throw new Error('GHL_API_KEY environment variable is required');
        }
        if (!config.locationId) {
            throw new Error('GHL_LOCATION_ID environment variable is required');
        }
        process.stderr.write('[GHL MCP] Initializing GHL API client...\n');
        process.stderr.write(`[GHL MCP] Base URL: ${config.baseUrl}\n`);
        process.stderr.write(`[GHL MCP] Version: ${config.version}\n`);
        process.stderr.write(`[GHL MCP] Location ID: ${config.locationId}\n`);
        return new ghl_api_client_1.GHLApiClient(config);
    }
    /**
     * Setup MCP request handlers
     */
    setupHandlers() {
        // Handle list tools requests
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            process.stderr.write('[GHL MCP] Listing available tools...\n');
            try {
                const contactToolDefinitions = this.contactTools.getToolDefinitions();
                const conversationToolDefinitions = this.conversationTools.getToolDefinitions();
                const blogToolDefinitions = this.blogTools.getToolDefinitions();
                const opportunityToolDefinitions = this.opportunityTools.getToolDefinitions();
                const calendarToolDefinitions = this.calendarTools.getToolDefinitions();
                const emailToolDefinitions = this.emailTools.getToolDefinitions();
                const locationToolDefinitions = this.locationTools.getToolDefinitions();
                const emailISVToolDefinitions = this.emailISVTools.getToolDefinitions();
                const socialMediaToolDefinitions = this.socialMediaTools.getTools();
                const mediaToolDefinitions = this.mediaTools.getToolDefinitions();
                const objectToolDefinitions = this.objectTools.getToolDefinitions();
                const associationToolDefinitions = this.associationTools.getTools();
                const customFieldV2ToolDefinitions = this.customFieldV2Tools.getTools();
                const workflowToolDefinitions = this.workflowTools.getTools();
                const surveyToolDefinitions = this.surveyTools.getTools();
                const storeToolDefinitions = this.storeTools.getTools();
                const productsToolDefinitions = this.productsTools.getTools();
                const paymentsToolDefinitions = this.paymentsTools.getTools();
                const invoicesToolDefinitions = this.invoicesTools.getTools();
                const allTools = [
                    ...contactToolDefinitions,
                    ...conversationToolDefinitions,
                    ...blogToolDefinitions,
                    ...opportunityToolDefinitions,
                    ...calendarToolDefinitions,
                    ...emailToolDefinitions,
                    ...locationToolDefinitions,
                    ...emailISVToolDefinitions,
                    ...socialMediaToolDefinitions,
                    ...mediaToolDefinitions,
                    ...objectToolDefinitions,
                    ...associationToolDefinitions,
                    ...customFieldV2ToolDefinitions,
                    ...workflowToolDefinitions,
                    ...surveyToolDefinitions,
                    ...storeToolDefinitions,
                    ...productsToolDefinitions,
                    ...paymentsToolDefinitions,
                    ...invoicesToolDefinitions
                ];
                process.stderr.write(`[GHL MCP] Registered ${allTools.length} tools total:\n`);
                process.stderr.write(`[GHL MCP] - ${contactToolDefinitions.length} contact tools\n`);
                process.stderr.write(`[GHL MCP] - ${conversationToolDefinitions.length} conversation tools\n`);
                process.stderr.write(`[GHL MCP] - ${blogToolDefinitions.length} blog tools\n`);
                process.stderr.write(`[GHL MCP] - ${opportunityToolDefinitions.length} opportunity tools\n`);
                process.stderr.write(`[GHL MCP] - ${calendarToolDefinitions.length} calendar tools\n`);
                process.stderr.write(`[GHL MCP] - ${emailToolDefinitions.length} email tools\n`);
                process.stderr.write(`[GHL MCP] - ${locationToolDefinitions.length} location tools\n`);
                process.stderr.write(`[GHL MCP] - ${emailISVToolDefinitions.length} email ISV tools\n`);
                process.stderr.write(`[GHL MCP] - ${socialMediaToolDefinitions.length} social media tools\n`);
                process.stderr.write(`[GHL MCP] - ${mediaToolDefinitions.length} media tools\n`);
                process.stderr.write(`[GHL MCP] - ${objectToolDefinitions.length} object tools\n`);
                process.stderr.write(`[GHL MCP] - ${associationToolDefinitions.length} association tools\n`);
                process.stderr.write(`[GHL MCP] - ${customFieldV2ToolDefinitions.length} custom field V2 tools\n`);
                process.stderr.write(`[GHL MCP] - ${workflowToolDefinitions.length} workflow tools\n`);
                process.stderr.write(`[GHL MCP] - ${surveyToolDefinitions.length} survey tools\n`);
                process.stderr.write(`[GHL MCP] - ${storeToolDefinitions.length} store tools\n`);
                process.stderr.write(`[GHL MCP] - ${productsToolDefinitions.length} products tools\n`);
                process.stderr.write(`[GHL MCP] - ${paymentsToolDefinitions.length} payments tools\n`);
                process.stderr.write(`[GHL MCP] - ${invoicesToolDefinitions.length} invoices tools\n`);
                return {
                    tools: allTools
                };
            }
            catch (error) {
                console.error('[GHL MCP] Error listing tools:', error);
                throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Failed to list tools: ${error}`);
            }
        });
        // Handle tool execution requests
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            process.stderr.write(`[GHL MCP] Executing tool: ${name}\n`);
            process.stderr.write(`[GHL MCP] Arguments: ${JSON.stringify(args, null, 2)}\n`);
            try {
                let result;
                // Route to appropriate tool handler
                if (this.isContactTool(name)) {
                    result = await this.contactTools.executeTool(name, args || {});
                }
                else if (this.isConversationTool(name)) {
                    result = await this.conversationTools.executeTool(name, args || {});
                }
                else if (this.isBlogTool(name)) {
                    result = await this.blogTools.executeTool(name, args || {});
                }
                else if (this.isOpportunityTool(name)) {
                    result = await this.opportunityTools.executeTool(name, args || {});
                }
                else if (this.isCalendarTool(name)) {
                    result = await this.calendarTools.executeTool(name, args || {});
                }
                else if (this.isEmailTool(name)) {
                    result = await this.emailTools.executeTool(name, args || {});
                }
                else if (this.isLocationTool(name)) {
                    result = await this.locationTools.executeTool(name, args || {});
                }
                else if (this.isEmailISVTool(name)) {
                    result = await this.emailISVTools.executeTool(name, args || {});
                }
                else if (this.isSocialMediaTool(name)) {
                    result = await this.socialMediaTools.executeTool(name, args || {});
                }
                else if (this.isMediaTool(name)) {
                    result = await this.mediaTools.executeTool(name, args || {});
                }
                else if (this.isObjectTool(name)) {
                    result = await this.objectTools.executeTool(name, args || {});
                }
                else if (this.isAssociationTool(name)) {
                    result = await this.associationTools.executeAssociationTool(name, args || {});
                }
                else if (this.isCustomFieldV2Tool(name)) {
                    result = await this.customFieldV2Tools.executeCustomFieldV2Tool(name, args || {});
                }
                else if (this.isWorkflowTool(name)) {
                    result = await this.workflowTools.executeWorkflowTool(name, args || {});
                }
                else if (this.isSurveyTool(name)) {
                    result = await this.surveyTools.executeSurveyTool(name, args || {});
                }
                else if (this.isStoreTool(name)) {
                    result = await this.storeTools.executeStoreTool(name, args || {});
                }
                else if (this.isProductsTool(name)) {
                    result = await this.productsTools.executeProductsTool(name, args || {});
                }
                else if (this.isPaymentsTool(name)) {
                    result = await this.paymentsTools.handleToolCall(name, args || {});
                }
                else if (this.isInvoicesTool(name)) {
                    result = await this.invoicesTools.handleToolCall(name, args || {});
                }
                else {
                    throw new Error(`Unknown tool: ${name}`);
                }
                process.stderr.write(`[GHL MCP] Tool ${name} executed successfully\n`);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            }
            catch (error) {
                console.error(`[GHL MCP] Error executing tool ${name}:`, error);
                // Determine appropriate error code
                const errorCode = error instanceof Error && error.message.includes('404')
                    ? types_js_1.ErrorCode.InvalidRequest
                    : types_js_1.ErrorCode.InternalError;
                throw new types_js_1.McpError(errorCode, `Tool execution failed: ${error}`);
            }
        });
        process.stderr.write('[GHL MCP] Request handlers setup complete\n');
    }
    /**
     * Check if tool name belongs to contact tools
     */
    isContactTool(toolName) {
        const contactToolNames = [
            // Basic Contact Management
            'create_contact', 'search_contacts', 'get_contact', 'update_contact',
            'add_contact_tags', 'remove_contact_tags', 'delete_contact',
            // Task Management
            'get_contact_tasks', 'create_contact_task', 'get_contact_task', 'update_contact_task',
            'delete_contact_task', 'update_task_completion',
            // Note Management
            'get_contact_notes', 'create_contact_note', 'get_contact_note', 'update_contact_note',
            'delete_contact_note',
            // Advanced Operations
            'upsert_contact', 'get_duplicate_contact', 'get_contacts_by_business', 'get_contact_appointments',
            // Bulk Operations
            'bulk_update_contact_tags', 'bulk_update_contact_business',
            // Followers Management
            'add_contact_followers', 'remove_contact_followers',
            // Campaign Management
            'add_contact_to_campaign', 'remove_contact_from_campaign', 'remove_contact_from_all_campaigns',
            // Workflow Management
            'add_contact_to_workflow', 'remove_contact_from_workflow'
        ];
        return contactToolNames.includes(toolName);
    }
    /**
     * Check if tool name belongs to conversation tools
     */
    isConversationTool(toolName) {
        const conversationToolNames = [
            // Basic conversation operations
            'send_sms', 'send_email', 'search_conversations', 'get_conversation',
            'create_conversation', 'update_conversation', 'delete_conversation', 'get_recent_messages',
            // Message management
            'get_email_message', 'get_message', 'upload_message_attachments', 'update_message_status',
            // Manual message creation
            'add_inbound_message', 'add_outbound_call',
            // Call recordings & transcriptions
            'get_message_recording', 'get_message_transcription', 'download_transcription',
            // Scheduling management
            'cancel_scheduled_message', 'cancel_scheduled_email',
            // Live chat features
            'live_chat_typing'
        ];
        return conversationToolNames.includes(toolName);
    }
    /**
     * Check if tool name belongs to blog tools
     */
    isBlogTool(toolName) {
        const blogToolNames = [
            'create_blog_post', 'update_blog_post', 'get_blog_posts', 'get_blog_sites',
            'get_blog_authors', 'get_blog_categories', 'check_url_slug'
        ];
        return blogToolNames.includes(toolName);
    }
    /**
     * Check if tool name belongs to opportunity tools
     */
    isOpportunityTool(toolName) {
        const opportunityToolNames = [
            'search_opportunities', 'get_pipelines', 'get_opportunity', 'create_opportunity',
            'update_opportunity_status', 'delete_opportunity', 'update_opportunity',
            'upsert_opportunity', 'add_opportunity_followers', 'remove_opportunity_followers'
        ];
        return opportunityToolNames.includes(toolName);
    }
    /**
     * Check if tool name belongs to calendar tools
     */
    isCalendarTool(toolName) {
        const calendarToolNames = [
            'get_calendar_groups', 'get_calendars', 'create_calendar', 'get_calendar', 'update_calendar',
            'delete_calendar', 'get_calendar_events', 'get_free_slots', 'create_appointment',
            'get_appointment', 'update_appointment', 'delete_appointment', 'create_block_slot', 'update_block_slot'
        ];
        return calendarToolNames.includes(toolName);
    }
    /**
     * Check if tool name belongs to email tools
     */
    isEmailTool(toolName) {
        const emailToolNames = [
            'get_email_campaigns', 'create_email_template', 'get_email_templates',
            'update_email_template', 'delete_email_template'
        ];
        return emailToolNames.includes(toolName);
    }
    /**
     * Check if tool name belongs to location tools
     */
    isLocationTool(toolName) {
        const locationToolNames = [
            // Location Management
            'search_locations', 'get_location', 'create_location', 'update_location', 'delete_location',
            // Location Tags
            'get_location_tags', 'create_location_tag', 'get_location_tag', 'update_location_tag', 'delete_location_tag',
            // Location Tasks
            'search_location_tasks',
            // Custom Fields
            'get_location_custom_fields', 'create_location_custom_field', 'get_location_custom_field',
            'update_location_custom_field', 'delete_location_custom_field',
            // Custom Values
            'get_location_custom_values', 'create_location_custom_value', 'get_location_custom_value',
            'update_location_custom_value', 'delete_location_custom_value',
            // Templates
            'get_location_templates', 'delete_location_template',
            // Timezones
            'get_timezones'
        ];
        return locationToolNames.includes(toolName);
    }
    /**
     * Check if tool name belongs to email ISV tools
     */
    isEmailISVTool(toolName) {
        const emailISVToolNames = [
            'verify_email'
        ];
        return emailISVToolNames.includes(toolName);
    }
    /**
     * Check if tool name belongs to social media tools
     */
    isSocialMediaTool(toolName) {
        const socialMediaToolNames = [
            // Post Management
            'search_social_posts', 'create_social_post', 'get_social_post', 'update_social_post',
            'delete_social_post', 'bulk_delete_social_posts',
            // Account Management
            'get_social_accounts', 'delete_social_account',
            // CSV Operations
            'upload_social_csv', 'get_csv_upload_status', 'set_csv_accounts',
            // Categories & Tags
            'get_social_categories', 'get_social_category', 'get_social_tags', 'get_social_tags_by_ids',
            // OAuth Integration
            'start_social_oauth', 'get_platform_accounts'
        ];
        return socialMediaToolNames.includes(toolName);
    }
    /**
     * Check if tool name belongs to media tools
     */
    isMediaTool(toolName) {
        const mediaToolNames = [
            'get_media_files', 'upload_media_file', 'delete_media_file'
        ];
        return mediaToolNames.includes(toolName);
    }
    /**
     * Check if tool name belongs to object tools
     */
    isObjectTool(toolName) {
        const objectToolNames = [
            'get_all_objects', 'create_object_schema', 'get_object_schema', 'update_object_schema',
            'create_object_record', 'get_object_record', 'update_object_record', 'delete_object_record',
            'search_object_records'
        ];
        return objectToolNames.includes(toolName);
    }
    /**
     * Check if tool name belongs to association tools
     */
    isAssociationTool(toolName) {
        const associationToolNames = [
            'ghl_get_all_associations', 'ghl_create_association', 'ghl_get_association_by_id',
            'ghl_update_association', 'ghl_delete_association', 'ghl_get_association_by_key',
            'ghl_get_association_by_object_key', 'ghl_create_relation', 'ghl_get_relations_by_record',
            'ghl_delete_relation'
        ];
        return associationToolNames.includes(toolName);
    }
    /**
     * Check if tool name belongs to custom field V2 tools
     */
    isCustomFieldV2Tool(toolName) {
        const customFieldV2ToolNames = [
            'ghl_get_custom_field_by_id', 'ghl_create_custom_field', 'ghl_update_custom_field',
            'ghl_delete_custom_field', 'ghl_get_custom_fields_by_object_key', 'ghl_create_custom_field_folder',
            'ghl_update_custom_field_folder', 'ghl_delete_custom_field_folder'
        ];
        return customFieldV2ToolNames.includes(toolName);
    }
    /**
     * Check if tool name belongs to workflow tools
     */
    isWorkflowTool(toolName) {
        const workflowToolNames = [
            'ghl_get_workflows'
        ];
        return workflowToolNames.includes(toolName);
    }
    /**
     * Check if tool name belongs to survey tools
     */
    isSurveyTool(toolName) {
        const surveyToolNames = [
            'ghl_get_surveys',
            'ghl_get_survey_submissions'
        ];
        return surveyToolNames.includes(toolName);
    }
    /**
     * Check if tool name belongs to store tools
     */
    isStoreTool(toolName) {
        const storeToolNames = [
            // Shipping Zones
            'ghl_create_shipping_zone', 'ghl_list_shipping_zones', 'ghl_get_shipping_zone',
            'ghl_update_shipping_zone', 'ghl_delete_shipping_zone',
            // Shipping Rates
            'ghl_get_available_shipping_rates', 'ghl_create_shipping_rate', 'ghl_list_shipping_rates',
            'ghl_get_shipping_rate', 'ghl_update_shipping_rate', 'ghl_delete_shipping_rate',
            // Shipping Carriers
            'ghl_create_shipping_carrier', 'ghl_list_shipping_carriers', 'ghl_get_shipping_carrier',
            'ghl_update_shipping_carrier', 'ghl_delete_shipping_carrier',
            // Store Settings
            'ghl_create_store_setting', 'ghl_get_store_setting'
        ];
        return storeToolNames.includes(toolName);
    }
    /**
     * Check if tool name belongs to products tools
     */
    isProductsTool(toolName) {
        const productsToolNames = [
            'ghl_create_product', 'ghl_list_products', 'ghl_get_product', 'ghl_update_product',
            'ghl_delete_product', 'ghl_create_price', 'ghl_list_prices', 'ghl_list_inventory',
            'ghl_create_product_collection', 'ghl_list_product_collections'
        ];
        return productsToolNames.includes(toolName);
    }
    /**
     * Check if tool name belongs to payments tools
     */
    isPaymentsTool(toolName) {
        const paymentsToolNames = [
            // Integration Provider tools
            'create_whitelabel_integration_provider', 'list_whitelabel_integration_providers',
            // Order tools
            'list_orders', 'get_order_by_id',
            // Order Fulfillment tools
            'create_order_fulfillment', 'list_order_fulfillments',
            // Transaction tools
            'list_transactions', 'get_transaction_by_id',
            // Subscription tools
            'list_subscriptions', 'get_subscription_by_id',
            // Coupon tools
            'list_coupons', 'create_coupon', 'update_coupon', 'delete_coupon', 'get_coupon',
            // Custom Provider tools
            'create_custom_provider_integration', 'delete_custom_provider_integration',
            'get_custom_provider_config', 'create_custom_provider_config', 'disconnect_custom_provider_config'
        ];
        return paymentsToolNames.includes(toolName);
    }
    /**
     * Check if tool name belongs to invoices tools
     */
    isInvoicesTool(toolName) {
        const invoicesToolNames = [
            // Invoice Template tools
            'create_invoice_template', 'list_invoice_templates', 'get_invoice_template', 'update_invoice_template', 'delete_invoice_template',
            'update_invoice_template_late_fees', 'update_invoice_template_payment_methods',
            // Invoice Schedule tools
            'create_invoice_schedule', 'list_invoice_schedules', 'get_invoice_schedule', 'update_invoice_schedule', 'delete_invoice_schedule',
            'schedule_invoice_schedule', 'auto_payment_invoice_schedule', 'cancel_invoice_schedule',
            // Invoice Management tools
            'create_invoice', 'list_invoices', 'get_invoice', 'update_invoice', 'delete_invoice', 'void_invoice', 'send_invoice',
            'record_invoice_payment', 'generate_invoice_number', 'text2pay_invoice', 'update_invoice_last_visited',
            // Estimate tools
            'create_estimate', 'list_estimates', 'update_estimate', 'delete_estimate', 'send_estimate', 'create_invoice_from_estimate',
            'generate_estimate_number', 'update_estimate_last_visited',
            // Estimate Template tools
            'list_estimate_templates', 'create_estimate_template', 'update_estimate_template', 'delete_estimate_template', 'preview_estimate_template'
        ];
        return invoicesToolNames.includes(toolName);
    }
    /**
     * Test GHL API connection
     */
    async testGHLConnection() {
        try {
            process.stderr.write('[GHL MCP] Testing GHL API connection...\n');
            const result = await this.ghlClient.testConnection();
            process.stderr.write('[GHL MCP] ✅ GHL API connection successful\n');
            process.stderr.write(`[GHL MCP] Connected to location: ${result.data?.locationId}\n`);
        }
        catch (error) {
            console.error('[GHL MCP] ❌ GHL API connection failed:', error);
            throw new Error(`Failed to connect to GHL API: ${error}`);
        }
    }
    /**
     * Initialize and start the MCP server
     */
    async start() {
        process.stderr.write('🚀 Starting GoHighLevel MCP Server...\n');
        process.stderr.write('=====================================\n');
        try {
            // Test GHL API connection
            await this.testGHLConnection();
            // Create transport
            const transport = new stdio_js_1.StdioServerTransport();
            // Connect server to transport
            await this.server.connect(transport);
            process.stderr.write('✅ GoHighLevel MCP Server started successfully!\n');
            process.stderr.write('🔗 Ready to handle Claude Desktop requests\n');
            process.stderr.write('=====================================\n');
            // Available tools summary
            const contactToolCount = this.contactTools.getToolDefinitions().length;
            const conversationToolCount = this.conversationTools.getToolDefinitions().length;
            const blogToolCount = this.blogTools.getToolDefinitions().length;
            const opportunityToolCount = this.opportunityTools.getToolDefinitions().length;
            const calendarToolCount = this.calendarTools.getToolDefinitions().length;
            const emailToolCount = this.emailTools.getToolDefinitions().length;
            const locationToolCount = this.locationTools.getToolDefinitions().length;
            const emailISVToolCount = this.emailISVTools.getToolDefinitions().length;
            const socialMediaToolCount = this.socialMediaTools.getTools().length;
            const mediaToolCount = this.mediaTools.getToolDefinitions().length;
            const objectToolCount = this.objectTools.getToolDefinitions().length;
            const associationToolCount = this.associationTools.getTools().length;
            const customFieldV2ToolCount = this.customFieldV2Tools.getTools().length;
            const workflowToolCount = this.workflowTools.getTools().length;
            const surveyToolCount = this.surveyTools.getTools().length;
            const storeToolCount = this.storeTools.getTools().length;
            const productsToolCount = this.productsTools.getTools().length;
            const paymentsToolCount = this.paymentsTools.getTools().length;
            const invoicesToolCount = this.invoicesTools.getTools().length;
            const totalTools = contactToolCount + conversationToolCount + blogToolCount + opportunityToolCount + calendarToolCount + emailToolCount + locationToolCount + emailISVToolCount + socialMediaToolCount + mediaToolCount + objectToolCount + associationToolCount + customFieldV2ToolCount + workflowToolCount + surveyToolCount + storeToolCount + productsToolCount + paymentsToolCount + invoicesToolCount;
            process.stderr.write(`📋 Available tools: ${totalTools}\n`);
            process.stderr.write('\n');
            process.stderr.write('🎯 CONTACT MANAGEMENT (31 tools):\n');
            process.stderr.write('   BASIC: create, search, get, update, delete contacts\n');
            process.stderr.write('   TAGS: add/remove contact tags, bulk tag operations\n');
            process.stderr.write('   TASKS: get, create, update, delete contact tasks\n');
            process.stderr.write('   NOTES: get, create, update, delete contact notes\n');
            process.stderr.write('   ADVANCED: upsert, duplicate check, business association\n');
            process.stderr.write('   BULK: mass tag updates, business assignments\n');
            process.stderr.write('   FOLLOWERS: add/remove contact followers\n');
            process.stderr.write('   CAMPAIGNS: add/remove contacts to/from campaigns\n');
            process.stderr.write('   WORKFLOWS: add/remove contacts to/from workflows\n');
            process.stderr.write('   APPOINTMENTS: get contact appointments\n');
            process.stderr.write('\n');
            process.stderr.write('💬 MESSAGING & CONVERSATIONS (20 tools):\n');
            process.stderr.write('   BASIC: send_sms, send_email - Send messages to contacts\n');
            process.stderr.write('   CONVERSATIONS: search, get, create, update, delete conversations\n');
            process.stderr.write('   MESSAGES: get individual messages, email messages, upload attachments\n');
            process.stderr.write('   STATUS: update message delivery status, monitor recent activity\n');
            process.stderr.write('   MANUAL: add inbound messages, add outbound calls manually\n');
            process.stderr.write('   RECORDINGS: get call recordings, transcriptions, download transcripts\n');
            process.stderr.write('   SCHEDULING: cancel scheduled messages and emails\n');
            process.stderr.write('   LIVE CHAT: typing indicators for real-time conversations\n');
            process.stderr.write('\n');
            process.stderr.write('📝 BLOG MANAGEMENT:\n');
            process.stderr.write('   • create_blog_post - Create new blog posts\n');
            process.stderr.write('   • update_blog_post - Update existing blog posts\n');
            process.stderr.write('   • get_blog_posts - List and search blog posts\n');
            process.stderr.write('   • get_blog_sites - Get available blog sites\n');
            process.stderr.write('   • get_blog_authors - Get available blog authors\n');
            process.stderr.write('   • get_blog_categories - Get available blog categories\n');
            process.stderr.write('   • check_url_slug - Validate URL slug availability\n');
            process.stderr.write('\n');
            process.stderr.write('💰 OPPORTUNITY MANAGEMENT (10 tools):\n');
            process.stderr.write('   SEARCH: search_opportunities - Search by pipeline, stage, status, contact\n');
            process.stderr.write('   PIPELINES: get_pipelines - Get all sales pipelines and stages\n');
            process.stderr.write('   CRUD: create, get, update, delete opportunities\n');
            process.stderr.write('   STATUS: update_opportunity_status - Quick status updates (won/lost)\n');
            process.stderr.write('   UPSERT: upsert_opportunity - Smart create/update based on contact\n');
            process.stderr.write('   FOLLOWERS: add/remove followers for opportunity notifications\n');
            process.stderr.write('🗓 CALENDAR & APPOINTMENTS:\n');
            process.stderr.write('   • get_calendar_groups - Get all calendar groups\n');
            process.stderr.write('   • get_calendars - List all calendars with filtering\n');
            process.stderr.write('   • create_calendar - Create new calendars\n');
            process.stderr.write('   • get_calendar - Get calendar details by ID\n');
            process.stderr.write('   • update_calendar - Update calendar settings\n');
            process.stderr.write('   • delete_calendar - Delete calendars\n');
            process.stderr.write('   • get_calendar_events - Get appointments/events in date range\n');
            process.stderr.write('   • get_free_slots - Check availability for bookings\n');
            process.stderr.write('   • create_appointment - Book new appointments\n');
            process.stderr.write('   • get_appointment - Get appointment details\n');
            process.stderr.write('   • update_appointment - Update appointment details\n');
            process.stderr.write('   • delete_appointment - Cancel appointments\n');
            process.stderr.write('   • create_block_slot - Block time slots\n');
            process.stderr.write('   • update_block_slot - Update blocked slots\n');
            process.stderr.write('\n');
            process.stderr.write('📧 EMAIL MARKETING:\n');
            process.stderr.write('   • get_email_campaigns - Get list of email campaigns\n');
            process.stderr.write('   • create_email_template - Create a new email template\n');
            process.stderr.write('   • get_email_templates - Get list of email templates\n');
            process.stderr.write('   • update_email_template - Update an existing email template\n');
            process.stderr.write('   • delete_email_template - Delete an email template\n');
            process.stderr.write('\n');
            process.stderr.write('🏢 LOCATION MANAGEMENT:\n');
            process.stderr.write('   • search_locations - Search for locations/sub-accounts\n');
            process.stderr.write('   • get_location - Get detailed location information\n');
            process.stderr.write('   • create_location - Create new sub-accounts (Agency Pro required)\n');
            process.stderr.write('   • update_location - Update location information\n');
            process.stderr.write('   • delete_location - Delete locations\n');
            process.stderr.write('   • get_location_tags - Get all tags for a location\n');
            process.stderr.write('   • create_location_tag - Create location tags\n');
            process.stderr.write('   • update_location_tag - Update location tags\n');
            process.stderr.write('   • delete_location_tag - Delete location tags\n');
            process.stderr.write('   • search_location_tasks - Search tasks within locations\n');
            process.stderr.write('   • get_location_custom_fields - Get custom fields\n');
            process.stderr.write('   • create_location_custom_field - Create custom fields\n');
            process.stderr.write('   • update_location_custom_field - Update custom fields\n');
            process.stderr.write('   • delete_location_custom_field - Delete custom fields\n');
            process.stderr.write('   • get_location_custom_values - Get custom values\n');
            process.stderr.write('   • create_location_custom_value - Create custom values\n');
            process.stderr.write('   • update_location_custom_value - Update custom values\n');
            process.stderr.write('   • delete_location_custom_value - Delete custom values\n');
            process.stderr.write('   • get_location_templates - Get SMS/Email templates\n');
            process.stderr.write('   • delete_location_template - Delete templates\n');
            process.stderr.write('   • get_timezones - Get available timezones\n');
            process.stderr.write('\n');
            process.stderr.write('✅ EMAIL VERIFICATION:\n');
            process.stderr.write('   • verify_email - Verify email deliverability and risk assessment\n');
            process.stderr.write('\n');
            process.stderr.write('📱 SOCIAL MEDIA POSTING:\n');
            process.stderr.write('   POSTS: search, create, get, update, delete social posts\n');
            process.stderr.write('   BULK: bulk delete up to 50 posts at once\n');
            process.stderr.write('   ACCOUNTS: get connected accounts, delete connections\n');
            process.stderr.write('   CSV: upload bulk posts via CSV, manage import status\n');
            process.stderr.write('   ORGANIZE: categories and tags for content organization\n');
            process.stderr.write('   OAUTH: start OAuth flows, get platform accounts\n');
            process.stderr.write('   PLATFORMS: Google, Facebook, Instagram, LinkedIn, Twitter, TikTok\n');
            process.stderr.write('\n');
            process.stderr.write('📁 MEDIA LIBRARY MANAGEMENT:\n');
            process.stderr.write('   • get_media_files - List files and folders with search/filter\n');
            process.stderr.write('   • upload_media_file - Upload files or add hosted file URLs\n');
            process.stderr.write('   • delete_media_file - Delete files and folders\n');
            process.stderr.write('\n');
            process.stderr.write('🏗️ CUSTOM OBJECTS MANAGEMENT:\n');
            process.stderr.write('   SCHEMA: get_all_objects, create_object_schema, get_object_schema, update_object_schema\n');
            process.stderr.write('   RECORDS: create_object_record, get_object_record, update_object_record, delete_object_record\n');
            process.stderr.write('   SEARCH: search_object_records - Search records using searchable properties\n');
            process.stderr.write('   FLEXIBILITY: Manage custom objects like pets, tickets, inventory, or any business data\n');
            process.stderr.write('   RELATIONSHIPS: Owner and follower management for records\n');
            process.stderr.write('\n');
            process.stderr.write('💳 PAYMENTS MANAGEMENT:\n');
            process.stderr.write('   INTEGRATIONS: create/list white-label payment integrations\n');
            process.stderr.write('   ORDERS: list_orders, get_order_by_id - Manage customer orders\n');
            process.stderr.write('   FULFILLMENT: create/list order fulfillments with tracking\n');
            process.stderr.write('   TRANSACTIONS: list/get payment transactions and history\n');
            process.stderr.write('   SUBSCRIPTIONS: list/get recurring payment subscriptions\n');
            process.stderr.write('   COUPONS: create, update, delete, list promotional coupons\n');
            process.stderr.write('   CUSTOM PROVIDERS: integrate custom payment gateways\n');
            process.stderr.write('\n');
            process.stderr.write('🧾 INVOICES & BILLING MANAGEMENT:\n');
            process.stderr.write('   TEMPLATES: create, list, get, update, delete invoice templates\n');
            process.stderr.write('   SCHEDULES: create, list, get recurring invoice automation\n');
            process.stderr.write('   INVOICES: create, list, get, send invoices to customers\n');
            process.stderr.write('   ESTIMATES: create, list, send estimates, convert to invoices\n');
            process.stderr.write('   UTILITIES: generate invoice/estimate numbers automatically\n');
            process.stderr.write('   FEATURES: late fees, payment methods, multi-currency support\n');
            process.stderr.write('=====================================\n');
        }
        catch (error) {
            console.error('❌ Failed to start GHL MCP Server:', error);
            process.exit(1);
        }
    }
}
/**
 * Handle graceful shutdown
 */
function setupGracefulShutdown() {
    const shutdown = (signal) => {
        process.stderr.write(`\n[GHL MCP] Received ${signal}, shutting down gracefully...\n`);
        process.exit(0);
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
}
/**
 * Main entry point
 */
async function main() {
    try {
        // Setup graceful shutdown
        setupGracefulShutdown();
        // Create and start server
        const server = new GHLMCPServer();
        await server.start();
    }
    catch (error) {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    }
}
// Start the server
main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
