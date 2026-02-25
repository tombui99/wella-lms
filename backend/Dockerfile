# Use the SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy the project files and restore dependencies
COPY ["BifrostLms.sln", "./"]
COPY ["BifrostLms.Api/BifrostLms.Api.csproj", "BifrostLms.Api/"]
RUN dotnet restore

# Copy the rest of the code and build
COPY . .
WORKDIR "/src/BifrostLms.Api"
RUN dotnet build "BifrostLms.Api.csproj" -c Release -o /app/build

# Publish the app
FROM build AS publish
RUN dotnet publish "BifrostLms.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "BifrostLms.Api.dll"]
