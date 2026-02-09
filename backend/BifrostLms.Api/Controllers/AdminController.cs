using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BifrostLms.Api.Core.Entities;
using BifrostLms.Api.Core.DTOs;
using BifrostLms.Api.Data;

namespace BifrostLms.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly AppDbContext _context;

    public AdminController(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        AppDbContext context)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
    }

    // --- User Management ---

    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<UserDisplayDto>>> GetUsers()
    {
        var users = await _userManager.Users.IgnoreQueryFilters().ToListAsync();
        var userDisplays = new List<UserDisplayDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            userDisplays.Add(new UserDisplayDto
            {
                Id = user.Id,
                Email = user.Email!,
                FullName = user.FullName ?? "",
                Role = roles.FirstOrDefault() ?? "Student",
                TenantId = user.TenantId ?? ""
            });
        }

        return Ok(userDisplays);
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto model)
    {
        var userExists = await _userManager.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == model.Email);
        if (userExists != null)
            return BadRequest(new { Message = "User already exists!" });

        ApplicationUser user = new()
        {
            Email = model.Email,
            SecurityStamp = Guid.NewGuid().ToString(),
            UserName = model.Email,
            FullName = model.FullName,
            TenantId = model.TenantId
        };

        var result = await _userManager.CreateAsync(user, model.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new { Message = string.Join("; ", result.Errors.Select(e => e.Description)) });
        }

        if (!await _roleManager.RoleExistsAsync(model.Role))
            await _roleManager.CreateAsync(new IdentityRole(model.Role));

        await _userManager.AddToRoleAsync(user, model.Role);

        return Ok(new { Message = "User created successfully!" });
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto model)
    {
        var user = await _userManager.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return NotFound();

        user.FullName = model.FullName;
        user.TenantId = model.TenantId;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return BadRequest(new { Message = "Failed to update user." });

        var currentRoles = await _userManager.GetRolesAsync(user);
        var currentRole = currentRoles.FirstOrDefault();

        if (currentRole != model.Role)
        {
            if (currentRole != null)
                await _userManager.RemoveFromRoleAsync(user, currentRole);

            if (!await _roleManager.RoleExistsAsync(model.Role))
                await _roleManager.CreateAsync(new IdentityRole(model.Role));

            await _userManager.AddToRoleAsync(user, model.Role);
        }

        return Ok(new { Message = "User updated successfully!" });
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            return BadRequest(new { Message = "Failed to delete user." });

        return Ok(new { Message = "User deleted successfully!" });
    }

    // --- Tenant Management ---

    [HttpGet("tenants")]
    public async Task<ActionResult<IEnumerable<Tenant>>> GetTenants()
    {
        return await _context.Tenants.ToListAsync();
    }

    [HttpPost("tenants")]
    public async Task<ActionResult<Tenant>> CreateTenant([FromBody] Tenant tenant)
    {
        if (await _context.Tenants.AnyAsync(t => t.Id == tenant.Id))
            return BadRequest(new { Message = "Tenant ID already exists!" });

        _context.Tenants.Add(tenant);
        await _context.SaveChangesAsync();
        return Ok(tenant);
    }

    [HttpPut("tenants/{id}")]
    public async Task<IActionResult> UpdateTenant(string id, [FromBody] Tenant tenant)
    {
        if (id != tenant.Id) return BadRequest();

        _context.Entry(tenant).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // --- Content Management (Global Access) ---

    [HttpGet("content")]
    public async Task<ActionResult<IEnumerable<ContentDisplayDto>>> GetContent()
    {
        var courses = await _context.Courses.IgnoreQueryFilters()
            .Include(c => c.SharedWithTenants)
            .Select(c => new ContentDisplayDto
            {
                Id = c.Id,
                Title = c.Title,
                Type = "Course",
                TenantId = c.TenantId ?? "N/A",
                SharedTenantIds = c.SharedWithTenants.Select(st => st.TenantId).ToList(),
                CreatedAt = c.CreatedAt
            }).ToListAsync();

        return Ok(courses.OrderByDescending(c => c.CreatedAt));
    }

    [HttpPost("content/reassign")]
    public async Task<IActionResult> UpdateContentTenant([FromBody] ContentTenantUpdateDto model)
    {
        if (model.EntityType != "Course") return BadRequest("Only Courses can be reassigned.");

        var course = await _context.Courses.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Id == model.EntityId);
        if (course == null) return NotFound();

        course.TenantId = model.NewTenantId;
        
        // Re-assign lessons for consistency
        var lessons = await _context.Lessons.IgnoreQueryFilters().Where(l => l.CourseId == model.EntityId).ToListAsync();
        foreach(var lesson in lessons)
        {
            lesson.TenantId = model.NewTenantId;
        }

        await _context.SaveChangesAsync();
        return Ok(new { Message = "Course reassigned successfully!" });
    }

    [HttpPost("course/share")]
    public async Task<IActionResult> UpdateCourseSharing([FromBody] CourseShareDto model)
    {
        var course = await _context.Courses.IgnoreQueryFilters()
            .Include(c => c.SharedWithTenants)
            .FirstOrDefaultAsync(c => c.Id == model.CourseId);

        if (course == null) return NotFound();

        // Remove tenants no longer in the list
        var tenantsToRemove = course.SharedWithTenants.Where(st => !model.TenantIds.Contains(st.TenantId)).ToList();
        _context.CourseTenants.RemoveRange(tenantsToRemove);

        // Add new tenants
        var existingTenantIds = course.SharedWithTenants.Select(st => st.TenantId).ToList();
        foreach (var tenantId in model.TenantIds)
        {
            if (!existingTenantIds.Contains(tenantId))
            {
                _context.CourseTenants.Add(new CourseTenant { CourseId = model.CourseId, TenantId = tenantId });
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { Message = "Sharing updated successfully!" });
    }
}
