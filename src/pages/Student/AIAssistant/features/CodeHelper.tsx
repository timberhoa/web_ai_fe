import React, { useState, useRef, useEffect } from 'react'
import styles from './CodeHelper.module.scss'
import { geminiApi, GeminiMessage } from '../../../../services/gemini'
import { getErrorMessage } from '../../../../utils/errorHandler'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SYSTEM_PROMPT = `Bạn là chuyên gia lập trình với kinh nghiệm nhiều năm trong nhiều ngôn ngữ. Nhiệm vụ của bạn là:
- Giải thích code một cách dễ hiểu, từng dòng một
- Tìm và sửa lỗi trong code một cách chi tiết
- Đề xuất cải thiện hiệu suất và cấu trúc code
- Giải thích thuật toán và độ phức tạp thời gian
- Đưa ra best practices và coding standards
- So sánh các cách tiếp cận khác nhau
- Trả lời bằng tiếng Việt, giải thích kỹ thuật rõ ràng với code examples`

const CodeHelper: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const geminiMessages: GeminiMessage[] = messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }))

      geminiMessages.push({
        role: 'user',
        parts: [{ text: userMessage.content }],
      })

      const result = await geminiApi.chat(geminiMessages, SYSTEM_PROMPT)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const codeExamples = [
    { lang: 'Python', icon: '🐍', query: 'Giải thích list comprehension trong Python' },
    { lang: 'JavaScript', icon: '⚡', query: 'Sự khác biệt giữa var, let và const' },
    { lang: 'Java', icon: '☕', query: 'Giải thích OOP trong Java' },
    { lang: 'C++', icon: '⚙️', query: 'Con trỏ và tham chiếu trong C++' },
  ]

  return (
    <div className={styles.terminal}>
      <div className={styles.terminalHeader}>
        <div className={styles.terminalButtons}>
          <span className={styles.btnRed} onClick={onBack}></span>
          <span className={styles.btnYellow}></span>
          <span className={styles.btnGreen}></span>
        </div>
        <div className={styles.terminalTitle}>
          <span className={styles.terminalIcon}>{'</>'}</span>
          Code Helper Terminal
          <span className={styles.terminalStatus}>● Online</span>
        </div>
      </div>

      <div className={styles.terminalBody}>
        {messages.length === 0 && !loading && (
          <div className={styles.startScreen}>
            <pre className={styles.asciiArt}>{`
   ____          _        _   _      _                 
  / ___|___   __| | ___  | | | | ___| |_ __   ___ _ __ 
 | |   / _ \\ / _\` |/ _ \\ | |_| |/ _ \\ | '_ \\ / _ \\ '__|
 | |__| (_) | (_| |  __/ |  _  |  __/ | |_) |  __/ |   
  \\____\\___/ \\__,_|\\___| |_| |_|\\___|_| .__/ \\___|_|   
                                      |_|              
            `}</pre>
            <div className={styles.welcomeText}>
              <p>{'>'} Welcome to Code Helper AI</p>
              <p>{'>'} Type your coding question or paste your code below</p>
              <p>{'>'} Supported languages: Python, JavaScript, Java, C++, and more...</p>
            </div>

            <div className={styles.quickCommands}>
              <div className={styles.commandsTitle}>{'>'} Quick Commands:</div>
              {codeExamples.map((example, index) => (
                <div
                  key={index}
                  className={styles.commandItem}
                  onClick={() => setInput(example.query)}
                >
                  <span className={styles.commandIcon}>{example.icon}</span>
                  <span className={styles.commandLang}>{example.lang}</span>
                  <span className={styles.commandArrow}>→</span>
                  <span className={styles.commandText}>{example.query}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className={styles.errorLine}>
            <span className={styles.errorPrompt}>ERROR:</span> {error}
          </div>
        )}

        <div className={styles.outputLines}>
          {messages.map((msg) => (
            <div key={msg.id} className={styles.outputBlock}>
              <div className={msg.role === 'user' ? styles.userLine : styles.aiLine}>
                <span className={styles.linePrompt}>
                  {msg.role === 'user' ? '$ user@terminal:~' : '$ ai@helper:~'}
                </span>
                <span className={styles.lineTime}>
                  [{msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                </span>
              </div>
              <div className={styles.lineContent}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className={styles.outputBlock}>
              <div className={styles.aiLine}>
                <span className={styles.linePrompt}>$ ai@helper:~</span>
              </div>
              <div className={styles.lineContent}>
                <span className={styles.cursor}>▊</span> Processing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form className={styles.terminalInput} onSubmit={handleSubmit}>
        <span className={styles.inputPrompt}>{'>'}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your code question or paste code here..."
          disabled={loading}
          autoFocus
        />
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? '⏳' : '▶'}
        </button>
      </form>
    </div>
  )
}

export default CodeHelper
