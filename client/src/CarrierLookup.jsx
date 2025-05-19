import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function CarrierLookup() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [result, setResult] = useState(undefined)
  const [loading, setLoading] = useState(false)

  const lookupCarrier = async () => {
    setLoading(true)
    setResult(undefined)
    try {
      const accessKey = "YOUR_NUMVERIFY_API_KEY" // Replace with your real key
      const proxyUrl = "http://localhost:3001/api/proxy" // Backend route to handle the API request securely
      const response = await fetch(proxyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          access_key: accessKey,
          number: phoneNumber
        })
      })

      const contentType = response.headers.get("content-type") || ""

      if (!response.ok || !contentType.includes("application/json")) {
        const text = await response.text()
        throw new Error(`Unexpected response: ${text.slice(0, 100)}...`)
      }

      let text
      try {
        text = await response.text()
      } catch (err) {
        throw new Error("Failed to read response body.")
      }

      if (!text || text.trim().length === 0) {
        throw new Error("Empty response from server.")
      }

      let data
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        throw new Error("Invalid JSON response from server.")
      }

      if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("Invalid response format.")
      }

      if (!("valid" in data) || !("carrier" in data)) {
        throw new Error("Response missing expected fields.")
      }

      if (data.success === false) {
        setResult({ error: data.error?.info || "Unknown API error." })
      } else {
        setResult(data)
      }
    } catch (error) {
      console.error("Lookup failed:", error)
      setResult({ error: error instanceof Error ? error.message : "Failed to fetch carrier information." })
    } finally {
      setLoading(false)
    }
  }

  const renderResult = () => {
    if (!result || typeof result !== "object") return null

    if ("error" in result) {
      return <p className="text-red-600">{result.error}</p>
    }

    return (
      <ul className="space-y-1">
        <li><strong>Valid:</strong> {result.valid ? "Yes" : "No"}</li>
        <li><strong>Carrier:</strong> {result.carrier || "N/A"}</li>
        <li><strong>Line Type:</strong> {result.line_type || "N/A"}</li>
        <li><strong>Location:</strong> {result.location || "N/A"}</li>
        <li><strong>Country:</strong> {result.country_name || "N/A"}</li>
      </ul>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-xl font-bold">Phone Carrier Lookup</h2>
          <Input
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <Button onClick={lookupCarrier} disabled={loading || !phoneNumber}>
            {loading ? "Looking up..." : "Lookup Carrier"}
          </Button>
          <div className="mt-4 text-sm">
            {renderResult()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
