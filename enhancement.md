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