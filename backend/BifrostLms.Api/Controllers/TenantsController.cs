using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BifrostLms.Api.Core.Entities;
using BifrostLms.Api.Core.Services;
using BifrostLms.Api.Data;

namespace BifrostLms.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class TenantsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ITenantProvider _tenantProvider;

    public TenantsController(AppDbContext context, ITenantProvider tenantProvider)
    {
        _context = context;
        _tenantProvider = tenantProvider;
    }

    [HttpGet("current")]
    public async Task<ActionResult<Tenant>> GetCurrentTenant()
    {
        var tenantId = _tenantProvider.TenantId;
        if (string.IsNullOrEmpty(tenantId)) return BadRequest("Tenant context not found.");

        var tenant = await _context.Tenants.FindAsync(tenantId);
        if (tenant == null) return NotFound();

        return tenant;
    }
}
