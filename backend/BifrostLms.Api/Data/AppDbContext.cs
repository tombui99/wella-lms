using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using BifrostLms.Api.Core.Entities;
using BifrostLms.Api.Core.Services;

namespace BifrostLms.Api.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    private readonly ITenantProvider _tenantProvider;

    public AppDbContext(DbContextOptions<AppDbContext> options, ITenantProvider tenantProvider) : base(options)
    {
        _tenantProvider = tenantProvider;
    }

    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<Course> Courses { get; set; }
    public DbSet<CourseTenant> CourseTenants { get; set; }
    public DbSet<Lesson> Lessons { get; set; }
    public DbSet<Schedule> Schedules { get; set; }
    public DbSet<ForumPost> ForumPosts { get; set; }
    public DbSet<Resource> Resources { get; set; }
    public DbSet<TrainingProgram> TrainingPrograms { get; set; }
    public DbSet<FAQ> FAQs { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<StudentProgress> StudentProgresses { get; set; }
    public DbSet<LessonProgress> LessonProgresses { get; set; }
    public DbSet<Quiz> Quizzes { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<Choice> Choices { get; set; }
    public DbSet<QuizAttempt> QuizAttempts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Tenant ID as a key for the Tenant entity
        modelBuilder.Entity<Tenant>().HasKey(t => t.Id);

        // Configure CourseTenant composite key
        modelBuilder.Entity<CourseTenant>().HasKey(ct => new { ct.CourseId, ct.TenantId });

        // Global Query Filter for Multi-tenancy
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(IMultiTenant).IsAssignableFrom(entityType.ClrType))
            {
                var method = typeof(AppDbContext)
                    .GetMethod(nameof(ApplyFilter), System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
                    .MakeGenericMethod(entityType.ClrType);
                method.Invoke(this, new object[] { modelBuilder });
            }
        }
    }

    private void ApplyFilter<T>(ModelBuilder modelBuilder) where T : class, IMultiTenant
    {
        if (typeof(T) == typeof(Course))
        {
            modelBuilder.Entity<Course>().HasQueryFilter(e => e.TenantId == _tenantProvider.TenantId || e.SharedWithTenants.Any(st => st.TenantId == _tenantProvider.TenantId));
        }
        else if (typeof(T) == typeof(Lesson))
        {
            modelBuilder.Entity<Lesson>().HasQueryFilter(e => e.TenantId == _tenantProvider.TenantId || (e.Course != null && e.Course.SharedWithTenants.Any(st => st.TenantId == _tenantProvider.TenantId)));
        }
        else if (typeof(T) == typeof(Quiz))
        {
            modelBuilder.Entity<Quiz>().HasQueryFilter(e => e.TenantId == _tenantProvider.TenantId || (e.Course != null && e.Course.SharedWithTenants.Any(st => st.TenantId == _tenantProvider.TenantId)));
        }
        else
        {
            modelBuilder.Entity<T>().HasQueryFilter(e => e.TenantId == _tenantProvider.TenantId);
        }
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<IMultiTenant>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.TenantId ??= _tenantProvider.TenantId;
            }
            
            if (entry.Entity is BaseEntity baseEntity && entry.State == EntityState.Modified)
            {
                baseEntity.UpdatedAt = DateTime.UtcNow;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
