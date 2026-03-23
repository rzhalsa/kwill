# Character Sheet and Data
This is the WIP version of the html character sheet and json data structure for Kwill dnd characters
### JSON
The information associated with a dnd character will be stored as a json file. This information will be parsed by javascript embedded into the Kwill character sheet to automatically populate fields with stored or calculated values.

Every character.json will contain the user_id and character_id keys for storing online on our database.

The json is and will be html agnostic, meaning that any html with the proper javascript should be able to interact with the json files.

### HTML
The character sheet is an html file designed to look like a pdf when viewed in a browser. It will have embedded javascript to parse through character.json files in order to populate fields automatically. Any changes made to the html sheet will be reflected in the stored html.

For developers: If you are using vs code you can install the Live Server extension by Ritwick Dey to show a live reflection of changes made tothe html.