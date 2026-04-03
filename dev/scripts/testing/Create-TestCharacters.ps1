# ============================================
# Task 3: Create Character Models in Database
# Sprint 2 - Evan Farling
# ============================================

Write-Host "================================" -ForegroundColor Cyan
Write-Host "TASK 3: CREATE TEST CHARACTERS" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5262/api/character"
$createdCharacters = @()

# ============================================
# CHARACTER 1: Low-Level Wizard
# ============================================
Write-Host "Creating Character 1: Gandalf (Level 5 Wizard)..." -ForegroundColor Yellow

$char1 = @{
    user_id = "user-test-001"
    character_id = "char-gandalf-001"
    object_id = "character_sheet"
    name = "Gandalf the Grey"
    level = 5
    class = @(@{
        object_id = "class"
        class_id = "wizard"
        class_level = "5"
        traits = @{ hit_point_die = "d6" }
    })
    ability_scores = @(@{
        score_strength = "10"
        score_dexterity = "12"
        score_constitution = "14"
        score_intelligence = "20"
        score_wisdom = "18"
        score_charisma = "16"
    })
} | ConvertTo-Json -Depth 10

try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $char1
    Write-Host "Success: Created Gandalf" -ForegroundColor Green
    $createdCharacters += "char-gandalf-001"
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ============================================
# CHARACTER 2: High-Level Fighter
# ============================================
Write-Host "Creating Character 2: Aragorn (Level 15 Fighter)..." -ForegroundColor Yellow

$char2 = @{
    user_id = "user-test-001"
    character_id = "char-aragorn-002"
    object_id = "character_sheet"
    name = "Aragorn"
    level = 15
    class = @(@{
        object_id = "class"
        class_id = "fighter"
        class_level = "15"
        traits = @{ hit_point_die = "d10" }
    })
    ability_scores = @(@{
        score_strength = "20"
        score_dexterity = "16"
        score_constitution = "18"
        score_intelligence = "12"
        score_wisdom = "14"
        score_charisma = "18"
    })
} | ConvertTo-Json -Depth 10

try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $char2
    Write-Host "Success: Created Aragorn" -ForegroundColor Green
    $createdCharacters += "char-aragorn-002"
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ============================================
# CHARACTER 3: Mid-Level Cleric
# ============================================
Write-Host "Creating Character 3: Elara (Level 10 Cleric)..." -ForegroundColor Yellow

$char3 = @{
    user_id = "user-test-002"
    character_id = "char-elara-003"
    object_id = "character_sheet"
    name = "Elara the Healer"
    level = 10
    class = @(@{
        object_id = "class"
        class_id = "cleric"
        class_level = "10"
        traits = @{ hit_point_die = "d8" }
    })
    ability_scores = @(@{
        score_strength = "12"
        score_dexterity = "10"
        score_constitution = "16"
        score_intelligence = "12"
        score_wisdom = "20"
        score_charisma = "14"
    })
} | ConvertTo-Json -Depth 10

try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $char3
    Write-Host "Success: Created Elara" -ForegroundColor Green
    $createdCharacters += "char-elara-003"
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ============================================
# CHARACTER 4: Low-Level Rogue
# ============================================
Write-Host "Creating Character 4: Shadow (Level 3 Rogue)..." -ForegroundColor Yellow

$char4 = @{
    user_id = "user-test-002"
    character_id = "char-shadow-004"
    object_id = "character_sheet"
    name = "Shadow"
    level = 3
    class = @(@{
        object_id = "class"
        class_id = "rogue"
        class_level = "3"
        traits = @{ hit_point_die = "d8" }
    })
    ability_scores = @(@{
        score_strength = "10"
        score_dexterity = "20"
        score_constitution = "12"
        score_intelligence = "14"
        score_wisdom = "12"
        score_charisma = "16"
    })
} | ConvertTo-Json -Depth 10

try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $char4
    Write-Host "Success: Created Shadow" -ForegroundColor Green
    $createdCharacters += "char-shadow-004"
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ============================================
# CHARACTER 5: High-Level Barbarian
# ============================================
Write-Host "Creating Character 5: Grok (Level 18 Barbarian)..." -ForegroundColor Yellow

$char5 = @{
    user_id = "user-test-003"
    character_id = "char-grok-005"
    object_id = "character_sheet"
    name = "Grok the Mighty"
    level = 18
    class = @(@{
        object_id = "class"
        class_id = "barbarian"
        class_level = "18"
        traits = @{ hit_point_die = "d12" }
    })
    ability_scores = @(@{
        score_strength = "24"
        score_dexterity = "14"
        score_constitution = "22"
        score_intelligence = "8"
        score_wisdom = "10"
        score_charisma = "10"
    })
} | ConvertTo-Json -Depth 10

try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $char5
    Write-Host "Success: Created Grok" -ForegroundColor Green
    $createdCharacters += "char-grok-005"
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ============================================
# CHARACTER 6: Mid-Level Ranger
# ============================================
Write-Host "Creating Character 6: Legolas (Level 12 Ranger)..." -ForegroundColor Yellow

$char6 = @{
    user_id = "user-test-003"
    character_id = "char-legolas-006"
    object_id = "character_sheet"
    name = "Legolas"
    level = 12
    class = @(@{
        object_id = "class"
        class_id = "ranger"
        class_level = "12"
        traits = @{ hit_point_die = "d10" }
    })
    ability_scores = @(@{
        score_strength = "14"
        score_dexterity = "22"
        score_constitution = "14"
        score_intelligence = "12"
        score_wisdom = "18"
        score_charisma = "14"
    })
} | ConvertTo-Json -Depth 10

try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $char6
    Write-Host "Success: Created Legolas" -ForegroundColor Green
    $createdCharacters += "char-legolas-006"
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ============================================
# CHARACTER 7: Low-Level Bard
# ============================================
Write-Host "Creating Character 7: Melody (Level 4 Bard)..." -ForegroundColor Yellow

$char7 = @{
    user_id = "user-test-004"
    character_id = "char-melody-007"
    object_id = "character_sheet"
    name = "Melody"
    level = 4
    class = @(@{
        object_id = "class"
        class_id = "bard"
        class_level = "4"
        traits = @{ hit_point_die = "d8" }
    })
    ability_scores = @(@{
        score_strength = "8"
        score_dexterity = "16"
        score_constitution = "12"
        score_intelligence = "14"
        score_wisdom = "10"
        score_charisma = "20"
    })
} | ConvertTo-Json -Depth 10

try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $char7
    Write-Host "Success: Created Melody" -ForegroundColor Green
    $createdCharacters += "char-melody-007"
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ============================================
# CHARACTER 8: High-Level Paladin
# ============================================
Write-Host "Creating Character 8: Sir Galahad (Level 16 Paladin)..." -ForegroundColor Yellow

$char8 = @{
    user_id = "user-test-004"
    character_id = "char-galahad-008"
    object_id = "character_sheet"
    name = "Sir Galahad"
    level = 16
    class = @(@{
        object_id = "class"
        class_id = "paladin"
        class_level = "16"
        traits = @{ hit_point_die = "d10" }
    })
    ability_scores = @(@{
        score_strength = "20"
        score_dexterity = "12"
        score_constitution = "18"
        score_intelligence = "10"
        score_wisdom = "14"
        score_charisma = "20"
    })
} | ConvertTo-Json -Depth 10

try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $char8
    Write-Host "Success: Created Sir Galahad" -ForegroundColor Green
    $createdCharacters += "char-galahad-008"
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ============================================
# CHARACTER 9: Max Level Sorcerer
# ============================================
Write-Host "Creating Character 9: Arcanus (Level 20 Sorcerer)..." -ForegroundColor Yellow

$char9 = @{
    user_id = "user-test-005"
    character_id = "char-arcanus-009"
    object_id = "character_sheet"
    name = "Arcanus the Supreme"
    level = 20
    class = @(@{
        object_id = "class"
        class_id = "sorcerer"
        class_level = "20"
        traits = @{ hit_point_die = "d6" }
    })
    ability_scores = @(@{
        score_strength = "8"
        score_dexterity = "14"
        score_constitution = "16"
        score_intelligence = "14"
        score_wisdom = "10"
        score_charisma = "22"
    })
} | ConvertTo-Json -Depth 10

try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $char9
    Write-Host "Success: Created Arcanus" -ForegroundColor Green
    $createdCharacters += "char-arcanus-009"
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ============================================
# CHARACTER 10: Low-Level Monk
# ============================================
Write-Host "Creating Character 10: Zen (Level 6 Monk)..." -ForegroundColor Yellow

$char10 = @{
    user_id = "user-test-005"
    character_id = "char-zen-010"
    object_id = "character_sheet"
    name = "Zen"
    level = 6
    class = @(@{
        object_id = "class"
        class_id = "monk"
        class_level = "6"
        traits = @{ hit_point_die = "d8" }
    })
    ability_scores = @(@{
        score_strength = "12"
        score_dexterity = "20"
        score_constitution = "14"
        score_intelligence = "10"
        score_wisdom = "18"
        score_charisma = "10"
    })
} | ConvertTo-Json -Depth 10

try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $char10
    Write-Host "Success: Created Zen" -ForegroundColor Green
    $createdCharacters += "char-zen-010"
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ============================================
# SUMMARY
# ============================================
Write-Host "================================" -ForegroundColor Cyan
Write-Host "CREATION COMPLETE" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Created $($createdCharacters.Count) characters" -ForegroundColor White
Write-Host ""
Write-Host "Coverage:" -ForegroundColor White
Write-Host "  Classes: Wizard, Fighter, Cleric, Rogue, Barbarian, Ranger, Bard, Paladin, Sorcerer, Monk" -ForegroundColor Gray
Write-Host "  Levels: 3, 4, 5, 6, 10, 12, 15, 16, 18, 20" -ForegroundColor Gray
Write-Host "  Users: 5 different test users" -ForegroundColor Gray
Write-Host "================================" -ForegroundColor Cyan