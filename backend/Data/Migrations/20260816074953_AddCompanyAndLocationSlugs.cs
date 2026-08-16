using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyAndLocationSlugs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "Locations",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "Companies",
                type: "TEXT",
                nullable: true);

            // Existing records get stable, collision-free placeholders. New records
            // are generated from Name by the DAOs.
            migrationBuilder.Sql("UPDATE Locations SET Slug = 'location-' || CompanyId || '-' || Id WHERE Slug IS NULL;");
            migrationBuilder.Sql("UPDATE Companies SET Slug = 'company-' || Id WHERE Slug IS NULL;");

            migrationBuilder.CreateIndex(
                name: "IX_Locations_CompanyId_Slug",
                table: "Locations",
                columns: new[] { "CompanyId", "Slug" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Companies_Slug",
                table: "Companies",
                column: "Slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Locations_CompanyId_Slug",
                table: "Locations");

            migrationBuilder.DropIndex(
                name: "IX_Companies_Slug",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "Companies");
        }
    }
}
