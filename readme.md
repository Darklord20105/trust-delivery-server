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

