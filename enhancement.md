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