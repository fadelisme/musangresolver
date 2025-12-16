'use client'

import { useState } from 'react'

type Tab = 'brand24' | 'tiktok' | 'utc2wib'
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

  const [utc2wib, setUtc2wib] = useState<TabState>({
    urls: '',
    loading: false,
    results: [],
    error: '',
  })

  const currentTab = activeTab === 'brand24' ? brand24 : activeTab === 'tiktok' ? tiktok : utc2wib
  const setCurrentTab = activeTab === 'brand24' ? setBrand24 : activeTab === 'tiktok' ? setTiktok : setUtc2wib

  const convertUTCtoWIB = (utcDateString: string): string | null => {
    try {
      const date = new Date(utcDateString.trim())
      if (isNaN(date.getTime())) return null

      // Convert to WIB (UTC+7)
      const wibDate = new Date(date.getTime() + 7 * 60 * 60 * 1000)

      // Format: DD/MM/YYYY (column 1) and HH:MM (column 2)
      const day = String(wibDate.getUTCDate()).padStart(2, '0')
      const month = String(wibDate.getUTCMonth() + 1).padStart(2, '0')
      const year = wibDate.getUTCFullYear()
      const hours = String(wibDate.getUTCHours()).padStart(2, '0')
      const minutes = String(wibDate.getUTCMinutes()).padStart(2, '0')

      return `${day}/${month}/${year}    ${hours}:${minutes}`
    } catch (err) {
      return null
    }
  }

  const handleResolveURLs = async () => {
    if (!currentTab.urls.trim()) {
      setCurrentTab({ ...currentTab, error: 'Please enter at least one URL' })
      return
    }

    setCurrentTab({ ...currentTab, loading: true, error: '', results: [] })

    try {
      // Handle UTC to WIB conversion
      if (activeTab === 'utc2wib') {
        const dateList = currentTab.urls.split('\n')

        const results = dateList.map((date) => {
          const trimmed = date.trim()
          if (trimmed.length === 0) {
            // Preserve empty lines
            return { original: '', resolved: '' }
          }
          return {
            original: trimmed,
            resolved: convertUTCtoWIB(trimmed) || 'Invalid date format'
          }
        })

        setCurrentTab({ ...currentTab, results, loading: false })
        return
      }

      // Handle URL resolution
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
        error: activeTab === 'utc2wib' ? 'Error converting dates. Please try again.' : 'Error resolving URLs. Please try again.',
        loading: false
      })
      console.error(err)
    }
  }

  const downloadCSV = () => {
    if (currentTab.results.length === 0) return

    let csvContent: string
    let filename: string

    if (activeTab === 'utc2wib') {
      csvContent = [
        ['Date', 'Time'],
        ...currentTab.results.map((r) => {
          const [date, time] = r.resolved.split('    ')
          return [date, time]
        }),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n')
      filename = 'utc_to_wib_conversions.csv'
    } else {
      csvContent = [
        ['original_url', 'parsed_url'],
        ...currentTab.results.map((r) => [r.original, r.resolved]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n')
      filename = activeTab === 'brand24' ? 'brand24_resolved_urls.csv' : 'tiktok_resolved_urls.csv'
    }

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

  const [copiedColumn, setCopiedColumn] = useState<'date' | 'time' | null>(null)

  const copyAllToClipboard = () => {
    const text = currentTab.results.map((r) => r.resolved).join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const copyColumn = (column: 'date' | 'time') => {
    let text = ''
    if (column === 'date') {
      text = currentTab.results.map((r) => r.resolved ? r.resolved.split('    ')[0] : '').join('\n')
    } else {
      text = currentTab.results.map((r) => r.resolved ? r.resolved.split('    ')[1] : '').join('\n')
    }
    navigator.clipboard.writeText(text).then(() => {
      setCopiedColumn(column)
      setTimeout(() => setCopiedColumn(null), 2000)
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
            <button
              onClick={() => handleTabChange('utc2wib')}
              className={`py-3 px-6 font-semibold transition-colors ${
                activeTab === 'utc2wib'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              UTC to WIB
            </button>
          </div>

          {/* Input Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {activeTab === 'brand24' ? 'Paste Brand24 URLs (one per line)' : activeTab === 'tiktok' ? 'Paste TikTok URLs (one per line)' : 'Paste UTC Dates (one per line)'}
            </label>
            <textarea
              value={currentTab.urls}
              onChange={(e) => setCurrentTab({ ...currentTab, urls: e.target.value })}
              placeholder={activeTab === 'brand24'
                ? 'https://app.brand24.com/result/open/?id=...&#10;https://app.brand24.com/result/open/?id=...'
                : activeTab === 'tiktok'
                ? 'https://vt.tiktok.com/ZSfS9VtuF/&#10;https://vt.tiktok.com/ZSfS9n7KR/'
                : '2025-12-10T11:35:21.000Z&#10;2025-12-10T10:00:27.000Z'
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
              {currentTab.loading
                ? activeTab === 'utc2wib' ? 'Converting...' : 'Resolving...'
                : activeTab === 'utc2wib' ? 'Convert Dates' : 'Resolve URLs'}
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
                  ✓ Successfully {activeTab === 'utc2wib' ? 'converted' : 'resolved'} {activeTab === 'utc2wib' ? currentTab.results.filter(r => r.resolved).length : currentTab.results.length} {activeTab === 'utc2wib' ? 'date' : 'URL'}{(activeTab === 'utc2wib' ? currentTab.results.filter(r => r.resolved).length : currentTab.results.length) !== 1 ? 's' : ''}
                </p>
              </div>

              {/* UTC to WIB Output View */}
              {activeTab === 'utc2wib' && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">WIB Output</label>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Date Column */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-gray-700">Date (DD/MM/YYYY)</label>
                        <button
                          onClick={() => copyColumn('date')}
                          className={`text-xs font-semibold py-1 px-3 rounded transition-colors ${
                            copiedColumn === 'date'
                              ? 'bg-green-600 text-white'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          {copiedColumn === 'date' ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                      <textarea
                        value={currentTab.results.map(r => r.resolved ? r.resolved.split('    ')[0] : '').join('\n')}
                        readOnly
                        className="w-full h-64 p-4 border-2 border-indigo-300 rounded-lg bg-indigo-50 font-mono text-sm resize-none"
                      />
                    </div>
                    {/* Time Column */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-gray-700">Time (HH:MM)</label>
                        <button
                          onClick={() => copyColumn('time')}
                          className={`text-xs font-semibold py-1 px-3 rounded transition-colors ${
                            copiedColumn === 'time'
                              ? 'bg-green-600 text-white'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          {copiedColumn === 'time' ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                      <textarea
                        value={currentTab.results.map(r => r.resolved ? r.resolved.split('    ')[1] : '').join('\n')}
                        readOnly
                        className="w-full h-64 p-4 border-2 border-indigo-300 rounded-lg bg-indigo-50 font-mono text-sm resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* View Mode Toggle */}
              {activeTab !== 'utc2wib' && (
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
              )}

              {/* Results Table View */}
              {viewMode === 'table' && activeTab !== 'utc2wib' && (
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
              {viewMode === 'snippet' && activeTab !== 'utc2wib' && (
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
                {viewMode === 'snippet' && activeTab !== 'utc2wib' && (
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
                  className={`${viewMode === 'snippet' && activeTab !== 'utc2wib' ? 'flex-1' : 'w-full'} bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200`}
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
              : activeTab === 'tiktok'
              ? 'Paste your TikTok short URLs and click "Resolve URLs" to get the desktop URLs'
              : 'Paste your UTC dates and click "Convert Dates" to convert to WIB (DD/MM/YYYY | HH:MM)'}
          </p>
        </div>
      </div>
    </div>
  )
}
