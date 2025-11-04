Auth work flow

## Super Admin
As understood only one super Admin exist
you can create a new super Admin naturally using th following steps:

1# first use this route
POST  /api/v1/auth/create-superadmin

2# add these details as Json in the request
{
    "name":"super admin name",  // letter, digits it doesnt matter
    "phone":"+1234567890",   // starts with + then 10 to 15 digits
    "email":"bsdjvkknkl@gmail.com" // standard email
}

3# after doing Basic format checks ,only one super admin should exist and he of course has all possible permissions, a unique api key is created

4# if the operation is a success, you will recieve this response like this
{
    "success": true,
    "userId": "681ca330ceea29d0e6bfb85",
    "apiKey": "1c2dc3cd-931f-4ce8-92c8-2ef64d37709d"
}

5# super user has been successfully created

## Login with Super Admin or other users by SMS

As of now users can't login without confirmation, to login you need to send verfication code either by sms or email (perhaps we will use SMS here for better security), use this this:
in case of first login
in case you can't recall your login details

steps:
1#  first send your phone number here
POST  /api/v1/auth/request-otp
the details should look like this in request body as json
{
    "phone":"+1234567890"
}

2# if successeded a 6 digit code would be sent to your phone by sms (for testing the otp code is displayed in server logs)

3# to verify the code sent use this route
POST  /api/v1/auth/verify-otp
include these details in request body
{
    "phone":"+12345678901",
    "otp":"635511",
    "email":"superadmin@example.com"
}

4# when succeded you should recieve a token along with special user api key and presumably auth data for login later

{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MjEwYTljZjI1N2M1NjczYTFhNGIyOSIsImlhdCI6MTc0Njk5NjIxMywiZXhwIjoxNzQ3MDE3ODEzfQ.FJhcaWNFWI8L-8C-Hn3XOS6QFDAB3dww6vtgYB-hxQ0",
    "apiKey": "0b6f027c-38b1-4540-9550-b1ca7717a501",
    "auth": {
        "otp": null,
        "otpExpires": null,
        "masterKey": "2838",
        "password": "90IrmzMyiQlB",
        "secretCode": "84454724",
        "uniqueId": "P00xfjsgJqaS"
    }
}

the auth details must not be changed cuz these are the proper login info , if lost it you need to verify again

5# you can use the api key and token to authorize access to routes as needed for now or just login using the auth data 
(basically its the same cuz login with auth data returns a token to be used)
tokens are temporary and by default lasts 6 hours

## Login Super Admin or other users with auth data
first time users must login by otp to verify theie account as mentioned above, 
when verified auth data and a password is created and be viewed once
to login with auth data  

1#  first send your email and password into this route
POST  /api/v1/auth/login

include them in request body
{
  "email":"superadmin@gmail.com",
  "password":"LZ6LmgIA5IhT"
}

if successeded
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZWVhMTJjNWU5MTIxNThlMTdmZDBjNSIsImlhdCI6MTc2MjI3NjI0MCwiZXhwIjoxNzYyMjk3ODQwfQ.Ie2G3jUroxdhSPn7jZ72cuNhGAhSboo6RGdUuWEJN6M",
    "apiKey": "fcb3ade9-6241-4a11-9516-ad91caea4008"
}

these data are saved in front end to be sent on every request

----------------------------------
----------------------------------

## Creating Users

as of now users can only be made by super admin access .. 
access details are pre-determinded by super admin

steps:
1# first use this route
POST  /api/v1/auth/signup
include these details in request body as json
{
    "name":"test 1", // name
    "phone":"+1472828402", // phone
    "email":"hjfbakjk@gmail.com", // email
    "role":"admin", // user role
    "kyc":{ // kyc auth details required
        "idType":"passport",
        "idNumber":"362874166419881e9",
        "documentUrl":"http://google"
    }
}

to grant access to this route you must have a token for super admin and its api key
load this into the headers of the request

x-api-key : 1c2dc3cd-931f-4ce8-92c8-2ef64d37709d // api key for admin
Authorization : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MjEwYTljZjI1N2M1NjczYTFhNGIyOSIsImlhdCI6MTc0Njk5NjIxMywiZXhwIjoxNzQ3MDE3ODEzfQ.FJhcaWNFWI8L-8C-Hn3XOS6QFDAB3dww6vtgYB-hxQ0 // super admin token

2# if everything is correct a new user is created and you recieve this response

{
    "success": true,
    "userId": "6820f6cfe77a10e2337636aa",
    "apiKey": "e65565d5-295a-4f55-ab2f-2ccd7bab50af"
}



----------------
let permissions = [];   

if (role === 'superAdmin') {
      permissions = [
        { resource: 'users', actions: ['read', 'write', 'delete', 'updatePermissions', 'verify'] },
        { resource: 'suppliers', actions: ['read', 'write', 'delete'] },
        { resource: 'customers', actions: ['read', 'write', 'delete'] },
        { resource: 'orders', actions: ['read', 'write', 'delete', 'assign', 'updateStatus', 'flag'] },
        { resource: 'payments', actions: ['read', 'write'] },                       
        { resource: 'analytics', actions: ['read'] },
        { resource: 'kyc', actions: ['read', 'write', 'verify'] },
        { resource: 'sms', actions: ['read', 'write'] },
        { resource: 'logistics', actions: ['read', 'write'] }
      ];
    } else if (role === 'admin') {
      permissions = [ 
        { resource: 'users', actions: ['read', 'updatePermissions'] },
        { resource: 'suppliers', actions: ['read'] },
        { resource: 'customers', actions: ['read'] },
        { resource: 'orders', actions: ['read', 'assign', 'flag'] },
        { resource: 'analytics', actions: ['read'] }
      ];
    } else if (role === 'supplierAdmin') {
      permissions = [
        { resource: 'suppliers', actions: ['read', 'write'] },
        { resource: 'customers', actions: ['read', 'write', 'delete'] },
        { resource: 'orders', actions: ['read', 'write', 'assign'] },
        { resource: 'analytics', actions: ['read'] }
      ];
    } else if (role === 'supplierModerator') {
      permissions = [
        { resource: 'suppliers', actions: ['read'] },
        { resource: 'customers', actions: ['read'] },
        { resource: 'orders', actions: ['read', 'flag'] },
        { resource: 'analytics', actions: ['read'] }
      ];
    }  else if (role === 'driver') {
      permissions = [
        { resource: 'orders', actions: ['read', 'updateStatus'] },
        { resource: 'logistics', actions: ['read'] }
      ];
    }-


-----------
-----


The structure is organized by Resource (the noun) and then by the actions that can be performed on that resource.

🗺️ RESTful Route Hierarchy by Resource
All routes should ideally be prefixed (e.g., /api/v1). The Actions listed below correspond directly to your permission definitions.

1. User Management (/users) 🧑‍💻
HTTP Method	Route Path	Description	Required Permission (Example)
GET	/users	Get a list of all users.	users:read  // ok
GET	/users/:id	Get details for a specific user.	users:read // ok
POST	/users	Create a new user account.	users:write  // ok for now only super admin can do this
PUT/PATCH	/users/:id	Update a user's basic information.	users:write // ok
DELETE	/users/:id	Delete a specific user.	users:delete // ok
PUT/PATCH	/users/:id/permissions	Update a user's role/permissions.	users:updatePermissions  // ok
POST	/users/:id/verify	Manually verify a user's account.	users:verify // dont know if we need it yet

2. Supplier Management (/suppliers) 🏭
HTTP Method	Route Path	Description	Required Permission (Example)
GET	/suppliers	Get a list of all suppliers.	suppliers:read
GET	/suppliers/:id	Get details for a specific supplier.	suppliers:read
POST	/suppliers	Create a new supplier record.	suppliers:write
PUT/PATCH	/suppliers/:id	Update supplier details.	suppliers:write
DELETE	/suppliers/:id	Delete a supplier record.	suppliers:delete
3. Customer Management (/customers) 👤
HTTP Method	Route Path	Description	Required Permission (Example)
GET	/customers	Get a list of all customers.	customers:read
GET	/customers/:id	Get details for a specific customer.	customers:read
POST	/customers	Create a new customer profile.	customers:write
PUT/PATCH	/customers/:id	Update customer details.	customers:write
DELETE	/customers/:id	Delete a customer profile.

Order & Delivery Management (/orders) 📦
HTTP Method	Route Path	Description	Required Permission (Example)
GET	/orders	Get a list of all orders (or filtered by user/supplier).	orders:read
GET	/orders/:id	Get details for a specific order.	orders:read
POST	/orders	Create a new delivery order.	orders:write
PUT/PATCH	/orders/:id	Update basic order details (non-status).	orders:write
DELETE	/orders/:id	Delete/Cancel an order.	orders:delete
PUT/PATCH	/orders/:id/assign	Assign an order to a driver.	orders:assign
PUT/PATCH	/orders/:id/status	Update the order's delivery status.	orders:updateStatus
POST	/orders/:id/flag	Flag an order for review (e.g., issue/delay).	orders:flag
5. Payments, Analytics, KYC, SMS, and Logistics
These resources often have fewer standard CRUD operations and rely on specific actions.

HTTP Method	Route Path	Resource	Actions	Description
GET	/payments	payments	read	Get payment/transaction history.
POST	/payments	payments	write	Record a new payment or transaction.
GET	/analytics/reports	analytics	read	Retrieve aggregated business analytics.
GET	/kyc	kyc	read	View KYC submissions awaiting verification.
POST	/kyc/:id	kyc	write	Submit KYC information (for user).
POST	/kyc/:id/verify	kyc	verify	Approve or reject a KYC submission.
GET	/sms/logs	sms	read	View SMS communication logs.
POST	/sms/send	sms	write	Send a custom SMS notification.
GET	/logistics/driver-locations	logistics	read	Get real-time driver locations/fleet status.
POST	/logistics/vehicle	logistics	write	Add/Update logistics resources (e.g., vehicles).
💡 Implementation Notes
Permission Middleware: For every route in the table, you'll need middleware that checks the authenticated user's permissions array (the one you defined) against the required permission. For example, for PUT /orders/:id/assign, the middleware must ensure the user has the orders:assign permission.

Contextual Filtering: For roles like driver or supplierAdmin, the orders:read action will require contextual filtering. A driver should only be able to read orders assigned to them. A supplierAdmin should only read orders originating from their supplier. The middleware or the route controller must enforce this ownership check.

Authentication: All these routes require a valid session or JWT (JSON Web Token) to identify the user before the permissions check is run.

____________

super admin

"name": "Super Admin",
"phone": "+1234567890",
"email": "superadmin@gmail.com",
"role": "superAdmin"

"userdocumentId": "68eea12c5e912158e17fd0c5",
"apiKey": "fcb3ade9-6241-4a11-9516-ad91caea4008"


"uniqueId": "P00IHL0A6YxR",
"secretCode": "71383356",
"masterKey": "0547",
"password no hash": "LZ6LmgIA5IhT",
"password hashed version "e906511cd015ca98b845f6e55f8d67398759560b0404b77340c9bfce9226db576cfe1e80e57f93b855e8a7d14772de6d445866ccee494678580004b726b895e5"


_____________________

{
  "name":"supplier wow  1",
  "email":"supplieradmin7754@gmail.com",
  "phone":"+1234567890463",
  "role":"supplierAdmin",

  "userId": "690a3ac24e7acf1dfc664052",
  "apiKey": "4cc286db-58f9-4506-8545-5eeae8f2b823",

      "auth": {
        "uniqueId": "P00Jd4Z4g3s5",
        "secretCode": "85028305",
        "masterKey": "5804",
        "password no hash":"F7EyzZ0kfqW2",
        "password": "6d0d844741e6c53380e362ad2fafc313ba18c681165e50d15e645b2bd6009098cf9ff190d136033097c6c733688739c0c0747b2be50ea1616a615260c6d1fff4"
}


// supplier by id

"_id": "690a414d4ebd09af28f37eba",
"name": "let go branch 2",
"phone": "+1234567890132",
"email": "supeppplier11@gmail.com",
createdBy": "690a3ac24e7acf1dfc664052",
"createdAt": "2025-11-04T18:09:17.750Z",
"updatedAt": "2025-11-04T18:09:17.751Z",
"__v": 0

"_id": "690a390536b4c4027dee8c8d",
"name": "Schoolar branch 1",
"phone": "+123456789012",
 "email": "superadmin@gmail.com",
"createdBy": "690a3ac24e7acf1dfc664052",
"createdAt": "2025-11-04T17:33:57.209Z",
 "updatedAt": "2025-11-04T17:33:57.211Z",
"__v": 0