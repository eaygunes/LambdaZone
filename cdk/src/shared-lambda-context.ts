
import Ec2 = require('aws-cdk-lib/aws-ec2');
import * as Lambda from 'aws-cdk-lib/aws-lambda';

export type SharedLambdaContext = {
  RdsVpcSettings: {
    vpc: Ec2.IVpc
    vpcSubnets: Ec2.SubnetSelection | undefined
    securityGroups: Ec2.ISecurityGroup[] | undefined
  },
  CommonLambdaLayerRds: Lambda.LayerVersion
}