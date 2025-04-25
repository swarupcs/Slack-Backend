## Postman Post-script for User SignIn

```
const jsonResponse = pm.response.json();
// console.log(jsonResponse.data.token);
// console.log(pm.collectionVariables.get("dev_server"));
pm.collectionVariables.set("authToken", jsonResponse.data.token)

```