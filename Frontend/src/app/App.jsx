import './App.css'
import { Editor } from "@monaco-editor/react"

function App() {

  return (
   <main
      className="h-screen w-full bg-gray-950 flex gap-4 p-4"
    >
      <aside
        className="h-full w-1/4 bg-amber-50 rounded-lg "
      >
        <h2 className="text-2xl font-bold p-4 border-b border-gray-300">Users</h2>
        

      </aside>
      <section
        className="w-3/4 bg-neutral-800 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// some comment"
          theme="vs-dark"
        />
      </section>

    </main>  
  )
}

export default App
