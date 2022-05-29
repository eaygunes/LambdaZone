using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Net;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace SampleLambda;

public class Function
{
    public APIGatewayProxyResponse FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
    {
        var contextStr = JsonSerializer.Serialize(context);
        LambdaLogger.Log("Context: " + contextStr);

        var requestStr = JsonSerializer.Serialize(request);
        LambdaLogger.Log("Request:  " + requestStr);

        string? bodyStrClear;

        if (request.IsBase64Encoded)
        {
            bodyStrClear = JsonSerializer.Deserialize<dynamic>(Encoding.UTF8.GetString(Convert.FromBase64String(request.Body)));
        }
        else
        {
            bodyStrClear = request.Body;
        }

        if (string.IsNullOrEmpty(bodyStrClear))
        {
            return new APIGatewayProxyResponse
            {
                StatusCode = (int)HttpStatusCode.BadRequest,
                Body = "Empty body",
                Headers = new Dictionary<string, string> { { "Content-Type", "text/plain" } }
            };
        }

        var bodyObj = JsonNode.Parse(bodyStrClear);
        LambdaLogger.Log("Body: " + bodyStrClear);
        
        var response = new APIGatewayProxyResponse
        {
            StatusCode = (int)HttpStatusCode.OK,
            Body = "OK",
            Headers = new Dictionary<string, string> { { "Content-Type", "text/plain" } }
        };

        return response;

    }
}
