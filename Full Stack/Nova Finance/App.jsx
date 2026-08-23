import { useState, useEffect, useMemo } from 'react'

const MOCK_ASSETS = [
    { id: '1', name: 'Apple Inc.', category: 'Stocks', quantity: 15, currentPrice: 185.50 },
    { id: '2', name: 'US Treasury 10Y', category: 'Bonds', quantity: 50, currentPrice: 98.20 },
    { id: '3', name: 'NVIDIA Corp.', category: 'Stocks', quantity: 10, currentPrice: 875.00 },
    { id: '4', name: 'Vanguard S&P 500 ETF', category: 'ETFs', quantity: 25, currentPrice: 460.10 },
    { id: '5', name: 'Corporate High Yield Bond', category: 'Bonds', quantity: 30, currentPrice: 102.40 }
];

const categories = ['All', 'Stocks', 'Crypto', 'Bonds', 'Commodities']
const currencies = ['USD', 'EUR', 'INR']

function formatCurrency(value, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function FilterBar({ searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, currency, setCurrency }) {
  return (
    <div>
      <input
        type="text"
        placeholder="Search by name or symbol"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
        {currencies.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
    </div>
  )
}

function PortfolioMetrics({ totalValue, currency, assetCount }) {
  return (
    <div>
      <h2>Portfolio Metrics</h2>

      <p>Current Value: {formatCurrency(totalValue, currency)}</p>
      <p>Total Value: {formatCurrency(totalValue, currency)}</p>
      <p>Assets: {assetCount}</p>
    </div>
  )
}

function AssetTable({ assets, currency }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Symbol</th>
          <th>Category</th>
          <th>Value</th>
          <th>Quantity</th>
        </tr>
      </thead>

      <tbody>
        {assets.map((asset) => (
          <tr key={asset.id}>
            <td>{asset.name}</td>
            <td>{asset.symbol}</td>
            <td>{asset.assetClass}</td>
            <td>{formatCurrency(asset.quantity * asset.currentPrice, currency)}</td>
            <td>{asset.quantity}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function App() {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [currency, setCurrency] = useState('USD')

  useEffect(() => {
    const timer = setTimeout(() => {
      setAssets(MOCK_ASSETS)
      setLoading(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [])

  const { filteredAssets, totalValue } = useMemo(() => {
    window.analyticsMemoCount = (window.analyticsMemoCount || 0) + 1

    const lowerSearch = searchTerm.trim().toLowerCase()

    const filtered = assets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(lowerSearch) ||
        asset.symbol.toLowerCase().includes(lowerSearch)
      const matchesCategory =
        selectedCategory === 'All' || asset.assetClass === selectedCategory

      return matchesSearch && matchesCategory
    })

    const total = filtered.reduce(
      (sum, asset) => sum + asset.quantity * asset.currentPrice,
      0
    )

    return {
      filteredAssets: filtered,
      totalValue: total,
    }
  }, [assets, searchTerm, selectedCategory])

  useEffect(() => {
    const formattedTotal = formatCurrency(totalValue, 'USD')
    document.title = `Portfolio - Total: ${formattedTotal}`
  }, [totalValue])

  return (
    <>
      <h1>Nova Financial Portfolio</h1>

      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        currency={currency}
        setCurrency={setCurrency}
      />

      {loading ? (
        <p>Loading assets.....</p>

      ) : (
        <>
          <PortfolioMetrics
            totalValue={totalValue}

            currency={currency}
            assetCount={filteredAssets.length}
          />

          <AssetTable assets={filteredAssets} currency={currency} />
        </>
      )}
    </>
  )
}

export default App
