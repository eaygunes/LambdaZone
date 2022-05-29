import * as Lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as path from 'path';
import { DefaultLambdaSettings, EnvironmentVariableKeys, LambdaConstruct } from '../../lambda-construct';
import { SharedLambdaContext } from '../../shared-lambda-context';

const ID = "SampleLambdaForDomain2WithJs";

export class SampleLambdaConstruct extends LambdaConstruct {
    private readonly sampleLambdaUrl: Lambda.CfnUrl;

    constructor(scope: Construct, sharedLambdaContext: SharedLambdaContext) {

        var props = {
            ...DefaultLambdaSettings,
            functionName: ID + "WithUrl",
            runtime: Lambda.Runtime.NODEJS_16_X,
            code: Lambda.Code.fromAsset(path.join(__dirname, "..", "..", "..", "..", "lambdas", "domain2", "domain2-sample-lambda", "src"), {
              exclude: ["**node_modules"]
            }),
            handler: "index.handler",
            vpc: sharedLambdaContext.RdsVpcSettings.vpc,
            vpcSubnets: sharedLambdaContext.RdsVpcSettings.vpcSubnets,
            securityGroups: sharedLambdaContext.RdsVpcSettings.securityGroups,
            description: "Sample lambda for domain 2",
            layers: [sharedLambdaContext.CommonLambdaLayerRds]
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
              principal: scope.node.tryGetContext('persistentDomain2SampleLambdaUserArn') as string,
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