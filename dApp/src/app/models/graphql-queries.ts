import { gql } from "apollo-angular";

export const GET_ALL_TOKENS = gql`
  query MyQuery($orderBy: String, $chainId: Int) {
    tokens(
      limit: 5
      orderBy: $orderBy
      orderDirection: "desc"
      where: { chainId: $chainId }
    ) {
      items {
        id
        address
        chainId
        creator
        name
        symbol
        marketCap
        description
        logoUrl
        timestamp
        bannerUrl
        isMigrated
        lpAddress
        routerAddress
        telegram
        twitter
        website
      }
    }
  }
`;

export const GET_TOKEN = gql`
  query MyQuery($id: String!) {
    token(id: $id) {
      address
      creator
      description
      id
      prices {
        items {
          id
          low
          open
          high
          count
          close
          average
        }
      }
      isMigrated
      logoUrl
      lpAddress
      marketCap
      name
      symbol
    }
  }
`;

export const GET_TRADES = gql`
  query MyQuery($tokenId: String) {
    trades(
      orderBy: "timestamp"
      orderDirection: "desc"
      where: { tokenId: $tokenId }
      limit: 5
    ) {
      items {
        action
        actor
        tokenId
        id
        timestamp
        fee
        amountOut
        amountIn
      }
    }
  }
`;

export const GET_TOPBAR_TRADES = gql`
  query GetTrades($limit: Int!, $chainId: Int!) {
    trades(
      orderBy: "timestamp"
      orderDirection: "desc"
      limit: $limit
      where: { chainId: $chainId }
    ) {
      items {
        action
        actor
        token {
          address
          symbol
        }
        id
        timestamp
        fee
        amountOut
        amountIn
        chainId
      }
    }
  }
`;