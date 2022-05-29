import * as Lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as path from 'path';
import { DefaultLambdaSettings, EnvironmentVariableKeys, LambdaConstruct } from '../../lambda-construct';
import { SharedLambdaContext } from '../../shared-lambda-context';

const ID = "SampleLambdaForDomain1WithDotnet";

export class SampleLambdaConstruct extends LambdaConstruct {
    private readonly sampleLambdaUrl: Lambda.CfnUrl;

    constructor(scope: Construct, sharedLambdaContext: SharedLambdaContext) {

        var props = {
            ...DefaultLambdaSettings,
            functionName: ID + "WithUrl",
            runtime: Lambda.Runtime.DOTNET_6,
            code: Lambda.Code.fromAsset(path.join(__dirname, "..", "..", "..", "..", "lambdas", "domain1", "domain1-sample-lambda", "src", "bin", "Release", "net6.0", "linux-x64", "publish")),
            handler: "SampleLambda::SampleLambda.Function::FunctionHandler",
            vpc: sharedLambdaContext.RdsVpcSettings.vpc,
            vpcSubnets: sharedLambdaContext.RdsVpcSettings.vpcSubnets,
            securityGroups: sharedLambdaContext.RdsVpcSettings.securityGroups,
            description: "Sample lambda for domain 1",
        }

        super(scope, ID, props);

        this.sampleLambdaUrl = new Lambda.CfnUrl(scope, ID + 'Url1', {
            authType: "AWS_IAM",
            targetFunctionArn: this.functionArn
          });
      
          new Lambda.CfnPermission(
            this,
            ID + 'Permission1',
            {
              functionName: this.functionName,
              principal: scope.node.tryGetContext('persistentDomain1SampleLambdaUserArn') as string,
              action: "lambda:InvokeFunctionUrl",
              functionUrlAuthType: "AWS_IAM"
            }
          )

        
    }

    public getEnvironmentVariablesToBeCollectedFromSecretManager(): EnvironmentVariableKeys[] {
      return [
        EnvironmentVariableKeys.ENV_VAR_1,
        EnvironmentVariableKeys.ENV_VAR_2,
        EnvironmentVariableKeys.ENV_VAR_3
      ]
    }

    public getOutputs(): { Key: string; Value: string; }[] {
        return [
          { "Key": ID + "Arn", "Value": this.functionArn },
          { "Key": ID + "FunctionURL", "Value": this.sampleLambdaUrl.attrFunctionUrl}
        ]
      }
}