using Microsoft.AspNetCore.Identity;
using BifrostLms.Api.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace BifrostLms.Api.Data;

public static class DbInitializer
{
    public static async Task Seed(WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // 1. Seed Roles
        string[] roles = { "Admin", "Teacher", "Student" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // 2. Seed Default Tenant
        if (!context.Tenants.Any())
        {
            context.Tenants.Add(new Tenant
            {
                Id = "system-tenant",
                Name = "System Administration",
                IsActive = true
            });
            await context.SaveChangesAsync();
        }

        // 3. Seed Admin User
        var adminEmail = "admin@bifrost.com";
        var adminUser = await userManager.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == adminEmail);

        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "System Admin",
                TenantId = "system-tenant",
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(adminUser, "Admin123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }
    }
}
