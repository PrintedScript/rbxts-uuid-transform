# @rbxts/uuid-transform
#### Last updated for roblox-ts V3.0.0
A really simple compile-time UUID generator for [roblox-ts](https://roblox-ts.com/), useful for obfuscating internal names like network remotes to protect them from malicious actors. This is meant as a partial drop-in replacement for [rbxts-transform-guid](https://github.com/roblox-aurora/rbxts-transform-guid)

## Installation

Add `@rbxts/uuid-transform` to your project dependencies
```
npm install @rbxts/uuid-transform
```

Modify `tsconfig.json` to add the transformer to your roblox-ts plugins
```json
{
    "compilerOptions": {
        // ...
        "plugins": [
            // ...
            {
                "transform": "@rbxts/uuid-transform"
            }
        ]
    }
}
```
Note: Make sure to restart the roblox-ts compiler if it is already running for the changes to take effect

## Usage

The transformer will only generate UUIDs for `const enum` which has a `uuid` JSDoc tag.
```ts
/**
 * @uuid
 */
export const enum RemoteId {
    GetPlayerInventory = "GetPlayerInventory", // The values can be anything you want as it will be replaced
    UpdatePlayerInventory = "UpdatePlayerInventory",
    DropInventoryItem = "DropInventoryItem"
}

const getPlayerInventoryRemoteName = RemoteId.GetPlayerInventory
const updatePlayerInventoryRemoteName = RemoteId.UpdatePlayerInventory
const dropInventoryItemRemoteName = RemoteId.DropInventoryItem

const Remotes = {
    [RemoteId.GetPlayerInventory]: "Test"
}
```
This will compile to
```lua
local getPlayerInventoryRemoteName = "73850d5d-b09f-4dca-8f59-fd34b0fc9d17"
local updatePlayerInventoryRemoteName = "dd3758e4-6ba4-4aef-bff5-d57558962e77"
local dropInventoryItemRemoteName = "d94e3150-df1c-48e7-a51b-059b4d94c074"

local Remotes = {
    ["73850d5d-b09f-4dca-8f59-fd34b0fc9d17"] = "Test"
}
```
The UUIDs will change everytime during compilation