using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BifrostLms.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCourseSharing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CourseTenants",
                columns: table => new
                {
                    CourseId = table.Column<int>(type: "int", nullable: false),
                    TenantId = table.Column<string>(type: "varchar(255)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseTenants", x => new { x.CourseId, x.TenantId });
                    table.ForeignKey(
                        name: "FK_CourseTenants_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CourseTenants");
        }
    }
}
