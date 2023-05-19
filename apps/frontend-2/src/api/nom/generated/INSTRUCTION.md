# Generating typescript types from GQL-schema
- Make sure you have previously run `npm install`

- Set your terminal working directory to the folder containing this markdown file (`$apps/frontend-2/src/api/nom/generated`)

- Run `npx graphql-codegen`

## Files in this folder and their purpose:
- `.graphqlconfig`
  - Used by the IntelliJ graphql plugin to setup autocompletion of queries and mutations.
- `nomclientqueries.graphql` and `nomclientmutations.graphql`
  - Queries and mutations in these files are transformed into typescript equivalents when running `npx graphql-codegen`
  - Autocompletion is available if `.graphqlconfig` is setup correctly.
- `codegen.yaml`
  - Defines how the GQL schema is read and transformed into typescript types when running `npx graphql-codegen`
- `graphql_generated.ts`
  - The generated file to be imported in client code

Both `codegen.yaml` and `.graphqlconfig` needs to be pointed at a live graphql api endpoint. Make sure that the server is running and that the graphql endpoint is accessible.

## Usage

````typescript jsx
import * as Gq from "../api/nom/generated/graphql_generated.ts"

function Component(){
  // useQuery from "apollo-client"
  const qry : Gq.QueryNameResult = useQuery(Gq.QueryNameDocument,{})

  return <SubComponent qry={qry} />
}
````
