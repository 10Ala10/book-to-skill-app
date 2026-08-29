import { useState } from "react";
import { Upload } from "./components/Upload";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main style={{ padding: 24 }}>
      <h1>Book to Skill</h1>
      <Upload onCreated={() => setRefreshKey(k => k + 1)} />
      {refreshKey > 0 && <p>Job created.</p>}
    </main>
  );
}

export default App;
