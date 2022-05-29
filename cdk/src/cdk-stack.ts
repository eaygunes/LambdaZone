import { aws_kms, Stack, StackProps } from 'aws-cdk-lib';
import * as Lambda from 'aws-cdk-lib/aws-lambda';
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import * as path from 'path';
import { EnvironmentVariableKeys, LambdaConstruct } from './lambda-construct';
import { SharedLambdaContext } from './shared-lambda-context';
import Ec2 = require('aws-cdk-lib/aws-ec2');

export class CdkStack extends Stack {
  private readonly lambdaList: LambdaConstruct[] = [];

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const persistentVpcIdForRds = scope.node.tryGetContext('persistentVpcIdForRds') as string;
    const persistentSubnetIdForRds = scope.node.tryGetContext('persistentSubnetIdForRds') as string;
    const persistentSecurityGroupIdForSql = scope.node.tryGetContext('persistentSecurityGroupIdForSql') as string;
    const persistentSecurityGroupIdForMongo = scope.node.tryGetContext('persistentSecurityGroupIdForMongo') as string;

    const existingVpcForRds = Ec2.Vpc.fromLookup(this, 'imported-vpc', { vpcId: persistentVpcIdForRds });
    const existingSubnetForRds = Ec2.Subnet.fromSubnetId(this, 'imported-subnet', persistentSubnetIdForRds,);
    const existingRdsSecurityGroupSql = Ec2.SecurityGroup.fromSecurityGroupId(this, 'imported-security-groupSql', persistentSecurityGroupIdForSql,);
    const existingRdsSecurityGroupMongo = Ec2.SecurityGroup.fromSecurityGroupId(this, 'imported-security-groupMongo', persistentSecurityGroupIdForMongo,);

    const commonLambdaLayerRds = new Lambda.LayerVersion(this, 'common-lambda-layer-for-rds', {
      compatibleRuntimes: [
        Lambda.Runtime.NODEJS_16_X,
      ],
      code: Lambda.Code.fromAsset(path.join(__dirname, "..", "..", "lambdaLayers", "common-lambda-layer-for-rds")),
      description: 'Lambda Layer for RDS access: Mongo and SQL clients',
    });

    var sharedLambdaContext: SharedLambdaContext = {
      RdsVpcSettings: {
        vpc: existingVpcForRds,
        vpcSubnets: { subnets: [existingSubnetForRds] },
        securityGroups: [existingRdsSecurityGroupSql, existingRdsSecurityGroupMongo],
      },
      CommonLambdaLayerRds: commonLambdaLayerRds
    }

    this.lambdaList.push(new (require(path.join(__dirname, "lambda-constructs", "domain1", "domain1-sample-lambda-construct.ts")).
      SampleLambdaConstruct)(this, sharedLambdaContext));
    this.lambdaList.push(new (require(path.join(__dirname, "lambda-constructs", "domain2", "domain2-sample-lambda-construct.ts")).
      SampleLambdaConstruct)(this, sharedLambdaContext));

    const keyArn = scope.node.tryGetContext('persistentLambdasKmsKeyArn') as string;
    const key = aws_kms.Key.fromKeyArn(this, 'Key', keyArn);
    const secretArn = scope.node.tryGetContext('persistentLambdasSecretArn') as string

    const secret = secretsManager.Secret.fromSecretAttributes(this, 'SecretFromCompleteArn', {
      secretCompleteArn: secretArn,
      encryptionKey: key
    });

    // Using secrets cache to avoid redundant billed API calls to secret manager.
    // Secrets provided to lambdas via env vars.
    const secretsCacheEntireSet: { [Key: string]: string } = {}

    Object.keys(EnvironmentVariableKeys).forEach(key => {
      secretsCacheEntireSet[key] = secret.secretValueFromJson(key).unsafeUnwrap().toString();
    });

    this.lambdaList.forEach(lambda => {
      lambda.getEnvironmentVariablesToBeCollectedFromSecretManager().forEach(key => {
        lambda.addEnvironment(key, secretsCacheEntireSet[key]);
      })
    })

  }

  public getOutputs(): { Key: string; Value: string; }[] {
    var list: { Key: string; Value: string; }[] = [];

    this.lambdaList.forEach(lambda => {
      list.push(...lambda.getOutputs())
    })


    return list;
  }
}
