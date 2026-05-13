# Global Exception Filter Flow

## Overview

The Global Exception Filter is a NestJS filter that catches **ALL exceptions** thrown anywhere in the application (controllers, services, middleware) and transforms them into standardized JSON error responses.

---

## How It Works

### 1. **Exception Flow in NestJS**

```
Request
  ↓
Middleware
  ↓
Guard
  ↓
Interceptor (before)
  ↓
Controller
  ↓
Service
  ↓
[Exception Thrown] ← Can happen at any level
  ↓
Global Exception Filter ← Catches here!
  ↓
Response
```

### 2. **Filter Registration**

In `main.ts`, register the filter globally:

```typescript
const app = await NestFactory.create(AppModule);
app.useGlobalFilters(new GlobalExceptionFilter());
```

**Why global?** Because we want to catch exceptions from:

- Controllers
- Services
- Guards
- Custom middleware
- Database operations
- Any thrown error

### 3. **Exception Types Handled**

#### **HttpException** (NestJS-specific)

```typescript
throw new HttpException(
  {
    statusCode: 500,
    message: 'Something went wrong',
    cause: 'Database connection failed',
  },
  HttpStatus.INTERNAL_SERVER_ERROR,
);
```

**Filter Output:**

```json
{
  "statusCode": 500,
  "message": "Something went wrong",
  "timestamp": "2026-05-12T08:04:19.464Z",
  "path": "/products",
  "method": "GET",
  "details": {
    "cause": "Database connection failed"
  }
}
```

#### **Standard Error** (JavaScript Error)

```typescript
throw new Error('Failed to fetch products from database');
```

**Filter Output:**

```json
{
  "statusCode": 500,
  "message": "Failed to fetch products from database",
  "timestamp": "2026-05-12T08:04:19.464Z",
  "path": "/products",
  "method": "GET",
  "details": {
    "name": "Error",
    "stack": "..." // Only in development
  }
}
```

#### **Unknown Exception**

```typescript
throw 'something went wrong'; // Not recommended, but handled
```

**Filter Output:**

```json
{
  "statusCode": 500,
  "message": "An unexpected error occurred",
  "timestamp": "2026-05-12T08:04:19.464Z",
  "path": "/products",
  "method": "GET",
  "details": {
    "error": "something went wrong"
  }
}
```

---

## Key Features

### ✅ **Catches Everything**

- `@Catch()` with no arguments catches **all exception types**
- Specific type catching: `@Catch(HttpException)` catches only HttpException

### ✅ **Standardized Response**

All errors follow the same structure:

```typescript
{
  statusCode: number,
  message: string,
  timestamp: ISO string,
  path: string,
  method: string,
  details?: object // Additional error context
}
```

### ✅ **Logging**

The filter logs all errors:

```typescript
this.logger.error(
  `[${request.method}] ${request.url}`,
  JSON.stringify(errorResponse),
  'GlobalExceptionFilter',
);
```

### ✅ **Environment-Aware**

Stack traces are only included in development:

```typescript
stack: process.env.NODE_ENV === 'development' ? exception.stack : undefined;
```

---

## Usage Examples

### Example 1: Service Throwing HttpException

```typescript
// products.service.ts
findOne(id: number) {
  const product = this.products.find(p => p.id === id);
  if (!product) {
    throw new HttpException(
      {
        message: 'Product not found',
        cause: `No product with ID ${id}`
      },
      HttpStatus.NOT_FOUND
    );
  }
  return product;
}
```

**Response:**

```json
{
  "statusCode": 404,
  "message": "Product not found",
  "timestamp": "2026-05-12T08:04:19.464Z",
  "path": "/products/999",
  "method": "GET",
  "details": {
    "message": "Product not found",
    "cause": "No product with ID 999"
  }
}
```

### Example 2: Service Throwing Standard Error

```typescript
// products.service.ts
findAll() {
  try {
    throw new Error('Database connection timeout');
  } catch (error) {
    throw new HttpException(
      {
        message: 'Failed to fetch products',
        cause: error.message
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
```

**Response:**

```json
{
  "statusCode": 500,
  "message": "Failed to fetch products",
  "timestamp": "2026-05-12T08:04:19.464Z",
  "path": "/products",
  "method": "GET",
  "details": {
    "message": "Failed to fetch products",
    "cause": "Database connection timeout"
  }
}
```

---

## Filter Execution Order

When an exception is thrown:

1. **Catch Phase** - The filter's `@Catch()` decorator determines which exceptions it intercepts
2. **Exception Analysis** - Filter checks exception type:
   - Is it `HttpException`?
   - Is it `Error`?
   - Is it something else?
3. **Status Code Assignment** - Sets appropriate HTTP status (500, 404, etc.)
4. **Message Extraction** - Gets error message from the exception
5. **Details Collection** - Gathers additional context (stack trace, cause, etc.)
6. **Logging** - Logs the error for monitoring
7. **Response Transformation** - Sends standardized JSON response

---

## Best Practices

### ✅ DO

- Throw `HttpException` with appropriate status codes for API errors
- Include meaningful error messages and context
- Let the filter handle transformation to JSON

### ❌ DON'T

- Throw raw strings: `throw "error"` → Use `throw new Error("error")`
- Ignore error handling in services → Catch and rethrow with context
- Return error responses directly → Let the filter handle it

---

## Summary

```
Exception thrown somewhere
            ↓
GlobalExceptionFilter catches it
            ↓
Analyzes exception type
            ↓
Extracts status, message, details
            ↓
Logs for monitoring
            ↓
Returns standardized JSON response
```

This ensures **consistent error handling** across your entire NestJS application! 🎯
