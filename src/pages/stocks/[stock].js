import { useRouter } from "next/router";

import Layout from "../../main/node/components/layout"
import StockList from "../../main/node/components/stockList"

// if user is not logged in with an account, only show a basic quote and chart
export default function Stock({ stockInformation, tempList }) {
  const router = useRouter();
  
  return (
    <Layout>
      <h1>stock quote</h1>
      <h4>{router.query.stock}</h4>
      <p>{stockInformation.symbol}</p>
      <p>{stockInformation.latestPrice}</p>
      <StockList props={tempList}/>
    </Layout>
  )
}

export async function getServerSideProps(context) {

  // const res = await fetch(`http://localhost:8080/stocks/${context.params.stock}/quote`)
  // const stockInformation = await res.json()

  const stockInformation = `{"symbol": "${context.params.stock}", "latestPrice": 162}`
  const tempList = new Array([{"name": "tech", "list": {"amd": 102, "nvda": 170}}, {"name": "oil", "list": {"bp": 40, "shell": 50}}]);

  if (!stockInformation) {
    return {
      notFound: true
    }
  }

  return { props: { stockInformation, tempList } }
}
  