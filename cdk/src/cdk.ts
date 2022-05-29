import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { CdkStack } from './cdk-stack';

const app = new cdk.App();

var awsAccount = app.node.tryGetContext('awsAccount') as string;
var awsRegion = app.node.tryGetContext('awsRegion') as string;

console.log(`awsAccount: ${awsAccount}`);
console.log(`awsRegion: ${awsRegion}`);

const prefix = app.node.tryGetContext('prefix') as string;
console.log(`prefix: ${prefix}`);

const stack = new CdkStack(app, `${prefix}SampleCdkStackForLambdaTests`, {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */

  env: { account: awsAccount, region: awsRegion },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});

var outputs = stack.getOutputs();

outputs.forEach((output) => {
  new cdk.CfnOutput(stack, output.Key, {
    exportName: output.Key,
    value: output.Value
  })
});
