"use strict";
/**
 * GoHighLevel Email ISV (Verification) Tools
 * Implements email verification functionality for the MCP server
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailISVTools = void 0;
/**
 * Email ISV Tools class
 * Provides email verification capabilities
 */
class EmailISVTools {
    ghlClient;
    constructor(ghlClient) {
        this.ghlClient = ghlClient;
    }
    /**
     * Get tool definitions for all Email ISV operations
     */
    getToolDefinitions() {
        return [
            {
                name: 'verify_email',
                description: 'Verify email address deliverability and get risk assessment. Charges will be deducted from the specified location wallet.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        locationId: {
                            type: 'string',
                            description: 'Location ID - charges will be deducted from this location wallet'
                        },
                        type: {
                            type: 'string',
                            enum: ['email', 'contact'],
                            description: 'Verification type: "email" for direct email verification, "contact" for contact ID verification'
                        },
                        verify: {
                            type: 'string',
                            description: 'Email address to verify (if type=email) or contact ID (if type=contact)'
                        }
                    },
                    required: ['locationId', 'type', 'verify']
                }
            }
        ];
    }
    /**
     * Execute email ISV tools
     */
    async executeTool(name, args) {
        switch (name) {
            case 'verify_email':
                return await this.verifyEmail(args);
            default:
                throw new Error(`Unknown email ISV tool: ${name}`);
        }
    }
    /**
     * Verify email address or contact
     */
    async verifyEmail(params) {
        try {
            const result = await this.ghlClient.verifyEmail(params.locationId, {
                type: params.type,
                verify: params.verify
            });
            if (!result.success || !result.data) {
                return {
                    success: false,
                    verification: { verified: false, message: 'Verification failed', address: params.verify },
                    message: result.error?.message || 'Email verification failed'
                };
            }
            const verification = result.data;
            // Determine if this is a successful verification response
            const isVerified = 'result' in verification;
            let message;
            if (isVerified) {
                const verifiedResult = verification;
                message = `Email verification completed. Result: ${verifiedResult.result}, Risk: ${verifiedResult.risk}`;
                if (verifiedResult.reason && verifiedResult.reason.length > 0) {
                    message += `, Reasons: ${verifiedResult.reason.join(', ')}`;
                }
                if (verifiedResult.leadconnectorRecomendation?.isEmailValid !== undefined) {
                    message += `, Recommended: ${verifiedResult.leadconnectorRecomendation.isEmailValid ? 'Valid' : 'Invalid'}`;
                }
            }
            else {
                const notVerifiedResult = verification;
                message = `Email verification not processed: ${notVerifiedResult.message}`;
            }
            return {
                success: true,
                verification,
                message
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                success: false,
                verification: { verified: false, message: errorMessage, address: params.verify },
                message: `Failed to verify email: ${errorMessage}`
            };
        }
    }
}
exports.EmailISVTools = EmailISVTools;
