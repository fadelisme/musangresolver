'use client'

import { useState } from 'react'

type Tab = 'brand24' | 'tiktok'
type ViewMode = 'table' | 'snippet'

interface TabState {
  urls: string
  loading: boolean
  results: Array<{ original: string; resolved: string }>
  error: string
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('brand24')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [copied, setCopied] = useState(false)

  const [brand24, setBrand24] = useState<TabState>({
    urls: '',
    loading: false,
    results: [],
    error: '',
  })

  const [tiktok, setTiktok] = useState<TabState>({
    urls: '',
    loading: false,
    results: [],
    error: '',
  })

  const currentTab = activeTab === 'brand24' ? brand24 : tiktok
  const setCurrentTab = activeTab === 'brand24' ? setBrand24 : setTiktok

  const handleResolveURLs = async () => {
    if (!currentTab.urls.trim()) {
      setCurrentTab({ ...currentTab, error: 'Please enter at least one URL' })
      return
    }

    setCurrentTab({ ...currentTab, loading: true, error: '', results: [] })

    try {
      const urlList = currentTab.urls
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url.length > 0)

      const response = await fetch('/api/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urlList }),
      })

      if (!response.ok) {
        throw new Error('Failed to resolve URLs')
      }

      const data = await response.json()
      setCurrentTab({ ...currentTab, results: data.results, loading: false })
    } catch (err) {
      setCurrentTab({
        ...currentTab,
        error: 'Error resolving URLs. Please try again.',
        loading: false
      })
      console.error(err)
    }
  }

  const downloadCSV = () => {
    if (currentTab.results.length === 0) return

    const csvContent = [
      ['original_url', 'parsed_url'],
      ...currentTab.results.map((r) => [r.original, r.resolved]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const filename = activeTab === 'brand24' ? 'brand24_resolved_urls.csv' : 'tiktok_resolved_urls.csv'
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
  }

  const handleClear = () => {
    setCurrentTab({
      urls: '',
      loading: false,
      results: [],
      error: '',
    })
  }

  const copyAllToClipboard = () => {
    const text = currentTab.results.map((r) => r.resolved).join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Musang Resolver</h1>
          <p className="text-gray-600">
            Paste your URLs to resolve redirects and export to CSV
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => handleTabChange('brand24')}
              className={`py-3 px-6 font-semibold transition-colors ${
                activeTab === 'brand24'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Brand24
            </button>
            <button
              onClick={() => handleTabChange('tiktok')}
              className={`py-3 px-6 font-semibold transition-colors ${
                activeTab === 'tiktok'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              TikTok
            </button>
          </div>

          {/* Input Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {activeTab === 'brand24' ? 'Paste Brand24 URLs (one per line)' : 'Paste TikTok URLs (one per line)'}
            </label>
            <textarea
              value={currentTab.urls}
              onChange={(e) => setCurrentTab({ ...currentTab, urls: e.target.value })}
              placeholder={activeTab === 'brand24'
                ? 'https://app.brand24.com/result/open/?id=...&#10;https://app.brand24.com/result/open/?id=...'
                : 'https://vt.tiktok.com/ZSfS9VtuF/&#10;https://vt.tiktok.com/ZSfS9n7KR/'
              }
              className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-none font-mono text-sm"
              disabled={currentTab.loading}
            />
          </div>

          {/* Error Message */}
          {currentTab.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {currentTab.error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleResolveURLs}
              disabled={currentTab.loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {currentTab.loading ? 'Resolving...' : 'Resolve URLs'}
            </button>
            <button
              onClick={handleClear}
              disabled={currentTab.loading}
              className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Clear
            </button>
          </div>

          {/* Results Section */}
          {currentTab.results.length > 0 && (
            <>
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-semibold">
                  ✓ Successfully resolved {currentTab.results.length} URL{currentTab.results.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                    viewMode === 'table'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Table View
                </button>
                <button
                  onClick={() => setViewMode('snippet')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                    viewMode === 'snippet'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Text Snippet
                </button>
              </div>

              {/* Results Table View */}
              {viewMode === 'table' && (
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Original URL</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          {activeTab === 'brand24' ? 'Resolved URL' : 'Desktop URL'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTab.results.slice(0, 10).map((result, idx) => (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-600 break-all text-xs">
                            {result.original.substring(0, 50)}...
                          </td>
                          <td className="py-3 px-4 text-indigo-600 break-all text-xs">
                            <a href={result.resolved} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {result.resolved.substring(0, 50)}...
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Text Snippet View */}
              {viewMode === 'snippet' && (
                <div className="mb-6">
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{currentTab.results.map((r) => r.resolved).join('\n')}</pre>
                  </div>
                </div>
              )}

              {currentTab.results.length > 10 && viewMode === 'table' && (
                <p className="text-gray-600 text-sm mb-4">
                  ... and {currentTab.results.length - 10} more URLs
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {viewMode === 'snippet' && (
                  <button
                    onClick={copyAllToClipboard}
                    className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-white ${
                      copied
                        ? 'bg-green-600'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {copied ? '✓ Copied to Clipboard!' : '📋 Copy All'}
                  </button>
                )}
                <button
                  onClick={downloadCSV}
                  className={`${viewMode === 'snippet' ? 'flex-1' : 'w-full'} bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200`}
                >
                  ⬇ Download CSV
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm">
          <p>
            {activeTab === 'brand24'
              ? 'Paste your Brand24 URLs and click "Resolve URLs" to get started'
              : 'Paste your TikTok short URLs and click "Resolve URLs" to get the desktop URLs'}
          </p>
        </div>
      </div>
    </div>
  )
}
