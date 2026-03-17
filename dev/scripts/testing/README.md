# Test Character Creation Script

## Setup for Teammates

### Step 1: Allow PowerShell Scripts (One-Time Setup)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 2: Start the Backend
```bash
cd dev/backend/Kwill.Api
dotnet run
```

### Step 3: Run the Script
```powershell
cd dev/scripts/testing
.\Create-TestCharacters.ps1
```

## What It Creates
- 10 test characters across all major classes
- Levels 3-20
- 5 different test users
- All pass D&D 5e validation

## Verify Success
```bash
mongosh
use Kwill
db.characterSheets.countDocuments()
```
Should show 10 uniqu characters.