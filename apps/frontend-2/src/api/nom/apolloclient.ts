import {ApolloClient, createHttpLink, InMemoryCache} from '@apollo/client'
import {setContext} from '@apollo/client/link/context'

const getCookieValue = (name: string): string => (
  document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
)

const httpLink = createHttpLink({
  uri: '/nom-api/graphql',
})

const csrfLink = setContext((_, {headers}) => {
  const csrfToken = getCookieValue('XSRF-TOKEN')
  return {
    headers: {
      ...headers,
      'X-XSRF-TOKEN': csrfToken,
      'Content-Type': 'application/json;charset=UTF8;'
    }
  }
})

export const apolloClient = new ApolloClient({
  // eslint-disable-next-line unicorn/prefer-spread -- csrfLink is not an array but a class
  link: csrfLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network'
    }
  }
})
