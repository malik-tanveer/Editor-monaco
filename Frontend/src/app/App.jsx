import "./App.css"
import { Editor } from "@monaco-editor/react"
import { MonacoBinding } from "y-monaco"
import { useRef, useMemo, useState, useEffect } from "react"
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"

function App() {

  const editorRef = useRef(null)
  const [ username, setUsername ] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || ""
  })
  const [ users, setUsers ] = useState([])
  const [ language, setLanguage ] = useState("javascript")

  const ydoc = useMemo(() => new Y.Doc(), [])
  const yText = useMemo(() => ydoc.getText("monaco"), [ ydoc ])

  const handleMount = (editor) => {
    editorRef.current = editor
    new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([ editorRef.current ]),
    )
  }

  // 🔄 Update editor language dynamically
  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    if (!editorRef.current) return

    const model = editorRef.current.getModel()
    const monaco = editorRef.current._standaloneKeybindingService._editorService._editorWorkerService._monaco

    if (monaco) {
      // Create new model with same content but new language
      const oldValue = model.getValue()
      const uri = model.uri
      monaco.editor.setModelLanguage(model, lang)
    } else {
      // fallback
      console.warn("Monaco instance not found for language switch")
    }
  }

  const handleJoin = (e) => {
    e.preventDefault()
    setUsername(e.target.username.value)
    window.history.pushState({}, "", "?username=" + e.target.username.value)
  }

  useEffect(() => {
    if (username) {
      const provider = new SocketIOProvider("/", "monaco", ydoc, { autoConnect: true })
      provider.awareness.setLocalStateField("user", { username })

      const updateUsers = () => {
        const states = Array.from(provider.awareness.getStates().values())
        setUsers(states.filter(s => s.user && s.user.username).map(s => s.user))
      }

      updateUsers()
      provider.awareness.on("change", updateUsers)

      const handleBeforeUnload = () => provider.awareness.setLocalStateField("user", null)
      window.addEventListener("beforeunload", handleBeforeUnload)

      return () => {
        provider.disconnect()
        window.removeEventListener("beforeunload", handleBeforeUnload)
      }
    }
  }, [username, ydoc])

  if (!username) {
    return (
      <main className="h-screen w-full bg-gray-950 flex gap-4 p-4 items-center justify-center" >
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter your username"
            className="p-2 rounded-lg bg-gray-800 text-white"
            name="username"
          />
          <button className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold">Join</button>
        </form>
      </main>
    )
  }

  return (
    <main className="h-screen w-full bg-gray-950 flex gap-4 p-4">
      <aside className="h-full w-1/4 bg-amber-50 rounded-lg">
        <h2 className="text-2xl font-bold p-4 border-b border-gray-300">Users</h2>
        <ul className="p-4">
          {users.map((user, index) => (
            <li key={index} className="p-2 bg-gray-800 text-white rounded mb-2">
              {user.username}
            </li>
          ))}
        </ul>
      </aside>

        <div className="absolute top-2 right-2 z-10">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="p-1 rounded bg-gray-700 text-white"
          >
            <option value="javascript">JavaScript</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="python">Python</option>
          </select>
        </div>
      <section className="w-3/4 bg-neutral-800 rounded-lg overflow-hidden relative flex flex-col">

        <Editor
          height="100%"
          language={language}
          defaultValue="// Write your code here"
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>
    </main>
  )
}

export default App