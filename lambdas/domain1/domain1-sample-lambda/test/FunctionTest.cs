using System.Net;
using Xunit;
using Amazon.Lambda.TestUtilities;
using Amazon.Lambda.APIGatewayEvents;
namespace SampleLambda.Tests;

public class FunctionTest
{
    [Fact]
    public void TestToUpperFunction()
    {

        // Invoke the lambda function and confirm the string was upper cased.
        var function = new Function();
        var context = new TestLambdaContext();

        APIGatewayProxyRequest request = new APIGatewayProxyRequest();
        var result = function.FunctionHandler(request, context);

        Assert.Equal("Empty body", result.Body);
        Assert.Equal((int)HttpStatusCode.BadRequest, result.StatusCode);

    }
}
