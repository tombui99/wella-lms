using BifrostLms.Api.Core.Services;

namespace BifrostLms.Api.Middleware;

public class TenantMiddleware
{
    private readonly RequestDelegate _next;

    public TenantMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITenantProvider tenantProvider)
    {
        // 1. Try to get Tenant ID from header
        if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var tenantId))
        {
            tenantProvider.TenantId = tenantId.ToString();
        }
        else
        {
            // 2. Fallback: Try to get from User claims if authenticated
            var tenantClaim = context.User.FindFirst("TenantId")?.Value;
            if (!string.IsNullOrEmpty(tenantClaim))
            {
                tenantProvider.TenantId = tenantClaim;
            }
        }

        await _next(context);
    }
}
