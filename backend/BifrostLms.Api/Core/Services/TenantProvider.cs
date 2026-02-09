namespace BifrostLms.Api.Core.Services;

public interface ITenantProvider
{
    string? TenantId { get; set; }
}

public class TenantProvider : ITenantProvider
{
    public string? TenantId { get; set; }
}
