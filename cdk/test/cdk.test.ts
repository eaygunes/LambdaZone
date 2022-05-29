import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Cdk from '../src/cdk-stack';

test('SampleLambda Created for dotnet6 runtime', () => {
  const app = new cdk.App();
  var awsAccount = app.node.tryGetContext('awsAccount') as string;
  var awsRegion = app.node.tryGetContext('awsRegion') as string;

  console.log(`awsAccount: ${awsAccount}`);
  console.log(`awsRegion: ${awsRegion}`);

  const stack = new Cdk.CdkStack(app, 'SampleCdkStackForLambdaTests', {
    env: { account: awsAccount, region: awsRegion }
  });
  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::Lambda::Function", {
    Handler: "SampleLambda::SampleLambda.Function::FunctionHandler",
    Runtime: "dotnet6",
  });
});
