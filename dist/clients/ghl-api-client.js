"use strict";
/**
 * GoHighLevel API Client
 * Implements exact API endpoints from OpenAPI specifications v2021-07-28 (Contacts) and v2021-04-15 (Conversations)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GHLApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * GoHighLevel API Client
 * Handles all API communication with GHL services
 */
class GHLApiClient {
    axiosInstance;
    config;
    constructor(config) {
        this.config = config;
        // Create axios instance with base configuration
        this.axiosInstance = axios_1.default.create({
            baseURL: config.baseUrl,
            headers: {
                'Authorization': `Bearer ${config.accessToken}`,
                'Version': config.version,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000 // 30 second timeout
        });
        // Add request interceptor for logging
        this.axiosInstance.interceptors.request.use((config) => {
            process.stderr.write(`[GHL API] ${config.method?.toUpperCase()} ${config.url}\n`);
            return config;
        }, (error) => {
            console.error('[GHL API] Request error:', error);
            return Promise.reject(error);
        });
        // Add response interceptor for error handling
        this.axiosInstance.interceptors.response.use((response) => {
            process.stderr.write(`[GHL API] Response ${response.status}: ${response.config.url}\n`);
            return response;
        }, (error) => {
            console.error('[GHL API] Response error:', {
                status: error.response?.status,
                message: error.response?.data?.message,
                url: error.config?.url
            });
            return Promise.reject(this.handleApiError(error));
        });
    }
    /**
     * Handle API errors and convert to standardized format
     */
    handleApiError(error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message || 'Unknown error';
        const errorMessage = Array.isArray(message) ? message.join(', ') : message;
        return new Error(`GHL API Error (${status}): ${errorMessage}`);
    }
    /**
     * Wrap API responses in standardized format
     */
    wrapResponse(data) {
        return {
            success: true,
            data
        };
    }
    /**
     * Create custom headers for different API versions
     */
    getConversationHeaders() {
        return {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Version': '2021-04-15', // Conversations API uses different version
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }
    /**
     * CONTACTS API METHODS
     */
    /**
     * Create a new contact
     * POST /contacts/
     */
    async createContact(contactData) {
        try {
            // Ensure locationId is set
            const payload = {
                ...contactData,
                locationId: contactData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.post('/contacts/', payload);
            return this.wrapResponse(response.data.contact);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get contact by ID
     * GET /contacts/{contactId}
     */
    async getContact(contactId) {
        try {
            const response = await this.axiosInstance.get(`/contacts/${contactId}`);
            return this.wrapResponse(response.data.contact);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update existing contact
     * PUT /contacts/{contactId}
     */
    async updateContact(contactId, updates) {
        try {
            const response = await this.axiosInstance.put(`/contacts/${contactId}`, updates);
            return this.wrapResponse(response.data.contact);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Delete contact
     * DELETE /contacts/{contactId}
     */
    async deleteContact(contactId) {
        try {
            const response = await this.axiosInstance.delete(`/contacts/${contactId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Search contacts with advanced filters
     * POST /contacts/search
     */
    async searchContacts(searchParams) {
        try {
            // Build minimal request body with only required/supported parameters
            // Start with just locationId and pageLimit as per API requirements
            const payload = {
                locationId: searchParams.locationId || this.config.locationId,
                pageLimit: searchParams.limit || 25
            };
            // Only add optional parameters if they have valid values
            if (searchParams.query && searchParams.query.trim()) {
                payload.query = searchParams.query.trim();
            }
            if (searchParams.startAfterId && searchParams.startAfterId.trim()) {
                payload.startAfterId = searchParams.startAfterId.trim();
            }
            if (searchParams.startAfter && typeof searchParams.startAfter === 'number') {
                payload.startAfter = searchParams.startAfter;
            }
            // Only add filters if we have valid filter values
            if (searchParams.filters) {
                const filters = {};
                let hasFilters = false;
                if (searchParams.filters.email && searchParams.filters.email.trim()) {
                    filters.email = searchParams.filters.email.trim();
                    hasFilters = true;
                }
                if (searchParams.filters.phone && searchParams.filters.phone.trim()) {
                    filters.phone = searchParams.filters.phone.trim();
                    hasFilters = true;
                }
                if (searchParams.filters.tags && Array.isArray(searchParams.filters.tags) && searchParams.filters.tags.length > 0) {
                    filters.tags = searchParams.filters.tags;
                    hasFilters = true;
                }
                if (searchParams.filters.dateAdded && typeof searchParams.filters.dateAdded === 'object') {
                    filters.dateAdded = searchParams.filters.dateAdded;
                    hasFilters = true;
                }
                // Only add filters object if we have actual filters
                if (hasFilters) {
                    payload.filters = filters;
                }
            }
            process.stderr.write(`[GHL API] Search contacts payload: ${JSON.stringify(payload, null, 2)}\n`);
            const response = await this.axiosInstance.post('/contacts/search', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            const axiosError = error;
            process.stderr.write(`[GHL API] Search contacts error: ${JSON.stringify({
                status: axiosError.response?.status,
                statusText: axiosError.response?.statusText,
                data: axiosError.response?.data,
                message: axiosError.message
            }, null, 2)}\n`);
            const handledError = this.handleApiError(axiosError);
            return {
                success: false,
                error: {
                    message: handledError.message,
                    statusCode: axiosError.response?.status || 500,
                    details: axiosError.response?.data
                }
            };
        }
    }
    /**
     * Get duplicate contact by email or phone
     * GET /contacts/search/duplicate
     */
    async getDuplicateContact(email, phone) {
        try {
            const params = {
                locationId: this.config.locationId
            };
            if (email)
                params.email = encodeURIComponent(email);
            if (phone)
                params.number = encodeURIComponent(phone);
            const response = await this.axiosInstance.get('/contacts/search/duplicate', { params });
            return this.wrapResponse(response.data.contact || null);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Add tags to contact
     * POST /contacts/{contactId}/tags
     */
    async addContactTags(contactId, tags) {
        try {
            const payload = { tags };
            const response = await this.axiosInstance.post(`/contacts/${contactId}/tags`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Remove tags from contact
     * DELETE /contacts/{contactId}/tags
     */
    async removeContactTags(contactId, tags) {
        try {
            const payload = { tags };
            const response = await this.axiosInstance.delete(`/contacts/${contactId}/tags`, { data: payload });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * CONVERSATIONS API METHODS
     */
    /**
     * Search conversations with filters
     * GET /conversations/search
     */
    async searchConversations(searchParams) {
        try {
            // Ensure locationId is set
            const params = {
                ...searchParams,
                locationId: searchParams.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.get('/conversations/search', {
                params,
                headers: this.getConversationHeaders()
            });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get conversation by ID
     * GET /conversations/{conversationId}
     */
    async getConversation(conversationId) {
        try {
            const response = await this.axiosInstance.get(`/conversations/${conversationId}`, { headers: this.getConversationHeaders() });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Create a new conversation
     * POST /conversations/
     */
    async createConversation(conversationData) {
        try {
            // Ensure locationId is set
            const payload = {
                ...conversationData,
                locationId: conversationData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.post('/conversations/', payload, { headers: this.getConversationHeaders() });
            return this.wrapResponse(response.data.conversation);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update conversation
     * PUT /conversations/{conversationId}
     */
    async updateConversation(conversationId, updates) {
        try {
            // Ensure locationId is set
            const payload = {
                ...updates,
                locationId: updates.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.put(`/conversations/${conversationId}`, payload, { headers: this.getConversationHeaders() });
            return this.wrapResponse(response.data.conversation);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Delete conversation
     * DELETE /conversations/{conversationId}
     */
    async deleteConversation(conversationId) {
        try {
            const response = await this.axiosInstance.delete(`/conversations/${conversationId}`, { headers: this.getConversationHeaders() });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get messages from a conversation
     * GET /conversations/{conversationId}/messages
     */
    async getConversationMessages(conversationId, options) {
        try {
            const params = {};
            if (options?.lastMessageId)
                params.lastMessageId = options.lastMessageId;
            if (options?.limit)
                params.limit = options.limit;
            if (options?.type)
                params.type = options.type;
            const response = await this.axiosInstance.get(`/conversations/${conversationId}/messages`, {
                params,
                headers: this.getConversationHeaders()
            });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get message by ID
     * GET /conversations/messages/{id}
     */
    async getMessage(messageId) {
        try {
            const response = await this.axiosInstance.get(`/conversations/messages/${messageId}`, { headers: this.getConversationHeaders() });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Send a new message (SMS, Email, etc.)
     * POST /conversations/messages
     */
    async sendMessage(messageData) {
        try {
            const response = await this.axiosInstance.post('/conversations/messages', messageData, { headers: this.getConversationHeaders() });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Send SMS message to a contact
     * Convenience method for sending SMS
     */
    async sendSMS(contactId, message, fromNumber) {
        try {
            const messageData = {
                type: 'SMS',
                contactId,
                message,
                fromNumber
            };
            return await this.sendMessage(messageData);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Send Email message to a contact
     * Convenience method for sending Email
     */
    async sendEmail(contactId, subject, message, html, options) {
        try {
            const messageData = {
                type: 'Email',
                contactId,
                subject,
                message,
                html,
                ...options
            };
            return await this.sendMessage(messageData);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * BLOG API METHODS
     */
    /**
     * Get all blog sites for a location
     * GET /blogs/site/all
     */
    async getBlogSites(params) {
        try {
            // Ensure locationId is set
            const queryParams = {
                locationId: params.locationId || this.config.locationId,
                skip: params.skip,
                limit: params.limit,
                ...(params.searchTerm && { searchTerm: params.searchTerm })
            };
            const response = await this.axiosInstance.get('/blogs/site/all', { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get blog posts for a specific blog
     * GET /blogs/posts/all
     */
    async getBlogPosts(params) {
        try {
            // Ensure locationId is set
            const queryParams = {
                locationId: params.locationId || this.config.locationId,
                blogId: params.blogId,
                limit: params.limit,
                offset: params.offset,
                ...(params.searchTerm && { searchTerm: params.searchTerm }),
                ...(params.status && { status: params.status })
            };
            const response = await this.axiosInstance.get('/blogs/posts/all', { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Create a new blog post
     * POST /blogs/posts
     */
    async createBlogPost(postData) {
        try {
            // Ensure locationId is set
            const payload = {
                ...postData,
                locationId: postData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.post('/blogs/posts', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update an existing blog post
     * PUT /blogs/posts/{postId}
     */
    async updateBlogPost(postId, postData) {
        try {
            // Ensure locationId is set
            const payload = {
                ...postData,
                locationId: postData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.put(`/blogs/posts/${postId}`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get all blog authors for a location
     * GET /blogs/authors
     */
    async getBlogAuthors(params) {
        try {
            // Ensure locationId is set
            const queryParams = {
                locationId: params.locationId || this.config.locationId,
                limit: params.limit,
                offset: params.offset
            };
            const response = await this.axiosInstance.get('/blogs/authors', { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get all blog categories for a location
     * GET /blogs/categories
     */
    async getBlogCategories(params) {
        try {
            // Ensure locationId is set
            const queryParams = {
                locationId: params.locationId || this.config.locationId,
                limit: params.limit,
                offset: params.offset
            };
            const response = await this.axiosInstance.get('/blogs/categories', { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Check if a URL slug exists (for validation before creating/updating posts)
     * GET /blogs/posts/url-slug-exists
     */
    async checkUrlSlugExists(params) {
        try {
            // Ensure locationId is set
            const queryParams = {
                locationId: params.locationId || this.config.locationId,
                urlSlug: params.urlSlug,
                ...(params.postId && { postId: params.postId })
            };
            const response = await this.axiosInstance.get('/blogs/posts/url-slug-exists', { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * TASKS API METHODS
     */
    /**
     * Get all tasks for a contact
     * GET /contacts/{contactId}/tasks
     */
    async getContactTasks(contactId) {
        try {
            const response = await this.axiosInstance.get(`/contacts/${contactId}/tasks`);
            return this.wrapResponse(response.data.tasks);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Create task for contact
     * POST /contacts/{contactId}/tasks
     */
    async createContactTask(contactId, taskData) {
        try {
            const response = await this.axiosInstance.post(`/contacts/${contactId}/tasks`, taskData);
            return this.wrapResponse(response.data.task);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * NOTES API METHODS
     */
    /**
     * Get all notes for a contact
     * GET /contacts/{contactId}/notes
     */
    async getContactNotes(contactId) {
        try {
            const response = await this.axiosInstance.get(`/contacts/${contactId}/notes`);
            return this.wrapResponse(response.data.notes);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Create note for contact
     * POST /contacts/{contactId}/notes
     */
    async createContactNote(contactId, noteData) {
        try {
            const response = await this.axiosInstance.post(`/contacts/${contactId}/notes`, noteData);
            return this.wrapResponse(response.data.note);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * ADDITIONAL CONTACT API METHODS
     */
    /**
     * Get a specific task for a contact
     * GET /contacts/{contactId}/tasks/{taskId}
     */
    async getContactTask(contactId, taskId) {
        try {
            const response = await this.axiosInstance.get(`/contacts/${contactId}/tasks/${taskId}`);
            return this.wrapResponse(response.data.task);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Update a task for a contact
     * PUT /contacts/{contactId}/tasks/{taskId}
     */
    async updateContactTask(contactId, taskId, updates) {
        try {
            const response = await this.axiosInstance.put(`/contacts/${contactId}/tasks/${taskId}`, updates);
            return this.wrapResponse(response.data.task);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Delete a task for a contact
     * DELETE /contacts/{contactId}/tasks/{taskId}
     */
    async deleteContactTask(contactId, taskId) {
        try {
            const response = await this.axiosInstance.delete(`/contacts/${contactId}/tasks/${taskId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Update task completion status
     * PUT /contacts/{contactId}/tasks/{taskId}/completed
     */
    async updateTaskCompletion(contactId, taskId, completed) {
        try {
            const response = await this.axiosInstance.put(`/contacts/${contactId}/tasks/${taskId}/completed`, { completed });
            return this.wrapResponse(response.data.task);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get a specific note for a contact
     * GET /contacts/{contactId}/notes/{noteId}
     */
    async getContactNote(contactId, noteId) {
        try {
            const response = await this.axiosInstance.get(`/contacts/${contactId}/notes/${noteId}`);
            return this.wrapResponse(response.data.note);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Update a note for a contact
     * PUT /contacts/{contactId}/notes/{noteId}
     */
    async updateContactNote(contactId, noteId, updates) {
        try {
            const response = await this.axiosInstance.put(`/contacts/${contactId}/notes/${noteId}`, updates);
            return this.wrapResponse(response.data.note);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Delete a note for a contact
     * DELETE /contacts/{contactId}/notes/{noteId}
     */
    async deleteContactNote(contactId, noteId) {
        try {
            const response = await this.axiosInstance.delete(`/contacts/${contactId}/notes/${noteId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Upsert contact (create or update based on email/phone)
     * POST /contacts/upsert
     */
    async upsertContact(contactData) {
        try {
            const payload = {
                ...contactData,
                locationId: contactData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.post('/contacts/upsert', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get contacts by business ID
     * GET /contacts/business/{businessId}
     */
    async getContactsByBusiness(businessId, params = {}) {
        try {
            const queryParams = {
                limit: params.limit || 25,
                skip: params.skip || 0,
                ...(params.query && { query: params.query })
            };
            const response = await this.axiosInstance.get(`/contacts/business/${businessId}`, { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get contact appointments
     * GET /contacts/{contactId}/appointments
     */
    async getContactAppointments(contactId) {
        try {
            const response = await this.axiosInstance.get(`/contacts/${contactId}/appointments`);
            return this.wrapResponse(response.data.events);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Bulk update contact tags
     * POST /contacts/tags/bulk
     */
    async bulkUpdateContactTags(contactIds, tags, operation, removeAllTags) {
        try {
            const payload = {
                ids: contactIds,
                tags,
                operation,
                ...(removeAllTags !== undefined && { removeAllTags })
            };
            const response = await this.axiosInstance.post('/contacts/tags/bulk', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Bulk update contact business
     * POST /contacts/business/bulk
     */
    async bulkUpdateContactBusiness(contactIds, businessId) {
        try {
            const payload = {
                ids: contactIds,
                businessId: businessId || null
            };
            const response = await this.axiosInstance.post('/contacts/business/bulk', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Add contact followers
     * POST /contacts/{contactId}/followers
     */
    async addContactFollowers(contactId, followers) {
        try {
            const payload = { followers };
            const response = await this.axiosInstance.post(`/contacts/${contactId}/followers`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Remove contact followers
     * DELETE /contacts/{contactId}/followers
     */
    async removeContactFollowers(contactId, followers) {
        try {
            const payload = { followers };
            const response = await this.axiosInstance.delete(`/contacts/${contactId}/followers`, { data: payload });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Add contact to campaign
     * POST /contacts/{contactId}/campaigns/{campaignId}
     */
    async addContactToCampaign(contactId, campaignId) {
        try {
            const response = await this.axiosInstance.post(`/contacts/${contactId}/campaigns/${campaignId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Remove contact from campaign
     * DELETE /contacts/{contactId}/campaigns/{campaignId}
     */
    async removeContactFromCampaign(contactId, campaignId) {
        try {
            const response = await this.axiosInstance.delete(`/contacts/${contactId}/campaigns/${campaignId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Remove contact from all campaigns
     * DELETE /contacts/{contactId}/campaigns
     */
    async removeContactFromAllCampaigns(contactId) {
        try {
            const response = await this.axiosInstance.delete(`/contacts/${contactId}/campaigns`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Add contact to workflow
     * POST /contacts/{contactId}/workflow/{workflowId}
     */
    async addContactToWorkflow(contactId, workflowId, eventStartTime) {
        try {
            const payload = eventStartTime ? { eventStartTime } : {};
            const response = await this.axiosInstance.post(`/contacts/${contactId}/workflow/${workflowId}`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Remove contact from workflow
     * DELETE /contacts/{contactId}/workflow/{workflowId}
     */
    async removeContactFromWorkflow(contactId, workflowId, eventStartTime) {
        try {
            const payload = eventStartTime ? { eventStartTime } : {};
            const response = await this.axiosInstance.delete(`/contacts/${contactId}/workflow/${workflowId}`, { data: payload });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * UTILITY METHODS
     */
    /**
     * Test API connection and authentication
     */
    async testConnection() {
        try {
            // Test with a simple GET request to check API connectivity
            const response = await this.axiosInstance.get('/locations/' + this.config.locationId);
            return this.wrapResponse({
                status: 'connected',
                locationId: this.config.locationId
            });
        }
        catch (error) {
            throw new Error(`GHL API connection test failed: ${error}`);
        }
    }
    /**
     * Update access token
     */
    updateAccessToken(newToken) {
        this.config.accessToken = newToken;
        this.axiosInstance.defaults.headers['Authorization'] = `Bearer ${newToken}`;
        process.stderr.write('[GHL API] Access token updated\n');
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * OPPORTUNITIES API METHODS
     */
    /**
     * Search opportunities with advanced filters
     * GET /opportunities/search
     */
    async searchOpportunities(searchParams) {
        try {
            // Build query parameters with exact API naming (underscores)
            const params = {
                location_id: searchParams.location_id || this.config.locationId
            };
            // Add optional search parameters only if they have values
            if (searchParams.q && searchParams.q.trim()) {
                params.q = searchParams.q.trim();
            }
            if (searchParams.pipeline_id) {
                params.pipeline_id = searchParams.pipeline_id;
            }
            if (searchParams.pipeline_stage_id) {
                params.pipeline_stage_id = searchParams.pipeline_stage_id;
            }
            if (searchParams.contact_id) {
                params.contact_id = searchParams.contact_id;
            }
            if (searchParams.status) {
                params.status = searchParams.status;
            }
            if (searchParams.assigned_to) {
                params.assigned_to = searchParams.assigned_to;
            }
            if (searchParams.campaignId) {
                params.campaignId = searchParams.campaignId;
            }
            if (searchParams.id) {
                params.id = searchParams.id;
            }
            if (searchParams.order) {
                params.order = searchParams.order;
            }
            if (searchParams.endDate) {
                params.endDate = searchParams.endDate;
            }
            if (searchParams.startAfter) {
                params.startAfter = searchParams.startAfter;
            }
            if (searchParams.startAfterId) {
                params.startAfterId = searchParams.startAfterId;
            }
            if (searchParams.date) {
                params.date = searchParams.date;
            }
            if (searchParams.country) {
                params.country = searchParams.country;
            }
            if (searchParams.page) {
                params.page = searchParams.page;
            }
            if (searchParams.limit) {
                params.limit = searchParams.limit;
            }
            if (searchParams.getTasks !== undefined) {
                params.getTasks = searchParams.getTasks;
            }
            if (searchParams.getNotes !== undefined) {
                params.getNotes = searchParams.getNotes;
            }
            if (searchParams.getCalendarEvents !== undefined) {
                params.getCalendarEvents = searchParams.getCalendarEvents;
            }
            process.stderr.write(`[GHL API] Search opportunities params: ${JSON.stringify(params, null, 2)}\n`);
            const response = await this.axiosInstance.get('/opportunities/search', { params });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            const axiosError = error;
            process.stderr.write(`[GHL API] Search opportunities error: ${JSON.stringify({
                status: axiosError.response?.status,
                statusText: axiosError.response?.statusText,
                data: axiosError.response?.data,
                message: axiosError.message
            }, null, 2)}\n`);
            throw this.handleApiError(axiosError);
        }
    }
    /**
     * Get all pipelines for a location
     * GET /opportunities/pipelines
     */
    async getPipelines(locationId) {
        try {
            const params = {
                locationId: locationId || this.config.locationId
            };
            const response = await this.axiosInstance.get('/opportunities/pipelines', { params });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get opportunity by ID
     * GET /opportunities/{id}
     */
    async getOpportunity(opportunityId) {
        try {
            const response = await this.axiosInstance.get(`/opportunities/${opportunityId}`);
            return this.wrapResponse(response.data.opportunity);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Create a new opportunity
     * POST /opportunities/
     */
    async createOpportunity(opportunityData) {
        try {
            // Ensure locationId is set
            const payload = {
                ...opportunityData,
                locationId: opportunityData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.post('/opportunities/', payload);
            return this.wrapResponse(response.data.opportunity);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Update existing opportunity
     * PUT /opportunities/{id}
     */
    async updateOpportunity(opportunityId, updates) {
        try {
            const response = await this.axiosInstance.put(`/opportunities/${opportunityId}`, updates);
            return this.wrapResponse(response.data.opportunity);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Update opportunity status
     * PUT /opportunities/{id}/status
     */
    async updateOpportunityStatus(opportunityId, status) {
        try {
            const payload = { status };
            const response = await this.axiosInstance.put(`/opportunities/${opportunityId}/status`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Upsert opportunity (create or update)
     * POST /opportunities/upsert
     */
    async upsertOpportunity(opportunityData) {
        try {
            // Ensure locationId is set
            const payload = {
                ...opportunityData,
                locationId: opportunityData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.post('/opportunities/upsert', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Delete opportunity
     * DELETE /opportunities/{id}
     */
    async deleteOpportunity(opportunityId) {
        try {
            const response = await this.axiosInstance.delete(`/opportunities/${opportunityId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Add followers to opportunity
     * POST /opportunities/{id}/followers
     */
    async addOpportunityFollowers(opportunityId, followers) {
        try {
            const payload = { followers };
            const response = await this.axiosInstance.post(`/opportunities/${opportunityId}/followers`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Remove followers from opportunity
     * DELETE /opportunities/{id}/followers
     */
    async removeOpportunityFollowers(opportunityId, followers) {
        try {
            const payload = { followers };
            const response = await this.axiosInstance.delete(`/opportunities/${opportunityId}/followers`, { data: payload });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * CALENDAR & APPOINTMENTS API METHODS
     */
    /**
     * Get all calendar groups in a location
     * GET /calendars/groups
     */
    async getCalendarGroups(locationId) {
        try {
            const params = {
                locationId: locationId || this.config.locationId
            };
            const response = await this.axiosInstance.get('/calendars/groups', { params });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Create a new calendar group
     * POST /calendars/groups
     */
    async createCalendarGroup(groupData) {
        try {
            const payload = {
                ...groupData,
                locationId: groupData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.post('/calendars/groups', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get all calendars in a location
     * GET /calendars/
     */
    async getCalendars(params) {
        try {
            const queryParams = {
                locationId: params?.locationId || this.config.locationId,
                ...(params?.groupId && { groupId: params.groupId }),
                ...(params?.showDrafted !== undefined && { showDrafted: params.showDrafted })
            };
            const response = await this.axiosInstance.get('/calendars/', { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Create a new calendar
     * POST /calendars/
     */
    async createCalendar(calendarData) {
        try {
            const payload = {
                ...calendarData,
                locationId: calendarData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.post('/calendars/', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get calendar by ID
     * GET /calendars/{calendarId}
     */
    async getCalendar(calendarId) {
        try {
            const response = await this.axiosInstance.get(`/calendars/${calendarId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Update calendar by ID
     * PUT /calendars/{calendarId}
     */
    async updateCalendar(calendarId, updates) {
        try {
            const response = await this.axiosInstance.put(`/calendars/${calendarId}`, updates);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Delete calendar by ID
     * DELETE /calendars/{calendarId}
     */
    async deleteCalendar(calendarId) {
        try {
            const response = await this.axiosInstance.delete(`/calendars/${calendarId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get calendar events/appointments
     * GET /calendars/events
     */
    async getCalendarEvents(eventParams) {
        try {
            const params = {
                locationId: eventParams.locationId || this.config.locationId,
                startTime: eventParams.startTime,
                endTime: eventParams.endTime,
                ...(eventParams.userId && { userId: eventParams.userId }),
                ...(eventParams.calendarId && { calendarId: eventParams.calendarId }),
                ...(eventParams.groupId && { groupId: eventParams.groupId })
            };
            const response = await this.axiosInstance.get('/calendars/events', { params });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get blocked slots
     * GET /calendars/blocked-slots
     */
    async getBlockedSlots(eventParams) {
        try {
            const params = {
                locationId: eventParams.locationId || this.config.locationId,
                startTime: eventParams.startTime,
                endTime: eventParams.endTime,
                ...(eventParams.userId && { userId: eventParams.userId }),
                ...(eventParams.calendarId && { calendarId: eventParams.calendarId }),
                ...(eventParams.groupId && { groupId: eventParams.groupId })
            };
            const response = await this.axiosInstance.get('/calendars/blocked-slots', { params });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get free slots for a calendar
     * GET /calendars/{calendarId}/free-slots
     */
    async getFreeSlots(slotParams) {
        try {
            const params = {
                startDate: slotParams.startDate,
                endDate: slotParams.endDate,
                ...(slotParams.timezone && { timezone: slotParams.timezone }),
                ...(slotParams.userId && { userId: slotParams.userId }),
                ...(slotParams.userIds && { userIds: slotParams.userIds }),
                ...(slotParams.enableLookBusy !== undefined && { enableLookBusy: slotParams.enableLookBusy })
            };
            const response = await this.axiosInstance.get(`/calendars/${slotParams.calendarId}/free-slots`, { params });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Create a new appointment
     * POST /calendars/events/appointments
     */
    async createAppointment(appointmentData) {
        try {
            const payload = {
                ...appointmentData,
                locationId: appointmentData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.post('/calendars/events/appointments', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get appointment by ID
     * GET /calendars/events/appointments/{eventId}
     */
    async getAppointment(appointmentId) {
        try {
            const response = await this.axiosInstance.get(`/calendars/events/appointments/${appointmentId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Update appointment by ID
     * PUT /calendars/events/appointments/{eventId}
     */
    async updateAppointment(appointmentId, updates) {
        try {
            const response = await this.axiosInstance.put(`/calendars/events/appointments/${appointmentId}`, updates);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Delete appointment by ID
     * DELETE /calendars/events/appointments/{eventId}
     */
    async deleteAppointment(appointmentId) {
        try {
            const response = await this.axiosInstance.delete(`/calendars/events/appointments/${appointmentId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Update block slot by ID
     * PUT /calendars/events/block-slots/{eventId}
     */
    async updateBlockSlot(blockSlotId, updates) {
        try {
            const response = await this.axiosInstance.put(`/calendars/events/block-slots/${blockSlotId}`, updates);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * EMAIL API METHODS
     */
    async getEmailCampaigns(params) {
        try {
            const response = await this.axiosInstance.get('/emails/schedule', {
                params: {
                    locationId: this.config.locationId,
                    ...params
                }
            });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    async createEmailTemplate(params) {
        try {
            const response = await this.axiosInstance.post('/emails/builder', {
                locationId: this.config.locationId,
                type: 'html',
                ...params
            });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    async getEmailTemplates(params) {
        try {
            const response = await this.axiosInstance.get('/emails/builder', {
                params: {
                    locationId: this.config.locationId,
                    ...params
                }
            });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    async updateEmailTemplate(params) {
        try {
            const { templateId, ...data } = params;
            const response = await this.axiosInstance.post('/emails/builder/data', {
                locationId: this.config.locationId,
                templateId,
                ...data,
                editorType: 'html'
            });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    async deleteEmailTemplate(params) {
        try {
            const { templateId } = params;
            const response = await this.axiosInstance.delete(`/emails/builder/${this.config.locationId}/${templateId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * LOCATION API METHODS
     */
    /**
     * Search locations/sub-accounts
     * GET /locations/search
     */
    async searchLocations(params = {}) {
        try {
            const queryParams = {
                skip: params.skip || 0,
                limit: params.limit || 10,
                order: params.order || 'asc',
                ...(params.companyId && { companyId: params.companyId }),
                ...(params.email && { email: params.email })
            };
            const response = await this.axiosInstance.get('/locations/search', { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get location by ID
     * GET /locations/{locationId}
     */
    async getLocationById(locationId) {
        try {
            const response = await this.axiosInstance.get(`/locations/${locationId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Create a new location/sub-account
     * POST /locations/
     */
    async createLocation(locationData) {
        try {
            const response = await this.axiosInstance.post('/locations/', locationData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Update location/sub-account
     * PUT /locations/{locationId}
     */
    async updateLocation(locationId, updates) {
        try {
            const response = await this.axiosInstance.put(`/locations/${locationId}`, updates);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Delete location/sub-account
     * DELETE /locations/{locationId}
     */
    async deleteLocation(locationId, deleteTwilioAccount) {
        try {
            const response = await this.axiosInstance.delete(`/locations/${locationId}`, {
                params: { deleteTwilioAccount }
            });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * LOCATION TAGS API METHODS
     */
    /**
     * Get location tags
     * GET /locations/{locationId}/tags
     */
    async getLocationTags(locationId) {
        try {
            const response = await this.axiosInstance.get(`/locations/${locationId}/tags`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Create location tag
     * POST /locations/{locationId}/tags
     */
    async createLocationTag(locationId, tagData) {
        try {
            const response = await this.axiosInstance.post(`/locations/${locationId}/tags`, tagData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get location tag by ID
     * GET /locations/{locationId}/tags/{tagId}
     */
    async getLocationTag(locationId, tagId) {
        try {
            const response = await this.axiosInstance.get(`/locations/${locationId}/tags/${tagId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Update location tag
     * PUT /locations/{locationId}/tags/{tagId}
     */
    async updateLocationTag(locationId, tagId, tagData) {
        try {
            const response = await this.axiosInstance.put(`/locations/${locationId}/tags/${tagId}`, tagData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Delete location tag
     * DELETE /locations/{locationId}/tags/{tagId}
     */
    async deleteLocationTag(locationId, tagId) {
        try {
            const response = await this.axiosInstance.delete(`/locations/${locationId}/tags/${tagId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * LOCATION TASKS API METHODS
     */
    /**
     * Search location tasks
     * POST /locations/{locationId}/tasks/search
     */
    async searchLocationTasks(locationId, searchParams) {
        try {
            const response = await this.axiosInstance.post(`/locations/${locationId}/tasks/search`, searchParams);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * CUSTOM FIELDS API METHODS
     */
    /**
     * Get custom fields for location
     * GET /locations/{locationId}/customFields
     */
    async getLocationCustomFields(locationId, model) {
        try {
            const params = {};
            if (model)
                params.model = model;
            const response = await this.axiosInstance.get(`/locations/${locationId}/customFields`, { params });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Create custom field for location
     * POST /locations/{locationId}/customFields
     */
    async createLocationCustomField(locationId, fieldData) {
        try {
            const response = await this.axiosInstance.post(`/locations/${locationId}/customFields`, fieldData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get custom field by ID
     * GET /locations/{locationId}/customFields/{id}
     */
    async getLocationCustomField(locationId, customFieldId) {
        try {
            const response = await this.axiosInstance.get(`/locations/${locationId}/customFields/${customFieldId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Update custom field
     * PUT /locations/{locationId}/customFields/{id}
     */
    async updateLocationCustomField(locationId, customFieldId, fieldData) {
        try {
            const response = await this.axiosInstance.put(`/locations/${locationId}/customFields/${customFieldId}`, fieldData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Delete custom field
     * DELETE /locations/{locationId}/customFields/{id}
     */
    async deleteLocationCustomField(locationId, customFieldId) {
        try {
            const response = await this.axiosInstance.delete(`/locations/${locationId}/customFields/${customFieldId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Upload file to custom fields
     * POST /locations/{locationId}/customFields/upload
     */
    async uploadLocationCustomFieldFile(locationId, uploadData) {
        try {
            // Note: This endpoint expects multipart/form-data but we'll handle it as JSON for now
            // In a real implementation, you'd use FormData for file uploads
            const response = await this.axiosInstance.post(`/locations/${locationId}/customFields/upload`, uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * CUSTOM VALUES API METHODS
     */
    /**
     * Get custom values for location
     * GET /locations/{locationId}/customValues
     */
    async getLocationCustomValues(locationId) {
        try {
            const response = await this.axiosInstance.get(`/locations/${locationId}/customValues`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Create custom value for location
     * POST /locations/{locationId}/customValues
     */
    async createLocationCustomValue(locationId, valueData) {
        try {
            const response = await this.axiosInstance.post(`/locations/${locationId}/customValues`, valueData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get custom value by ID
     * GET /locations/{locationId}/customValues/{id}
     */
    async getLocationCustomValue(locationId, customValueId) {
        try {
            const response = await this.axiosInstance.get(`/locations/${locationId}/customValues/${customValueId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Update custom value
     * PUT /locations/{locationId}/customValues/{id}
     */
    async updateLocationCustomValue(locationId, customValueId, valueData) {
        try {
            const response = await this.axiosInstance.put(`/locations/${locationId}/customValues/${customValueId}`, valueData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Delete custom value
     * DELETE /locations/{locationId}/customValues/{id}
     */
    async deleteLocationCustomValue(locationId, customValueId) {
        try {
            const response = await this.axiosInstance.delete(`/locations/${locationId}/customValues/${customValueId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * TEMPLATES API METHODS
     */
    /**
     * Get location templates (SMS/Email)
     * GET /locations/{locationId}/templates
     */
    async getLocationTemplates(locationId, params) {
        try {
            const queryParams = {
                originId: params.originId,
                deleted: params.deleted || false,
                skip: params.skip || 0,
                limit: params.limit || 25,
                ...(params.type && { type: params.type })
            };
            const response = await this.axiosInstance.get(`/locations/${locationId}/templates`, { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Delete location template
     * DELETE /locations/{locationId}/templates/{id}
     */
    async deleteLocationTemplate(locationId, templateId) {
        try {
            const response = await this.axiosInstance.delete(`/locations/${locationId}/templates/${templateId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * TIMEZONES API METHODS
     */
    /**
     * Get available timezones
     * GET /locations/{locationId}/timezones
     */
    async getTimezones(locationId) {
        try {
            const endpoint = locationId ? `/locations/${locationId}/timezones` : '/locations/timezones';
            const response = await this.axiosInstance.get(endpoint);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * EMAIL ISV (VERIFICATION) API METHODS
     */
    /**
     * Verify email address or contact
     * POST /email/verify
     */
    async verifyEmail(locationId, verificationData) {
        try {
            const params = {
                locationId: locationId
            };
            const response = await this.axiosInstance.post('/email/verify', verificationData, { params });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * ADDITIONAL CONVERSATION/MESSAGE API METHODS
     */
    /**
     * Get email message by ID
     * GET /conversations/messages/email/{id}
     */
    async getEmailMessage(emailMessageId) {
        try {
            const response = await this.axiosInstance.get(`/conversations/messages/email/${emailMessageId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Cancel scheduled email message
     * DELETE /conversations/messages/email/{emailMessageId}/schedule
     */
    async cancelScheduledEmail(emailMessageId) {
        try {
            const response = await this.axiosInstance.delete(`/conversations/messages/email/${emailMessageId}/schedule`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Add inbound message manually
     * POST /conversations/messages/inbound
     */
    async addInboundMessage(messageData) {
        try {
            const response = await this.axiosInstance.post('/conversations/messages/inbound', messageData, { headers: this.getConversationHeaders() });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Add outbound call manually
     * POST /conversations/messages/outbound
     */
    async addOutboundCall(messageData) {
        try {
            const response = await this.axiosInstance.post('/conversations/messages/outbound', messageData, { headers: this.getConversationHeaders() });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Cancel scheduled message
     * DELETE /conversations/messages/{messageId}/schedule
     */
    async cancelScheduledMessage(messageId) {
        try {
            const response = await this.axiosInstance.delete(`/conversations/messages/${messageId}/schedule`, { headers: this.getConversationHeaders() });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Upload file attachments for messages
     * POST /conversations/messages/upload
     */
    async uploadMessageAttachments(uploadData) {
        try {
            const response = await this.axiosInstance.post('/conversations/messages/upload', uploadData, {
                headers: {
                    ...this.getConversationHeaders(),
                    'Content-Type': 'multipart/form-data'
                }
            });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Update message status
     * PUT /conversations/messages/{messageId}/status
     */
    async updateMessageStatus(messageId, statusData) {
        try {
            const response = await this.axiosInstance.put(`/conversations/messages/${messageId}/status`, statusData, { headers: this.getConversationHeaders() });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get message recording
     * GET /conversations/messages/{messageId}/locations/{locationId}/recording
     */
    async getMessageRecording(messageId, locationId) {
        try {
            const locId = locationId || this.config.locationId;
            const response = await this.axiosInstance.get(`/conversations/messages/${messageId}/locations/${locId}/recording`, {
                headers: this.getConversationHeaders(),
                responseType: 'arraybuffer'
            });
            const recordingResponse = {
                audioData: response.data,
                contentType: response.headers['content-type'] || 'audio/x-wav',
                contentDisposition: response.headers['content-disposition'] || 'attachment; filename=audio.wav'
            };
            return this.wrapResponse(recordingResponse);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get message transcription
     * GET /conversations/locations/{locationId}/messages/{messageId}/transcription
     */
    async getMessageTranscription(messageId, locationId) {
        try {
            const locId = locationId || this.config.locationId;
            const response = await this.axiosInstance.get(`/conversations/locations/${locId}/messages/${messageId}/transcription`, { headers: this.getConversationHeaders() });
            return this.wrapResponse({ transcriptions: response.data });
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Download message transcription
     * GET /conversations/locations/{locationId}/messages/{messageId}/transcription/download
     */
    async downloadMessageTranscription(messageId, locationId) {
        try {
            const locId = locationId || this.config.locationId;
            const response = await this.axiosInstance.get(`/conversations/locations/${locId}/messages/${messageId}/transcription/download`, {
                headers: this.getConversationHeaders(),
                responseType: 'text'
            });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Live chat typing indicator
     * POST /conversations/providers/live-chat/typing
     */
    async liveChatTyping(typingData) {
        try {
            const response = await this.axiosInstance.post('/conversations/providers/live-chat/typing', typingData, { headers: this.getConversationHeaders() });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    // ============================================================================
    // SOCIAL MEDIA POSTING API METHODS
    // ============================================================================
    // ===== POST MANAGEMENT =====
    /**
     * Search/List Social Media Posts
     */
    async searchSocialPosts(searchData) {
        try {
            const locationId = this.config.locationId;
            const response = await this.axiosInstance.post(`/social-media-posting/${locationId}/posts/list`, searchData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Create Social Media Post
     */
    async createSocialPost(postData) {
        try {
            const locationId = this.config.locationId;
            const response = await this.axiosInstance.post(`/social-media-posting/${locationId}/posts`, postData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get Social Media Post by ID
     */
    async getSocialPost(postId) {
        try {
            const locationId = this.config.locationId;
            const response = await this.axiosInstance.get(`/social-media-posting/${locationId}/posts/${postId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update Social Media Post
     */
    async updateSocialPost(postId, updateData) {
        try {
            const locationId = this.config.locationId;
            const response = await this.axiosInstance.put(`/social-media-posting/${locationId}/posts/${postId}`, updateData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Delete Social Media Post
     */
    async deleteSocialPost(postId) {
        try {
            const locationId = this.config.locationId;
            const response = await this.axiosInstance.delete(`/social-media-posting/${locationId}/posts/${postId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Bulk Delete Social Media Posts
     */
    async bulkDeleteSocialPosts(deleteData) {
        try {
            const locationId = this.config.locationId;
            const response = await this.axiosInstance.post(`/social-media-posting/${locationId}/posts/bulk-delete`, deleteData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    // ===== ACCOUNT MANAGEMENT =====
    /**
     * Get Social Media Accounts and Groups
     */
    async getSocialAccounts() {
        try {
            const locationId = this.config.locationId;
            const response = await this.axiosInstance.get(`/social-media-posting/${locationId}/accounts`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Delete Social Media Account
     */
    async deleteSocialAccount(accountId, companyId, userId) {
        try {
            const locationId = this.config.locationId;
            const params = {};
            if (companyId)
                params.companyId = companyId;
            if (userId)
                params.userId = userId;
            const response = await this.axiosInstance.delete(`/social-media-posting/${locationId}/accounts/${accountId}`, { params });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    // ===== CSV OPERATIONS =====
    /**
     * Upload CSV for Social Media Posts
     */
    async uploadSocialCSV(csvData) {
        try {
            const locationId = this.config.locationId;
            // Note: This would typically use FormData for file upload
            const response = await this.axiosInstance.post(`/social-media-posting/${locationId}/csv`, csvData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get CSV Upload Status
     */
    async getSocialCSVUploadStatus(skip, limit, includeUsers, userId) {
        try {
            const locationId = this.config.locationId;
            const params = {};
            if (skip !== undefined)
                params.skip = skip.toString();
            if (limit !== undefined)
                params.limit = limit.toString();
            if (includeUsers !== undefined)
                params.includeUsers = includeUsers.toString();
            if (userId)
                params.userId = userId;
            const response = await this.axiosInstance.get(`/social-media-posting/${locationId}/csv`, { params });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Set Accounts for CSV Import
     */
    async setSocialCSVAccounts(accountsData) {
        try {
            const locationId = this.config.locationId;
            const response = await this.axiosInstance.post(`/social-media-posting/${locationId}/set-accounts`, accountsData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get CSV Posts
     */
    async getSocialCSVPosts(csvId, skip, limit) {
        try {
            const locationId = this.config.locationId;
            const params = {};
            if (skip !== undefined)
                params.skip = skip.toString();
            if (limit !== undefined)
                params.limit = limit.toString();
            const response = await this.axiosInstance.get(`/social-media-posting/${locationId}/csv/${csvId}`, { params });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Start CSV Finalization
     */
    async finalizeSocialCSV(csvId, finalizeData) {
        try {
            const locationId = this.config.locationId;
            const response = await this.axiosInstance.patch(`/social-media-posting/${locationId}/csv/${csvId}`, finalizeData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Delete CSV Import
     */
    async deleteSocialCSV(csvId) {
        try {
            const locationId = this.config.locationId;
            const response = await this.axiosInstance.delete(`/social-media-posting/${locationId}/csv/${csvId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Delete CSV Post
     */
    async deleteSocialCSVPost(csvId, postId) {
        try {
            const locationId = this.config.locationId;
            const response = await this.axiosInstance.delete(`/social-media-posting/${locationId}/csv/${csvId}/post/${postId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    // ===== CATEGORIES & TAGS =====
    /**
     * Get Social Media Categories
     */
    async getSocialCategories(searchText, limit, skip) {
        // TODO: Implement this method properly
        throw new Error('Method not yet implemented');
    }
    // TODO: Implement remaining social media API methods
    async getSocialCategory(categoryId) {
        throw new Error('Method not yet implemented');
    }
    async getSocialTags(searchText, limit, skip) {
        throw new Error('Method not yet implemented');
    }
    async getSocialTagsByIds(tagData) {
        throw new Error('Method not yet implemented');
    }
    async startSocialOAuth(platform, userId, page, reconnect) {
        throw new Error('Method not yet implemented');
    }
    async getGoogleBusinessLocations(accountId) {
        throw new Error('Method not yet implemented');
    }
    async setGoogleBusinessLocations(accountId, locationData) {
        throw new Error('Method not yet implemented');
    }
    async getFacebookPages(accountId) {
        throw new Error('Method not yet implemented');
    }
    async attachFacebookPages(accountId, pageData) {
        throw new Error('Method not yet implemented');
    }
    async getInstagramAccounts(accountId) {
        throw new Error('Method not yet implemented');
    }
    async attachInstagramAccounts(accountId, accountData) {
        throw new Error('Method not yet implemented');
    }
    async getLinkedInAccounts(accountId) {
        throw new Error('Method not yet implemented');
    }
    async attachLinkedInAccounts(accountId, accountData) {
        throw new Error('Method not yet implemented');
    }
    async getTwitterProfile(accountId) {
        throw new Error('Method not yet implemented');
    }
    async attachTwitterProfile(accountId, profileData) {
        throw new Error('Method not yet implemented');
    }
    async getTikTokProfile(accountId) {
        throw new Error('Method not yet implemented');
    }
    async attachTikTokProfile(accountId, profileData) {
        throw new Error('Method not yet implemented');
    }
    async getTikTokBusinessProfile(accountId) {
        throw new Error('Method not yet implemented');
    }
    // ===== MISSING CALENDAR GROUPS MANAGEMENT METHODS =====
    /**
     * Validate calendar group slug
     * GET /calendars/groups/slug/validate
     */
    async validateCalendarGroupSlug(slug, locationId) {
        try {
            const params = {
                locationId: locationId || this.config.locationId,
                slug
            };
            const response = await this.axiosInstance.get('/calendars/groups/slug/validate', { params });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Update calendar group by ID
     * PUT /calendars/groups/{groupId}
     */
    async updateCalendarGroup(groupId, updateData) {
        try {
            const response = await this.axiosInstance.put(`/calendars/groups/${groupId}`, updateData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Delete calendar group by ID
     * DELETE /calendars/groups/{groupId}
     */
    async deleteCalendarGroup(groupId) {
        try {
            const response = await this.axiosInstance.delete(`/calendars/groups/${groupId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Disable calendar group
     * POST /calendars/groups/{groupId}/status
     */
    async disableCalendarGroup(groupId, isActive) {
        try {
            const payload = { isActive };
            const response = await this.axiosInstance.post(`/calendars/groups/${groupId}/status`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    // ===== APPOINTMENT NOTES METHODS =====
    /**
     * Get appointment notes
     * GET /calendars/events/appointments/{appointmentId}/notes
     */
    async getAppointmentNotes(appointmentId, limit = 10, offset = 0) {
        try {
            const params = { limit, offset };
            const response = await this.axiosInstance.get(`/calendars/events/appointments/${appointmentId}/notes`, { params });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Create appointment note
     * POST /calendars/events/appointments/{appointmentId}/notes
     */
    async createAppointmentNote(appointmentId, noteData) {
        try {
            const response = await this.axiosInstance.post(`/calendars/events/appointments/${appointmentId}/notes`, noteData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Update appointment note
     * PUT /calendars/events/appointments/{appointmentId}/notes/{noteId}
     */
    async updateAppointmentNote(appointmentId, noteId, updateData) {
        try {
            const response = await this.axiosInstance.put(`/calendars/events/appointments/${appointmentId}/notes/${noteId}`, updateData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Delete appointment note
     * DELETE /calendars/events/appointments/{appointmentId}/notes/{noteId}
     */
    async deleteAppointmentNote(appointmentId, noteId) {
        try {
            const response = await this.axiosInstance.delete(`/calendars/events/appointments/${appointmentId}/notes/${noteId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    // ===== CALENDAR RESOURCES METHODS =====
    /**
     * Get calendar resources
     * GET /calendars/resources/{resourceType}
     */
    async getCalendarResources(resourceType, limit = 20, skip = 0, locationId) {
        try {
            const params = {
                locationId: locationId || this.config.locationId,
                limit,
                skip
            };
            const response = await this.axiosInstance.get(`/calendars/resources/${resourceType}`, { params });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Create calendar resource
     * POST /calendars/resources/{resourceType}
     */
    async createCalendarResource(resourceType, resourceData) {
        try {
            const payload = {
                ...resourceData,
                locationId: resourceData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.post(`/calendars/resources/${resourceType}`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get calendar resource by ID
     * GET /calendars/resources/{resourceType}/{resourceId}
     */
    async getCalendarResource(resourceType, resourceId) {
        try {
            const response = await this.axiosInstance.get(`/calendars/resources/${resourceType}/${resourceId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Update calendar resource
     * PUT /calendars/resources/{resourceType}/{resourceId}
     */
    async updateCalendarResource(resourceType, resourceId, updateData) {
        try {
            const response = await this.axiosInstance.put(`/calendars/resources/${resourceType}/${resourceId}`, updateData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Delete calendar resource
     * DELETE /calendars/resources/{resourceType}/{resourceId}
     */
    async deleteCalendarResource(resourceType, resourceId) {
        try {
            const response = await this.axiosInstance.delete(`/calendars/resources/${resourceType}/${resourceId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    // ===== CALENDAR NOTIFICATIONS METHODS =====
    /**
     * Get calendar notifications
     * GET /calendars/{calendarId}/notifications
     */
    async getCalendarNotifications(calendarId, queryParams) {
        try {
            const params = {
                ...queryParams
            };
            const response = await this.axiosInstance.get(`/calendars/${calendarId}/notifications`, { params });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Create calendar notifications
     * POST /calendars/{calendarId}/notifications
     */
    async createCalendarNotifications(calendarId, notifications) {
        try {
            const payload = { notifications };
            const response = await this.axiosInstance.post(`/calendars/${calendarId}/notifications`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get calendar notification by ID
     * GET /calendars/{calendarId}/notifications/{notificationId}
     */
    async getCalendarNotification(calendarId, notificationId) {
        try {
            const response = await this.axiosInstance.get(`/calendars/${calendarId}/notifications/${notificationId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Update calendar notification
     * PUT /calendars/{calendarId}/notifications/{notificationId}
     */
    async updateCalendarNotification(calendarId, notificationId, updateData) {
        try {
            const response = await this.axiosInstance.put(`/calendars/${calendarId}/notifications/${notificationId}`, updateData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Delete calendar notification
     * DELETE /calendars/{calendarId}/notifications/{notificationId}
     */
    async deleteCalendarNotification(calendarId, notificationId) {
        try {
            const response = await this.axiosInstance.delete(`/calendars/${calendarId}/notifications/${notificationId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get blocked slots by location
     * GET /calendars/blocked-slots
     */
    async getBlockedSlotsByLocation(slotParams) {
        try {
            const params = new URLSearchParams({
                locationId: slotParams.locationId,
                startTime: slotParams.startTime,
                endTime: slotParams.endTime,
                ...(slotParams.userId && { userId: slotParams.userId }),
                ...(slotParams.calendarId && { calendarId: slotParams.calendarId }),
                ...(slotParams.groupId && { groupId: slotParams.groupId })
            });
            const response = await this.axiosInstance.get(`/calendars/blocked-slots?${params}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Create a new block slot
     * POST /calendars/blocked-slots
     */
    async createBlockSlot(blockSlotData) {
        try {
            const payload = {
                ...blockSlotData,
                locationId: blockSlotData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.post('/calendars/blocked-slots', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    // ===== MEDIA LIBRARY API METHODS =====
    /**
     * Get list of files and folders from media library
     * GET /medias/files
     */
    async getMediaFiles(params) {
        try {
            const queryParams = new URLSearchParams({
                sortBy: params.sortBy,
                sortOrder: params.sortOrder,
                altType: params.altType,
                altId: params.altId,
                ...(params.offset !== undefined && { offset: params.offset.toString() }),
                ...(params.limit !== undefined && { limit: params.limit.toString() }),
                ...(params.type && { type: params.type }),
                ...(params.query && { query: params.query }),
                ...(params.parentId && { parentId: params.parentId })
            });
            const response = await this.axiosInstance.get(`/medias/files?${queryParams}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Upload file to media library
     * POST /medias/upload-file
     */
    async uploadMediaFile(uploadData) {
        try {
            const formData = new FormData();
            // Handle file upload (either direct file or hosted file URL)
            if (uploadData.hosted && uploadData.fileUrl) {
                formData.append('hosted', 'true');
                formData.append('fileUrl', uploadData.fileUrl);
            }
            else if (uploadData.file) {
                formData.append('hosted', 'false');
                formData.append('file', uploadData.file);
            }
            else {
                throw new Error('Either file or fileUrl (with hosted=true) must be provided');
            }
            // Add optional fields
            if (uploadData.name) {
                formData.append('name', uploadData.name);
            }
            if (uploadData.parentId) {
                formData.append('parentId', uploadData.parentId);
            }
            const response = await this.axiosInstance.post('/medias/upload-file', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Delete file or folder from media library
     * DELETE /medias/{id}
     */
    async deleteMediaFile(deleteParams) {
        try {
            const queryParams = new URLSearchParams({
                altType: deleteParams.altType,
                altId: deleteParams.altId
            });
            const response = await this.axiosInstance.delete(`/medias/${deleteParams.id}?${queryParams}`);
            return this.wrapResponse({ success: true, message: 'Media file deleted successfully' });
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    // ===== CUSTOM OBJECTS API METHODS =====
    /**
     * Get all objects for a location
     * GET /objects/
     */
    async getObjectsByLocation(locationId) {
        try {
            const params = {
                locationId: locationId || this.config.locationId
            };
            const response = await this.axiosInstance.get('/objects/', { params });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Create custom object schema
     * POST /objects/
     */
    async createObjectSchema(schemaData) {
        try {
            const payload = {
                ...schemaData,
                locationId: schemaData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.post('/objects/', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get object schema by key/id
     * GET /objects/{key}
     */
    async getObjectSchema(params) {
        try {
            const queryParams = {
                locationId: params.locationId || this.config.locationId,
                ...(params.fetchProperties !== undefined && { fetchProperties: params.fetchProperties.toString() })
            };
            const response = await this.axiosInstance.get(`/objects/${params.key}`, { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Update object schema by key/id
     * PUT /objects/{key}
     */
    async updateObjectSchema(key, updateData) {
        try {
            const payload = {
                ...updateData,
                locationId: updateData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.put(`/objects/${key}`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Create object record
     * POST /objects/{schemaKey}/records
     */
    async createObjectRecord(schemaKey, recordData) {
        try {
            const payload = {
                ...recordData,
                locationId: recordData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.post(`/objects/${schemaKey}/records`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get object record by id
     * GET /objects/{schemaKey}/records/{id}
     */
    async getObjectRecord(schemaKey, recordId) {
        try {
            const response = await this.axiosInstance.get(`/objects/${schemaKey}/records/${recordId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Update object record
     * PUT /objects/{schemaKey}/records/{id}
     */
    async updateObjectRecord(schemaKey, recordId, updateData) {
        try {
            const queryParams = {
                locationId: updateData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.put(`/objects/${schemaKey}/records/${recordId}`, updateData, { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Delete object record
     * DELETE /objects/{schemaKey}/records/{id}
     */
    async deleteObjectRecord(schemaKey, recordId) {
        try {
            const response = await this.axiosInstance.delete(`/objects/${schemaKey}/records/${recordId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Search object records
     * POST /objects/{schemaKey}/records/search
     */
    async searchObjectRecords(schemaKey, searchData) {
        try {
            const payload = {
                ...searchData,
                locationId: searchData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.post(`/objects/${schemaKey}/records/search`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    // ===== ASSOCIATIONS API METHODS =====
    /**
     * Get all associations for a location
     * GET /associations/
     */
    async getAssociations(params) {
        try {
            const queryParams = {
                locationId: params.locationId || this.config.locationId,
                skip: params.skip.toString(),
                limit: params.limit.toString()
            };
            const response = await this.axiosInstance.get('/associations/', { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Create association
     * POST /associations/
     */
    async createAssociation(associationData) {
        try {
            const payload = {
                ...associationData,
                locationId: associationData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.post('/associations/', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get association by ID
     * GET /associations/{associationId}
     */
    async getAssociationById(associationId) {
        try {
            const response = await this.axiosInstance.get(`/associations/${associationId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Update association
     * PUT /associations/{associationId}
     */
    async updateAssociation(associationId, updateData) {
        try {
            const response = await this.axiosInstance.put(`/associations/${associationId}`, updateData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Delete association
     * DELETE /associations/{associationId}
     */
    async deleteAssociation(associationId) {
        try {
            const response = await this.axiosInstance.delete(`/associations/${associationId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get association by key name
     * GET /associations/key/{key_name}
     */
    async getAssociationByKey(params) {
        try {
            const queryParams = {
                locationId: params.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.get(`/associations/key/${params.keyName}`, { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get association by object key
     * GET /associations/objectKey/{objectKey}
     */
    async getAssociationByObjectKey(params) {
        try {
            const queryParams = params.locationId ? {
                locationId: params.locationId
            } : {};
            const response = await this.axiosInstance.get(`/associations/objectKey/${params.objectKey}`, { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Create relation between entities
     * POST /associations/relations
     */
    async createRelation(relationData) {
        try {
            const payload = {
                ...relationData,
                locationId: relationData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.post('/associations/relations', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get relations by record ID
     * GET /associations/relations/{recordId}
     */
    async getRelationsByRecord(params) {
        try {
            const queryParams = {
                locationId: params.locationId || this.config.locationId,
                skip: params.skip.toString(),
                limit: params.limit.toString(),
                ...(params.associationIds && { associationIds: params.associationIds })
            };
            const response = await this.axiosInstance.get(`/associations/relations/${params.recordId}`, { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Delete relation
     * DELETE /associations/relations/{relationId}
     */
    async deleteRelation(params) {
        try {
            const queryParams = {
                locationId: params.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.delete(`/associations/relations/${params.relationId}`, { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    // ===== CUSTOM FIELDS V2 API METHODS =====
    /**
     * Get custom field or folder by ID
     * GET /custom-fields/{id}
     */
    async getCustomFieldV2ById(id) {
        try {
            const response = await this.axiosInstance.get(`/custom-fields/${id}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Create custom field
     * POST /custom-fields/
     */
    async createCustomFieldV2(fieldData) {
        try {
            const payload = {
                ...fieldData,
                locationId: fieldData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.post('/custom-fields/', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Update custom field by ID
     * PUT /custom-fields/{id}
     */
    async updateCustomFieldV2(id, fieldData) {
        try {
            const payload = {
                ...fieldData,
                locationId: fieldData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.put(`/custom-fields/${id}`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Delete custom field by ID
     * DELETE /custom-fields/{id}
     */
    async deleteCustomFieldV2(id) {
        try {
            const response = await this.axiosInstance.delete(`/custom-fields/${id}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get custom fields by object key
     * GET /custom-fields/object-key/{objectKey}
     */
    async getCustomFieldsV2ByObjectKey(params) {
        try {
            const queryParams = {
                locationId: params.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.get(`/custom-fields/object-key/${params.objectKey}`, { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Create custom field folder
     * POST /custom-fields/folder
     */
    async createCustomFieldV2Folder(folderData) {
        try {
            const payload = {
                ...folderData,
                locationId: folderData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.post('/custom-fields/folder', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Update custom field folder name
     * PUT /custom-fields/folder/{id}
     */
    async updateCustomFieldV2Folder(id, folderData) {
        try {
            const payload = {
                ...folderData,
                locationId: folderData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.put(`/custom-fields/folder/${id}`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Delete custom field folder
     * DELETE /custom-fields/folder/{id}
     */
    async deleteCustomFieldV2Folder(params) {
        try {
            const queryParams = {
                locationId: params.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.delete(`/custom-fields/folder/${params.id}`, { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    // ===== WORKFLOWS API METHODS =====
    /**
     * Get all workflows for a location
     * GET /workflows/
     */
    async getWorkflows(request) {
        try {
            const queryParams = {
                locationId: request.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.get('/workflows/', { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    // ===== SURVEYS API METHODS =====
    /**
     * Get all surveys for a location
     * GET /surveys/
     */
    async getSurveys(request) {
        try {
            const queryParams = {
                locationId: request.locationId || this.config.locationId
            };
            if (request.skip !== undefined) {
                queryParams.skip = request.skip.toString();
            }
            if (request.limit !== undefined) {
                queryParams.limit = request.limit.toString();
            }
            if (request.type) {
                queryParams.type = request.type;
            }
            const response = await this.axiosInstance.get('/surveys/', { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw this.handleApiError(error);
        }
    }
    /**
     * Get survey submissions with filtering and pagination
     * GET /surveys/submissions
     */
    async getSurveySubmissions(request) {
        try {
            const locationId = request.locationId || this.config.locationId;
            const params = new URLSearchParams();
            if (request.page)
                params.append('page', request.page.toString());
            if (request.limit)
                params.append('limit', request.limit.toString());
            if (request.surveyId)
                params.append('surveyId', request.surveyId);
            if (request.q)
                params.append('q', request.q);
            if (request.startAt)
                params.append('startAt', request.startAt);
            if (request.endAt)
                params.append('endAt', request.endAt);
            const response = await this.axiosInstance.get(`/locations/${locationId}/surveys/submissions?${params.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    // ===== STORE API METHODS =====
    /**
     * SHIPPING ZONES API METHODS
     */
    /**
     * Create a new shipping zone
     * POST /store/shipping-zone
     */
    async createShippingZone(zoneData) {
        try {
            const payload = {
                ...zoneData,
                altId: zoneData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post('/store/shipping-zone', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * List all shipping zones
     * GET /store/shipping-zone
     */
    async listShippingZones(params) {
        try {
            const altId = params.altId || this.config.locationId;
            const queryParams = new URLSearchParams({
                altId,
                altType: 'location'
            });
            if (params.limit)
                queryParams.append('limit', params.limit.toString());
            if (params.offset)
                queryParams.append('offset', params.offset.toString());
            if (params.withShippingRate !== undefined)
                queryParams.append('withShippingRate', params.withShippingRate.toString());
            const response = await this.axiosInstance.get(`/store/shipping-zone?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get a specific shipping zone by ID
     * GET /store/shipping-zone/{shippingZoneId}
     */
    async getShippingZone(shippingZoneId, params) {
        try {
            const altId = params.altId || this.config.locationId;
            const queryParams = new URLSearchParams({
                altId,
                altType: 'location'
            });
            if (params.withShippingRate !== undefined)
                queryParams.append('withShippingRate', params.withShippingRate.toString());
            const response = await this.axiosInstance.get(`/store/shipping-zone/${shippingZoneId}?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update a shipping zone
     * PUT /store/shipping-zone/{shippingZoneId}
     */
    async updateShippingZone(shippingZoneId, updateData) {
        try {
            const payload = {
                ...updateData,
                altId: updateData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.put(`/store/shipping-zone/${shippingZoneId}`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Delete a shipping zone
     * DELETE /store/shipping-zone/{shippingZoneId}
     */
    async deleteShippingZone(shippingZoneId, params) {
        try {
            const altId = params.altId || this.config.locationId;
            const queryParams = new URLSearchParams({
                altId,
                altType: 'location'
            });
            const response = await this.axiosInstance.delete(`/store/shipping-zone/${shippingZoneId}?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * SHIPPING RATES API METHODS
     */
    /**
     * Get available shipping rates for an order
     * POST /store/shipping-zone/shipping-rates
     */
    async getAvailableShippingRates(rateData) {
        try {
            const payload = {
                ...rateData,
                altId: rateData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post('/store/shipping-zone/shipping-rates', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Create a new shipping rate for a zone
     * POST /store/shipping-zone/{shippingZoneId}/shipping-rate
     */
    async createShippingRate(shippingZoneId, rateData) {
        try {
            const payload = {
                ...rateData,
                altId: rateData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post(`/store/shipping-zone/${shippingZoneId}/shipping-rate`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * List shipping rates for a zone
     * GET /store/shipping-zone/{shippingZoneId}/shipping-rate
     */
    async listShippingRates(shippingZoneId, params) {
        try {
            const altId = params.altId || this.config.locationId;
            const queryParams = new URLSearchParams({
                altId,
                altType: 'location'
            });
            if (params.limit)
                queryParams.append('limit', params.limit.toString());
            if (params.offset)
                queryParams.append('offset', params.offset.toString());
            const response = await this.axiosInstance.get(`/store/shipping-zone/${shippingZoneId}/shipping-rate?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get a specific shipping rate
     * GET /store/shipping-zone/{shippingZoneId}/shipping-rate/{shippingRateId}
     */
    async getShippingRate(shippingZoneId, shippingRateId, params) {
        try {
            const altId = params.altId || this.config.locationId;
            const queryParams = new URLSearchParams({
                altId,
                altType: 'location'
            });
            const response = await this.axiosInstance.get(`/store/shipping-zone/${shippingZoneId}/shipping-rate/${shippingRateId}?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update a shipping rate
     * PUT /store/shipping-zone/{shippingZoneId}/shipping-rate/{shippingRateId}
     */
    async updateShippingRate(shippingZoneId, shippingRateId, updateData) {
        try {
            const payload = {
                ...updateData,
                altId: updateData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.put(`/store/shipping-zone/${shippingZoneId}/shipping-rate/${shippingRateId}`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Delete a shipping rate
     * DELETE /store/shipping-zone/{shippingZoneId}/shipping-rate/{shippingRateId}
     */
    async deleteShippingRate(shippingZoneId, shippingRateId, params) {
        try {
            const altId = params.altId || this.config.locationId;
            const queryParams = new URLSearchParams({
                altId,
                altType: 'location'
            });
            const response = await this.axiosInstance.delete(`/store/shipping-zone/${shippingZoneId}/shipping-rate/${shippingRateId}?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * SHIPPING CARRIERS API METHODS
     */
    /**
     * Create a new shipping carrier
     * POST /store/shipping-carrier
     */
    async createShippingCarrier(carrierData) {
        try {
            const payload = {
                ...carrierData,
                altId: carrierData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post('/store/shipping-carrier', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * List all shipping carriers
     * GET /store/shipping-carrier
     */
    async listShippingCarriers(params) {
        try {
            const altId = params.altId || this.config.locationId;
            const queryParams = new URLSearchParams({
                altId,
                altType: 'location'
            });
            const response = await this.axiosInstance.get(`/store/shipping-carrier?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get a specific shipping carrier by ID
     * GET /store/shipping-carrier/{shippingCarrierId}
     */
    async getShippingCarrier(shippingCarrierId, params) {
        try {
            const altId = params.altId || this.config.locationId;
            const queryParams = new URLSearchParams({
                altId,
                altType: 'location'
            });
            const response = await this.axiosInstance.get(`/store/shipping-carrier/${shippingCarrierId}?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update a shipping carrier
     * PUT /store/shipping-carrier/{shippingCarrierId}
     */
    async updateShippingCarrier(shippingCarrierId, updateData) {
        try {
            const payload = {
                ...updateData,
                altId: updateData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.put(`/store/shipping-carrier/${shippingCarrierId}`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Delete a shipping carrier
     * DELETE /store/shipping-carrier/{shippingCarrierId}
     */
    async deleteShippingCarrier(shippingCarrierId, params) {
        try {
            const altId = params.altId || this.config.locationId;
            const queryParams = new URLSearchParams({
                altId,
                altType: 'location'
            });
            const response = await this.axiosInstance.delete(`/store/shipping-carrier/${shippingCarrierId}?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * STORE SETTINGS API METHODS
     */
    /**
     * Create or update store settings
     * POST /store/store-setting
     */
    async createStoreSetting(settingData) {
        try {
            const payload = {
                ...settingData,
                altId: settingData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post('/store/store-setting', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get store settings
     * GET /store/store-setting
     */
    async getStoreSetting(params) {
        try {
            const altId = params.altId || this.config.locationId;
            const queryParams = new URLSearchParams({
                altId,
                altType: 'location'
            });
            const response = await this.axiosInstance.get(`/store/store-setting?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * PRODUCTS API METHODS
     */
    /**
     * Create a new product
     * POST /products/
     */
    async createProduct(productData) {
        try {
            const response = await this.axiosInstance.post('/products/', productData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update a product by ID
     * PUT /products/{productId}
     */
    async updateProduct(productId, updateData) {
        try {
            const response = await this.axiosInstance.put(`/products/${productId}`, updateData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get a product by ID
     * GET /products/{productId}
     */
    async getProduct(productId, locationId) {
        try {
            const queryParams = new URLSearchParams({
                locationId: locationId || this.config.locationId
            });
            const response = await this.axiosInstance.get(`/products/${productId}?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * List products
     * GET /products/
     */
    async listProducts(params) {
        try {
            const queryParams = new URLSearchParams({
                locationId: params.locationId || this.config.locationId
            });
            if (params.limit)
                queryParams.append('limit', params.limit.toString());
            if (params.offset)
                queryParams.append('offset', params.offset.toString());
            if (params.search)
                queryParams.append('search', params.search);
            if (params.collectionIds?.length)
                queryParams.append('collectionIds', params.collectionIds.join(','));
            if (params.collectionSlug)
                queryParams.append('collectionSlug', params.collectionSlug);
            if (params.expand?.length)
                params.expand.forEach(item => queryParams.append('expand', item));
            if (params.productIds?.length)
                params.productIds.forEach(id => queryParams.append('productIds', id));
            if (params.storeId)
                queryParams.append('storeId', params.storeId);
            if (params.includedInStore !== undefined)
                queryParams.append('includedInStore', params.includedInStore.toString());
            if (params.availableInStore !== undefined)
                queryParams.append('availableInStore', params.availableInStore.toString());
            if (params.sortOrder)
                queryParams.append('sortOrder', params.sortOrder);
            const response = await this.axiosInstance.get(`/products/?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Delete a product by ID
     * DELETE /products/{productId}
     */
    async deleteProduct(productId, locationId) {
        try {
            const queryParams = new URLSearchParams({
                locationId: locationId || this.config.locationId
            });
            const response = await this.axiosInstance.delete(`/products/${productId}?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Bulk update products
     * POST /products/bulk-update
     */
    async bulkUpdateProducts(updateData) {
        try {
            const payload = {
                ...updateData,
                altId: updateData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post('/products/bulk-update', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Create a price for a product
     * POST /products/{productId}/price
     */
    async createPrice(productId, priceData) {
        try {
            const payload = {
                ...priceData,
                locationId: priceData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.post(`/products/${productId}/price`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update a price by ID
     * PUT /products/{productId}/price/{priceId}
     */
    async updatePrice(productId, priceId, updateData) {
        try {
            const payload = {
                ...updateData,
                locationId: updateData.locationId || this.config.locationId
            };
            const response = await this.axiosInstance.put(`/products/${productId}/price/${priceId}`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get a price by ID
     * GET /products/{productId}/price/{priceId}
     */
    async getPrice(productId, priceId, locationId) {
        try {
            const queryParams = new URLSearchParams({
                locationId: locationId || this.config.locationId
            });
            const response = await this.axiosInstance.get(`/products/${productId}/price/${priceId}?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * List prices for a product
     * GET /products/{productId}/price
     */
    async listPrices(productId, params) {
        try {
            const queryParams = new URLSearchParams({
                locationId: params.locationId || this.config.locationId
            });
            if (params.limit)
                queryParams.append('limit', params.limit.toString());
            if (params.offset)
                queryParams.append('offset', params.offset.toString());
            if (params.ids)
                queryParams.append('ids', params.ids);
            const response = await this.axiosInstance.get(`/products/${productId}/price?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Delete a price by ID
     * DELETE /products/{productId}/price/{priceId}
     */
    async deletePrice(productId, priceId, locationId) {
        try {
            const queryParams = new URLSearchParams({
                locationId: locationId || this.config.locationId
            });
            const response = await this.axiosInstance.delete(`/products/${productId}/price/${priceId}?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * List inventory
     * GET /products/inventory
     */
    async listInventory(params) {
        try {
            const queryParams = new URLSearchParams({
                altId: params.altId || this.config.locationId,
                altType: 'location'
            });
            if (params.limit)
                queryParams.append('limit', params.limit.toString());
            if (params.offset)
                queryParams.append('offset', params.offset.toString());
            if (params.search)
                queryParams.append('search', params.search);
            const response = await this.axiosInstance.get(`/products/inventory?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update inventory
     * POST /products/inventory
     */
    async updateInventory(updateData) {
        try {
            const payload = {
                ...updateData,
                altId: updateData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post('/products/inventory', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get product store stats
     * GET /products/store/{storeId}/stats
     */
    async getProductStoreStats(storeId, params) {
        try {
            const queryParams = new URLSearchParams({
                altId: params.altId || this.config.locationId,
                altType: 'location'
            });
            if (params.search)
                queryParams.append('search', params.search);
            if (params.collectionIds)
                queryParams.append('collectionIds', params.collectionIds);
            const response = await this.axiosInstance.get(`/products/store/${storeId}/stats?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update product store status
     * POST /products/store/{storeId}
     */
    async updateProductStore(storeId, updateData) {
        try {
            const response = await this.axiosInstance.post(`/products/store/${storeId}`, updateData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Create a product collection
     * POST /products/collections
     */
    async createProductCollection(collectionData) {
        try {
            const payload = {
                ...collectionData,
                altId: collectionData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post('/products/collections', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update a product collection
     * PUT /products/collections/{collectionId}
     */
    async updateProductCollection(collectionId, updateData) {
        try {
            const payload = {
                ...updateData,
                altId: updateData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.put(`/products/collections/${collectionId}`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get a product collection by ID
     * GET /products/collections/{collectionId}
     */
    async getProductCollection(collectionId) {
        try {
            const response = await this.axiosInstance.get(`/products/collections/${collectionId}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * List product collections
     * GET /products/collections
     */
    async listProductCollections(params) {
        try {
            const queryParams = new URLSearchParams({
                altId: params.altId || this.config.locationId,
                altType: 'location'
            });
            if (params.limit)
                queryParams.append('limit', params.limit.toString());
            if (params.offset)
                queryParams.append('offset', params.offset.toString());
            if (params.collectionIds)
                queryParams.append('collectionIds', params.collectionIds);
            if (params.name)
                queryParams.append('name', params.name);
            const response = await this.axiosInstance.get(`/products/collections?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Delete a product collection
     * DELETE /products/collections/{collectionId}
     */
    async deleteProductCollection(collectionId, params) {
        try {
            const queryParams = new URLSearchParams({
                altId: params.altId || this.config.locationId,
                altType: 'location'
            });
            const response = await this.axiosInstance.delete(`/products/collections/${collectionId}?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * List product reviews
     * GET /products/reviews
     */
    async listProductReviews(params) {
        try {
            const queryParams = new URLSearchParams({
                altId: params.altId || this.config.locationId,
                altType: 'location'
            });
            if (params.limit)
                queryParams.append('limit', params.limit.toString());
            if (params.offset)
                queryParams.append('offset', params.offset.toString());
            if (params.sortField)
                queryParams.append('sortField', params.sortField);
            if (params.sortOrder)
                queryParams.append('sortOrder', params.sortOrder);
            if (params.rating)
                queryParams.append('rating', params.rating.toString());
            if (params.startDate)
                queryParams.append('startDate', params.startDate);
            if (params.endDate)
                queryParams.append('endDate', params.endDate);
            if (params.productId)
                queryParams.append('productId', params.productId);
            if (params.storeId)
                queryParams.append('storeId', params.storeId);
            const response = await this.axiosInstance.get(`/products/reviews?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get reviews count
     * GET /products/reviews/count
     */
    async getReviewsCount(params) {
        try {
            const queryParams = new URLSearchParams({
                altId: params.altId || this.config.locationId,
                altType: 'location'
            });
            if (params.rating)
                queryParams.append('rating', params.rating.toString());
            if (params.startDate)
                queryParams.append('startDate', params.startDate);
            if (params.endDate)
                queryParams.append('endDate', params.endDate);
            if (params.productId)
                queryParams.append('productId', params.productId);
            if (params.storeId)
                queryParams.append('storeId', params.storeId);
            const response = await this.axiosInstance.get(`/products/reviews/count?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update a product review
     * PUT /products/reviews/{reviewId}
     */
    async updateProductReview(reviewId, updateData) {
        try {
            const payload = {
                ...updateData,
                altId: updateData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.put(`/products/reviews/${reviewId}`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Delete a product review
     * DELETE /products/reviews/{reviewId}
     */
    async deleteProductReview(reviewId, params) {
        try {
            const queryParams = new URLSearchParams({
                altId: params.altId || this.config.locationId,
                altType: 'location',
                productId: params.productId
            });
            const response = await this.axiosInstance.delete(`/products/reviews/${reviewId}?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Bulk update product reviews
     * POST /products/reviews/bulk-update
     */
    async bulkUpdateProductReviews(updateData) {
        try {
            const payload = {
                ...updateData,
                altId: updateData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post('/products/reviews/bulk-update', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * PAYMENTS API METHODS
     */
    /**
     * Create white-label integration provider
     * POST /payments/integrations/provider/whitelabel
     */
    async createWhiteLabelIntegrationProvider(data) {
        try {
            const response = await this.axiosInstance.post('/payments/integrations/provider/whitelabel', data);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * List white-label integration providers
     * GET /payments/integrations/provider/whitelabel
     */
    async listWhiteLabelIntegrationProviders(params) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
            const response = await this.axiosInstance.get(`/payments/integrations/provider/whitelabel?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * List orders
     * GET /payments/orders
     */
    async listOrders(params) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
            const response = await this.axiosInstance.get(`/payments/orders?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get order by ID
     * GET /payments/orders/{orderId}
     */
    async getOrderById(orderId, params) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && key !== 'orderId') {
                    queryParams.append(key, value.toString());
                }
            });
            const response = await this.axiosInstance.get(`/payments/orders/${orderId}?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Create order fulfillment
     * POST /payments/orders/{orderId}/fulfillments
     */
    async createOrderFulfillment(orderId, data) {
        try {
            const response = await this.axiosInstance.post(`/payments/orders/${orderId}/fulfillments`, data);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * List order fulfillments
     * GET /payments/orders/{orderId}/fulfillments
     */
    async listOrderFulfillments(orderId, params) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && key !== 'orderId') {
                    queryParams.append(key, value.toString());
                }
            });
            const response = await this.axiosInstance.get(`/payments/orders/${orderId}/fulfillments?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * List transactions
     * GET /payments/transactions
     */
    async listTransactions(params) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
            const response = await this.axiosInstance.get(`/payments/transactions?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get transaction by ID
     * GET /payments/transactions/{transactionId}
     */
    async getTransactionById(transactionId, params) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && key !== 'transactionId') {
                    queryParams.append(key, value.toString());
                }
            });
            const response = await this.axiosInstance.get(`/payments/transactions/${transactionId}?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * List subscriptions
     * GET /payments/subscriptions
     */
    async listSubscriptions(params) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
            const response = await this.axiosInstance.get(`/payments/subscriptions?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get subscription by ID
     * GET /payments/subscriptions/{subscriptionId}
     */
    async getSubscriptionById(subscriptionId, params) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && key !== 'subscriptionId') {
                    queryParams.append(key, value.toString());
                }
            });
            const response = await this.axiosInstance.get(`/payments/subscriptions/${subscriptionId}?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * List coupons
     * GET /payments/coupon/list
     */
    async listCoupons(params) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
            const response = await this.axiosInstance.get(`/payments/coupon/list?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Create coupon
     * POST /payments/coupon
     */
    async createCoupon(data) {
        try {
            const response = await this.axiosInstance.post('/payments/coupon', data);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update coupon
     * PUT /payments/coupon
     */
    async updateCoupon(data) {
        try {
            const response = await this.axiosInstance.put('/payments/coupon', data);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Delete coupon
     * DELETE /payments/coupon
     */
    async deleteCoupon(data) {
        try {
            const response = await this.axiosInstance.delete('/payments/coupon', { data });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get coupon
     * GET /payments/coupon
     */
    async getCoupon(params) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
            const response = await this.axiosInstance.get(`/payments/coupon?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Create custom provider integration
     * POST /payments/custom-provider/provider
     */
    async createCustomProviderIntegration(locationId, data) {
        try {
            const queryParams = new URLSearchParams({ locationId });
            const response = await this.axiosInstance.post(`/payments/custom-provider/provider?${queryParams.toString()}`, data);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Delete custom provider integration
     * DELETE /payments/custom-provider/provider
     */
    async deleteCustomProviderIntegration(locationId) {
        try {
            const queryParams = new URLSearchParams({ locationId });
            const response = await this.axiosInstance.delete(`/payments/custom-provider/provider?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get custom provider config
     * GET /payments/custom-provider/connect
     */
    async getCustomProviderConfig(locationId) {
        try {
            const queryParams = new URLSearchParams({ locationId });
            const response = await this.axiosInstance.get(`/payments/custom-provider/connect?${queryParams.toString()}`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Create custom provider config
     * POST /payments/custom-provider/connect
     */
    async createCustomProviderConfig(locationId, data) {
        try {
            const queryParams = new URLSearchParams({ locationId });
            const response = await this.axiosInstance.post(`/payments/custom-provider/connect?${queryParams.toString()}`, data);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Disconnect custom provider config
     * POST /payments/custom-provider/disconnect
     */
    async disconnectCustomProviderConfig(locationId, data) {
        try {
            const queryParams = new URLSearchParams({ locationId });
            const response = await this.axiosInstance.post(`/payments/custom-provider/disconnect?${queryParams.toString()}`, data);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    // =============================================================================
    // INVOICES API METHODS
    // =============================================================================
    /**
     * Create invoice template
     * POST /invoices/template
     */
    async createInvoiceTemplate(templateData) {
        try {
            const payload = {
                ...templateData,
                altId: templateData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post('/invoices/template', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * List invoice templates
     * GET /invoices/template
     */
    async listInvoiceTemplates(params) {
        try {
            const queryParams = {
                altId: params?.altId || this.config.locationId,
                altType: 'location',
                limit: params?.limit || '10',
                offset: params?.offset || '0',
                ...(params?.status && { status: params.status }),
                ...(params?.startAt && { startAt: params.startAt }),
                ...(params?.endAt && { endAt: params.endAt }),
                ...(params?.search && { search: params.search }),
                ...(params?.paymentMode && { paymentMode: params.paymentMode })
            };
            const response = await this.axiosInstance.get('/invoices/template', { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get invoice template by ID
     * GET /invoices/template/{templateId}
     */
    async getInvoiceTemplate(templateId, params) {
        try {
            const queryParams = {
                altId: params?.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.get(`/invoices/template/${templateId}`, { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update invoice template
     * PUT /invoices/template/{templateId}
     */
    async updateInvoiceTemplate(templateId, templateData) {
        try {
            const payload = {
                ...templateData,
                altId: templateData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.put(`/invoices/template/${templateId}`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Delete invoice template
     * DELETE /invoices/template/{templateId}
     */
    async deleteInvoiceTemplate(templateId, params) {
        try {
            const queryParams = {
                altId: params?.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.delete(`/invoices/template/${templateId}`, { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update invoice template late fees configuration
     * PATCH /invoices/template/{templateId}/late-fees-configuration
     */
    async updateInvoiceTemplateLateFeesConfiguration(templateId, configData) {
        try {
            const payload = {
                ...configData,
                altId: configData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.patch(`/invoices/template/${templateId}/late-fees-configuration`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update invoice template payment methods configuration
     * PATCH /invoices/template/{templateId}/payment-methods-configuration
     */
    async updateInvoiceTemplatePaymentMethodsConfiguration(templateId, configData) {
        try {
            const payload = {
                ...configData,
                altId: configData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.patch(`/invoices/template/${templateId}/payment-methods-configuration`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Create invoice schedule
     * POST /invoices/schedule
     */
    async createInvoiceSchedule(scheduleData) {
        try {
            const payload = {
                ...scheduleData,
                altId: scheduleData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post('/invoices/schedule', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * List invoice schedules
     * GET /invoices/schedule
     */
    async listInvoiceSchedules(params) {
        try {
            const queryParams = {
                altId: params?.altId || this.config.locationId,
                altType: 'location',
                limit: params?.limit || '10',
                offset: params?.offset || '0',
                ...(params?.status && { status: params.status }),
                ...(params?.startAt && { startAt: params.startAt }),
                ...(params?.endAt && { endAt: params.endAt }),
                ...(params?.search && { search: params.search }),
                ...(params?.paymentMode && { paymentMode: params.paymentMode })
            };
            const response = await this.axiosInstance.get('/invoices/schedule', { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get invoice schedule by ID
     * GET /invoices/schedule/{scheduleId}
     */
    async getInvoiceSchedule(scheduleId, params) {
        try {
            const queryParams = {
                altId: params?.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.get(`/invoices/schedule/${scheduleId}`, { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update invoice schedule
     * PUT /invoices/schedule/{scheduleId}
     */
    async updateInvoiceSchedule(scheduleId, scheduleData) {
        try {
            const payload = {
                ...scheduleData,
                altId: scheduleData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.put(`/invoices/schedule/${scheduleId}`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Delete invoice schedule
     * DELETE /invoices/schedule/{scheduleId}
     */
    async deleteInvoiceSchedule(scheduleId, params) {
        try {
            const queryParams = {
                altId: params?.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.delete(`/invoices/schedule/${scheduleId}`, { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update and schedule recurring invoice
     * POST /invoices/schedule/{scheduleId}/updateAndSchedule
     */
    async updateAndScheduleInvoiceSchedule(scheduleId) {
        try {
            const response = await this.axiosInstance.post(`/invoices/schedule/${scheduleId}/updateAndSchedule`);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Schedule an invoice schedule
     * POST /invoices/schedule/{scheduleId}/schedule
     */
    async scheduleInvoiceSchedule(scheduleId, scheduleData) {
        try {
            const payload = {
                ...scheduleData,
                altId: scheduleData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post(`/invoices/schedule/${scheduleId}/schedule`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Manage auto payment for schedule invoice
     * POST /invoices/schedule/{scheduleId}/auto-payment
     */
    async autoPaymentInvoiceSchedule(scheduleId, paymentData) {
        try {
            const payload = {
                ...paymentData,
                altId: paymentData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post(`/invoices/schedule/${scheduleId}/auto-payment`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Cancel scheduled invoice
     * POST /invoices/schedule/{scheduleId}/cancel
     */
    async cancelInvoiceSchedule(scheduleId, cancelData) {
        try {
            const payload = {
                ...cancelData,
                altId: cancelData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post(`/invoices/schedule/${scheduleId}/cancel`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Create or update text2pay invoice
     * POST /invoices/text2pay
     */
    async text2PayInvoice(invoiceData) {
        try {
            const payload = {
                ...invoiceData,
                altId: invoiceData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post('/invoices/text2pay', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Generate invoice number
     * GET /invoices/generate-invoice-number
     */
    async generateInvoiceNumber(params) {
        try {
            const queryParams = {
                altId: params?.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.get('/invoices/generate-invoice-number', { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get invoice by ID
     * GET /invoices/{invoiceId}
     */
    async getInvoice(invoiceId, params) {
        try {
            const queryParams = {
                altId: params?.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.get(`/invoices/${invoiceId}`, { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update invoice
     * PUT /invoices/{invoiceId}
     */
    async updateInvoice(invoiceId, invoiceData) {
        try {
            const payload = {
                ...invoiceData,
                altId: invoiceData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.put(`/invoices/${invoiceId}`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Delete invoice
     * DELETE /invoices/{invoiceId}
     */
    async deleteInvoice(invoiceId, params) {
        try {
            const queryParams = {
                altId: params?.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.delete(`/invoices/${invoiceId}`, { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update invoice late fees configuration
     * PATCH /invoices/{invoiceId}/late-fees-configuration
     */
    async updateInvoiceLateFeesConfiguration(invoiceId, configData) {
        try {
            const payload = {
                ...configData,
                altId: configData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.patch(`/invoices/${invoiceId}/late-fees-configuration`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Void invoice
     * POST /invoices/{invoiceId}/void
     */
    async voidInvoice(invoiceId, voidData) {
        try {
            const payload = {
                ...voidData,
                altId: voidData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post(`/invoices/${invoiceId}/void`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Send invoice
     * POST /invoices/{invoiceId}/send
     */
    async sendInvoice(invoiceId, sendData) {
        try {
            const payload = {
                ...sendData,
                altId: sendData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post(`/invoices/${invoiceId}/send`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Record manual payment for invoice
     * POST /invoices/{invoiceId}/record-payment
     */
    async recordInvoicePayment(invoiceId, paymentData) {
        try {
            const payload = {
                ...paymentData,
                altId: paymentData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post(`/invoices/${invoiceId}/record-payment`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update invoice last visited at
     * PATCH /invoices/stats/last-visited-at
     */
    async updateInvoiceLastVisitedAt(statsData) {
        try {
            const response = await this.axiosInstance.patch('/invoices/stats/last-visited-at', statsData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Create new estimate
     * POST /invoices/estimate
     */
    async createEstimate(estimateData) {
        try {
            const payload = {
                ...estimateData,
                altId: estimateData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post('/invoices/estimate', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update estimate
     * PUT /invoices/estimate/{estimateId}
     */
    async updateEstimate(estimateId, estimateData) {
        try {
            const payload = {
                ...estimateData,
                altId: estimateData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.put(`/invoices/estimate/${estimateId}`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Delete estimate
     * DELETE /invoices/estimate/{estimateId}
     */
    async deleteEstimate(estimateId, deleteData) {
        try {
            const payload = {
                ...deleteData,
                altId: deleteData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.delete(`/invoices/estimate/${estimateId}`, { data: payload });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Generate estimate number
     * GET /invoices/estimate/number/generate
     */
    async generateEstimateNumber(params) {
        try {
            const queryParams = {
                altId: params?.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.get('/invoices/estimate/number/generate', { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Send estimate
     * POST /invoices/estimate/{estimateId}/send
     */
    async sendEstimate(estimateId, sendData) {
        try {
            const payload = {
                ...sendData,
                altId: sendData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post(`/invoices/estimate/${estimateId}/send`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Create invoice from estimate
     * POST /invoices/estimate/{estimateId}/invoice
     */
    async createInvoiceFromEstimate(estimateId, invoiceData) {
        try {
            const payload = {
                ...invoiceData,
                altId: invoiceData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post(`/invoices/estimate/${estimateId}/invoice`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * List estimates
     * GET /invoices/estimate/list
     */
    async listEstimates(params) {
        try {
            const queryParams = {
                altId: params?.altId || this.config.locationId,
                altType: 'location',
                limit: params?.limit || '10',
                offset: params?.offset || '0',
                ...(params?.startAt && { startAt: params.startAt }),
                ...(params?.endAt && { endAt: params.endAt }),
                ...(params?.search && { search: params.search }),
                ...(params?.status && { status: params.status }),
                ...(params?.contactId && { contactId: params.contactId })
            };
            const response = await this.axiosInstance.get('/invoices/estimate/list', { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update estimate last visited at
     * PATCH /invoices/estimate/stats/last-visited-at
     */
    async updateEstimateLastVisitedAt(statsData) {
        try {
            const response = await this.axiosInstance.patch('/invoices/estimate/stats/last-visited-at', statsData);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * List estimate templates
     * GET /invoices/estimate/template
     */
    async listEstimateTemplates(params) {
        try {
            const queryParams = {
                altId: params?.altId || this.config.locationId,
                altType: 'location',
                limit: params?.limit || '10',
                offset: params?.offset || '0',
                ...(params?.search && { search: params.search })
            };
            const response = await this.axiosInstance.get('/invoices/estimate/template', { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Create estimate template
     * POST /invoices/estimate/template
     */
    async createEstimateTemplate(templateData) {
        try {
            const payload = {
                ...templateData,
                altId: templateData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post('/invoices/estimate/template', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Update estimate template
     * PUT /invoices/estimate/template/{templateId}
     */
    async updateEstimateTemplate(templateId, templateData) {
        try {
            const payload = {
                ...templateData,
                altId: templateData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.put(`/invoices/estimate/template/${templateId}`, payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Delete estimate template
     * DELETE /invoices/estimate/template/{templateId}
     */
    async deleteEstimateTemplate(templateId, deleteData) {
        try {
            const payload = {
                ...deleteData,
                altId: deleteData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.delete(`/invoices/estimate/template/${templateId}`, { data: payload });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Preview estimate template
     * GET /invoices/estimate/template/preview
     */
    async previewEstimateTemplate(params) {
        try {
            const queryParams = {
                altId: params?.altId || this.config.locationId,
                altType: 'location',
                templateId: params?.templateId || ''
            };
            const response = await this.axiosInstance.get('/invoices/estimate/template/preview', { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Create invoice
     * POST /invoices/
     */
    async createInvoice(invoiceData) {
        try {
            const payload = {
                ...invoiceData,
                altId: invoiceData.altId || this.config.locationId,
                altType: 'location'
            };
            const response = await this.axiosInstance.post('/invoices/', payload);
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * List invoices
     * GET /invoices/
     */
    async listInvoices(params) {
        try {
            const queryParams = {
                altId: params?.altId || this.config.locationId,
                altType: 'location',
                limit: params?.limit || '10',
                offset: params?.offset || '0',
                ...(params?.status && { status: params.status }),
                ...(params?.startAt && { startAt: params.startAt }),
                ...(params?.endAt && { endAt: params.endAt }),
                ...(params?.search && { search: params.search }),
                ...(params?.paymentMode && { paymentMode: params.paymentMode }),
                ...(params?.contactId && { contactId: params.contactId }),
                ...(params?.sortField && { sortField: params.sortField }),
                ...(params?.sortOrder && { sortOrder: params.sortOrder })
            };
            const response = await this.axiosInstance.get('/invoices/', { params: queryParams });
            return this.wrapResponse(response.data);
        }
        catch (error) {
            throw error;
        }
    }
}
exports.GHLApiClient = GHLApiClient;
