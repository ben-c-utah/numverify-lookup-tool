import { useState } from "react";

export default function CarrierLookup() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const lookupCarrier = async () => {
    setLoading(true);
    setResult(null);

    try {
      const accessKey = "YOUR_NUMVERIFY_API_KEY";
      const proxyUrl = "http://localhost:3001/api/proxy";

      const response = await fetch(proxyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          access_key: accessKey,
          number: phoneNumber
        })
      });

      const data = await response.json();

      if (!data || typeof data !== "object") {
        throw new Error("Unexpected response format.");
      }

      if (data.success === false) {
        throw new Error(data.error?.info || "API Error");
      }

      setResult(data);
    } catch (err) {
      console.error("Lookup error:", err);
      setResult({ error: err.message || "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;
    if (result.error) {
      return <p style={{ color: "red" }}>Error: {result.error}</p>;
    }

    return (
      <div style={{ marginTop: "1rem" }}>
        <ul>
          <li><strong>Valid:</strong> {result.valid ? "Yes" : "No"}</li>
          <li><strong>Carrier:</strong> {result.carrier || "N/A"}</li>
          <li><strong>Line Type:</strong> {result.line_type || "N/A"}</li>
          <li><strong>Location:</strong> {result.location || "N/A"}</li>
          <li><strong>Country:</strong> {result.country_name || "N/A"}</li>
        </ul>
      </div>
    );
  };

  return (
    <div style={{
      maxWidth: "500px",
      margin: "2rem auto",
      padding: "1rem",
      border: "1px solid #ccc",
      borderRadius: "8px"
    }}>
      <h2 style={{ marginBottom: "1rem" }}>Phone Carrier Lookup</h2>

      <input
        type="text"
        placeholder="Enter phone number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5rem",
          marginBottom: "1rem"
        }}
      />

      <button
        onClick={lookupCarrier}
        disabled={loading || !phoneNumber}
        style={{
          padding: "0.5rem 1rem",
          cursor: "pointer"
        }}
      >
        {loading ? "Looking up..." : "Lookup Carrier"}
      </button>

      {renderResult()}
    </div>
  );
}
