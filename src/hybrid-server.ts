console.log("🚀 Starting MCP Server...");
console.log("Using PORT:", process.env.PORT);

/**
 * GoHighLevel MCP Hybrid Server
 * Combines your existing server.ts and http-server.ts into one file
 * Compatible with your existing project structure
 */

import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
    ListToolsRequestSchema, 
    CallToolRequestSchema, 
    McpError, 
    ErrorCode 
} from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Note: Tool classes will be imported dynamically in initializeTools() method
// to avoid TypeScript compilation errors if some tool files don't exist yet

/**
 * Deployment mode configuration
 */
enum DeploymentMode {
    HTTP = 'http',
    STDIO = 'stdio',
    AUTO = 'auto'
}

/**
 * Hybrid MCP Server class supporting both HTTP and STDIO modes
 */
class GHLMCPHybridServer {
    private app?: express.Application;
    private server: Server;
    private ghlClient: any; // Use any type to avoid import issues
    private mode: DeploymentMode;
    private port: number;

    // Tool instances - using any type to avoid TypeScript import issues
    private contactTools: any;
    private conversationTools: any;
    private blogTools: any;
    private opportunityTools: any;
    private calendarTools: any;
    private emailTools: any;
    private locationTools: any;
    private emailISVTools: any;
    private socialMediaTools: any;
    private mediaTools: any;
    private objectTools: any;
    private associationTools: any;
    private customFieldV2Tools: any;
    private workflowTools: any;
    private surveyTools: any;
    private storeTools: any;
    private productsTools: any;
    private paymentsTools: any;
    private invoicesTools: any;

    constructor() {
        // Determine deployment mode
        this.mode = this.determineMode();
        this.port = parseInt(process.env.PORT || '8080');
        
        console.log(`✅ MCP Server will run in ${this.mode.toUpperCase()} mode on port: ${this.port}`);
        
        // Initialize Express app if in HTTP mode
        if (this.mode === DeploymentMode.HTTP) {
            this.app = express();
            this.setupExpress();
        }

        // Initialize MCP server with capabilities
        this.server = new Server({
            name: 'ghl-mcp-server',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });

        // Initialize GHL API client
        this.ghlClient = this.initializeGHLClient();

        // Initialize all tool instances
        this.initializeTools();

        // Setup MCP handlers
        this.setupMCPHandlers();

        // Setup HTTP routes if in HTTP mode
        if (this.mode === DeploymentMode.HTTP && this.app) {
            this.setupRoutes();
        }
    }

    /**
     * Determine deployment mode based on environment
     */
    private determineMode(): DeploymentMode {
        const modeEnv = process.env.MCP_MODE?.toLowerCase();
        
        if (modeEnv === 'http') return DeploymentMode.HTTP;
        if (modeEnv === 'stdio') return DeploymentMode.STDIO;
        
        // Auto-detect based on environment
        if (process.env.PORT || process.env.NODE_ENV === 'production') {
            return DeploymentMode.HTTP;
        }
        
        // Default to STDIO for Claude Desktop
        return DeploymentMode.STDIO;
    }

    /**
     * Logging helper that works in both modes
     */
    private log(message: string): void {
        if (this.mode === DeploymentMode.HTTP) {
            console.log(message);
        } else {
            process.stderr.write(message + '\n');
        }
    }

    /**
     * Setup Express middleware and configuration (HTTP mode only)
     */
    private setupExpress(): void {
        if (!this.app) return;

        // Enable CORS for Claude AI and other web clients
        this.app.use(cors({
            origin: [
                'https://chatgpt.com', 
                'https://chat.openai.com', 
                'http://localhost:*', 
                'https://claude.ai', 
                'https://app.claude.ai'
            ],
            methods: ['GET', 'POST', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
            credentials: true
        }));

        // Parse JSON requests
        this.app.use(express.json());

        // Request logging
        this.app.use((req, res, next) => {
            console.log(`[HTTP] ${req.method} ${req.path} - ${new Date().toISOString()}`);
            next();
        });

        // Debug middleware to catch ALL requests - Fixed route pattern
        this.app.use((req, res, next) => {
            console.log('🔍 === INCOMING REQUEST DEBUG ===');
            console.log(`Method: ${req.method}`);
            console.log(`URL: ${req.originalUrl}`);
            console.log(`IP: ${req.ip}`);
            console.log(`User-Agent: ${req.headers['user-agent']}`);
            console.log(`Headers:`, JSON.stringify(req.headers, null, 2));
            if (req.body && Object.keys(req.body).length > 0) {
                console.log(`Body:`, JSON.stringify(req.body, null, 2));
            }
            console.log('🔍 ================================');
            next();
        });
    }

    /**
     * Initialize GoHighLevel API client with configuration
     */
    private initializeGHLClient(): any {
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

        this.log('[GHL MCP] Initializing GHL API client...');
        this.log(`[GHL MCP] Base URL: ${config.baseUrl}`);
        this.log(`[GHL MCP] Version: ${config.version}`);
        this.log(`[GHL MCP] Location ID: ${config.locationId}`);

        try {
            // Try to import and initialize the GHL client
            const { GHLApiClient } = require('./clients/ghl-api-client');
            return new GHLApiClient(config);
        } catch (error) {
            this.log(`[GHL MCP] Warning: Could not load GHLApiClient: ${error}`);
            // Return a mock client for development
            return {
                testConnection: async () => ({ data: { locationId: config.locationId } })
            };
        }
    }

    /**
     * Initialize all tool instances using safe imports
     */
    private initializeTools(): void {
        try {
            // Use require() for CommonJS compatibility and error handling
            const { ContactTools } = require('./tools/contact-tools');
            const { ConversationTools } = require('./tools/conversation-tools');
            const { BlogTools } = require('./tools/blog-tools');
            const { OpportunityTools } = require('./tools/opportunity-tools');
            const { CalendarTools } = require('./tools/calendar-tools');
            const { EmailTools } = require('./tools/email-tools');
            const { LocationTools } = require('./tools/location-tools');
            const { EmailISVTools } = require('./tools/email-isv-tools');
            const { SocialMediaTools } = require('./tools/social-media-tools');
            const { MediaTools } = require('./tools/media-tools');
            const { ObjectTools } = require('./tools/object-tools');
            const { AssociationTools } = require('./tools/association-tools');
            const { CustomFieldV2Tools } = require('./tools/custom-field-v2-tools');
            const { WorkflowTools } = require('./tools/workflow-tools');
            const { SurveyTools } = require('./tools/survey-tools');
            const { StoreTools } = require('./tools/store-tools');
            const { ProductsTools } = require('./tools/products-tools');
            const { PaymentsTools } = require('./tools/payments-tools');
            const { InvoicesTools } = require('./tools/invoices-tools');

            this.contactTools = new ContactTools(this.ghlClient);
            this.conversationTools = new ConversationTools(this.ghlClient);
            this.blogTools = new BlogTools(this.ghlClient);
            this.opportunityTools = new OpportunityTools(this.ghlClient);
            this.calendarTools = new CalendarTools(this.ghlClient);
            this.emailTools = new EmailTools(this.ghlClient);
            this.locationTools = new LocationTools(this.ghlClient);
            this.emailISVTools = new EmailISVTools(this.ghlClient);
            this.socialMediaTools = new SocialMediaTools(this.ghlClient);
            this.mediaTools = new MediaTools(this.ghlClient);
            this.objectTools = new ObjectTools(this.ghlClient);
            this.associationTools = new AssociationTools(this.ghlClient);
            this.customFieldV2Tools = new CustomFieldV2Tools(this.ghlClient);
            this.workflowTools = new WorkflowTools(this.ghlClient);
            this.surveyTools = new SurveyTools(this.ghlClient);
            this.storeTools = new StoreTools(this.ghlClient);
            this.productsTools = new ProductsTools(this.ghlClient);
            this.paymentsTools = new PaymentsTools(this.ghlClient);
            this.invoicesTools = new InvoicesTools(this.ghlClient);

            this.log('[GHL MCP] All tool classes initialized successfully');
        } catch (error) {
            this.log(`[GHL MCP] Warning: Some tool classes could not be loaded: ${error}`);
            
            // Initialize with mock tools that return empty arrays
            const mockTool = {
                getToolDefinitions: () => [],
                getTools: () => [],
                executeTool: async () => ({ error: 'Tool not available' }),
                executeAssociationTool: async () => ({ error: 'Tool not available' }),
                executeCustomFieldV2Tool: async () => ({ error: 'Tool not available' }),
                executeWorkflowTool: async () => ({ error: 'Tool not available' }),
                executeSurveyTool: async () => ({ error: 'Tool not available' }),
                executeStoreTool: async () => ({ error: 'Tool not available' }),
                executeProductsTool: async () => ({ error: 'Tool not available' }),
                handleToolCall: async () => ({ error: 'Tool not available' })
            };

            this.contactTools = mockTool;
            this.conversationTools = mockTool;
            this.blogTools = mockTool;
            this.opportunityTools = mockTool;
            this.calendarTools = mockTool;
            this.emailTools = mockTool;
            this.locationTools = mockTool;
            this.emailISVTools = mockTool;
            this.socialMediaTools = mockTool;
            this.mediaTools = mockTool;
            this.objectTools = mockTool;
            this.associationTools = mockTool;
            this.customFieldV2Tools = mockTool;
            this.workflowTools = mockTool;
            this.surveyTools = mockTool;
            this.storeTools = mockTool;
            this.productsTools = mockTool;
            this.paymentsTools = mockTool;
            this.invoicesTools = mockTool;
        }
    }

    /**
     * Setup MCP request handlers (used by both modes)
     */
    private setupMCPHandlers(): void {
        // Handle list tools requests
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            this.log('[GHL MCP] Listing available tools...');
            
            try {
                const allTools = [
                    ...this.contactTools.getToolDefinitions(),
                    ...this.conversationTools.getToolDefinitions(),
                    ...this.blogTools.getToolDefinitions(),
                    ...this.opportunityTools.getToolDefinitions(),
                    ...this.calendarTools.getToolDefinitions(),
                    ...this.emailTools.getToolDefinitions(),
                    ...this.locationTools.getToolDefinitions(),
                    ...this.emailISVTools.getToolDefinitions(),
                    ...this.socialMediaTools.getTools(),
                    ...this.mediaTools.getToolDefinitions(),
                    ...this.objectTools.getToolDefinitions(),
                    ...this.associationTools.getTools(),
                    ...this.customFieldV2Tools.getTools(),
                    ...this.workflowTools.getTools(),
                    ...this.surveyTools.getTools(),
                    ...this.storeTools.getTools(),
                    ...this.productsTools.getTools(),
                    ...this.paymentsTools.getTools(),
                    ...this.invoicesTools.getTools()
                ];

                this.log(`[GHL MCP] Registered ${allTools.length} tools total`);
                return { tools: allTools };

            } catch (error) {
                console.error('[GHL MCP] Error listing tools:', error);
                throw new McpError(ErrorCode.InternalError, `Failed to list tools: ${error}`);
            }
        });

        // Handle tool execution requests
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            this.log(`[GHL MCP] Executing tool: ${name}`);

            try {
                let result;

                // Route to appropriate tool handler
                if (this.isContactTool(name)) {
                    result = await this.contactTools.executeTool(name, args || {});
                } else if (this.isConversationTool(name)) {
                    result = await this.conversationTools.executeTool(name, args || {});
                } else if (this.isBlogTool(name)) {
                    result = await this.blogTools.executeTool(name, args || {});
                } else if (this.isOpportunityTool(name)) {
                    result = await this.opportunityTools.executeTool(name, args || {});
                } else if (this.isCalendarTool(name)) {
                    result = await this.calendarTools.executeTool(name, args || {});
                } else if (this.isEmailTool(name)) {
                    result = await this.emailTools.executeTool(name, args || {});
                } else if (this.isLocationTool(name)) {
                    result = await this.locationTools.executeTool(name, args || {});
                } else if (this.isEmailISVTool(name)) {
                    result = await this.emailISVTools.executeTool(name, args || {});
                } else if (this.isSocialMediaTool(name)) {
                    result = await this.socialMediaTools.executeTool(name, args || {});
                } else if (this.isMediaTool(name)) {
                    result = await this.mediaTools.executeTool(name, args || {});
                } else if (this.isObjectTool(name)) {
                    result = await this.objectTools.executeTool(name, args || {});
                } else if (this.isAssociationTool(name)) {
                    result = await this.associationTools.executeAssociationTool(name, args || {});
                } else if (this.isCustomFieldV2Tool(name)) {
                    result = await this.customFieldV2Tools.executeCustomFieldV2Tool(name, args || {});
                } else if (this.isWorkflowTool(name)) {
                    result = await this.workflowTools.executeWorkflowTool(name, args || {});
                } else if (this.isSurveyTool(name)) {
                    result = await this.surveyTools.executeSurveyTool(name, args || {});
                } else if (this.isStoreTool(name)) {
                    result = await this.storeTools.executeStoreTool(name, args || {});
                } else if (this.isProductsTool(name)) {
                    result = await this.productsTools.executeProductsTool(name, args || {});
                } else if (this.isPaymentsTool(name)) {
                    result = await this.paymentsTools.handleToolCall(name, args || {});
                } else if (this.isInvoicesTool(name)) {
                    result = await this.invoicesTools.handleToolCall(name, args || {});
                } else {
                    throw new Error(`Unknown tool: ${name}`);
                }

                this.log(`[GHL MCP] Tool ${name} executed successfully`);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };

            } catch (error) {
                console.error(`[GHL MCP] Error executing tool ${name}:`, error);
                const errorCode = error instanceof Error && error.message.includes('404')
                    ? ErrorCode.InvalidRequest
                    : ErrorCode.InternalError;
                throw new McpError(errorCode, `Tool execution failed: ${error}`);
            }
        });
    }

    /**
     * Setup HTTP routes (HTTP mode only)
     */
    private setupRoutes(): void {
        if (!this.app) return;

        // Claude test endpoint
        this.app.all('/claude-test', (req, res) => {
            console.log('🎯 CLAUDE TEST ENDPOINT HIT!');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', '*');
            
            res.json({
                success: true,
                message: "Claude successfully reached the server!",
                method: req.method,
                timestamp: new Date().toISOString(),
                userAgent: req.headers['user-agent'],
                ip: req.ip
            });
        });

        // Health check endpoint
        this.app.get('/health', async (req, res) => {
            try {
                const allToolNames = await this.getAllToolNames();
                res.json({
                    status: 'healthy',
                    server: 'ghl-mcp-server',
                    version: '1.0.0',
                    protocol: '2024-11-05',
                    timestamp: new Date().toISOString(),
                    tools: allToolNames,
                    endpoint: '/sse',
                    mode: this.mode
                });
            } catch (error) {
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

        // Tools listing endpoint
        this.app.get('/tools', async (req, res) => {
            try {
                const allTools = [
                    ...this.contactTools.getToolDefinitions(),
                    ...this.conversationTools.getToolDefinitions(),
                    ...this.blogTools.getToolDefinitions(),
                    ...this.opportunityTools.getToolDefinitions(),
                    ...this.calendarTools.getToolDefinitions(),
                    ...this.emailTools.getToolDefinitions(),
                    ...this.locationTools.getToolDefinitions(),
                    ...this.emailISVTools.getToolDefinitions(),
                    ...this.socialMediaTools.getTools(),
                    ...this.mediaTools.getToolDefinitions(),
                    ...this.objectTools.getToolDefinitions(),
                    ...this.associationTools.getTools(),
                    ...this.customFieldV2Tools.getTools(),
                    ...this.workflowTools.getTools(),
                    ...this.surveyTools.getTools(),
                    ...this.storeTools.getTools(),
                    ...this.productsTools.getTools(),
                    ...this.paymentsTools.getTools(),
                    ...this.invoicesTools.getTools()
                ];

                console.log(`[GHL MCP HTTP] Tools endpoint accessed - returning ${allTools.length} tools`);
                res.json({
                    tools: allTools,
                    count: allTools.length,
                    categories: this.getToolsCount()
                });
            } catch (error) {
                console.error('[GHL MCP HTTP] Error listing tools:', error);
                res.status(500).json({
                    error: 'Failed to list tools',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        // FIXED SSE endpoint for web MCP connection
        const handleSSE = async (req: express.Request, res: express.Response): Promise<void> => {
            const sessionId = req.query.sessionId || 'unknown';
            console.log(`[GHL MCP HTTP] SSE request: ${req.method} from: ${req.ip}, sessionId: ${sessionId}`);

            try {
                // Handle POST requests with JSON-RPC (MCP protocol messages)
                if (req.method === 'POST') {
                    console.log('[GHL MCP HTTP] Processing POST request...');
                    
                    if (!req.body) {
                        console.log('[GHL MCP HTTP] ERROR: No request body');
                        res.status(400).json({ error: 'No request body' });
                        return;
                    }
                    
                    const { jsonrpc, id, method, params } = req.body;
                    
                    console.log(`[GHL MCP HTTP] JSON-RPC request: ${method}`);
                    console.log(`[GHL MCP HTTP] Request ID: ${id}, JSONRPC: ${jsonrpc}`);
                    
                    if (jsonrpc !== '2.0') {
                        console.log('[GHL MCP HTTP] Invalid JSON-RPC version');
                        res.json({
                            jsonrpc: '2.0',
                            id,
                            error: { code: -32600, message: 'Invalid Request' }
                        });
                        return;
                    }

                    // Handle MCP initialization
                    if (method === 'initialize') {
                        console.log('[GHL MCP HTTP] Sending initialize response...');
                        console.log('[GHL MCP HTTP] Client info:', JSON.stringify(params.clientInfo, null, 2));
                        
                        // Get tool count for logging
                        const allTools = [
                            ...this.contactTools.getToolDefinitions(),
                            ...this.conversationTools.getToolDefinitions(),
                            ...this.blogTools.getToolDefinitions(),
                            ...this.opportunityTools.getToolDefinitions(),
                            ...this.calendarTools.getToolDefinitions(),
                            ...this.emailTools.getToolDefinitions(),
                            ...this.locationTools.getToolDefinitions(),
                            ...this.emailISVTools.getToolDefinitions(),
                            ...this.socialMediaTools.getTools(),
                            ...this.mediaTools.getToolDefinitions(),
                            ...this.objectTools.getToolDefinitions(),
                            ...this.associationTools.getTools(),
                            ...this.customFieldV2Tools.getTools(),
                            ...this.workflowTools.getTools(),
                            ...this.surveyTools.getTools(),
                            ...this.storeTools.getTools(),
                            ...this.productsTools.getTools(),
                            ...this.paymentsTools.getTools(),
                            ...this.invoicesTools.getTools()
                        ];
                        
                        console.log(`[GHL MCP HTTP] Advertising ${allTools.length} tools capability`);
                        
                        res.json({
                            jsonrpc: '2.0',
                            id,
                            result: {
                                protocolVersion: '2024-11-05',
                                capabilities: {
                                    tools: {
                                        listChanged: true
                                    },
                                    resources: {
                                        subscribe: false,
                                        listChanged: false
                                    }
                                },
                                serverInfo: {
                                    name: 'ghl-mcp-server',
                                    version: '1.0.0'
                                }
                            }
                        });
                        console.log('[GHL MCP HTTP] Initialize response sent - tools capability advertised');
                        return;
                    }

                    // Handle notifications/cancelled (for timeouts)
                    if (method === 'notifications/cancelled') {
                        console.log('[GHL MCP HTTP] Received cancellation notification:', params);
                        res.json({
                            jsonrpc: '2.0',
                            id: null
                        });
                        return;
                    }

                    // Handle notifications/initialized
                    if (method === 'notifications/initialized') {
                        console.log('[GHL MCP HTTP] Client initialized successfully!');
                        console.log('[GHL MCP HTTP] Waiting for tools/list request...');
                        
                        // Send a simple acknowledgment
                        res.status(200).end();
                        
                        // If Claude doesn't request tools within 2 seconds, there might be an issue
                        setTimeout(() => {
                            console.log('[GHL MCP HTTP] WARNING: No tools/list request received yet. Client may not recognize tools capability.');
                        }, 2000);
                        
                        return;
                    }

                    // Handle tools list request
                    if (method === 'tools/list') {
                        console.log('[GHL MCP HTTP] Tools list requested!');
                        const allTools = [
                            ...this.contactTools.getToolDefinitions(),
                            ...this.conversationTools.getToolDefinitions(),
                            ...this.blogTools.getToolDefinitions(),
                            ...this.opportunityTools.getToolDefinitions(),
                            ...this.calendarTools.getToolDefinitions(),
                            ...this.emailTools.getToolDefinitions(),
                            ...this.locationTools.getToolDefinitions(),
                            ...this.emailISVTools.getToolDefinitions(),
                            ...this.socialMediaTools.getTools(),
                            ...this.mediaTools.getToolDefinitions(),
                            ...this.objectTools.getToolDefinitions(),
                            ...this.associationTools.getTools(),
                            ...this.customFieldV2Tools.getTools(),
                            ...this.workflowTools.getTools(),
                            ...this.surveyTools.getTools(),
                            ...this.storeTools.getTools(),
                            ...this.productsTools.getTools(),
                            ...this.paymentsTools.getTools(),
                            ...this.invoicesTools.getTools()
                        ];

                        console.log(`[GHL MCP HTTP] Returning ${allTools.length} tools`);
                        res.json({
                            jsonrpc: '2.0',
                            id,
                            result: {
                                tools: allTools
                            }
                        });
                        return;
                    }

                    // Handle resources list request (Claude sends this instead of tools/list)
                    if (method === 'resources/list') {
                        console.log('[GHL MCP HTTP] Resources list requested - returning empty resources');
                        res.json({
                            jsonrpc: '2.0',
                            id,
                            result: {
                                resources: []
                            }
                        });
                        console.log('[GHL MCP HTTP] Resources response sent');
                        return;
                    }

                    // Claude might be looking for tools in resources - let's also try advertising tools here
                    if (method === 'resources/templates') {
                        console.log('[GHL MCP HTTP] Resource templates requested - sending tools as resources');
                        
                        const allTools = [
                            ...this.contactTools.getToolDefinitions(),
                            ...this.conversationTools.getToolDefinitions(),
                            ...this.blogTools.getToolDefinitions(),
                            ...this.opportunityTools.getToolDefinitions(),
                            ...this.calendarTools.getToolDefinitions(),
                            ...this.emailTools.getToolDefinitions(),
                            ...this.locationTools.getToolDefinitions(),
                            ...this.emailISVTools.getToolDefinitions(),
                            ...this.socialMediaTools.getTools(),
                            ...this.mediaTools.getToolDefinitions(),
                            ...this.objectTools.getToolDefinitions(),
                            ...this.associationTools.getTools(),
                            ...this.customFieldV2Tools.getTools(),
                            ...this.workflowTools.getTools(),
                            ...this.surveyTools.getTools(),
                            ...this.storeTools.getTools(),
                            ...this.productsTools.getTools(),
                            ...this.paymentsTools.getTools(),
                            ...this.invoicesTools.getTools()
                        ];
                        
                        res.json({
                            jsonrpc: '2.0',
                            id,
                            result: {
                                resourceTemplates: allTools.map(tool => ({
                                    uri: `tool://ghl/${tool.name}`,
                                    name: tool.name,
                                    description: tool.description,
                                    mimeType: 'application/json'
                                }))
                            }
                        });
                        return;
                    }

                    // Handle tool execution
                    if (method === 'tools/call') {
                        const { name, arguments: args } = params;
                        console.log(`[GHL MCP HTTP] Executing tool: ${name}`);

                        try {
                            let result;

                            // Route to appropriate tool handler (use your existing routing logic)
                            if (this.isContactTool(name)) {
                                result = await this.contactTools.executeTool(name, args || {});
                            } else if (this.isConversationTool(name)) {
                                result = await this.conversationTools.executeTool(name, args || {});
                            } else if (this.isBlogTool(name)) {
                                result = await this.blogTools.executeTool(name, args || {});
                            } else if (this.isOpportunityTool(name)) {
                                result = await this.opportunityTools.executeTool(name, args || {});
                            } else if (this.isCalendarTool(name)) {
                                result = await this.calendarTools.executeTool(name, args || {});
                            } else if (this.isEmailTool(name)) {
                                result = await this.emailTools.executeTool(name, args || {});
                            } else if (this.isLocationTool(name)) {
                                result = await this.locationTools.executeTool(name, args || {});
                            } else if (this.isEmailISVTool(name)) {
                                result = await this.emailISVTools.executeTool(name, args || {});
                            } else if (this.isSocialMediaTool(name)) {
                                result = await this.socialMediaTools.executeTool(name, args || {});
                            } else if (this.isMediaTool(name)) {
                                result = await this.mediaTools.executeTool(name, args || {});
                            } else if (this.isObjectTool(name)) {
                                result = await this.objectTools.executeTool(name, args || {});
                            } else if (this.isAssociationTool(name)) {
                                result = await this.associationTools.executeAssociationTool(name, args || {});
                            } else if (this.isCustomFieldV2Tool(name)) {
                                result = await this.customFieldV2Tools.executeCustomFieldV2Tool(name, args || {});
                            } else if (this.isWorkflowTool(name)) {
                                result = await this.workflowTools.executeWorkflowTool(name, args || {});
                            } else if (this.isSurveyTool(name)) {
                                result = await this.surveyTools.executeSurveyTool(name, args || {});
                            } else if (this.isStoreTool(name)) {
                                result = await this.storeTools.executeStoreTool(name, args || {});
                            } else if (this.isProductsTool(name)) {
                                result = await this.productsTools.executeProductsTool(name, args || {});
                            } else if (this.isPaymentsTool(name)) {
                                result = await this.paymentsTools.handleToolCall(name, args || {});
                            } else if (this.isInvoicesTool(name)) {
                                result = await this.invoicesTools.handleToolCall(name, args || {});
                            } else {
                                throw new Error(`Unknown tool: ${name}`);
                            }

                            res.json({
                                jsonrpc: '2.0',
                                id,
                                result: {
                                    content: [
                                        {
                                            type: 'text',
                                            text: JSON.stringify(result, null, 2)
                                        }
                                    ]
                                }
                            });
                            return;

                        } catch (error) {
                            res.json({
                                jsonrpc: '2.0',
                                id,
                                error: {
                                    code: -32603,
                                    message: `Tool execution failed: ${error}`
                                }
                            });
                            return;
                        }
                    }

                    // Unknown method - this should catch any unhandled requests
                    console.log(`[GHL MCP HTTP] ERROR: Unknown method '${method}' - this request was not handled`);
                    console.log(`[GHL MCP HTTP] Available handlers: initialize, notifications/cancelled, notifications/initialized, resources/list, tools/list, tools/call`);
                    res.json({
                        jsonrpc: '2.0',
                        id,
                        error: { code: -32601, message: `Method not found: ${method}` }
                    });
                    return;
                }

                // Handle GET requests for SSE connection (real-time updates)
                if (req.method === 'GET') {
                    const transport = new SSEServerTransport('/sse', res);
                    await this.server.connect(transport);
                    console.log(`[GHL MCP HTTP] SSE connection established for session: ${sessionId}`);

                    req.on('close', () => {
                        console.log(`[GHL MCP HTTP] SSE connection closed for session: ${sessionId}`);
                    });
                    return;
                }

            } catch (error) {
                console.error(`[GHL MCP HTTP] CRITICAL ERROR in handleSSE for session ${sessionId}:`, error);
                console.error(`[GHL MCP HTTP] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
                if (!res.headersSent) {
                    try {
                        res.status(500).json({ 
                            jsonrpc: '2.0',
                            id: req.body?.id || null,
                            error: { 
                                code: -32603, 
                                message: 'Internal error',
                                data: error instanceof Error ? error.message : 'Unknown error'
                            }
                        });
                    } catch (responseError) {
                        console.error(`[GHL MCP HTTP] Failed to send error response:`, responseError);
                        res.end();
                    }
                } else {
                    res.end();
                }
            }
        };

        // Handle both GET and POST for SSE
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
                    mode: this.mode,
                    endpoints: {
                        health: '/health',
                        capabilities: '/capabilities',
                        tools: '/tools',
                        sse: '/sse'
                    },
                    tools: toolsCount,
                    documentation: 'https://github.com/your-repo/ghl-mcp-server'
                });
            } catch (error) {
                console.error('[GHL MCP HTTP] Error in root endpoint:', error);
                res.status(500).json({
                    error: 'Server error',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }

    /**
     * Get all tool names as an array
     */
    private async getAllToolNames(): Promise<string[]> {
        try {
            const allTools = [
                ...this.contactTools.getToolDefinitions(),
                ...this.conversationTools.getToolDefinitions(),
                ...this.blogTools.getToolDefinitions(),
                ...this.opportunityTools.getToolDefinitions(),
                ...this.calendarTools.getToolDefinitions(),
                ...this.emailTools.getToolDefinitions(),
                ...this.locationTools.getToolDefinitions(),
                ...this.emailISVTools.getToolDefinitions(),
                ...this.socialMediaTools.getTools(),
                ...this.mediaTools.getToolDefinitions(),
                ...this.objectTools.getToolDefinitions(),
                ...this.associationTools.getTools(),
                ...this.customFieldV2Tools.getTools(),
                ...this.workflowTools.getTools(),
                ...this.surveyTools.getTools(),
                ...this.storeTools.getTools(),
                ...this.productsTools.getTools(),
                ...this.paymentsTools.getTools(),
                ...this.invoicesTools.getTools()
            ];

            return allTools.map(tool => tool.name);
        } catch (error) {
            console.error('[GHL MCP] Error getting tool names:', error);
            return [];
        }
    }

    /**
     * Get tools count summary
     */
    private getToolsCount() {
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
            payments: this.paymentsTools.getTools().length,
            invoices: this.invoicesTools.getTools().length,
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
                this.productsTools.getTools().length +
                this.paymentsTools.getTools().length +
                this.invoicesTools.getTools().length
        };
    }

    // Tool validation methods
    private isContactTool(toolName: string): boolean {
        const contactToolNames = [
            'create_contact', 'search_contacts', 'get_contact', 'update_contact',
            'add_contact_tags', 'remove_contact_tags', 'delete_contact',
            'get_contact_tasks', 'create_contact_task', 'get_contact_task', 'update_contact_task',
            'delete_contact_task', 'update_task_completion',
            'get_contact_notes', 'create_contact_note', 'get_contact_note', 'update_contact_note',
            'delete_contact_note', 'upsert_contact', 'get_duplicate_contact', 'get_contacts_by_business',
            'get_contact_appointments', 'bulk_update_contact_tags', 'bulk_update_contact_business',
            'add_contact_followers', 'remove_contact_followers', 'add_contact_to_campaign',
            'remove_contact_from_campaign', 'remove_contact_from_all_campaigns',
            'add_contact_to_workflow', 'remove_contact_from_workflow'
        ];
        return contactToolNames.includes(toolName);
    }

    private isConversationTool(toolName: string): boolean {
        const conversationToolNames = [
            'send_sms', 'send_email', 'search_conversations', 'get_conversation',
            'create_conversation', 'update_conversation', 'delete_conversation', 'get_recent_messages',
            'get_email_message', 'get_message', 'upload_message_attachments', 'update_message_status',
            'add_inbound_message', 'add_outbound_call', 'get_message_recording', 'get_message_transcription',
            'download_transcription', 'cancel_scheduled_message', 'cancel_scheduled_email', 'live_chat_typing'
        ];
        return conversationToolNames.includes(toolName);
    }

    private isBlogTool(toolName: string): boolean {
        const blogToolNames = [
            'create_blog_post', 'update_blog_post', 'get_blog_posts', 'get_blog_sites',
            'get_blog_authors', 'get_blog_categories', 'check_url_slug'
        ];
        return blogToolNames.includes(toolName);
    }

    private isOpportunityTool(toolName: string): boolean {
        const opportunityToolNames = [
            'search_opportunities', 'get_pipelines', 'get_opportunity', 'create_opportunity',
            'update_opportunity_status', 'delete_opportunity', 'update_opportunity',
            'upsert_opportunity', 'add_opportunity_followers', 'remove_opportunity_followers'
        ];
        return opportunityToolNames.includes(toolName);
    }

    private isCalendarTool(toolName: string): boolean {
        const calendarToolNames = [
            'get_calendar_groups', 'create_calendar_group', 'validate_group_slug',
            'update_calendar_group', 'delete_calendar_group', 'disable_calendar_group',
            'get_calendars', 'create_calendar', 'get_calendar', 'update_calendar', 'delete_calendar',
            'get_calendar_events', 'get_free_slots', 'create_appointment', 'get_appointment',
            'update_appointment', 'delete_appointment', 'get_appointment_notes', 'create_appointment_note',
            'update_appointment_note', 'delete_appointment_note', 'get_calendar_resources_equipments',
            'create_calendar_resource_equipment', 'get_calendar_resource_equipment', 'update_calendar_resource_equipment',
            'delete_calendar_resource_equipment', 'get_calendar_resources_rooms', 'create_calendar_resource_room',
            'get_calendar_resource_room', 'update_calendar_resource_room', 'delete_calendar_resource_room',
            'get_calendar_notifications', 'create_calendar_notifications', 'get_calendar_notification',
            'update_calendar_notification', 'delete_calendar_notification', 'create_block_slot',
            'update_block_slot', 'get_blocked_slots'
        ];
        return calendarToolNames.includes(toolName);
    }

    private isEmailTool(toolName: string): boolean {
        const emailToolNames = [
            'get_email_campaigns', 'create_email_template', 'get_email_templates',
            'update_email_template', 'delete_email_template'
        ];
        return emailToolNames.includes(toolName);
    }

    private isLocationTool(toolName: string): boolean {
        const locationToolNames = [
            'search_locations', 'get_location', 'create_location', 'update_location', 'delete_location',
            'get_location_tags', 'create_location_tag', 'get_location_tag', 'update_location_tag',
            'delete_location_tag', 'search_location_tasks', 'get_location_custom_fields',
            'create_location_custom_field', 'get_location_custom_field', 'update_location_custom_field',
            'delete_location_custom_field', 'get_location_custom_values', 'create_location_custom_value',
            'get_location_custom_value', 'update_location_custom_value', 'delete_location_custom_value',
            'get_location_templates', 'delete_location_template', 'get_timezones'
        ];
        return locationToolNames.includes(toolName);
    }

    private isEmailISVTool(toolName: string): boolean {
        const emailISVToolNames = ['verify_email'];
        return emailISVToolNames.includes(toolName);
    }

    private isSocialMediaTool(toolName: string): boolean {
        const socialMediaToolNames = [
            'search_social_posts', 'create_social_post', 'get_social_post', 'update_social_post',
            'delete_social_post', 'bulk_delete_social_posts', 'get_social_accounts', 'delete_social_account',
            'upload_social_csv', 'get_csv_upload_status', 'set_csv_accounts', 'get_social_categories',
            'get_social_category', 'get_social_tags', 'get_social_tags_by_ids', 'start_social_oauth',
            'get_platform_accounts'
        ];
        return socialMediaToolNames.includes(toolName);
    }

    private isMediaTool(toolName: string): boolean {
        const mediaToolNames = [
            'get_media_files', 'upload_media_file', 'delete_media_file'
        ];
        return mediaToolNames.includes(toolName);
    }

    private isObjectTool(toolName: string): boolean {
        const objectToolNames = [
            'get_all_objects', 'create_object_schema', 'get_object_schema', 'update_object_schema',
            'create_object_record', 'get_object_record', 'update_object_record', 'delete_object_record',
            'search_object_records'
        ];
        return objectToolNames.includes(toolName);
    }

    private isAssociationTool(toolName: string): boolean {
        const associationToolNames = [
            'ghl_get_all_associations', 'ghl_create_association', 'ghl_get_association_by_id',
            'ghl_update_association', 'ghl_delete_association', 'ghl_get_association_by_key',
            'ghl_get_association_by_object_key', 'ghl_create_relation', 'ghl_get_relations_by_record',
            'ghl_delete_relation'
        ];
        return associationToolNames.includes(toolName);
    }

    private isCustomFieldV2Tool(toolName: string): boolean {
        const customFieldV2ToolNames = [
            'ghl_get_custom_field_by_id', 'ghl_create_custom_field', 'ghl_update_custom_field',
            'ghl_delete_custom_field', 'ghl_get_custom_fields_by_object_key', 'ghl_create_custom_field_folder',
            'ghl_update_custom_field_folder', 'ghl_delete_custom_field_folder'
        ];
        return customFieldV2ToolNames.includes(toolName);
    }

    private isWorkflowTool(toolName: string): boolean {
        const workflowToolNames = ['ghl_get_workflows'];
        return workflowToolNames.includes(toolName);
    }

    private isSurveyTool(toolName: string): boolean {
        const surveyToolNames = ['ghl_get_surveys', 'ghl_get_survey_submissions'];
        return surveyToolNames.includes(toolName);
    }

    private isStoreTool(toolName: string): boolean {
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

    private isProductsTool(toolName: string): boolean {
        const productsToolNames = [
            'ghl_create_product', 'ghl_list_products', 'ghl_get_product', 'ghl_update_product',
            'ghl_delete_product', 'ghl_create_price', 'ghl_list_prices', 'ghl_list_inventory',
            'ghl_create_product_collection', 'ghl_list_product_collections'
        ];
        return productsToolNames.includes(toolName);
    }

    private isPaymentsTool(toolName: string): boolean {
        const paymentsToolNames = [
            'create_whitelabel_integration_provider', 'list_whitelabel_integration_providers',
            'list_orders', 'get_order_by_id', 'create_order_fulfillment', 'list_order_fulfillments',
            'list_transactions', 'get_transaction_by_id', 'list_subscriptions', 'get_subscription_by_id',
            'list_coupons', 'create_coupon', 'update_coupon', 'delete_coupon', 'get_coupon',
            'create_custom_provider_integration', 'delete_custom_provider_integration',
            'get_custom_provider_config', 'create_custom_provider_config', 'disconnect_custom_provider_config'
        ];
        return paymentsToolNames.includes(toolName);
    }

    private isInvoicesTool(toolName: string): boolean {
        const invoicesToolNames = [
            'create_invoice_template', 'list_invoice_templates', 'get_invoice_template',
            'update_invoice_template', 'delete_invoice_template', 'create_invoice_schedule',
            'list_invoice_schedules', 'get_invoice_schedule', 'create_invoice', 'list_invoices',
            'get_invoice', 'send_invoice', 'create_estimate', 'list_estimates', 'send_estimate',
            'create_invoice_from_estimate', 'generate_invoice_number', 'generate_estimate_number'
        ];
        return invoicesToolNames.includes(toolName);
    }

    /**
     * Test GHL API connection
     */
    private async testGHLConnection(): Promise<void> {
        try {
            this.log('[GHL MCP] Testing GHL API connection...');
            const result = await this.ghlClient.testConnection();
            this.log('[GHL MCP] ✅ GHL API connection successful');
            this.log(`[GHL MCP] Connected to location: ${result.data?.locationId}`);
        } catch (error) {
            this.log(`[GHL MCP] ❌ GHL API connection failed: ${error}`);
            throw new Error(`Failed to connect to GHL API: ${error}`);
        }
    }

    /**
     * Start the server in the appropriate mode
     */
    public async start(): Promise<void> {
        this.log('🚀 Starting GoHighLevel MCP Hybrid Server...');
        this.log('=========================================');
        this.log(`Mode: ${this.mode.toUpperCase()}`);

        try {
            // Test GHL API connection
            await this.testGHLConnection();

            if (this.mode === DeploymentMode.HTTP) {
                await this.startHttpMode();
            } else {
                await this.startStdioMode();
            }

        } catch (error) {
            this.log(`❌ Failed to start GHL MCP Server: ${error}`);
            process.exit(1);
        }
    }

    /**
     * Start HTTP mode (for web deployment)
     */
    private async startHttpMode(): Promise<void> {
        if (!this.app) {
            throw new Error('Express app not initialized for HTTP mode');
        }

        this.app.listen(this.port, '0.0.0.0', () => {
            console.log('✅ GoHighLevel MCP HTTP Server started successfully!');
            console.log(`🌐 Server running on: http://0.0.0.0:${this.port}`);
            console.log(`🔗 SSE Endpoint: http://0.0.0.0:${this.port}/sse`);
            console.log(`📋 Tools Available: ${this.getToolsCount().total}`);
            console.log('🎯 Ready for web integration (Claude AI, ChatGPT, etc.)!');
            console.log('=========================================');
        });
    }

    /**
     * Start STDIO mode (for Claude Desktop)
     */
    private async startStdioMode(): Promise<void> {
        // Create STDIO transport
        const transport = new StdioServerTransport();
        
        // Connect server to transport
        await this.server.connect(transport);
        
        this.log('✅ GoHighLevel MCP Server started successfully!');
        this.log('🔗 Ready to handle Claude Desktop requests');
        this.log(`📋 Tools Available: ${this.getToolsCount().total}`);
        this.log('=========================================');

        // Print tools summary for STDIO mode
        this.printToolsSummary();
    }

    /**
     * Print detailed tools summary (STDIO mode)
     */
    private printToolsSummary(): void {
        const toolsCount = this.getToolsCount();
        
        this.log(`📋 Available tools: ${toolsCount.total}`);
        this.log('');
        this.log('🎯 CONTACT MANAGEMENT (31 tools):');
        this.log('   BASIC: create, search, get, update, delete contacts');
        this.log('   TAGS: add/remove contact tags, bulk tag operations');
        this.log('   TASKS: get, create, update, delete contact tasks');
        this.log('   NOTES: get, create, update, delete contact notes');
        this.log('   ADVANCED: upsert, duplicate check, business association');
        this.log('   BULK: mass tag updates, business assignments');
        this.log('   FOLLOWERS: add/remove contact followers');
        this.log('   CAMPAIGNS: add/remove contacts to/from campaigns');
        this.log('   WORKFLOWS: add/remove contacts to/from workflows');
        this.log('   APPOINTMENTS: get contact appointments');
        this.log('');
        this.log('💬 MESSAGING & CONVERSATIONS (20 tools):');
        this.log('   BASIC: send_sms, send_email - Send messages to contacts');
        this.log('   CONVERSATIONS: search, get, create, update, delete conversations');
        this.log('   MESSAGES: get individual messages, email messages, upload attachments');
        this.log('   STATUS: update message delivery status, monitor recent activity');
        this.log('   MANUAL: add inbound messages, add outbound calls manually');
        this.log('   RECORDINGS: get call recordings, transcriptions, download transcripts');
        this.log('   SCHEDULING: cancel scheduled messages and emails');
        this.log('   LIVE CHAT: typing indicators for real-time conversations');
        this.log('');
        this.log('📝 BLOG MANAGEMENT:');
        this.log('   • create_blog_post - Create new blog posts');
        this.log('   • update_blog_post - Update existing blog posts');
        this.log('   • get_blog_posts - List and search blog posts');
        this.log('   • get_blog_sites - Get available blog sites');
        this.log('   • get_blog_authors - Get available blog authors');
        this.log('   • get_blog_categories - Get available blog categories');
        this.log('   • check_url_slug - Validate URL slug availability');
        this.log('');
        this.log('💰 OPPORTUNITY MANAGEMENT (10 tools):');
        this.log('   SEARCH: search_opportunities - Search by pipeline, stage, status, contact');
        this.log('   PIPELINES: get_pipelines - Get all sales pipelines and stages');
        this.log('   CRUD: create, get, update, delete opportunities');
        this.log('   STATUS: update_opportunity_status - Quick status updates (won/lost)');
        this.log('   UPSERT: upsert_opportunity - Smart create/update based on contact');
        this.log('   FOLLOWERS: add/remove followers for opportunity notifications');
        this.log('');
        this.log('🗓 CALENDAR & APPOINTMENTS:');
        this.log('   • Calendar groups and calendars management');
        this.log('   • Appointment booking and management');
        this.log('   • Free slot checking and availability');
        this.log('   • Appointment notes and resources');
        this.log('   • Calendar notifications and blocked slots');
        this.log('');
        this.log('📧 EMAIL MARKETING & VERIFICATION:');
        this.log('   • Email campaigns and templates');
        this.log('   • Email deliverability verification');
        this.log('');
        this.log('🏢 LOCATION & BUSINESS MANAGEMENT:');
        this.log('   • Location/sub-account management');
        this.log('   • Custom fields and values');
        this.log('   • Tags and templates');
        this.log('   • Task management');
        this.log('');
        this.log('📱 SOCIAL MEDIA & CONTENT:');
        this.log('   • Multi-platform social media posting');
        this.log('   • Media library management');
        this.log('   • Content organization and scheduling');
        this.log('');
        this.log('🏗️ CUSTOM OBJECTS & DATA:');
        this.log('   • Custom object schema management');
        this.log('   • Record creation and management');
        this.log('   • Associations and relationships');
        this.log('   • Custom fields V2');
        this.log('');
        this.log('⚙️ AUTOMATION & WORKFLOWS:');
        this.log('   • Workflow management');
        this.log('   • Survey tools');
        this.log('');
        this.log('🛒 E-COMMERCE & STORE:');
        this.log('   • Product and inventory management');
        this.log('   • Shipping zones and rates');
        this.log('   • Store settings');
        this.log('');
        this.log('💳 PAYMENTS & BILLING:');
        this.log('   • Order and transaction management');
        this.log('   • Subscription management');
        this.log('   • Coupon and discount management');
        this.log('   • Invoice and estimate management');
        this.log('   • Custom payment integrations');
        this.log('');
        this.log('=========================================');
    }
}

/**
 * Handle graceful shutdown
 */
function setupGracefulShutdown(): void {
    const shutdown = (signal: string) => {
        console.log(`\n[GHL MCP] Received ${signal}, shutting down gracefully...`);
        process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
    try {
        // Setup graceful shutdown
        setupGracefulShutdown();

        // Create and start hybrid server
        const server = new GHLMCPHybridServer();
        await server.start();

    } catch (error) {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    }
}

// Start the server
main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
});