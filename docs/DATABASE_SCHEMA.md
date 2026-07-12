# Database Schema
## AssetFlow — MongoDB Collections

---

## Collection 1: users
```json
{
  "_id": "ObjectId",
  "employeeId": "String (unique, auto-generated: EMP-001)",
  "firstName": "String (required)",
  "lastName": "String (required)",
  "email": "String (unique, required)",
  "password": "String (hashed)",
  "role": "Enum: [admin, asset_manager, department_head, employee]",
  "department": "ObjectId → departments",
  "phone": "String",
  "avatar": "String (URL)",
  "isActive": "Boolean (default: true)",
  "isEmailVerified": "Boolean (default: false)",
  "emailVerificationToken": "String",
  "passwordResetToken": "String",
  "passwordResetExpires": "Date",
  "lastLogin": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Collection 2: departments
```json
{
  "_id": "ObjectId",
  "name": "String (unique, required)",
  "code": "String (unique, e.g.: IT, HR, FIN)",
  "description": "String",
  "manager": "ObjectId → users",
  "employeeCount": "Number (virtual)",
  "budget": "Number",
  "location": "String",
  "isActive": "Boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Collection 3: asset_categories
```json
{
  "_id": "ObjectId",
  "name": "String (unique, required)",
  "code": "String (unique)",
  "description": "String",
  "icon": "String",
  "color": "String (hex)",
  "depreciationRate": "Number (annual %)",
  "maintenanceInterval": "Number (days)",
  "isActive": "Boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Collection 4: assets
```json
{
  "_id": "ObjectId",
  "assetId": "String (unique, auto: AST-00001)",
  "qrCode": "String (base64/URL)",
  "name": "String (required)",
  "description": "String",
  "category": "ObjectId → asset_categories",
  "department": "ObjectId → departments",
  "assignedTo": "ObjectId → users (nullable)",
  "status": "Enum: [available, allocated, under_maintenance, disposed, lost]",
  "condition": "Enum: [excellent, good, fair, poor, damaged]",
  "location": "String",
  "serialNumber": "String (unique)",
  "brand": "String",
  "model": "String",
  "purchaseDate": "Date",
  "purchasePrice": "Number",
  "currentValue": "Number",
  "vendor": "String",
  "warrantyExpiry": "Date",
  "images": "[String]",
  "tags": "[String]",
  "customFields": "Object",
  "healthScore": "Number (0-100, computed)",
  "lastAuditDate": "Date",
  "disposedAt": "Date",
  "disposalReason": "String",
  "createdBy": "ObjectId → users",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Collection 5: bookings
```json
{
  "_id": "ObjectId",
  "bookingId": "String (auto: BK-00001)",
  "asset": "ObjectId → assets",
  "bookedBy": "ObjectId → users",
  "department": "ObjectId → departments",
  "startTime": "Date (required)",
  "endTime": "Date (required)",
  "purpose": "String",
  "status": "Enum: [pending, approved, rejected, cancelled, completed]",
  "approvedBy": "ObjectId → users",
  "approvedAt": "Date",
  "rejectionReason": "String",
  "notes": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Collection 6: maintenance
```json
{
  "_id": "ObjectId",
  "maintenanceId": "String (auto: MNT-00001)",
  "asset": "ObjectId → assets",
  "reportedBy": "ObjectId → users",
  "assignedTo": "ObjectId → users (technician)",
  "type": "Enum: [corrective, preventive, inspection]",
  "priority": "Enum: [low, medium, high, critical]",
  "status": "Enum: [pending, approved, rejected, in_progress, completed, cancelled]",
  "description": "String (required)",
  "diagnosis": "String",
  "resolution": "String",
  "estimatedCost": "Number",
  "actualCost": "Number",
  "images": "[String]",
  "approvedBy": "ObjectId → users",
  "approvedAt": "Date",
  "startedAt": "Date",
  "completedAt": "Date",
  "nextMaintenanceDate": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Collection 7: transfers
```json
{
  "_id": "ObjectId",
  "transferId": "String (auto: TRF-00001)",
  "asset": "ObjectId → assets",
  "fromDepartment": "ObjectId → departments",
  "toDepartment": "ObjectId → departments",
  "fromUser": "ObjectId → users",
  "toUser": "ObjectId → users",
  "requestedBy": "ObjectId → users",
  "status": "Enum: [pending, approved, rejected, completed]",
  "reason": "String",
  "approvedBy": "ObjectId → users",
  "approvedAt": "Date",
  "completedAt": "Date",
  "notes": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Collection 8: audits
```json
{
  "_id": "ObjectId",
  "auditId": "String (auto: AUD-00001)",
  "title": "String",
  "department": "ObjectId → departments",
  "conductedBy": "ObjectId → users",
  "status": "Enum: [planned, in_progress, completed, cancelled]",
  "scheduledDate": "Date",
  "startedAt": "Date",
  "completedAt": "Date",
  "totalAssets": "Number",
  "scannedAssets": "Number",
  "matchedAssets": "Number",
  "discrepancies": "[{ asset: ObjectId, issue: String, expectedValue: String, actualValue: String }]",
  "notes": "String",
  "reportUrl": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Collection 9: notifications
```json
{
  "_id": "ObjectId",
  "recipient": "ObjectId → users",
  "title": "String",
  "message": "String",
  "type": "Enum: [info, success, warning, error]",
  "category": "Enum: [maintenance, booking, transfer, audit, system, asset]",
  "isRead": "Boolean (default: false)",
  "readAt": "Date",
  "actionUrl": "String",
  "metadata": "Object",
  "createdAt": "Date"
}
```

## Collection 10: activity_logs
```json
{
  "_id": "ObjectId",
  "action": "String (e.g.: ASSET_CREATED, USER_LOGIN)",
  "entity": "String (collection name)",
  "entityId": "ObjectId",
  "performedBy": "ObjectId → users",
  "ipAddress": "String",
  "userAgent": "String",
  "oldValue": "Object",
  "newValue": "Object",
  "description": "String",
  "createdAt": "Date"
}
```

## Collection 11: settings
```json
{
  "_id": "ObjectId",
  "key": "String (unique)",
  "value": "Mixed",
  "group": "String (general/email/notifications/security)",
  "description": "String",
  "isPublic": "Boolean",
  "updatedBy": "ObjectId → users",
  "updatedAt": "Date"
}
```

## Indexes
```javascript
// assets
assets.createIndex({ assetId: 1 }, { unique: true })
assets.createIndex({ status: 1, department: 1 })
assets.createIndex({ assignedTo: 1 })
assets.createIndex({ warrantyExpiry: 1 })
assets.createIndex({ name: 'text', description: 'text', brand: 'text' })

// users
users.createIndex({ email: 1 }, { unique: true })
users.createIndex({ employeeId: 1 }, { unique: true })
users.createIndex({ department: 1, role: 1 })

// bookings
bookings.createIndex({ asset: 1, startTime: 1, endTime: 1 })
bookings.createIndex({ bookedBy: 1 })

// activity_logs
activity_logs.createIndex({ createdAt: -1 })
activity_logs.createIndex({ performedBy: 1 })
```
