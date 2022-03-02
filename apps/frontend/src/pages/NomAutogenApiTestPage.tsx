import * as React from 'react'
import {useQuery} from '@apollo/client';
import * as Gq from '../api/nom/generated/graphql_generated'

export default function NomAutogenApiTestPage(): JSX.Element {
  const [qryNavId, setQryNavId] = React.useState<string>('');


  const qry: Gq.HentRessursQueryHookResult = useQuery<any,Gq.HentRessursQueryVariables>(Gq.HentRessursDocument,{
    variables: {navIdent: qryNavId} as any,
    skip: !qryNavId || qryNavId.length !== 7,
  })

  const pregenHookQry = Gq.useHentRessursQuery({
    variables: {navIdent: qryNavId},
    skip: !qryNavId || qryNavId.length !== 7
  })

  console.log({qry, pregenHookQry})

  return <div>
    Hent en navident:
    <input value={qryNavId} onChange={(ev => setQryNavId(ev.target.value))} />
    <pre>
    {JSON.stringify(qry.data, null, 2)}
  </pre>
  </div>
}
