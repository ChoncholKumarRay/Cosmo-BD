# **Cosmo BD**

## **Overview**

The **Cosmo BD** is an example product supplier service with minimal front-end for an E-Commerce eco-system, a project of my university web technoloy course. Front-end have dashboard that is only accessed by admin to see all the Supply request of from the **Artisan Orion** E-commerce site. Also it has some bankend service that is provided for the E-Commerce site.

## **Base URL of the Backend**

- **Local URL**: `http://localhost:5002`
- **Online URL**: `https://cosmo-bd.onrender.com`

## **Endpoints Overview**

The APIs are accessed using the base URL followed by specific routes. For example:

- **Local API**: `http://localhost:5002/api/user/req-supply`
- **Online API**: `https://cosmo-bd.onrender.com/api/user/req-supply`

# **API Documentation: User Routes**

## 1. **POST /api/user/req-supply**

### **Description**

This endpoint allows the user (E-Commerce site) to create a new supply document by providing relevant details about the supply, including supply ID, ordered products, payment, bank transaction details, and buyer information. The request also requires a verification code to ensure it is coming from an authorized source.

### **Request Body**

```json
{
  "verification_code": "string",
  "supply_id": "string",
  "ordered_products": "array",
  "payment": "number",
  "bank_transaction": "string",
  "buyer_name": "string",
  "phone": "string",
  "address": "string"
}
```

### **Response**

**Success (201)**

```json
{
  "success": true,
  "message": "Supply created successfully."
}
```

**Error (400)**

- **Missing Fields**

```json
{
  "message": "All fields are required (supply_id, ordered_products, payment, bank_transaction, buyer_name, phone, address)."
}
```

- **Invalid Verification Code**

```json
{
  "message": "Unknown user API request."
}
```

- **Supply Already Exists**

```json
{
  "message": "A supply with the ID {supply_id} already exists."
}
```

**Error (500)**

- **Internal Server Error**

```json
{
  "success": false,
  "message": "An error occurred while creating the supply."
}
```

#### **Notes**

- **Verification Code**: The verification code provided in the request body must match the one stored in the environment variable `ARTISAN_VERIFICATION_CODE` to ensure that the request is valid.
- **Supply ID**: Each supply order must have a unique `supply_id`. If a supply with the same ID already exists, the request will fail.

### **Error Codes**

- **400**: Bad Request - Missing required fields, invalid verification code, or duplicate supply ID.
- **500**: Internal Server Error - Occurs when there is an issue creating the supply due to backend/database issues.

---

---

# **API Documentation: Admin Routes**

## 1. **POST /api/admin/login**

### **Description**

This endpoint allows an admin user to log in by providing a username and password. If the credentials are valid, a JWT (JSON Web Token) is issued, which is required for accessing protected routes.

### **Request Body**

```json
{
  "username": "string",
  "password": "string"
}
```

### **Response**

**Success (200)**

```json
{
  "message": "Login successful",
  "token": "string"
}
```

**Error (401)**

```json
{
  "message": "Invalid credentials"
}
```

---

## 2. **GET /api/admin/get-supply**

### **Description**

This endpoint allows the admin to fetch all the supply records. The response includes details of each supply, buyer information along with information about the ordered products, their prices, quantities, and the total price for each supply.

### **Headers**

- **Authorization**: `Bearer <token>` (JWT token obtained after login)

### **Response**

**Success (200)**

```json
[
  {
    "supply_id": "string",
    "ordered_products": [
      {
        "product_id": "string",
        "name": "string",
        "price": "number",
        "quantity": "number",
        "subtotal_price": "number"
      }
    ],
    "total_price": "number",
    "current_status": "string"
  }
]
```

**Error (500)**

```json
{
  "message": "Failed to fetch supply records"
}
```

---

## 3. **POST /api/admin/update-status**

### **Description**

This endpoint allows an admin to update the status of a supply. The admin must provide the supply ID and the new status. The status update is also sent to an external API (E-Commerce Site API) for synchronization. If the status is successfully updated in both systems, the supply record is updated in the database.

### **Request Body**

```json
{
  "supplyId": "string",
  "status": "string"
}
```

### **Response**

**Success (200)**

```json
{
  "message": "Status updated successfully!"
}
```

**Error (400)**

- **Missing fields (Supply ID or status)**

```json
{
  "message": "Supply ID and status are required"
}
```

- **Invalid status**

```json
{
  "message": "Invalid status provided"
}
```

**Error (403)**

- **Invalid Token**

```json
{
  "message": "Access Denied"
}
```

**Error (500)**

```json
{
  "message": "Server configuration error: Verification code not found"
}
```

**Error (404)**

- **Supply not found**

```json
{
  "message": "Supply record not found."
}
```

**Error (500)**

- **Failed to update status**

```json
{
  "message": "Failed to update status in the external system"
}
```

---

### **Authentication**

- All protected routes (i.e., `GET /get-supply`, `POST /update-status`) require authentication via a JWT token. The token should be included in the `Authorization` header as a Bearer token.

---
