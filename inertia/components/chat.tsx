import { useForm } from '@inertiajs/react'
import { useEffect, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'

function Chat() {
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const form = useForm({ sender: '', message: '' })

  useEffect(() => {
    if (!form.data.sender) {
      const newSender = `user-${uuid().toString()}`
      localStorage.setItem('sender', newSender)
      form.setData('sender', newSender)
    }
  }, [form.data.sender])

  const [messages, setMessages] = useState<{ type: string; message: string }[]>(
    localStorage.getItem('messages')
      ? JSON.parse(localStorage.getItem('messages') as string)
      : [
          {
            type: 'message',
            message: 'Selamat datang, ada apa yang bisa saya bantu?',
          },
        ]
  )

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages))
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (form.data.message.trim() === '') return
    setMessages((prevMessages) => [...prevMessages, { type: 'answer', message: form.data.message }])
    form.post('/send-message', {
      onSuccess: (page) => {
        const flashMessages = page.props.messages as {
          text: string
          type: 'success' | 'error' | 'info'
        }[]

        if (!flashMessages || !Array.isArray(flashMessages)) return
        setMessages((prevMessages) => [
          ...prevMessages,
          ...flashMessages.map((msg) => ({
            type: 'message',
            message:
              msg.type === 'success' || msg.type === 'info'
                ? msg.text
                : 'Maaf, saya tidak bisa menjawab pertanyaanmu',
          })),
        ])
      },
    })
    form.setData('message', '')
  }

  const linkify = (text: string) => {
    const urlRegex = /((https?:\/\/[^\s]+))/g
    return text.replace(
      urlRegex,
      '<a href="$1" class="text-blue-500 underline" target="_blank" rel="noopener noreferrer">$1</a>'
    )
  }

  return (
    <div className="flex flex-col h-[70vh] min-w-[280px] bg-white">
      <div className="bg-slate-800 text-white px-4 py-2">
        <h1 className="text-lg font-bold">Assistant Chat</h1>
      </div>
      <ul className="p-4 flex-col flex-grow overflow-y-auto">
        {messages.map((message, index) => (
          <li key={index} className={`mb-6 flex`}>
            <span
              className={`${
                message.type === 'message' ? 'bg-green-200' : 'bg-gray-200 ml-auto'
              } text-black rounded-lg py-2 px-4 break-words inline-block max-w-80`}
              dangerouslySetInnerHTML={{ __html: linkify(message.message) }}
            />
          </li>
        ))}
        <div ref={messagesEndRef} />
      </ul>
      <form onSubmit={handleSubmit} className="flex px-4 py-2">
        <input
          type="text"
          placeholder="Type your message here"
          value={form.data.message}
          onChange={(e) => form.setData('message', e.target.value)}
          className="flex-grow py-2 px-4 rounded-[50px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-[80%]"
        />
        <button type="submit" className="bg-slate-800 text-white py-2 px-4 rounded-[50px] ml-2">
          Send
        </button>
      </form>
    </div>
  )
}

export default Chat
