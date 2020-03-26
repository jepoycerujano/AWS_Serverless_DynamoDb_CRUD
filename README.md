# workflow master

### What is this repository for? ###

* Microservice for  workflow master

### How do I get set up? ###

* Setting up the Serverless function (for DEV stages only)
```bash
# NOTE: Always run the serverless function first
# one-time setup
npm install -g serverless # optional in case you have it already
npm install
sls dynamodb install
# run (see package.json > scripts)
npm start
```

* How to run tests
```
npm run test
```
* Deployment instructions
  * no docs yet
  
### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact

# TODO
* Create TODO
```json
{
"templateName": "",
"templateData": "",
"execution_name": "",
"taskToken": "",
"owner": [""], // approver of task
}
```
# Workflow_Actors
* Create/Update Workflow Actors
    - NOTE: number of approver/actors will depend on process. Naming convertions for actors is base on rule description and should be in CamelCase and no space. It will send resonse 
```json
{
    "actor": "", // actor should be unique and serve as ID.
    "email": [""], // array of valid email
}
```
- Example:
```json
{
    "actor": "finance_validator_corp",
    "email": ["juan_delacruz@seaoil.com.ph", "james_rizal@seaaoil.com.ph"],
}
```
* Read/Delete Workflow Actors
    - get/update/delete actors email will need actors name parameters.
```json
{
    "actors": "finance_validator_cor"
}
```