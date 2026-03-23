To run the sql database you need:
Microsoft.EntityFrameworkCore.SqlServer --version 8.0.11
Microsoft.EntityFrameworkCore.Design --version 8.0.11
Microsoft.EntityFrameworkCore.Tools --version 8.0.11
In both Kwill.Data and Kwill.Api, versions have to match too (If these aren't already added the projects for some reason)

Open a terminal and run these two commands from the backend folder:
dotnet ef migrations add InitialCreate --project Kwill.Data --startup-project Kwill.Api
dotnet ef database update --project Kwill.Data --startup-project Kwill.Api

This should create the local sql server on your device

To view the sql database go to view -> Sql Server Object Explorer
Then follow the path MSSQLLocalDB/KwillAuthDb/Tables/dbo.Users
This is the sql database that was made.