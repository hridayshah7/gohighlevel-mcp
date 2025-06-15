"use strict";
/**
 * GoHighLevel MCP HTTP Server
 * HTTP version for ChatGPT web integration
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const sse_js_1 = require("@modelcontextprotocol/sdk/server/sse.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const dotenv = __importStar(require("dotenv"));
const ghl_api_client_1 = require("./clients/ghl-api-client");
const contact_tools_1 = require("./tools/contact-tools");
const conversation_tools_1 = require("./tools/conversation-tools");
const blog_tools_1 = require("./tools/blog-tools");
const opportunity_tools_1 = require("./tools/opportunity-tools");
const calendar_tools_1 = require("./tools/calendar-tools");
const email_tools_1 = require("./tools/email-tools");
const location_tools_1 = require("./tools/location-tools");
const email_isv_tools_1 = require("./tools/email-isv-tools");
const social_media_tools_1 = require("./tools/social-media-tools");
const media_tools_1 = require("./tools/media-tools");
const object_tools_1 = require("./tools/object-tools");
const association_tools_1 = require("./tools/association-tools");
const custom_field_v2_tools_1 = require("./tools/custom-field-v2-tools");
const workflow_tools_1 = require("./tools/workflow-tools");
const survey_tools_1 = require("./tools/survey-tools");
const store_tools_1 = require("./tools/store-tools");
const products_tools_1 = require("./tools/products-tools");
// Load environment variables
dotenv.config();
/**
 * HTTP MCP Server class for web deployment
 */
class GHLMCPHttpServer {
    app;
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
    port;
    constructor() {
        this.port = parseInt(process.env.PORT || process.env.MCP_SERVER_PORT || '8000');
        // Initialize Express app
        this.app = (0, express_1.default)();
        this.setupExpress();
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
        this.contactTools = new contact_tools_1.ContactTools(this.ghlClient);
        this.conversationTools = new conversation_tools_1.ConversationTools(this.ghlClient);
        this.blogTools = new blog_tools_1.BlogTools(this.ghlClient);
        this.opportunityTools = new opportunity_tools_1.OpportunityTools(this.ghlClient);
        this.calendarTools = new calendar_tools_1.CalendarTools(this.ghlClient);
        this.emailTools = new email_tools_1.EmailTools(this.ghlClient);
        this.locationTools = new location_tools_1.LocationTools(this.ghlClient);
        this.emailISVTools = new email_isv_tools_1.EmailISVTools(this.ghlClient);
        this.socialMediaTools = new social_media_tools_1.SocialMediaTools(this.ghlClient);
        this.mediaTools = new media_tools_1.MediaTools(this.ghlClient);
        this.objectTools = new object_tools_1.ObjectTools(this.ghlClient);
        this.associationTools = new association_tools_1.AssociationTools(this.ghlClient);
        this.customFieldV2Tools = new custom_field_v2_tools_1.CustomFieldV2Tools(this.ghlClient);
        this.workflowTools = new workflow_tools_1.WorkflowTools(this.ghlClient);
        this.surveyTools = new survey_tools_1.SurveyTools(this.ghlClient);
        this.storeTools = new store_tools_1.StoreTools(this.ghlClient);
        this.productsTools = new products_tools_1.ProductsTools(this.ghlClient);
        // Setup MCP handlers
        this.setupMCPHandlers();
        this.setupRoutes();
    }
    /**
     * Setup Express middleware and configuration
     */
    setupExpress() {
        // Enable CORS for ChatGPT integration
        this.app.use((0, cors_1.default)({
            origin: ['https://chatgpt.com', 'https://chat.openai.com', 'http://localhost:*'],
            methods: ['GET', 'POST', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
            credentials: true
        }));
        // Parse JSON requests
        this.app.use(express_1.default.json());
        // Request logging
        this.app.use((req, res, next) => {
            console.log(`[HTTP] ${req.method} ${req.path} - ${new Date().toISOString()}`);
            next();
        });
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
        console.log('[GHL MCP HTTP] Initializing GHL API client...');
        console.log(`[GHL MCP HTTP] Base URL: ${config.baseUrl}`);
        console.log(`[GHL MCP HTTP] Version: ${config.version}`);
        console.log(`[GHL MCP HTTP] Location ID: ${config.locationId}`);
        return new ghl_api_client_1.GHLApiClient(config);
    }
    /**
     * Setup MCP request handlers
     */
    setupMCPHandlers() {
        // Handle list tools requests
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            console.log('[GHL MCP HTTP] Listing available tools...');
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
                    ...productsToolDefinitions
                ];
                console.log(`[GHL MCP HTTP] Registered ${allTools.length} tools total`);
                return {
                    tools: allTools
                };
            }
            catch (error) {
                console.error('[GHL MCP HTTP] Error listing tools:', error);
                throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Failed to list tools: ${error}`);
            }
        });
        // Handle tool execution requests
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            console.log(`[GHL MCP HTTP] Executing tool: ${name}`);
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
                else {
                    throw new Error(`Unknown tool: ${name}`);
                }
                console.log(`[GHL MCP HTTP] Tool ${name} executed successfully`);
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
                console.error(`[GHL MCP HTTP] Error executing tool ${name}:`, error);
                throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Tool execution failed: ${error}`);
            }
        });
    }
    /**
     * Setup HTTP routes
     */
    /**
       * Setup HTTP routes
       */
    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', async (req, res) => {
            try {
                // Get all tool names for the health check
                const allToolNames = await this.getAllToolNames();
                res.json({
                    status: 'healthy',
                    server: 'ghl-mcp-server',
                    version: '1.0.0',
                    protocol: '2024-11-05',
                    timestamp: new Date().toISOString(),
                    tools: allToolNames,
                    endpoint: '/sse'
                });
            }
            catch (error) {
                console.error('[GHL MCP HTTP] Error in health check:', error);
                res.status(500).json({
                    status: 'error',
                    error: 'Health check failed'
                });
            }
        });
        // MCP capabilities endpoint
        this.app.get('/capabilities', (req, res) => {
            res.json({
                capabilities: {
                    tools: {},
                },
                server: {
                    name: 'ghl-mcp-server',
                    version: '1.0.0'
                }
            });
        });
        // Tools listing endpoint - Fixed to properly handle async operations
        this.app.get('/tools', async (req, res) => {
            try {
                const contactTools = this.contactTools.getToolDefinitions();
                const conversationTools = this.conversationTools.getToolDefinitions();
                const blogTools = this.blogTools.getToolDefinitions();
                const opportunityTools = this.opportunityTools.getToolDefinitions();
                const calendarTools = this.calendarTools.getToolDefinitions();
                const emailTools = this.emailTools.getToolDefinitions();
                const locationTools = this.locationTools.getToolDefinitions();
                const emailISVTools = this.emailISVTools.getToolDefinitions();
                const socialMediaTools = this.socialMediaTools.getTools();
                const mediaTools = this.mediaTools.getToolDefinitions();
                const objectTools = this.objectTools.getToolDefinitions();
                const associationTools = this.associationTools.getTools();
                const customFieldV2Tools = this.customFieldV2Tools.getTools();
                const workflowTools = this.workflowTools.getTools();
                const surveyTools = this.surveyTools.getTools();
                const storeTools = this.storeTools.getTools();
                const productsTools = this.productsTools.getTools();
                const allTools = [
                    ...contactTools,
                    ...conversationTools,
                    ...blogTools,
                    ...opportunityTools,
                    ...calendarTools,
                    ...emailTools,
                    ...locationTools,
                    ...emailISVTools,
                    ...socialMediaTools,
                    ...mediaTools,
                    ...objectTools,
                    ...associationTools,
                    ...customFieldV2Tools,
                    ...workflowTools,
                    ...surveyTools,
                    ...storeTools,
                    ...productsTools
                ];
                console.log(`[GHL MCP HTTP] Tools endpoint accessed - returning ${allTools.length} tools`);
                res.json({
                    tools: allTools,
                    count: allTools.length,
                    categories: this.getToolsCount() // Keep the detailed breakdown here
                });
            }
            catch (error) {
                console.error('[GHL MCP HTTP] Error listing tools:', error);
                res.status(500).json({
                    error: 'Failed to list tools',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        // SSE endpoint for ChatGPT MCP connection
        const handleSSE = async (req, res) => {
            const sessionId = req.query.sessionId || 'unknown';
            console.log(`[GHL MCP HTTP] New SSE connection from: ${req.ip}, sessionId: ${sessionId}, method: ${req.method}`);
            try {
                // Create SSE transport (this will set the headers)
                const transport = new sse_js_1.SSEServerTransport('/sse', res);
                // Connect MCP server to transport
                await this.server.connect(transport);
                console.log(`[GHL MCP HTTP] SSE connection established for session: ${sessionId}`);
                // Handle client disconnect
                req.on('close', () => {
                    console.log(`[GHL MCP HTTP] SSE connection closed for session: ${sessionId}`);
                });
            }
            catch (error) {
                console.error(`[GHL MCP HTTP] SSE connection error for session ${sessionId}:`, error);
                // Only send error response if headers haven't been sent yet
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Failed to establish SSE connection' });
                }
                else {
                    // If headers were already sent, close the connection
                    res.end();
                }
            }
        };
        // Handle both GET and POST for SSE (MCP protocol requirements)
        this.app.get('/sse', handleSSE);
        this.app.post('/sse', handleSSE);
        // Root endpoint with server info
        this.app.get('/', async (req, res) => {
            try {
                const toolsCount = this.getToolsCount();
                res.json({
                    name: 'GoHighLevel MCP Server',
                    version: '1.0.0',
                    status: 'running',
                    endpoints: {
                        health: '/health',
                        capabilities: '/capabilities',
                        tools: '/tools',
                        sse: '/sse'
                    },
                    tools: toolsCount,
                    documentation: 'https://github.com/your-repo/ghl-mcp-server'
                });
            }
            catch (error) {
                console.error('[GHL MCP HTTP] Error in root endpoint:', error);
                res.status(500).json({
                    error: 'Server error',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Get all tool names as an array (for health endpoint)
     */
    async getAllToolNames() {
        try {
            const contactTools = this.contactTools.getToolDefinitions();
            const conversationTools = this.conversationTools.getToolDefinitions();
            const blogTools = this.blogTools.getToolDefinitions();
            const opportunityTools = this.opportunityTools.getToolDefinitions();
            const calendarTools = this.calendarTools.getToolDefinitions();
            const emailTools = this.emailTools.getToolDefinitions();
            const locationTools = this.locationTools.getToolDefinitions();
            const emailISVTools = this.emailISVTools.getToolDefinitions();
            const socialMediaTools = this.socialMediaTools.getTools();
            const mediaTools = this.mediaTools.getToolDefinitions();
            const objectTools = this.objectTools.getToolDefinitions();
            const associationTools = this.associationTools.getTools();
            const customFieldV2Tools = this.customFieldV2Tools.getTools();
            const workflowTools = this.workflowTools.getTools();
            const surveyTools = this.surveyTools.getTools();
            const storeTools = this.storeTools.getTools();
            const productsTools = this.productsTools.getTools();
            const allTools = [
                ...contactTools,
                ...conversationTools,
                ...blogTools,
                ...opportunityTools,
                ...calendarTools,
                ...emailTools,
                ...locationTools,
                ...emailISVTools,
                ...socialMediaTools,
                ...mediaTools,
                ...objectTools,
                ...associationTools,
                ...customFieldV2Tools,
                ...workflowTools,
                ...surveyTools,
                ...storeTools,
                ...productsTools
            ];
            // Extract just the tool names
            return allTools.map(tool => tool.name);
        }
        catch (error) {
            console.error('[GHL MCP HTTP] Error getting tool names:', error);
            return []; // Return empty array on error
        }
    }
    /**
     * Get tools count summary
     */
    getToolsCount() {
        return {
            contact: this.contactTools.getToolDefinitions().length,
            conversation: this.conversationTools.getToolDefinitions().length,
            blog: this.blogTools.getToolDefinitions().length,
            opportunity: this.opportunityTools.getToolDefinitions().length,
            calendar: this.calendarTools.getToolDefinitions().length,
            email: this.emailTools.getToolDefinitions().length,
            location: this.locationTools.getToolDefinitions().length,
            emailISV: this.emailISVTools.getToolDefinitions().length,
            socialMedia: this.socialMediaTools.getTools().length,
            media: this.mediaTools.getToolDefinitions().length,
            objects: this.objectTools.getToolDefinitions().length,
            associations: this.associationTools.getTools().length,
            customFieldsV2: this.customFieldV2Tools.getTools().length,
            workflows: this.workflowTools.getTools().length,
            surveys: this.surveyTools.getTools().length,
            store: this.storeTools.getTools().length,
            products: this.productsTools.getTools().length,
            total: this.contactTools.getToolDefinitions().length +
                this.conversationTools.getToolDefinitions().length +
                this.blogTools.getToolDefinitions().length +
                this.opportunityTools.getToolDefinitions().length +
                this.calendarTools.getToolDefinitions().length +
                this.emailTools.getToolDefinitions().length +
                this.locationTools.getToolDefinitions().length +
                this.emailISVTools.getToolDefinitions().length +
                this.socialMediaTools.getTools().length +
                this.mediaTools.getToolDefinitions().length +
                this.objectTools.getToolDefinitions().length +
                this.associationTools.getTools().length +
                this.customFieldV2Tools.getTools().length +
                this.workflowTools.getTools().length +
                this.surveyTools.getTools().length +
                this.storeTools.getTools().length +
                this.productsTools.getTools().length
        };
    }
    /**
     * Tool name validation helpers
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
    isBlogTool(toolName) {
        const blogToolNames = [
            'create_blog_post', 'update_blog_post', 'get_blog_posts', 'get_blog_sites',
            'get_blog_authors', 'get_blog_categories', 'check_url_slug'
        ];
        return blogToolNames.includes(toolName);
    }
    isOpportunityTool(toolName) {
        const opportunityToolNames = [
            'search_opportunities', 'get_pipelines', 'get_opportunity', 'create_opportunity',
            'update_opportunity_status', 'delete_opportunity', 'update_opportunity',
            'upsert_opportunity', 'add_opportunity_followers', 'remove_opportunity_followers'
        ];
        return opportunityToolNames.includes(toolName);
    }
    isCalendarTool(toolName) {
        const calendarToolNames = [
            // Calendar Groups Management
            'get_calendar_groups', 'create_calendar_group', 'validate_group_slug',
            'update_calendar_group', 'delete_calendar_group', 'disable_calendar_group',
            // Calendars
            'get_calendars', 'create_calendar', 'get_calendar', 'update_calendar', 'delete_calendar',
            // Events and Appointments
            'get_calendar_events', 'get_free_slots', 'create_appointment', 'get_appointment',
            'update_appointment', 'delete_appointment',
            // Appointment Notes
            'get_appointment_notes', 'create_appointment_note', 'update_appointment_note', 'delete_appointment_note',
            // Calendar Resources
            'get_calendar_resources', 'get_calendar_resource_by_id', 'update_calendar_resource', 'delete_calendar_resource',
            // Calendar Notifications
            'get_calendar_notifications', 'create_calendar_notification', 'update_calendar_notification', 'delete_calendar_notification',
            // Blocked Slots
            'create_block_slot', 'update_block_slot', 'get_blocked_slots', 'delete_blocked_slot'
        ];
        return calendarToolNames.includes(toolName);
    }
    isEmailTool(toolName) {
        const emailToolNames = [
            'get_email_campaigns', 'create_email_template', 'get_email_templates',
            'update_email_template', 'delete_email_template'
        ];
        return emailToolNames.includes(toolName);
    }
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
    isEmailISVTool(toolName) {
        const emailISVToolNames = [
            'verify_email'
        ];
        return emailISVToolNames.includes(toolName);
    }
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
    isMediaTool(toolName) {
        const mediaToolNames = [
            'get_media_files', 'upload_media_file', 'delete_media_file'
        ];
        return mediaToolNames.includes(toolName);
    }
    isObjectTool(toolName) {
        const objectToolNames = [
            'get_all_objects', 'create_object_schema', 'get_object_schema', 'update_object_schema',
            'create_object_record', 'get_object_record', 'update_object_record', 'delete_object_record',
            'search_object_records'
        ];
        return objectToolNames.includes(toolName);
    }
    isAssociationTool(toolName) {
        const associationToolNames = [
            'ghl_get_all_associations', 'ghl_create_association', 'ghl_get_association_by_id',
            'ghl_update_association', 'ghl_delete_association', 'ghl_get_association_by_key',
            'ghl_get_association_by_object_key', 'ghl_create_relation', 'ghl_get_relations_by_record',
            'ghl_delete_relation'
        ];
        return associationToolNames.includes(toolName);
    }
    isCustomFieldV2Tool(toolName) {
        const customFieldV2ToolNames = [
            'ghl_get_custom_field_by_id', 'ghl_create_custom_field', 'ghl_update_custom_field',
            'ghl_delete_custom_field', 'ghl_get_custom_fields_by_object_key', 'ghl_create_custom_field_folder',
            'ghl_update_custom_field_folder', 'ghl_delete_custom_field_folder'
        ];
        return customFieldV2ToolNames.includes(toolName);
    }
    isWorkflowTool(toolName) {
        const workflowToolNames = [
            'ghl_get_workflows'
        ];
        return workflowToolNames.includes(toolName);
    }
    isSurveyTool(toolName) {
        const surveyToolNames = [
            'ghl_get_surveys',
            'ghl_get_survey_submissions'
        ];
        return surveyToolNames.includes(toolName);
    }
    isStoreTool(toolName) {
        const storeToolNames = [
            'ghl_create_shipping_zone', 'ghl_list_shipping_zones', 'ghl_get_shipping_zone',
            'ghl_update_shipping_zone', 'ghl_delete_shipping_zone', 'ghl_get_available_shipping_rates',
            'ghl_create_shipping_rate', 'ghl_list_shipping_rates', 'ghl_get_shipping_rate',
            'ghl_update_shipping_rate', 'ghl_delete_shipping_rate', 'ghl_create_shipping_carrier',
            'ghl_list_shipping_carriers', 'ghl_get_shipping_carrier', 'ghl_update_shipping_carrier',
            'ghl_delete_shipping_carrier', 'ghl_create_store_setting', 'ghl_get_store_setting'
        ];
        return storeToolNames.includes(toolName);
    }
    isProductsTool(toolName) {
        const productsToolNames = [
            'ghl_create_product', 'ghl_list_products', 'ghl_get_product', 'ghl_update_product',
            'ghl_delete_product', 'ghl_bulk_update_products', 'ghl_create_price', 'ghl_list_prices',
            'ghl_get_price', 'ghl_update_price', 'ghl_delete_price', 'ghl_list_inventory',
            'ghl_update_inventory', 'ghl_get_product_store_stats', 'ghl_update_product_store',
            'ghl_create_product_collection', 'ghl_list_product_collections', 'ghl_get_product_collection',
            'ghl_update_product_collection', 'ghl_delete_product_collection', 'ghl_list_product_reviews',
            'ghl_get_reviews_count', 'ghl_update_product_review', 'ghl_delete_product_review',
            'ghl_bulk_update_product_reviews'
        ];
        return productsToolNames.includes(toolName);
    }
    /**
     * Test GHL API connection
     */
    async testGHLConnection() {
        try {
            console.log('[GHL MCP HTTP] Testing GHL API connection...');
            const result = await this.ghlClient.testConnection();
            console.log('[GHL MCP HTTP] ✅ GHL API connection successful');
            console.log(`[GHL MCP HTTP] Connected to location: ${result.data?.locationId}`);
        }
        catch (error) {
            console.error('[GHL MCP HTTP] ❌ GHL API connection failed:', error);
            throw new Error(`Failed to connect to GHL API: ${error}`);
        }
    }
    /**
     * Start the HTTP server
     */
    async start() {
        console.log('🚀 Starting GoHighLevel MCP HTTP Server...');
        console.log('=========================================');
        try {
            // Test GHL API connection
            await this.testGHLConnection();
            // Start HTTP server
            this.app.listen(this.port, '0.0.0.0', () => {
                console.log('✅ GoHighLevel MCP HTTP Server started successfully!');
                console.log(`🌐 Server running on: http://0.0.0.0:${this.port}`);
                console.log(`🔗 SSE Endpoint: http://0.0.0.0:${this.port}/sse`);
                console.log(`📋 Tools Available: ${this.getToolsCount().total}`);
                console.log('🎯 Ready for ChatGPT integration!');
                console.log('=========================================');
            });
        }
        catch (error) {
            console.error('❌ Failed to start GHL MCP HTTP Server:', error);
            process.exit(1);
        }
    }
}
/**
 * Handle graceful shutdown
 */
function setupGracefulShutdown() {
    const shutdown = (signal) => {
        console.log(`\n[GHL MCP HTTP] Received ${signal}, shutting down gracefully...`);
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
        // Create and start HTTP server
        const server = new GHLMCPHttpServer();
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
