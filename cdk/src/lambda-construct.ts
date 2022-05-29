import { Duration } from 'aws-cdk-lib';
import * as Lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export abstract class LambdaConstruct extends Lambda.Function {
    constructor (scope: Construct, id: string, props: Lambda.FunctionProps) {
        super (scope, id, props);
    }

    public abstract getOutputs(): { Key: string; Value: string; }[] ;

    public abstract getEnvironmentVariablesToBeCollectedFromSecretManager(): EnvironmentVariableKeys[] ;
}

export const DefaultLambdaSettings = {
    timeout: Duration.seconds(60),
    memorySize: 256,
  }

export enum EnvironmentVariableKeys {
    ENV_VAR_1 = "ENV_VAR_1",
    ENV_VAR_2 = "ENV_VAR_2",
    ENV_VAR_3 = "ENV_VAR_3",
  }