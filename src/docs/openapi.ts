const errorResponse = {
  type: 'object',
  properties: {
    status: { type: 'string', example: 'error' },
    message: { type: 'string' },
    details: { type: 'object', nullable: true },
    requestId: { type: 'string' },
  },
};

const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string', format: 'email' },
  },
};

const authResultSchema = {
  type: 'object',
  properties: {
    status: { type: 'string', example: 'success' },
    data: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        user: userSchema,
      },
    },
  },
};

export const openApiDocument: Record<string, unknown> = {
  openapi: '3.0.3',
  info: {
    title: 'TrustLayer API',
    version: '0.1.0',
    description:
      'Secure Express API demonstrating JWT auth, request validation, rate limiting, a ' +
      'pluggable upload adapter, structured logging, and OpenAPI docs.',
  },
  servers: [{ url: '/', description: 'Current host' }],
  tags: [{ name: 'Health' }, { name: 'Auth' }, { name: 'Users' }, { name: 'Uploads' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: errorResponse,
      AuthResult: authResultSchema,
      User: userSchema,
    },
    responses: {
      Unauthorized: {
        description: 'Missing, invalid, or expired credentials',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      ValidationError: {
        description: 'Request body failed validation',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      TooManyRequests: {
        description: 'Rate limit exceeded',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Liveness check',
        responses: {
          '200': {
            description: 'Service is up',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { status: { type: 'string', example: 'ok' } },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8, maxLength: 72 },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Account created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AuthResult' } },
            },
          },
          '409': { description: 'Email already registered' },
          '422': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Authenticated',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AuthResult' } },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '422': { $ref: '#/components/responses/ValidationError' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/api/v1/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request a password reset token',
        description:
          'Always returns 200 regardless of whether the email is registered, to avoid ' +
          'account enumeration. The reset token is only included in the response outside ' +
          'production; in production it would be delivered by email.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Request accepted' },
          '422': { $ref: '#/components/responses/ValidationError' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/api/v1/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset a password using a reset token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'password'],
                properties: {
                  token: { type: 'string' },
                  password: { type: 'string', minLength: 8, maxLength: 72 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Password updated' },
          '400': { description: 'Invalid or expired token' },
          '422': { $ref: '#/components/responses/ValidationError' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/api/v1/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get the authenticated caller profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Caller profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/v1/uploads': {
      post: {
        tags: ['Uploads'],
        summary: 'Upload a file via the configured storage adapter',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: { file: { type: 'string', format: 'binary' } },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Stored',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        key: { type: 'string' },
                        url: { type: 'string' },
                        size: { type: 'integer' },
                        mimeType: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'No file attached, or the storage adapter is misconfigured' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '422': { description: 'Unsupported file type or file too large' },
        },
      },
    },
  },
};
