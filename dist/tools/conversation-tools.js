"use strict";
/**
 * MCP Conversation Tools for GoHighLevel Integration
 * Exposes messaging and conversation capabilities to ChatGPT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationTools = void 0;
/**
 * Conversation Tools Class
 * Implements MCP tools for messaging and conversation management
 */
class ConversationTools {
    ghlClient;
    constructor(ghlClient) {
        this.ghlClient = ghlClient;
    }
    /**
     * Get all conversation tool definitions for MCP server
     */
    getToolDefinitions() {
        return [
            {
                name: 'send_sms',
                description: 'Send an SMS message to a contact in GoHighLevel',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: {
                            type: 'string',
                            description: 'The unique ID of the contact to send SMS to'
                        },
                        message: {
                            type: 'string',
                            description: 'The SMS message content to send',
                            maxLength: 1600
                        },
                        fromNumber: {
                            type: 'string',
                            description: 'Optional: Phone number to send from (must be configured in GHL)'
                        }
                    },
                    required: ['contactId', 'message']
                }
            },
            {
                name: 'send_email',
                description: 'Send an email message to a contact in GoHighLevel',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: {
                            type: 'string',
                            description: 'The unique ID of the contact to send email to'
                        },
                        subject: {
                            type: 'string',
                            description: 'Email subject line'
                        },
                        message: {
                            type: 'string',
                            description: 'Plain text email content'
                        },
                        html: {
                            type: 'string',
                            description: 'HTML email content (optional, takes precedence over message)'
                        },
                        emailFrom: {
                            type: 'string',
                            description: 'Optional: Email address to send from (must be configured in GHL)',
                            format: 'email'
                        },
                        attachments: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Optional: Array of attachment URLs'
                        },
                        emailCc: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Optional: Array of CC email addresses'
                        },
                        emailBcc: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Optional: Array of BCC email addresses'
                        }
                    },
                    required: ['contactId', 'subject']
                }
            },
            {
                name: 'search_conversations',
                description: 'Search conversations in GoHighLevel with various filters',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: {
                            type: 'string',
                            description: 'Filter conversations for a specific contact'
                        },
                        query: {
                            type: 'string',
                            description: 'Search query to filter conversations'
                        },
                        status: {
                            type: 'string',
                            enum: ['all', 'read', 'unread', 'starred', 'recents'],
                            description: 'Filter conversations by read status',
                            default: 'all'
                        },
                        limit: {
                            type: 'number',
                            description: 'Maximum number of conversations to return (default: 20, max: 100)',
                            minimum: 1,
                            maximum: 100,
                            default: 20
                        },
                        assignedTo: {
                            type: 'string',
                            description: 'Filter by user ID assigned to conversations'
                        }
                    }
                }
            },
            {
                name: 'get_conversation',
                description: 'Get detailed conversation information including message history',
                inputSchema: {
                    type: 'object',
                    properties: {
                        conversationId: {
                            type: 'string',
                            description: 'The unique ID of the conversation to retrieve'
                        },
                        limit: {
                            type: 'number',
                            description: 'Maximum number of messages to return (default: 20)',
                            minimum: 1,
                            maximum: 100,
                            default: 20
                        },
                        messageTypes: {
                            type: 'array',
                            items: {
                                type: 'string',
                                enum: [
                                    'TYPE_SMS', 'TYPE_EMAIL', 'TYPE_CALL', 'TYPE_FACEBOOK',
                                    'TYPE_INSTAGRAM', 'TYPE_WHATSAPP', 'TYPE_LIVE_CHAT'
                                ]
                            },
                            description: 'Filter messages by type (optional)'
                        }
                    },
                    required: ['conversationId']
                }
            },
            {
                name: 'create_conversation',
                description: 'Create a new conversation with a contact',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: {
                            type: 'string',
                            description: 'The unique ID of the contact to create conversation with'
                        }
                    },
                    required: ['contactId']
                }
            },
            {
                name: 'update_conversation',
                description: 'Update conversation properties (star, mark read, etc.)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        conversationId: {
                            type: 'string',
                            description: 'The unique ID of the conversation to update'
                        },
                        starred: {
                            type: 'boolean',
                            description: 'Star or unstar the conversation'
                        },
                        unreadCount: {
                            type: 'number',
                            description: 'Set the unread message count (0 to mark as read)',
                            minimum: 0
                        }
                    },
                    required: ['conversationId']
                }
            },
            {
                name: 'get_recent_messages',
                description: 'Get recent messages across all conversations for monitoring',
                inputSchema: {
                    type: 'object',
                    properties: {
                        limit: {
                            type: 'number',
                            description: 'Maximum number of conversations to check (default: 10)',
                            minimum: 1,
                            maximum: 50,
                            default: 10
                        },
                        status: {
                            type: 'string',
                            enum: ['all', 'unread'],
                            description: 'Filter by conversation status',
                            default: 'unread'
                        }
                    }
                }
            },
            {
                name: 'delete_conversation',
                description: 'Delete a conversation permanently',
                inputSchema: {
                    type: 'object',
                    properties: {
                        conversationId: {
                            type: 'string',
                            description: 'The unique ID of the conversation to delete'
                        }
                    },
                    required: ['conversationId']
                }
            },
            // MESSAGE MANAGEMENT TOOLS
            {
                name: 'get_email_message',
                description: 'Get detailed email message information by email message ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        emailMessageId: {
                            type: 'string',
                            description: 'The unique ID of the email message to retrieve'
                        }
                    },
                    required: ['emailMessageId']
                }
            },
            {
                name: 'get_message',
                description: 'Get detailed message information by message ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        messageId: {
                            type: 'string',
                            description: 'The unique ID of the message to retrieve'
                        }
                    },
                    required: ['messageId']
                }
            },
            {
                name: 'upload_message_attachments',
                description: 'Upload file attachments for use in messages',
                inputSchema: {
                    type: 'object',
                    properties: {
                        conversationId: {
                            type: 'string',
                            description: 'The conversation ID to upload attachments for'
                        },
                        attachmentUrls: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Array of file URLs to upload as attachments'
                        }
                    },
                    required: ['conversationId', 'attachmentUrls']
                }
            },
            {
                name: 'update_message_status',
                description: 'Update the delivery status of a message',
                inputSchema: {
                    type: 'object',
                    properties: {
                        messageId: {
                            type: 'string',
                            description: 'The unique ID of the message to update'
                        },
                        status: {
                            type: 'string',
                            enum: ['delivered', 'failed', 'pending', 'read'],
                            description: 'New status for the message'
                        },
                        error: {
                            type: 'object',
                            description: 'Error details if status is failed',
                            properties: {
                                code: { type: 'string' },
                                type: { type: 'string' },
                                message: { type: 'string' }
                            }
                        },
                        emailMessageId: {
                            type: 'string',
                            description: 'Email message ID if updating email status'
                        },
                        recipients: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Email delivery status for additional recipients'
                        }
                    },
                    required: ['messageId', 'status']
                }
            },
            // MANUAL MESSAGE CREATION TOOLS
            {
                name: 'add_inbound_message',
                description: 'Manually add an inbound message to a conversation',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            enum: ['SMS', 'Email', 'WhatsApp', 'GMB', 'IG', 'FB', 'Custom', 'WebChat', 'Live_Chat', 'Call'],
                            description: 'Type of inbound message to add'
                        },
                        conversationId: {
                            type: 'string',
                            description: 'The conversation to add the message to'
                        },
                        conversationProviderId: {
                            type: 'string',
                            description: 'Conversation provider ID for the message'
                        },
                        message: {
                            type: 'string',
                            description: 'Message content (for text-based messages)'
                        },
                        attachments: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Array of attachment URLs'
                        },
                        html: {
                            type: 'string',
                            description: 'HTML content for email messages'
                        },
                        subject: {
                            type: 'string',
                            description: 'Subject line for email messages'
                        },
                        emailFrom: {
                            type: 'string',
                            description: 'From email address'
                        },
                        emailTo: {
                            type: 'string',
                            description: 'To email address'
                        },
                        emailCc: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'CC email addresses'
                        },
                        emailBcc: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'BCC email addresses'
                        },
                        emailMessageId: {
                            type: 'string',
                            description: 'Email message ID for threading'
                        },
                        altId: {
                            type: 'string',
                            description: 'External provider message ID'
                        },
                        date: {
                            type: 'string',
                            description: 'Date of the message (ISO format)'
                        },
                        call: {
                            type: 'object',
                            description: 'Call details for call-type messages',
                            properties: {
                                to: { type: 'string', description: 'Called number' },
                                from: { type: 'string', description: 'Caller number' },
                                status: {
                                    type: 'string',
                                    enum: ['pending', 'completed', 'answered', 'busy', 'no-answer', 'failed', 'canceled', 'voicemail'],
                                    description: 'Call status'
                                }
                            }
                        }
                    },
                    required: ['type', 'conversationId', 'conversationProviderId']
                }
            },
            {
                name: 'add_outbound_call',
                description: 'Manually add an outbound call record to a conversation',
                inputSchema: {
                    type: 'object',
                    properties: {
                        conversationId: {
                            type: 'string',
                            description: 'The conversation to add the call to'
                        },
                        conversationProviderId: {
                            type: 'string',
                            description: 'Conversation provider ID for the call'
                        },
                        to: {
                            type: 'string',
                            description: 'Called phone number'
                        },
                        from: {
                            type: 'string',
                            description: 'Caller phone number'
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'completed', 'answered', 'busy', 'no-answer', 'failed', 'canceled', 'voicemail'],
                            description: 'Call completion status'
                        },
                        attachments: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Array of attachment URLs'
                        },
                        altId: {
                            type: 'string',
                            description: 'External provider call ID'
                        },
                        date: {
                            type: 'string',
                            description: 'Date of the call (ISO format)'
                        }
                    },
                    required: ['conversationId', 'conversationProviderId', 'to', 'from', 'status']
                }
            },
            // CALL RECORDING & TRANSCRIPTION TOOLS
            {
                name: 'get_message_recording',
                description: 'Get call recording audio for a message',
                inputSchema: {
                    type: 'object',
                    properties: {
                        messageId: {
                            type: 'string',
                            description: 'The unique ID of the call message to get recording for'
                        }
                    },
                    required: ['messageId']
                }
            },
            {
                name: 'get_message_transcription',
                description: 'Get call transcription text for a message',
                inputSchema: {
                    type: 'object',
                    properties: {
                        messageId: {
                            type: 'string',
                            description: 'The unique ID of the call message to get transcription for'
                        }
                    },
                    required: ['messageId']
                }
            },
            {
                name: 'download_transcription',
                description: 'Download call transcription as a text file',
                inputSchema: {
                    type: 'object',
                    properties: {
                        messageId: {
                            type: 'string',
                            description: 'The unique ID of the call message to download transcription for'
                        }
                    },
                    required: ['messageId']
                }
            },
            // SCHEDULING MANAGEMENT TOOLS
            {
                name: 'cancel_scheduled_message',
                description: 'Cancel a scheduled message before it is sent',
                inputSchema: {
                    type: 'object',
                    properties: {
                        messageId: {
                            type: 'string',
                            description: 'The unique ID of the scheduled message to cancel'
                        }
                    },
                    required: ['messageId']
                }
            },
            {
                name: 'cancel_scheduled_email',
                description: 'Cancel a scheduled email before it is sent',
                inputSchema: {
                    type: 'object',
                    properties: {
                        emailMessageId: {
                            type: 'string',
                            description: 'The unique ID of the scheduled email to cancel'
                        }
                    },
                    required: ['emailMessageId']
                }
            },
            // LIVE CHAT TOOLS
            {
                name: 'live_chat_typing',
                description: 'Send typing indicator for live chat conversations',
                inputSchema: {
                    type: 'object',
                    properties: {
                        visitorId: {
                            type: 'string',
                            description: 'Unique visitor ID for the live chat session'
                        },
                        conversationId: {
                            type: 'string',
                            description: 'The conversation ID for the live chat'
                        },
                        isTyping: {
                            type: 'boolean',
                            description: 'Whether the agent is currently typing'
                        }
                    },
                    required: ['visitorId', 'conversationId', 'isTyping']
                }
            }
        ];
    }
    /**
     * Execute conversation tool based on tool name and arguments
     */
    async executeTool(name, args) {
        switch (name) {
            case 'send_sms':
                return this.sendSMS(args);
            case 'send_email':
                return this.sendEmail(args);
            case 'search_conversations':
                return this.searchConversations(args);
            case 'get_conversation':
                return this.getConversation(args);
            case 'create_conversation':
                return this.createConversation(args);
            case 'update_conversation':
                return this.updateConversation(args);
            case 'get_recent_messages':
                return this.getRecentMessages(args);
            case 'delete_conversation':
                return this.deleteConversation(args);
            case 'get_email_message':
                return this.getEmailMessage(args);
            case 'get_message':
                return this.getMessage(args);
            case 'upload_message_attachments':
                return this.uploadMessageAttachments(args);
            case 'update_message_status':
                return this.updateMessageStatus(args);
            case 'add_inbound_message':
                return this.addInboundMessage(args);
            case 'add_outbound_call':
                return this.addOutboundCall(args);
            case 'get_message_recording':
                return this.getMessageRecording(args);
            case 'get_message_transcription':
                return this.getMessageTranscription(args);
            case 'download_transcription':
                return this.downloadTranscription(args);
            case 'cancel_scheduled_message':
                return this.cancelScheduledMessage(args);
            case 'cancel_scheduled_email':
                return this.cancelScheduledEmail(args);
            case 'live_chat_typing':
                return this.liveChatTyping(args);
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    /**
     * SEND SMS
     */
    async sendSMS(params) {
        try {
            const response = await this.ghlClient.sendSMS(params.contactId, params.message, params.fromNumber);
            const result = response.data;
            return {
                success: true,
                messageId: result.messageId,
                conversationId: result.conversationId,
                message: `SMS sent successfully to contact ${params.contactId}`
            };
        }
        catch (error) {
            throw new Error(`Failed to send SMS: ${error}`);
        }
    }
    /**
     * SEND EMAIL
     */
    async sendEmail(params) {
        try {
            const response = await this.ghlClient.sendEmail(params.contactId, params.subject, params.message, params.html, {
                emailFrom: params.emailFrom,
                emailCc: params.emailCc,
                emailBcc: params.emailBcc,
                attachments: params.attachments
            });
            const result = response.data;
            return {
                success: true,
                messageId: result.messageId,
                conversationId: result.conversationId,
                emailMessageId: result.emailMessageId,
                message: `Email sent successfully to contact ${params.contactId}`
            };
        }
        catch (error) {
            throw new Error(`Failed to send email: ${error}`);
        }
    }
    /**
     * SEARCH CONVERSATIONS
     */
    async searchConversations(params) {
        try {
            const searchParams = {
                locationId: this.ghlClient.getConfig().locationId,
                contactId: params.contactId,
                query: params.query,
                status: params.status || 'all',
                limit: params.limit || 20,
                assignedTo: params.assignedTo
            };
            const response = await this.ghlClient.searchConversations(searchParams);
            const data = response.data;
            return {
                success: true,
                conversations: data.conversations,
                total: data.total,
                message: `Found ${data.conversations.length} conversations (${data.total} total)`
            };
        }
        catch (error) {
            throw new Error(`Failed to search conversations: ${error}`);
        }
    }
    /**
     * GET CONVERSATION
     */
    async getConversation(params) {
        try {
            // Get conversation details
            const conversationResponse = await this.ghlClient.getConversation(params.conversationId);
            const conversation = conversationResponse.data;
            // Get messages
            const messagesResponse = await this.ghlClient.getConversationMessages(params.conversationId, {
                limit: params.limit || 20,
                type: params.messageTypes?.join(',')
            });
            const messagesData = messagesResponse.data;
            return {
                success: true,
                conversation,
                messages: messagesData.messages,
                hasMoreMessages: messagesData.nextPage,
                message: `Retrieved conversation with ${messagesData.messages.length} messages`
            };
        }
        catch (error) {
            throw new Error(`Failed to get conversation: ${error}`);
        }
    }
    /**
     * CREATE CONVERSATION
     */
    async createConversation(params) {
        try {
            const response = await this.ghlClient.createConversation({
                locationId: this.ghlClient.getConfig().locationId,
                contactId: params.contactId
            });
            const result = response.data;
            return {
                success: true,
                conversationId: result.id,
                message: `Conversation created successfully with contact ${params.contactId}`
            };
        }
        catch (error) {
            throw new Error(`Failed to create conversation: ${error}`);
        }
    }
    /**
     * UPDATE CONVERSATION
     */
    async updateConversation(params) {
        try {
            const updateData = {
                locationId: this.ghlClient.getConfig().locationId,
                starred: params.starred,
                unreadCount: params.unreadCount
            };
            const response = await this.ghlClient.updateConversation(params.conversationId, updateData);
            return {
                success: true,
                conversation: response.data,
                message: `Conversation updated successfully`
            };
        }
        catch (error) {
            throw new Error(`Failed to update conversation: ${error}`);
        }
    }
    /**
     * GET RECENT MESSAGES
     */
    async getRecentMessages(params) {
        try {
            const status = (params.status === 'all' || params.status === 'unread') ? params.status : 'unread';
            const searchParams = {
                locationId: this.ghlClient.getConfig().locationId,
                limit: params.limit || 10,
                status,
                sortBy: 'last_message_date',
                sort: 'desc'
            };
            const response = await this.ghlClient.searchConversations(searchParams);
            const data = response.data;
            // Enhance with recent message details
            const enhancedConversations = data.conversations.map(conv => ({
                conversationId: conv.id,
                contactName: conv.fullName || conv.contactName,
                contactEmail: conv.email,
                contactPhone: conv.phone,
                lastMessageBody: conv.lastMessageBody,
                lastMessageType: conv.lastMessageType,
                unreadCount: conv.unreadCount,
                starred: conv.starred
            }));
            return {
                success: true,
                conversations: enhancedConversations,
                message: `Retrieved ${enhancedConversations.length} recent conversations`
            };
        }
        catch (error) {
            throw new Error(`Failed to get recent messages: ${error}`);
        }
    }
    async deleteConversation(params) {
        try {
            const response = await this.ghlClient.deleteConversation(params.conversationId);
            return {
                success: true,
                message: `Conversation deleted successfully`
            };
        }
        catch (error) {
            throw new Error(`Failed to delete conversation: ${error}`);
        }
    }
    async getEmailMessage(params) {
        try {
            const response = await this.ghlClient.getEmailMessage(params.emailMessageId);
            const emailMessage = response.data;
            return {
                success: true,
                emailMessage,
                message: `Retrieved email message with ID ${params.emailMessageId}`
            };
        }
        catch (error) {
            throw new Error(`Failed to get email message: ${error}`);
        }
    }
    async getMessage(params) {
        try {
            const response = await this.ghlClient.getMessage(params.messageId);
            const messageData = response.data;
            return {
                success: true,
                messageData,
                message: `Retrieved message with ID ${params.messageId}`
            };
        }
        catch (error) {
            throw new Error(`Failed to get message: ${error}`);
        }
    }
    async uploadMessageAttachments(params) {
        try {
            const uploadData = {
                conversationId: params.conversationId,
                locationId: this.ghlClient.getConfig().locationId,
                attachmentUrls: params.attachmentUrls
            };
            const response = await this.ghlClient.uploadMessageAttachments(uploadData);
            const result = response.data;
            return {
                success: true,
                uploadedFiles: result.uploadedFiles,
                message: `Attachments uploaded successfully to conversation ${params.conversationId}`
            };
        }
        catch (error) {
            throw new Error(`Failed to upload message attachments: ${error}`);
        }
    }
    async updateMessageStatus(params) {
        try {
            const statusData = {
                status: params.status,
                error: params.error,
                emailMessageId: params.emailMessageId,
                recipients: params.recipients
            };
            const response = await this.ghlClient.updateMessageStatus(params.messageId, statusData);
            return {
                success: true,
                message: `Message status updated to ${params.status} successfully`
            };
        }
        catch (error) {
            throw new Error(`Failed to update message status: ${error}`);
        }
    }
    async addInboundMessage(params) {
        try {
            const messageData = {
                type: params.type,
                conversationId: params.conversationId,
                conversationProviderId: params.conversationProviderId,
                message: params.message,
                attachments: params.attachments,
                html: params.html,
                subject: params.subject,
                emailFrom: params.emailFrom,
                emailTo: params.emailTo,
                emailCc: params.emailCc,
                emailBcc: params.emailBcc,
                emailMessageId: params.emailMessageId,
                altId: params.altId,
                date: params.date,
                call: params.call
            };
            const response = await this.ghlClient.addInboundMessage(messageData);
            const result = response.data;
            return {
                success: true,
                messageId: result.messageId,
                conversationId: result.conversationId,
                message: `Inbound message added successfully to conversation ${params.conversationId}`
            };
        }
        catch (error) {
            throw new Error(`Failed to add inbound message: ${error}`);
        }
    }
    async addOutboundCall(params) {
        try {
            const callData = {
                type: 'Call',
                conversationId: params.conversationId,
                conversationProviderId: params.conversationProviderId,
                attachments: params.attachments,
                altId: params.altId,
                date: params.date,
                call: {
                    to: params.to,
                    from: params.from,
                    status: params.status
                }
            };
            const response = await this.ghlClient.addOutboundCall(callData);
            const result = response.data;
            return {
                success: true,
                messageId: result.messageId,
                conversationId: result.conversationId,
                message: `Outbound call added successfully to conversation ${params.conversationId}`
            };
        }
        catch (error) {
            throw new Error(`Failed to add outbound call: ${error}`);
        }
    }
    async getMessageRecording(params) {
        try {
            const response = await this.ghlClient.getMessageRecording(params.messageId);
            const recording = response.data;
            return {
                success: true,
                recording: recording.audioData,
                contentType: recording.contentType,
                message: `Retrieved call recording for message ${params.messageId}`
            };
        }
        catch (error) {
            throw new Error(`Failed to get message recording: ${error}`);
        }
    }
    async getMessageTranscription(params) {
        try {
            const response = await this.ghlClient.getMessageTranscription(params.messageId);
            const transcriptionData = response.data;
            return {
                success: true,
                transcriptions: transcriptionData.transcriptions,
                message: `Retrieved call transcription for message ${params.messageId}`
            };
        }
        catch (error) {
            throw new Error(`Failed to get message transcription: ${error}`);
        }
    }
    async downloadTranscription(params) {
        try {
            const response = await this.ghlClient.downloadMessageTranscription(params.messageId);
            const transcription = response.data;
            return {
                success: true,
                transcription,
                message: `Downloaded call transcription for message ${params.messageId}`
            };
        }
        catch (error) {
            throw new Error(`Failed to download transcription: ${error}`);
        }
    }
    async cancelScheduledMessage(params) {
        try {
            const response = await this.ghlClient.cancelScheduledMessage(params.messageId);
            const result = response.data;
            return {
                success: true,
                status: result.status,
                message: result.message || `Scheduled message cancelled successfully`
            };
        }
        catch (error) {
            throw new Error(`Failed to cancel scheduled message: ${error}`);
        }
    }
    async cancelScheduledEmail(params) {
        try {
            const response = await this.ghlClient.cancelScheduledEmail(params.emailMessageId);
            const result = response.data;
            return {
                success: true,
                status: result.status,
                message: result.message || `Scheduled email cancelled successfully`
            };
        }
        catch (error) {
            throw new Error(`Failed to cancel scheduled email: ${error}`);
        }
    }
    async liveChatTyping(params) {
        try {
            const typingData = {
                locationId: this.ghlClient.getConfig().locationId,
                isTyping: params.isTyping,
                visitorId: params.visitorId,
                conversationId: params.conversationId
            };
            const response = await this.ghlClient.liveChatTyping(typingData);
            const result = response.data;
            return {
                success: result.success,
                message: `Live chat typing indicator ${params.isTyping ? 'enabled' : 'disabled'} successfully`
            };
        }
        catch (error) {
            throw new Error(`Failed to send live chat typing indicator: ${error}`);
        }
    }
}
exports.ConversationTools = ConversationTools;
