# LambdaZone
This is project for running JS and DotNet lambdas (with function URLs) in a Cloudformation stack.
The stack and lambda setups are managed via CDK code (IaC).
The stack uses some persistent, existing resources such as VPC.

## Installation

- Change directory to `lambdaLayers\common-lambda-layer-for-rds` folder. Run `npm i` to install dependencies of the lambda layer project. All lambda dependencies are installed on the layer, hence no need for `npm i` command on the JS lamdba folders.
- Open terminal and change directory to `cdk` folder. 
- You need to bootstrap aws cdk (i.e. install the AWS' CDK stack that will be used for installing your stacks). Run the command `npm run bootstrap-test`.
- Run `npm i` to install dependencies of the cdk project.
- On the same folder, run `npm run build-dotnet-lambda` to prepare the release for the dotnet lambda.
- Open `cdk\package.json` on the cdk folder, locate npm scripts such as `deploy-test` and update AWS account profile and number there.
- Open `cdk\cdk.json` and provide the values for `awsAccount`, `awsRegion` and all variables prefixed with `persistent`. These are existing persistent resources that are installed manually.
  - persistentLambdasKmsKeyArn: AWS KMS Symmetric Key to be used for encrypting/decrrypting secrets: https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html#create-symmetric-cmk
  - persistentLambdasSecretArn: On AWS Secret Manager, create `Other type of secret` with Key/value pair: https://docs.aws.amazon.com/secretsmanager/latest/userguide/create_secret.html
    - Your secret has to contain the keys defined on the enum `EnvironmentVariableKeys`.
  - vpc, subnet and security group IDs: These are the VPN details for accessing services such as RDS from your lambdas:  https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html#vpc-conditions
  - lambda user Arns: These are IAM users that are allowed to call your Lambda function URL's: https://docs.aws.amazon.com/lambda/latest/dg/urls-auth.html

## Deployment
- Run `deploy-test` to install the stack. 

Deployment details (e.g. Lambda URL's) will be printed to the console (`Outputs:...`) during the deployment command above.
The deployment details will also be written to the file `cdk-exports.json` after the deployment.

## Tests

To test the cdk code (Typescript), run `npm run test`.

To test the dotnet lambdas, in the terminal, navigate to `lambdas\domain1\domain1-sample-lambda\test` and then run `dotnet test`.
The test code for JS lambdas is not added yet.

## Further development
Github workflow files will be added to manage the deployments via Github actions.