# User Roles & Permissions
## AssetFlow RBAC Matrix

## Roles Overview

| Role | Code | Description |
|------|------|-------------|
| Administrator | `admin` | Full system access |
| Asset Manager | `asset_manager` | Manage assets and maintenance |
| Department Head | `department_head` | Manage department resources |
| Employee | `employee` | Self-service access |

## Permission Matrix

| Feature | Admin | Asset Manager | Dept. Head | Employee |
|---------|-------|--------------|------------|---------|
| **Dashboard** | Full | Full | Dept. only | Own only |
| **Asset - Create** | ✅ | ✅ | ❌ | ❌ |
| **Asset - Read All** | ✅ | ✅ | Dept. only | Own only |
| **Asset - Update** | ✅ | ✅ | ❌ | ❌ |
| **Asset - Delete** | ✅ | ❌ | ❌ | ❌ |
| **Asset - Allocate** | ✅ | ✅ | ❌ | ❌ |
| **Asset - Transfer** | ✅ | ✅ | Approve | Request |
| **Department - CRUD** | ✅ | ❌ | Read | ❌ |
| **Employee - CRUD** | ✅ | Read | Dept. only | Own profile |
| **Booking - Create** | ✅ | ✅ | ✅ | ✅ |
| **Booking - Approve** | ✅ | ✅ | ✅ | ❌ |
| **Maintenance - Raise** | ✅ | ✅ | ✅ | ✅ |
| **Maintenance - Approve** | ✅ | ✅ | ❌ | ❌ |
| **Audit - Start** | ✅ | ✅ | ❌ | ❌ |
| **Reports - View** | ✅ | ✅ | Dept. only | ❌ |
| **Reports - Export** | ✅ | ✅ | ❌ | ❌ |
| **AI Insights** | ✅ | ✅ | Limited | ❌ |
| **Activity Logs** | ✅ | Limited | ❌ | ❌ |
| **System Settings** | ✅ | ❌ | ❌ | ❌ |

## Role Hierarchy
```
Admin
  └── Asset Manager
        └── Department Head
              └── Employee
```
