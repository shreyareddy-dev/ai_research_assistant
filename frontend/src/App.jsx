import { useState } from "react";

function App() {

  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState("");

  const [chatHistory, setChatHistory] = useState([]);

  // Upload PDF
  const uploadPDF = async () => {

    if (!file) {
      alert("Please select a PDF");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    const response = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    setLoading(false);
    setUploaded(true);
    setFileName(file.name);

    alert(data.message);
  };

  // Ask AI
  const askQuestion = async () => {

    if (!question) {
      alert("Please enter a question");
      return;
    }

    setLoading(true);

    const currentQuestion = question;

    const response = await fetch("http://127.0.0.1:8000/ask", {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        question: currentQuestion,
      }),
    });

    const data = await response.json();

    setChatHistory((prev) => [
      ...prev,
      {
        question: currentQuestion,
        answer: data.answer,
      },
    ]);

    setQuestion("");
    setLoading(false);
  };

  // Clear Chat
  const clearAll = () => {

    setQuestion("");
    setChatHistory([]);
  };

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e1b4b, #312e81, #5b21b6, #7c3aed)",
        fontFamily: "Arial",
        display: "flex",
        padding: "20px",
        gap: "20px",
      }}
    >

      {/* Sidebar */}

      <div
        style={{
          width: "280px",
          background: "rgba(17,24,39,0.85)",
          backdropFilter: "blur(15px)",
          borderRadius: "20px",
          padding: "25px",
          color: "white",
          boxShadow: "0 0 20px rgba(0,0,0,0.25)",
        }}
      >

        <h1
          style={{
            fontSize: "28px",
            marginBottom: "25px",
            color: "#ffffff",
          }}
        >
          AI Research Assistant
        </h1>

        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            padding: "18px",
            borderRadius: "15px",
            marginBottom: "20px",
          }}
        >

          <h3>Uploaded PDF</h3>

          <p>
            {uploaded ? fileName : "No PDF Uploaded"}
          </p>

        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            padding: "18px",
            borderRadius: "15px",
            marginBottom: "20px",
          }}
        >

          <h3>Total Chats</h3>

          <p>{chatHistory.length}</p>

        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            padding: "18px",
            borderRadius: "15px",
          }}
        >

          <h3>Suggested Questions</h3>

          <ul style={{ lineHeight: "1.8" }}>
            <li>Summarize this paper</li>
            <li>Give important points</li>
            <li>Who is the author?</li>
            <li>Explain methodology</li>
            <li>What is the conclusion?</li>
          </ul>

        </div>

      </div>

      {/* Main Content */}

      <div
        style={{
          flex: 1,
          background: "#f8fafc",
          borderRadius: "20px",
          padding: "35px",
          boxShadow: "0 0 25px rgba(0,0,0,0.2)",
        }}
      >

        <h1
          style={{
            color: "#5b21b6",
            marginBottom: "10px",
          }}
        >
          Welcome Back 👋
        </h1>

        <p
          style={{
            color: "#4b5563",
            marginBottom: "30px",
            fontSize: "16px",
          }}
        >
          Upload research papers and interact with your AI assistant.
        </p>

        {/* Upload Section */}

        <div
          style={{
            background: "#dbeafe",
            padding: "20px",
            borderRadius: "15px",
            marginBottom: "30px",
          }}
        >

          <h2 style={{ color: "#1d4ed8" }}>
            Upload PDF
          </h2>

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <br /><br />

          <button
            onClick={uploadPDF}
            style={{
              padding: "12px 24px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            Upload PDF
          </button>

          {uploaded && (
            <p
              style={{
                color: "green",
                marginTop: "12px",
                fontWeight: "bold",
              }}
            >
              PDF Uploaded Successfully
            </p>
          )}

        </div>

        {/* Question Section */}

        <div
          style={{
            background: "#fae8ff",
            padding: "20px",
            borderRadius: "15px",
            marginBottom: "30px",
          }}
        >

          <h2 style={{ color: "#a21caf" }}>
            Ask AI
          </h2>

          <textarea
            rows="5"
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: "12px",
              border: "1px solid #ccc",
              fontSize: "15px",
              color: "#111827",
            }}
            placeholder="Ask something about the uploaded PDF..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <br /><br />

          <button
            onClick={askQuestion}
            style={{
              padding: "12px 24px",
              backgroundColor: "#db2777",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              cursor: "pointer",
              marginRight: "12px",
            }}
          >
            Ask AI
          </button>

          <button
            onClick={clearAll}
            style={{
              padding: "12px 24px",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            Clear Chat
          </button>

        </div>

        {/* Loading */}

        {loading && (
          <div
            style={{
              textAlign: "center",
              color: "#4f46e5",
              fontWeight: "bold",
              marginBottom: "20px",
              fontSize: "18px",
            }}
          >
            AI is thinking...
          </div>
        )}

        {/* Chat History */}

        <h2
          style={{
            color: "#1e293b",
            marginBottom: "20px",
          }}
        >
          Chat History
        </h2>

        {chatHistory.map((chat, index) => (

          <div
            key={index}
            style={{
              background: "#ffffff",
              padding: "25px",
              borderRadius: "15px",
              marginBottom: "20px",
              borderLeft: "8px solid #8b5cf6",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >

            <h3 style={{ color: "#2563eb" }}>
              Question
            </h3>

            <p
              style={{
                fontSize: "16px",
                marginBottom: "20px",
                color: "#111827",
              }}
            >
              {chat.question}
            </p>

            <h3 style={{ color: "#0f766e" }}>
              Answer
            </h3>

            <div
              style={{
                whiteSpace: "pre-line",
                lineHeight: "1.9",
                fontSize: "15px",
                color: "#111827",
              }}
            >
              {chat.answer}
            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default App;