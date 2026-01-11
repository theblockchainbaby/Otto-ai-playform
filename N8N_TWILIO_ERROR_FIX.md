# Fix for Twilio "To" Phone Number Error

## The Issue
The Twilio node is failing with **"A 'To' phone number is required"** because the expression used to get the phone number is returning `undefined`.

This is caused by a **case-sensitivity mismatch** in the variable name:
- **You used:** `dynamicVariables` (camelCase)
- **The data is:** `dynamic_variables` (snake_case)

## The Fix

1. Open your **Twilio** node in n8n.
2. Locate the **"To"** field.
3. Replace the current expression with this corrected one:

```javascript
{{ $('Code in JavaScript1').first().json.dynamic_variables.customerPhone }}
```

*(Note the underscore in `dynamic_variables`)*

## Verification
To verify the data exists before sending:
1. Click on the **"Code in JavaScript1"** node.
2. Check the **Output Data** JSON.
3. Ensure you see the structure:
   ```json
   {
     "dynamic_variables": {
       "customerPhone": "+1..."
     }
   }
   ```
