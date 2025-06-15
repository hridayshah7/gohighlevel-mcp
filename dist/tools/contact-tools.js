"use strict";
/**
 * GoHighLevel Contact Tools
 * Implements all contact management functionality for the MCP server
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactTools = void 0;
/**
 * Contact Tools class
 * Provides comprehensive contact management capabilities
 */
class ContactTools {
    ghlClient;
    constructor(ghlClient) {
        this.ghlClient = ghlClient;
    }
    /**
     * Get tool definitions for all contact operations
     */
    getToolDefinitions() {
        return [
            // Basic Contact Management
            {
                name: 'create_contact',
                description: 'Create a new contact in GoHighLevel',
                inputSchema: {
                    type: 'object',
                    properties: {
                        firstName: { type: 'string', description: 'Contact first name' },
                        lastName: { type: 'string', description: 'Contact last name' },
                        email: { type: 'string', description: 'Contact email address' },
                        phone: { type: 'string', description: 'Contact phone number' },
                        tags: { type: 'array', items: { type: 'string' }, description: 'Tags to assign to contact' },
                        source: { type: 'string', description: 'Source of the contact' }
                    },
                    required: ['email']
                }
            },
            {
                name: 'search_contacts',
                description: 'Search for contacts with advanced filtering options',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: { type: 'string', description: 'Search query string' },
                        email: { type: 'string', description: 'Filter by email address' },
                        phone: { type: 'string', description: 'Filter by phone number' },
                        limit: { type: 'number', description: 'Maximum number of results (default: 25)' }
                    }
                }
            },
            {
                name: 'get_contact',
                description: 'Get detailed information about a specific contact',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' }
                    },
                    required: ['contactId']
                }
            },
            {
                name: 'update_contact',
                description: 'Update contact information',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' },
                        firstName: { type: 'string', description: 'Contact first name' },
                        lastName: { type: 'string', description: 'Contact last name' },
                        email: { type: 'string', description: 'Contact email address' },
                        phone: { type: 'string', description: 'Contact phone number' },
                        tags: { type: 'array', items: { type: 'string' }, description: 'Tags to assign to contact' }
                    },
                    required: ['contactId']
                }
            },
            {
                name: 'delete_contact',
                description: 'Delete a contact from GoHighLevel',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' }
                    },
                    required: ['contactId']
                }
            },
            {
                name: 'add_contact_tags',
                description: 'Add tags to a contact',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' },
                        tags: { type: 'array', items: { type: 'string' }, description: 'Tags to add' }
                    },
                    required: ['contactId', 'tags']
                }
            },
            {
                name: 'remove_contact_tags',
                description: 'Remove tags from a contact',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' },
                        tags: { type: 'array', items: { type: 'string' }, description: 'Tags to remove' }
                    },
                    required: ['contactId', 'tags']
                }
            },
            // Task Management
            {
                name: 'get_contact_tasks',
                description: 'Get all tasks for a contact',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' }
                    },
                    required: ['contactId']
                }
            },
            {
                name: 'create_contact_task',
                description: 'Create a new task for a contact',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' },
                        title: { type: 'string', description: 'Task title' },
                        body: { type: 'string', description: 'Task description' },
                        dueDate: { type: 'string', description: 'Due date (ISO format)' },
                        completed: { type: 'boolean', description: 'Task completion status' },
                        assignedTo: { type: 'string', description: 'User ID to assign task to' }
                    },
                    required: ['contactId', 'title', 'dueDate']
                }
            },
            {
                name: 'get_contact_task',
                description: 'Get a specific task for a contact',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' },
                        taskId: { type: 'string', description: 'Task ID' }
                    },
                    required: ['contactId', 'taskId']
                }
            },
            {
                name: 'update_contact_task',
                description: 'Update a task for a contact',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' },
                        taskId: { type: 'string', description: 'Task ID' },
                        title: { type: 'string', description: 'Task title' },
                        body: { type: 'string', description: 'Task description' },
                        dueDate: { type: 'string', description: 'Due date (ISO format)' },
                        completed: { type: 'boolean', description: 'Task completion status' },
                        assignedTo: { type: 'string', description: 'User ID to assign task to' }
                    },
                    required: ['contactId', 'taskId']
                }
            },
            {
                name: 'delete_contact_task',
                description: 'Delete a task for a contact',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' },
                        taskId: { type: 'string', description: 'Task ID' }
                    },
                    required: ['contactId', 'taskId']
                }
            },
            {
                name: 'update_task_completion',
                description: 'Update task completion status',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' },
                        taskId: { type: 'string', description: 'Task ID' },
                        completed: { type: 'boolean', description: 'Completion status' }
                    },
                    required: ['contactId', 'taskId', 'completed']
                }
            },
            // Note Management
            {
                name: 'get_contact_notes',
                description: 'Get all notes for a contact',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' }
                    },
                    required: ['contactId']
                }
            },
            {
                name: 'create_contact_note',
                description: 'Create a new note for a contact',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' },
                        body: { type: 'string', description: 'Note content' },
                        userId: { type: 'string', description: 'User ID creating the note' }
                    },
                    required: ['contactId', 'body']
                }
            },
            {
                name: 'get_contact_note',
                description: 'Get a specific note for a contact',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' },
                        noteId: { type: 'string', description: 'Note ID' }
                    },
                    required: ['contactId', 'noteId']
                }
            },
            {
                name: 'update_contact_note',
                description: 'Update a note for a contact',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' },
                        noteId: { type: 'string', description: 'Note ID' },
                        body: { type: 'string', description: 'Note content' },
                        userId: { type: 'string', description: 'User ID updating the note' }
                    },
                    required: ['contactId', 'noteId', 'body']
                }
            },
            {
                name: 'delete_contact_note',
                description: 'Delete a note for a contact',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' },
                        noteId: { type: 'string', description: 'Note ID' }
                    },
                    required: ['contactId', 'noteId']
                }
            },
            // Advanced Contact Operations
            {
                name: 'upsert_contact',
                description: 'Create or update contact based on email/phone (smart merge)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        firstName: { type: 'string', description: 'Contact first name' },
                        lastName: { type: 'string', description: 'Contact last name' },
                        email: { type: 'string', description: 'Contact email address' },
                        phone: { type: 'string', description: 'Contact phone number' },
                        tags: { type: 'array', items: { type: 'string' }, description: 'Tags to assign to contact' },
                        source: { type: 'string', description: 'Source of the contact' },
                        assignedTo: { type: 'string', description: 'User ID to assign contact to' }
                    }
                }
            },
            {
                name: 'get_duplicate_contact',
                description: 'Check for duplicate contacts by email or phone',
                inputSchema: {
                    type: 'object',
                    properties: {
                        email: { type: 'string', description: 'Email to check for duplicates' },
                        phone: { type: 'string', description: 'Phone to check for duplicates' }
                    }
                }
            },
            {
                name: 'get_contacts_by_business',
                description: 'Get contacts associated with a specific business',
                inputSchema: {
                    type: 'object',
                    properties: {
                        businessId: { type: 'string', description: 'Business ID' },
                        limit: { type: 'number', description: 'Maximum number of results' },
                        skip: { type: 'number', description: 'Number of results to skip' },
                        query: { type: 'string', description: 'Search query' }
                    },
                    required: ['businessId']
                }
            },
            {
                name: 'get_contact_appointments',
                description: 'Get all appointments for a contact',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' }
                    },
                    required: ['contactId']
                }
            },
            // Bulk Operations
            {
                name: 'bulk_update_contact_tags',
                description: 'Bulk add or remove tags from multiple contacts',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactIds: { type: 'array', items: { type: 'string' }, description: 'Array of contact IDs' },
                        tags: { type: 'array', items: { type: 'string' }, description: 'Tags to add or remove' },
                        operation: { type: 'string', enum: ['add', 'remove'], description: 'Operation to perform' },
                        removeAllTags: { type: 'boolean', description: 'Remove all existing tags before adding new ones' }
                    },
                    required: ['contactIds', 'tags', 'operation']
                }
            },
            {
                name: 'bulk_update_contact_business',
                description: 'Bulk update business association for multiple contacts',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactIds: { type: 'array', items: { type: 'string' }, description: 'Array of contact IDs' },
                        businessId: { type: 'string', description: 'Business ID (null to remove from business)' }
                    },
                    required: ['contactIds']
                }
            },
            // Followers Management
            {
                name: 'add_contact_followers',
                description: 'Add followers to a contact',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' },
                        followers: { type: 'array', items: { type: 'string' }, description: 'Array of user IDs to add as followers' }
                    },
                    required: ['contactId', 'followers']
                }
            },
            {
                name: 'remove_contact_followers',
                description: 'Remove followers from a contact',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' },
                        followers: { type: 'array', items: { type: 'string' }, description: 'Array of user IDs to remove as followers' }
                    },
                    required: ['contactId', 'followers']
                }
            },
            // Campaign Management
            {
                name: 'add_contact_to_campaign',
                description: 'Add contact to a marketing campaign',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' },
                        campaignId: { type: 'string', description: 'Campaign ID' }
                    },
                    required: ['contactId', 'campaignId']
                }
            },
            {
                name: 'remove_contact_from_campaign',
                description: 'Remove contact from a specific campaign',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' },
                        campaignId: { type: 'string', description: 'Campaign ID' }
                    },
                    required: ['contactId', 'campaignId']
                }
            },
            {
                name: 'remove_contact_from_all_campaigns',
                description: 'Remove contact from all campaigns',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' }
                    },
                    required: ['contactId']
                }
            },
            // Workflow Management
            {
                name: 'add_contact_to_workflow',
                description: 'Add contact to a workflow',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' },
                        workflowId: { type: 'string', description: 'Workflow ID' },
                        eventStartTime: { type: 'string', description: 'Event start time (ISO format)' }
                    },
                    required: ['contactId', 'workflowId']
                }
            },
            {
                name: 'remove_contact_from_workflow',
                description: 'Remove contact from a workflow',
                inputSchema: {
                    type: 'object',
                    properties: {
                        contactId: { type: 'string', description: 'Contact ID' },
                        workflowId: { type: 'string', description: 'Workflow ID' },
                        eventStartTime: { type: 'string', description: 'Event start time (ISO format)' }
                    },
                    required: ['contactId', 'workflowId']
                }
            }
        ];
    }
    /**
     * Execute a contact tool with the given parameters
     */
    async executeTool(toolName, params) {
        try {
            switch (toolName) {
                // Basic Contact Management
                case 'create_contact':
                    return await this.createContact(params);
                case 'search_contacts':
                    return await this.searchContacts(params);
                case 'get_contact':
                    return await this.getContact(params.contactId);
                case 'update_contact':
                    return await this.updateContact(params);
                case 'delete_contact':
                    return await this.deleteContact(params.contactId);
                case 'add_contact_tags':
                    return await this.addContactTags(params);
                case 'remove_contact_tags':
                    return await this.removeContactTags(params);
                // Task Management
                case 'get_contact_tasks':
                    return await this.getContactTasks(params);
                case 'create_contact_task':
                    return await this.createContactTask(params);
                case 'get_contact_task':
                    return await this.getContactTask(params);
                case 'update_contact_task':
                    return await this.updateContactTask(params);
                case 'delete_contact_task':
                    return await this.deleteContactTask(params);
                case 'update_task_completion':
                    return await this.updateTaskCompletion(params);
                // Note Management
                case 'get_contact_notes':
                    return await this.getContactNotes(params);
                case 'create_contact_note':
                    return await this.createContactNote(params);
                case 'get_contact_note':
                    return await this.getContactNote(params);
                case 'update_contact_note':
                    return await this.updateContactNote(params);
                case 'delete_contact_note':
                    return await this.deleteContactNote(params);
                // Advanced Operations
                case 'upsert_contact':
                    return await this.upsertContact(params);
                case 'get_duplicate_contact':
                    return await this.getDuplicateContact(params);
                case 'get_contacts_by_business':
                    return await this.getContactsByBusiness(params);
                case 'get_contact_appointments':
                    return await this.getContactAppointments(params);
                // Bulk Operations
                case 'bulk_update_contact_tags':
                    return await this.bulkUpdateContactTags(params);
                case 'bulk_update_contact_business':
                    return await this.bulkUpdateContactBusiness(params);
                // Followers Management
                case 'add_contact_followers':
                    return await this.addContactFollowers(params);
                case 'remove_contact_followers':
                    return await this.removeContactFollowers(params);
                // Campaign Management
                case 'add_contact_to_campaign':
                    return await this.addContactToCampaign(params);
                case 'remove_contact_from_campaign':
                    return await this.removeContactFromCampaign(params);
                case 'remove_contact_from_all_campaigns':
                    return await this.removeContactFromAllCampaigns(params);
                // Workflow Management
                case 'add_contact_to_workflow':
                    return await this.addContactToWorkflow(params);
                case 'remove_contact_from_workflow':
                    return await this.removeContactFromWorkflow(params);
                default:
                    throw new Error(`Unknown tool: ${toolName}`);
            }
        }
        catch (error) {
            console.error(`Error executing contact tool ${toolName}:`, error);
            throw error;
        }
    }
    // Implementation methods...
    // Basic Contact Management
    async createContact(params) {
        const response = await this.ghlClient.createContact({
            locationId: this.ghlClient.getConfig().locationId,
            firstName: params.firstName,
            lastName: params.lastName,
            email: params.email,
            phone: params.phone,
            tags: params.tags,
            source: params.source
        });
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to create contact');
        }
        return response.data;
    }
    async searchContacts(params) {
        const response = await this.ghlClient.searchContacts({
            locationId: this.ghlClient.getConfig().locationId,
            query: params.query,
            limit: params.limit,
            filters: {
                ...(params.email && { email: params.email }),
                ...(params.phone && { phone: params.phone })
            }
        });
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to search contacts');
        }
        return response.data;
    }
    async getContact(contactId) {
        const response = await this.ghlClient.getContact(contactId);
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to get contact');
        }
        return response.data;
    }
    async updateContact(params) {
        const response = await this.ghlClient.updateContact(params.contactId, {
            firstName: params.firstName,
            lastName: params.lastName,
            email: params.email,
            phone: params.phone,
            tags: params.tags
        });
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to update contact');
        }
        return response.data;
    }
    async deleteContact(contactId) {
        const response = await this.ghlClient.deleteContact(contactId);
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to delete contact');
        }
        return response.data;
    }
    async addContactTags(params) {
        const response = await this.ghlClient.addContactTags(params.contactId, params.tags);
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to add contact tags');
        }
        return response.data;
    }
    async removeContactTags(params) {
        const response = await this.ghlClient.removeContactTags(params.contactId, params.tags);
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to remove contact tags');
        }
        return response.data;
    }
    // Task Management
    async getContactTasks(params) {
        const response = await this.ghlClient.getContactTasks(params.contactId);
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to get contact tasks');
        }
        return response.data;
    }
    async createContactTask(params) {
        const response = await this.ghlClient.createContactTask(params.contactId, {
            title: params.title,
            body: params.body,
            dueDate: params.dueDate,
            completed: params.completed || false,
            assignedTo: params.assignedTo
        });
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to create contact task');
        }
        return response.data;
    }
    async getContactTask(params) {
        const response = await this.ghlClient.getContactTask(params.contactId, params.taskId);
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to get contact task');
        }
        return response.data;
    }
    async updateContactTask(params) {
        const response = await this.ghlClient.updateContactTask(params.contactId, params.taskId, {
            title: params.title,
            body: params.body,
            dueDate: params.dueDate,
            completed: params.completed,
            assignedTo: params.assignedTo
        });
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to update contact task');
        }
        return response.data;
    }
    async deleteContactTask(params) {
        const response = await this.ghlClient.deleteContactTask(params.contactId, params.taskId);
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to delete contact task');
        }
        return response.data;
    }
    async updateTaskCompletion(params) {
        const response = await this.ghlClient.updateTaskCompletion(params.contactId, params.taskId, params.completed);
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to update task completion');
        }
        return response.data;
    }
    // Note Management
    async getContactNotes(params) {
        const response = await this.ghlClient.getContactNotes(params.contactId);
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to get contact notes');
        }
        return response.data;
    }
    async createContactNote(params) {
        const response = await this.ghlClient.createContactNote(params.contactId, {
            body: params.body,
            userId: params.userId
        });
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to create contact note');
        }
        return response.data;
    }
    async getContactNote(params) {
        const response = await this.ghlClient.getContactNote(params.contactId, params.noteId);
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to get contact note');
        }
        return response.data;
    }
    async updateContactNote(params) {
        const response = await this.ghlClient.updateContactNote(params.contactId, params.noteId, {
            body: params.body,
            userId: params.userId
        });
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to update contact note');
        }
        return response.data;
    }
    async deleteContactNote(params) {
        const response = await this.ghlClient.deleteContactNote(params.contactId, params.noteId);
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to delete contact note');
        }
        return response.data;
    }
    // Advanced Operations
    async upsertContact(params) {
        const response = await this.ghlClient.upsertContact({
            locationId: this.ghlClient.getConfig().locationId,
            firstName: params.firstName,
            lastName: params.lastName,
            name: params.name,
            email: params.email,
            phone: params.phone,
            address1: params.address,
            city: params.city,
            state: params.state,
            country: params.country,
            postalCode: params.postalCode,
            website: params.website,
            timezone: params.timezone,
            companyName: params.companyName,
            tags: params.tags,
            customFields: params.customFields,
            source: params.source,
            assignedTo: params.assignedTo
        });
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to upsert contact');
        }
        return response.data;
    }
    async getDuplicateContact(params) {
        const response = await this.ghlClient.getDuplicateContact(params.email, params.phone);
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to check for duplicate contact');
        }
        return response.data;
    }
    async getContactsByBusiness(params) {
        const response = await this.ghlClient.getContactsByBusiness(params.businessId, {
            limit: params.limit,
            skip: params.skip,
            query: params.query
        });
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to get contacts by business');
        }
        return response.data;
    }
    async getContactAppointments(params) {
        const response = await this.ghlClient.getContactAppointments(params.contactId);
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to get contact appointments');
        }
        return response.data;
    }
    // Bulk Operations
    async bulkUpdateContactTags(params) {
        const response = await this.ghlClient.bulkUpdateContactTags(params.contactIds, params.tags, params.operation, params.removeAllTags);
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to bulk update contact tags');
        }
        return response.data;
    }
    async bulkUpdateContactBusiness(params) {
        const response = await this.ghlClient.bulkUpdateContactBusiness(params.contactIds, params.businessId);
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to bulk update contact business');
        }
        return response.data;
    }
    // Followers Management
    async addContactFollowers(params) {
        const response = await this.ghlClient.addContactFollowers(params.contactId, params.followers);
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to add contact followers');
        }
        return response.data;
    }
    async removeContactFollowers(params) {
        const response = await this.ghlClient.removeContactFollowers(params.contactId, params.followers);
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to remove contact followers');
        }
        return response.data;
    }
    // Campaign Management
    async addContactToCampaign(params) {
        const response = await this.ghlClient.addContactToCampaign(params.contactId, params.campaignId);
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to add contact to campaign');
        }
        return response.data;
    }
    async removeContactFromCampaign(params) {
        const response = await this.ghlClient.removeContactFromCampaign(params.contactId, params.campaignId);
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to remove contact from campaign');
        }
        return response.data;
    }
    async removeContactFromAllCampaigns(params) {
        const response = await this.ghlClient.removeContactFromAllCampaigns(params.contactId);
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to remove contact from all campaigns');
        }
        return response.data;
    }
    // Workflow Management
    async addContactToWorkflow(params) {
        const response = await this.ghlClient.addContactToWorkflow(params.contactId, params.workflowId, params.eventStartTime);
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to add contact to workflow');
        }
        return response.data;
    }
    async removeContactFromWorkflow(params) {
        const response = await this.ghlClient.removeContactFromWorkflow(params.contactId, params.workflowId, params.eventStartTime);
        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to remove contact from workflow');
        }
        return response.data;
    }
}
exports.ContactTools = ContactTools;
