---
title: "API Documentation for Developers"
summary: "Complete API reference and developer guide for integrating with the AI chatbot system"
category: "api"
readTime: "15 min read"
lastUpdated: "2025-01-06"
tags: ["api", "developers", "integration", "authentication", "endpoints"]
difficulty: "advanced"
featured: true
order: 1
---

# API Documentation for Developers

This comprehensive guide covers all API endpoints and integration methods for the AI chatbot system. Whether you're building custom integrations, automating workflows, or developing applications on top of our platform, this documentation provides everything you need.

## Authentication

### API Key Authentication

All API requests require authentication using an API key. Include your API key in the request headers:

```bash
Authorization: Bearer YOUR_API_KEY
```

### Getting Your API Key

1. Navigate to your account settings
2. Go to the "API Access" section
3. Generate a new API key
4. Store it securely - it won't be shown again

> **Security Note**: Never expose your API key in client-side code or public repositories. Always use environment variables or secure configuration management.

## Base URL

All API endpoints are relative to the base URL:

```
https://your-domain.com/api
```

## Rate Limiting

API requests are rate-limited to ensure system stability:

- **Standard users**: 100 requests per minute
- **Premium users**: 500 requests per minute
- **Enterprise users**: 2000 requests per minute

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Chat API

### Start a New Chat

Create a new chat session and send the first message.

```http
POST /api/chat
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "message": "Hello, how can you help me today?",
  "model": "gpt-4",
  "stream": true,
  "attachments": []
}
```

**Response (Streaming)**:
```
data: {"type": "text", "content": "Hello! I'm here to help you with"}
data: {"type": "text", "content": " any questions or tasks you have."}
data: {"type": "done"}
```

**Response (Non-streaming)**:
```json
{
  "id": "chat_123456",
  "message": "Hello! I'm here to help you with any questions or tasks you have.",
  "model": "gpt-4",
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 25,
    "total_tokens": 40
  },
  "created_at": "2025-01-06T12:00:00Z"
}
```

### Continue Existing Chat

Send a message to an existing chat session.

```http
POST /api/chat/{chat_id}/messages
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "message": "Can you help me write a Python function?",
  "stream": false
}
```

### Get Chat History

Retrieve the complete history of a chat session.

```http
GET /api/chat/{chat_id}/history
Authorization: Bearer YOUR_API_KEY
```

**Response**:
```json
{
  "chat_id": "chat_123456",
  "messages": [
    {
      "id": "msg_001",
      "role": "user",
      "content": "Hello, how can you help me today?",
      "timestamp": "2025-01-06T12:00:00Z"
    },
    {
      "id": "msg_002",
      "role": "assistant",
      "content": "Hello! I'm here to help you with any questions or tasks you have.",
      "timestamp": "2025-01-06T12:00:05Z"
    }
  ],
  "created_at": "2025-01-06T12:00:00Z",
  "updated_at": "2025-01-06T12:00:05Z"
}
```

## Document API

### Create Document

Create a new document artifact.

```http
POST /api/documents
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "title": "My Document",
  "content": "# Document Title\n\nThis is the document content.",
  "type": "markdown"
}
```

**Response**:
```json
{
  "id": "doc_123456",
  "title": "My Document",
  "content": "# Document Title\n\nThis is the document content.",
  "type": "markdown",
  "version": 1,
  "created_at": "2025-01-06T12:00:00Z",
  "updated_at": "2025-01-06T12:00:00Z"
}
```

### Update Document

Update an existing document with new content.

```http
PUT /api/documents/{document_id}
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "content": "# Updated Document Title\n\nThis is the updated content.",
  "title": "Updated Document"
}
```

### Get Document

Retrieve a specific document by ID.

```http
GET /api/documents/{document_id}
Authorization: Bearer YOUR_API_KEY
```

### List Documents

Get a list of all documents with optional filtering.

```http
GET /api/documents?type=markdown&limit=10&offset=0
Authorization: Bearer YOUR_API_KEY
```

**Query Parameters**:
- `type`: Filter by document type (markdown, code, etc.)
- `limit`: Number of results to return (default: 20, max: 100)
- `offset`: Number of results to skip for pagination
- `search`: Search term to filter documents

## File Upload API

### Upload File

Upload a file to the knowledge base.

```http
POST /api/files/upload
Content-Type: multipart/form-data
Authorization: Bearer YOUR_API_KEY

{
  "file": [binary file data],
  "description": "Optional file description",
  "tags": ["tag1", "tag2"]
}
```

**Response**:
```json
{
  "id": "file_123456",
  "filename": "document.pdf",
  "size": 1024000,
  "type": "application/pdf",
  "status": "processing",
  "upload_url": "https://storage.example.com/files/file_123456",
  "created_at": "2025-01-06T12:00:00Z"
}
```

### Get Upload Status

Check the processing status of an uploaded file.

```http
GET /api/files/{file_id}/status
Authorization: Bearer YOUR_API_KEY
```

**Response**:
```json
{
  "id": "file_123456",
  "status": "completed",
  "processed_at": "2025-01-06T12:01:30Z",
  "chunks_created": 15,
  "error": null
}
```

## Knowledge Base API

### Search Knowledge Base

Search through the knowledge base using semantic or text search.

```http
POST /api/knowledge/search
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "query": "How to integrate with Microsoft Teams?",
  "type": "semantic",
  "limit": 5,
  "filters": {
    "source_type": "document",
    "tags": ["integration"]
  }
}
```

**Response**:
```json
{
  "results": [
    {
      "id": "chunk_123",
      "content": "To integrate with Microsoft Teams...",
      "score": 0.95,
      "source": {
        "id": "file_456",
        "filename": "teams-integration.pdf",
        "type": "document"
      },
      "metadata": {
        "page": 3,
        "section": "Integration Setup"
      }
    }
  ],
  "total": 1,
  "query_time": 0.15
}
```

### Add to Knowledge Base

Add content directly to the knowledge base.

```http
POST /api/knowledge
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "content": "This is important information to remember.",
  "title": "Important Note",
  "source_type": "manual",
  "tags": ["important", "note"],
  "metadata": {
    "category": "general"
  }
}
```

## Webhooks

### Configure Webhooks

Set up webhooks to receive real-time notifications about events.

```http
POST /api/webhooks
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "url": "https://your-app.com/webhook",
  "events": ["chat.message", "document.created", "file.uploaded"],
  "secret": "your_webhook_secret"
}
```

### Webhook Events

Available webhook events:

- `chat.message` - New chat message received
- `chat.completed` - Chat session completed
- `document.created` - New document artifact created
- `document.updated` - Document artifact updated
- `file.uploaded` - File uploaded to knowledge base
- `file.processed` - File processing completed
- `knowledge.added` - New content added to knowledge base

### Webhook Payload Example

```json
{
  "event": "chat.message",
  "timestamp": "2025-01-06T12:00:00Z",
  "data": {
    "chat_id": "chat_123456",
    "message_id": "msg_789",
    "user_id": "user_abc",
    "content": "Hello, world!",
    "role": "user"
  }
}
```

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is missing required parameters",
    "details": {
      "missing_fields": ["message"]
    }
  }
}
```

### Common Error Codes

- `INVALID_API_KEY` - API key is missing or invalid
- `RATE_LIMITED` - Too many requests
- `INVALID_REQUEST` - Request format is incorrect
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions

## SDKs and Libraries

### JavaScript/Node.js

```bash
npm install @your-company/chatbot-api
```

```javascript
import { ChatbotAPI } from '@your-company/chatbot-api';

const client = new ChatbotAPI({
  apiKey: process.env.CHATBOT_API_KEY,
  baseURL: 'https://your-domain.com/api'
});

// Send a chat message
const response = await client.chat.send({
  message: 'Hello, world!',
  stream: false
});

console.log(response.message);
```

### Python

```bash
pip install chatbot-api-python
```

```python
from chatbot_api import ChatbotClient

client = ChatbotClient(
    api_key=os.environ['CHATBOT_API_KEY'],
    base_url='https://your-domain.com/api'
)

# Send a chat message
response = client.chat.send(
    message='Hello, world!',
    stream=False
)

print(response.message)
```

## Best Practices

### Performance Optimization

1. **Use Streaming**: Enable streaming for real-time responses
2. **Batch Requests**: Group multiple operations when possible
3. **Cache Results**: Cache frequently accessed data
4. **Pagination**: Use pagination for large result sets

### Security

1. **Secure API Keys**: Store API keys securely
2. **Validate Webhooks**: Verify webhook signatures
3. **Use HTTPS**: Always use HTTPS for API requests
4. **Rate Limiting**: Implement client-side rate limiting

### Error Handling

1. **Retry Logic**: Implement exponential backoff for retries
2. **Graceful Degradation**: Handle API failures gracefully
3. **Logging**: Log API requests and responses for debugging
4. **Monitoring**: Monitor API usage and performance

## Support

For API support and questions:

- **Email**: francotechnologiesllc@gmail.com
- **Documentation**: Check this help center for updates
- **Status Page**: Monitor API status and incidents

## Changelog

### Version 1.0.0 (2025-01-06)
- Initial API release
- Chat, Document, and Knowledge Base endpoints
- Webhook support
- Rate limiting implementation