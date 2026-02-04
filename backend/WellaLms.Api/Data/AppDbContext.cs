using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WellaLms.Api.Core.Entities;

namespace WellaLms.Api.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<Course> Courses { get; set; }
    public DbSet<Lesson> Lessons { get; set; }
    public DbSet<Schedule> Schedules { get; set; }
    public DbSet<ForumPost> ForumPosts { get; set; }
    public DbSet<Resource> Resources { get; set; }
    public DbSet<TrainingProgram> TrainingPrograms { get; set; }
    public DbSet<FAQ> FAQs { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<StudentProgress> StudentProgresses { get; set; }
    public DbSet<LessonProgress> LessonProgresses { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Tenant ID as a key for the Tenant entity
        modelBuilder.Entity<Tenant>().HasKey(t => t.Id);

        // Optional: Global Global Query Filter for Multi-tenancy
        // This is a simple implementation. In a real SaaS, you'd inject ITenantService
        // and use its TenantId here.
    }
}
