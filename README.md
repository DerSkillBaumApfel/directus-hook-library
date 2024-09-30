# Directus Hook Library

[![NPM version](https://img.shields.io/npm/v/directus-hook-library)](https://www.npmjs.com/package/directus-hook-library)

A collection of customizable hooks for Directus. This is not an extension, but a library of scripts that could be used inside a Directus hook extension.

## Installation & Usage

First [create a Directus Extension](https://docs.directus.io/extensions/creating-extensions.html) and during setup choose the extension type `hook`.

Inside the extension folder install `directus-hook-library`:

```sh
npm install directus-hook-library
```

Import it in `src/index.ts`, like:

```js
import { setProjectSettingsFromEnvVars } from "directus-hook-library";
```

Have a look at the examples below.

> _Tip:_ You can use multiple of these hook scripts inside the same Directus hook.

## Hooks & Examples

### `deleteUnusedM2OItems`

Used to delete related M2O items that loose their relation and should not be kept, which is not possible via directus itself. This makes sense for a M2O relation that is used like a O2O relation.

Delete all `oneCollection` items that loose their relationship to a `manyCollections` item.

**(!) Important**: You have to specify a (hidden) reverse relationship `O2M` in your `oneCollection` inside Directus to make this work.

<details><summary>Example</summary>

```ts
// src/index.ts
import { defineHook } from "@directus/extensions-sdk";
import { deleteUnusedM2OItems } from "directus-hook-library";

export default defineHook((register, context) => {
    deleteUnusedM2OItems(register, context, {
        oneCollection: "meta_infos",
        manyCollections: {
            pages: "pages",
            posts: "posts",
        },
    });
});
```

</details>

### `replaceDeletedUserReferences`

This replaces the reference to a deleted user with a reference to the current user in the directus_files collection.

<details><summary>Example</summary>

```ts
// src/index.ts
import { defineHook } from "@directus/extensions-sdk";
import { replaceDeletedUserReferences } from "directus-hook-library";

export default defineHook((register, context) => {
    replaceDeletedUserReferences(register, context);
});
```

</details>

### `resetFieldsHiddenByOption`

Set fields to null that have a value but are hidden by a condition.

<details><summary>Example</summary>

```ts
// src/index.ts
import { defineHook } from "@directus/extensions-sdk";
import { resetFieldsHiddenByOption } from "directus-hook-library";

export default defineHook((register, context) => {
    resetFieldsHiddenByOption(register, context, {
        collection: "conditional",
        optionsField: "detail",
        resetGroups: [
            {
                not: ["yes"],
                nullify: ["title", "description"],
            },
            {
                not: ["no"],
                nullify: ["external_link"],
            },
        ],
    });
});
```

</details>

### `setProjectSettingsFromEnvVars`

Used for setting project settings from ENV vars like, `PROJECT_URL`.

This overwrites the values for `settings` in the Project Settings when starting Directus.

<details><summary>Example</summary>

```ts
// src/index.ts
import { defineHook } from "@directus/extensions-sdk";
import { setProjectSettingsFromEnvVars } from "directus-hook-library";

export default defineHook((register, context) => {
    setProjectSettingsFromEnvVars(register, context, [
        "project_name",
        "project_descriptor",
        "project_url",
    ]);
});
```

For ENV variables like:

```.env
PROJECT_NAME=Directus
PROJECT_DESCRIPTOR=Hook
PROJECT_URL=http://localhost:3000
```

</details>





## Many to Any (M2A) hooks
This library provides hooks implementing cascading functionality for `M2A` relations, which is not possible via directus itself.\
For more information and `configuration` details, read the following sections referring to each function.

<details>

<summary> <h3 id="m2a-configuration"> M2A configuration </h3> </summary>

The configuration object for all `M2A` type hooks is the same.\
Configuration objects are described by: 

- <a id="junctionCollectionDescription"> ONE `junctionCollection` entry: </a>
    ```ts
    export type JunctionCollection = {
        collectionName: string;
        foreignKeyFieldName: string;
        itemDiscriminatorFieldName: string;
    };
    ``` 
     Described by: 
    - collectionName: The name of the junction collection (`article_block` in examples)
    - foreignKeyField: The name of the field containing the foreign key for related any items. (`item` if left as Directus default, left as default in examples)
    - itemDiscriminatorFieldName: The name of the field containing the table containing the related item. (`collection` if left as Directus default, left as default in examples)

- <a id="anyCollectionDescription"> MANY `anyCollection` entries: </a>
    ```ts
    export type AnyCollection = {
        collectionName: string;
        primaryKeyFieldName: string;
    };
    ``` 
     Described by: 
    - collectionName: The name of the junction collection (`text_block`, `image_block` or `video_block` in examples)
    - primaryKeyFieldName: The name of the field containing the primary key, which is used to create a relation of items inside of `junctionCollection` collections. (`id` if left as Directus default, left as default in examples)


Grouped together as an object describing the relation called `M2AConfig`: 
```ts
export type M2AConfig = {
    anyCollections: AnyCollection[];
    junctionCollection: JunctionCollection;
};
``` 

</details>





<details>

<summary> <h3> Helper functions </h3> </summary>

Two helper functions are provided, reducing configuration repetition if default fields are left as default.\
The specified helper functions are:

- `toJunctionCollectionM2A` (optional):
  
    This functions takes the `collectionName` as string and sets the other properties to Directus defaults.\
    It is used in the following examples, but customized `JunctionCollection` items can also be passed.\
    For details regarding default values [see M2A configuration](#m2a-configuration) or [Directus documentation](https://docs.directus.io/app/data-model/relationships.html#many-to-any-m2a).
    ```ts
    export const toJunctionCollectionM2A = (collectionName: string): JunctionCollection => ({
        collectionName,
        foreignKeyFieldName: "item",
        itemDiscriminatorFieldName: "collection",
    });
    ```

- `toAnyCollectionM2A` (optional):
  
    This functions takes the `collectionName` as string and sets the other properties to Directus defaults.\
    It is used in the following examples, but customized `AnyCollection` items can also be passed.\
    For details regarding default values [see M2A configuration](#m2a-configuration) or [Directus documentation](https://docs.directus.io/app/data-model/relationships.html#many-to-any-m2a).
    ```ts
    export const toAnyCollectionM2A = (collectionName: string): AnyCollection => ({
        collectionName,
        primaryKeyFieldName: "id",
    });
    ```
    
</details>





### `deleteUnusedItemFilterM2A`
Used to cascade deletes performed on `junctionCollection` items to all configured `anyCollections` (on `junctionCollection` delete, the related `anyCollection` item is also deleted).

Each `Filter` instance is configured with: 
- a `Directus register function` (see [register function](https://docs.directus.io/extensions/hooks.html#register-function))
- a `Directus extension context` (see [context object](https://docs.directus.io/extensions/hooks.html#register-function))
- a `M2AConfig` object, containing configuration as specified in [M2A configuration](#m2a-configuration)
On delete of an item inside a configured `junctionCollection` item, the `anyCollection` item which the junction collection item relates to is also deleted.\
Works like `M2O`, `O2M` or `M2M` selection of `DELETE CASCADE`.

<details>
<summary>Examples</summary>

Basic in code usage/configuration (configure a single M2A relation):
```ts
// src/index.ts
import { defineHook } from "@directus/extensions-sdk";
import {
    toJunctionCollectionM2A,
    toAnyCollectionM2A,
    deleteUnusedItemFilterM2A,
} from "directus-hook-library";

export default defineHook((register, context) => {
    deleteUnusedItemFilterM2A(register, context, {
      anyCollections: [
            "text_block",
            "image_block",
            "video_block"
        ].map(toAnyCollectionM2A),
      junctionCollection: toJunctionCollectionM2A("article_block")
    });
});
```

Advanced in code usage/configuration (configure multiple M2A relations with multiple junction tables referencing identical item pools):
```ts
// src/index.ts
import { defineHook } from "@directus/extensions-sdk";
import {
    toJunctionCollectionM2A,
    toAnyCollectionM2A,
    deleteUnusedItemFilterM2A,
} from "directus-hook-library";

const advancedExampleConfig = [
    {
        configCollections: [
            "image_block",
            "video_block",
            "text_block"
        ],
        configJunctions: [
            "article_block",
            "blogpost_block"
        ]
    },
    {
        configCollections: [
            "pizza_item",
            "pasta_item",
            "dessert_item"
        ],
        configJunctions: [
            "order_item"
        ]
    },
]

export default defineHook((register, context) => {
    for (const relationConfig of advancedExampleConfig) {
        for (const junctionCollectionName of relationConfig.configJunctions) {
            deleteUnusedItemFilterM2A(register, context, {
                anyCollections: relationConfig.configCollections.map(toAnyCollectionM2A),
                junctionCollection: toJunctionCollectionM2A(junctionCollectionName)
            });
        }
    }
});
```
</details>





### `deleteUnusedRelationActionM2A`
Used to cascade deletes performed on `anyCollection` items to a configured `junctionCollection` (on `anyCollection` item delete, relating items in `junctionCollection` are also deleted).

Each `Action` instance is configured with: 
- a `Directus register function` (see [register function](https://docs.directus.io/extensions/hooks.html#register-function))
- a `Directus extension context` (see [context object](https://docs.directus.io/extensions/hooks.html#register-function))
- a `M2AConfig` object, containing configuration as specified in [M2A configuration](#m2a-configuration)
On delete of an item inside a configured `any` collection, `junction` entries pointing to the deleted `any` item are deleted.\
Works like `M2O`, `O2M` or `M2M` selection of `DELETE CASCADE`.

<details>
<summary>Examples</summary>

Basic in code usage/configuration (configure a single M2A relation):
```ts
// src/index.ts
import { defineHook } from "@directus/extensions-sdk";
import {
    toJunctionCollectionM2A,
    toAnyCollectionM2A,
    deleteUnusedRelationActionM2A,
} from "directus-hook-library";

export default defineHook((register, context) => {
    deleteUnusedRelationActionM2A(register, context, {
      anyCollections: [
            "text_block",
            "image_block",
            "video_block"
        ].map(toAnyCollectionM2A),
      junctionCollection: toJunctionCollectionM2A("article_block")
    });
});
```

Advanced in code usage/configuration (configure multiple M2A relations with multiple junction tables referencing identical item pools):
```ts
// src/index.ts
import { defineHook } from "@directus/extensions-sdk";
import {
    toJunctionCollectionM2A,
    toAnyCollectionM2A,
    deleteUnusedRelationActionM2A,
} from "directus-hook-library";

const advancedExampleConfig = [
    {
        configCollections: [
            "image_block",
            "video_block",
            "text_block"
        ],
        configJunctions: [
            "article_block",
            "blogpost_block"
        ]
    },
    {
        configCollections: [
            "pizza_item",
            "pasta_item",
            "dessert_item"
        ],
        configJunctions: [
            "order_item"
        ]
    },
]

export default defineHook((register, context) => {
    for (const relationConfig of advancedExampleConfig) {
        for (const junctionCollectionName of relationConfig.configJunctions) {
            deleteUnusedRelationActionM2A(register, context, {
                anyCollections: relationConfig.configCollections.map(toAnyCollectionM2A),
                junctionCollection: toJunctionCollectionM2A(junctionCollectionName)
            });
        }
    }
});
```
</details>





### `preventItemDeleteFilterM2A`
Used to prevent deletes performed on `anyCollection` if the related `junctionCollection` contains a relation to deleted `anyCollection` item (delete request for `junctionCollection` item should be prevented).

Each `Filter` instance is configured with: 
- a `Directus register function` (see [register function](https://docs.directus.io/extensions/hooks.html#register-function))
- a `Directus extension context` (see [context object](https://docs.directus.io/extensions/hooks.html#register-function))
- a `M2AConfig` object, containing configuration as specified in [M2A configuration](#m2a-configuration)
On delete request of an `anyCollection` item, configured `junctionCollection` is checked.\
If an item containing a relation still exists, the delete request is denied and the operation is prohibited.\
Works like `M2O`, `O2M` or `M2M` selection of `DELETE RESTRICT`.

<details>
<summary>Examples</summary>

Basic in code usage/configuration (configure a single M2A relation):
```ts
// src/index.ts
import { defineHook } from "@directus/extensions-sdk";
import {
    toJunctionCollectionM2A,
    toAnyCollectionM2A,
    preventItemDeleteFilterM2A,
} from "directus-hook-library";

export default defineHook((register, context) => {
    preventItemDeleteFilterM2A(register, context, {
      anyCollections: [
            "text_block",
            "image_block",
            "video_block"
        ].map(toAnyCollectionM2A),
      junctionCollection: toJunctionCollectionM2A("article_block")
    });
});
```

Advanced in code usage/configuration (configure multiple M2A relations with multiple junction tables referencing identical item pools):
```ts
// src/index.ts
import { defineHook } from "@directus/extensions-sdk";
import {
    toJunctionCollectionM2A,
    toAnyCollectionM2A,
    preventItemDeleteFilterM2A,
} from "directus-hook-library";

const advancedExampleConfig = [
    {
        configCollections: [
            "image_block",
            "video_block",
            "text_block"
        ],
        configJunctions: [
            "article_block",
            "blogpost_block"
        ]
    },
    {
        configCollections: [
            "pizza_item",
            "pasta_item",
            "dessert_item"
        ],
        configJunctions: [
            "order_item"
        ]
    },
]

export default defineHook((register, context) => {
    for (const relationConfig of advancedExampleConfig) {
        for (const junctionCollectionName of relationConfig.configJunctions) {
            preventItemDeleteFilterM2A(register, context, {
                anyCollections: relationConfig.configCollections.map(toAnyCollectionM2A),
                junctionCollection: toJunctionCollectionM2A(junctionCollectionName)
            });
        }
    }
});
```
</details>





### `preventRelationDeleteFilterM2A`
Used to prevent deletes performed on `junctionCollection` if the related `anyCollection` item still exists (delete request for `anyCollection` item should be prevented).

Each `Filter` instance is configured with: 
- a `Directus register function` (see [register function](https://docs.directus.io/extensions/hooks.html#register-function))
- a `Directus extension context` (see [context object](https://docs.directus.io/extensions/hooks.html#register-function))
- a `M2AConfig` object, containing configuration as specified in [M2A configuration](#m2a-configuration)
On delete request of a `junctionCollection` item, configured `anyCollections` are checked.\
If related item still exists, the delete request is denied and the operation is prohibited.\
Works like `M2O`, `O2M` or `M2M` selection of `DELETE RESTRICT`.

<details>
<summary>Examples</summary>

Basic in code usage/configuration (configure a single M2A relation):
```ts
// src/index.ts
import { defineHook } from "@directus/extensions-sdk";
import {
    toJunctionCollectionM2A,
    toAnyCollectionM2A,
    preventRelationDeleteFilterM2A,
} from "directus-hook-library";

export default defineHook((register, context) => {
    preventRelationDeleteFilterM2A(register, context, {
      anyCollections: [
            "text_block",
            "image_block",
            "video_block"
        ].map(toAnyCollectionM2A),
      junctionCollection: toJunctionCollectionM2A("article_block")
    });
});
```

Advanced in code usage/configuration (configure multiple M2A relations with multiple junction tables referencing identical item pools):
```ts
// src/index.ts
import { defineHook } from "@directus/extensions-sdk";
import {
    toJunctionCollectionM2A,
    toAnyCollectionM2A,
    preventRelationDeleteFilterM2A,
} from "directus-hook-library";

const advancedExampleConfig = [
    {
        configCollections: [
            "image_block",
            "video_block",
            "text_block"
        ],
        configJunctions: [
            "article_block",
            "blogpost_block"
        ]
    },
    {
        configCollections: [
            "pizza_item",
            "pasta_item",
            "dessert_item"
        ],
        configJunctions: [
            "order_item"
        ]
    },
]

export default defineHook((register, context) => {
    for (const relationConfig of advancedExampleConfig) {
        for (const junctionCollectionName of relationConfig.configJunctions) {
            preventRelationDeleteFilterM2A(register, context, {
                anyCollections: relationConfig.configCollections.map(toAnyCollectionM2A),
                junctionCollection: toJunctionCollectionM2A(junctionCollectionName)
            });
        }
    }
});
```
</details>
