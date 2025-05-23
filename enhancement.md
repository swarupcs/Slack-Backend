## 1. Duplicate user signup
### Problem
When a user tries to sign up with an email that is already registered, they should be informed that the email is already in use.

### Solution
When a user tries to sign up with an email that is already registered, the server should respond with a status code of 409 and a message indicating that the email is already in use.

### Implementation

## 2. If a member has no workspace, then from controller, return a message that the user has no workspace
### Problem
When a user tries to access a workspace that does not exist, they should be informed that they do not have any workspaces.

### Solution
When a user tries to access a workspace that does not exist, the server should respond with a status code of 404 and a message indicating that the user does not have any workspaces.

## 3. Add a member by using the email of the user : TODO Task
### Problem
When a user tries to add a member using their email, the server should check if the email is valid and if the user exists in the system.

### Solution
When a user tries to add a member using their email, the server should check if the email is valid and if the user exists in the system. If the email is valid and the user exists, the server should respond with a status code of 200 and a message indicating that the member has been added successfully. If the email is invalid or the user does not exist, the server should respond with a status code of 400 and a message indicating that the email is invalid or the user does not exist.

## 4. Add member name in the workspace members list

#### add member name along with member email, member id, memner name


## 5. Reser Password
### Problem
When a user tries to reset their password, they should be informed if the email is not registered in the system.

### Solution
When a user tries to reset their password, the server should check if the email is registered in the system. If the email is registered, the server should respond with a status code of 200 and a message indicating that the password reset link has been sent to the user's email. If the email is not registered, the server should respond with a status code of 404 and a message indicating that the email is not registered in the system.


## 6. Confirm Email
### Problem
When a user tries to confirm their email, they should be informed if the email is not registered in the system.

### Solution
When a user tries to confirm their email, the server should check if the email is registered in the system. If the email is registered, the server should respond with a status code of 200 and a message indicating that the email has been confirmed successfully. If the email is not registered, the server should respond with a status code of 404 and a message indicating that the email is not registered in the system.

## 7. User can login with username or email
### Problem
When a user tries to log in, they should be able to use either their username or email to log in.
### Solution
When a user tries to log in, the server should check if the username or email is valid. If the username or email is valid, the server should respond with a status code of 200 and a message indicating that the user has logged in successfully. If the username or email is invalid, the server should respond with a status code of 400 and a message indicating that the username or email is invalid.

## 8. Implement refresh token and access token
### Problem
When a user logs in, they should be issued a refresh token and an access token. The access token should be used to authenticate the user for a limited time, while the refresh token should be used to obtain a new access token when the old one expires.

### Solution
When a user logs in, the server should issue a refresh token and an access token. The access token should be used to authenticate the user for a limited time, while the refresh token should be used to obtain a new access token when the old one expires. The server should respond with a status code of 200 and a message indicating that the user has logged in successfully along with the access token and refresh token.

## 9. Admin Dashboard
### Problem
When an super user tries to access the dashboard, they should be able to see the list of all users and their details with which user has create workspace, which user has member of which workspace and channels.

### Solution


## 10. When user try for creating duplicate workspace, then return a message that the workspace is already created by the user
### Problem
When a user tries to create a workspace that already exists, they should be informed that the workspace is already created by the user. 

### Solution
When a user tries to create a workspace that already exists, the server should respond with a status code of 409 and a message indicating that the workspace is already created by the user. The server should also provide the details of the existing workspace, such as its name and ID, to help the user identify it.

## 11. When user try for creating duplicate channel, then return a message that the channel is already created by the user  
### Problem
When a user tries to create a channel that already exists, they should be informed that the channel is already created by the user. 

### Solution
When a user tries to create a channel that already exists, the server should respond with a status code of 409 and a message indicating that the channel is already created by the user. The server should also provide the details of the existing channel, such as its name and ID, to help the user identify it. 

## 12. Same workspace name and channel name should not be allowed for the same user. Currently it not allowed creating workspace with same name but the workspace name is checking for all user(or checking for all workspaces) but it should be checking for the same user.
### Problem
When a user tries to create a workspace or channel with the same name as an existing one, they should be informed that the name is already in use.

### Solution
When a user tries to create a workspace or channel with the same name as an existing one, the server should check if the name is already in use by the same user. If the name is already in use, the server should respond with a status code of 409 and a message indicating that the name is already in use. If the name is not in use, the server should allow the user to create the workspace or channel.

## 13. When workspace is not created, then return a toast message that the workspace is not created with the error message
### Problem
When a user tries to create a workspace and it fails, they should be informed that the workspace is not created.

### Solution    
When a user tries to create a workspace and it fails, the server should respond with a status code of 500 and a message indicating that the workspace is not created. The server should also provide the error message to help the user understand why the workspace creation failed. The client should display this message as a toast notification to inform the user.

## 14. When a verification email is sent, then return a toast message that the verification email is sent to the user
### Problem
When a user requests to send a verification email, they should be informed that the verification email is sent to their email address.

### Solution    
When a user requests to send a verification email, the server should respond with a status code of 200 and a message indicating that the verification email is sent to their email address. The client should display this message as a toast notification to inform the user.

## 15. When a verification email is not sent, then return a toast message that the verification email is not sent with the error message
### Problem
When a user requests to send a verification email and it fails, they should be informed that the verification email is not sent.        

### Solution    
When a user requests to send a verification email and it fails, the server should respond with a status code of 500 and a message indicating that the verification email is not sent. The server should also provide the error message to help the user understand why the verification email sending failed. The client should display this message as a toast notification to inform the user.        

## 16. When a user is not verified, then return a toast message that the user is not verified
### Problem
When a user tries to access a feature that requires verification and they are not verified, they should be informed that they are not verified.        

### Solution    
When a user tries to access a feature that requires verification and they are not verified, the server should respond with a status code of 403 and a message indicating that the user is not verified. The client should display this message as a toast notification to inform the user.

## 17. Until a user is not verified, then the user should not be able to create a workspace
### Problem
When a user tries to create a workspace and they are not verified, they should be informed that they are not verified and cannot create a workspace.        

### Solution    
When a user tries to create a workspace and they are not verified, the server should respond with a status code of 403 and a message indicating that the user is not verified and cannot create a workspace. The client should display this message as a toast notification to inform the user.