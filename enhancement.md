## Duplicate user signup
### Problem
When a user tries to sign up with an email that is already registered, they should be informed that the email is already in use.

### Solution
When a user tries to sign up with an email that is already registered, the server should respond with a status code of 409 and a message indicating that the email is already in use.

### Implementation