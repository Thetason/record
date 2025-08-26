"use client"

import { useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function TestLoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [username, setUsername] = useState("syb2020")
  const [password, setPassword] = useState("Syb20201234!")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleLogin = async () => {
    setLoading(true)
    setResult(null)

    try {
      console.log("🚀 로그인 시작:", { username })
      
      const signInResult = await signIn("credentials", {
        username,
        password,
        redirect: false
      })
      
      console.log("📬 signIn 결과:", signInResult)
      setResult(signInResult)
      
      if (signInResult?.ok) {
        console.log("✅ 로그인 성공, 세션 새로고침...")
        // 세션 새로고침을 위해 약간 대기
        setTimeout(() => {
          console.log("🚀 대시보드로 이동")
          router.push("/dashboard")
        }, 1000)
      }
    } catch (error) {
      console.error("❌ 로그인 에러:", error)
      setResult({ error: error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">로그인 테스트 페이지</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">현재 세션 상태</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            Status: {status}
            {"\n"}
            Session: {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">로그인 폼</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">아이디</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">로그인 결과</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">테스트 계정</h2>
          <div className="space-y-2">
            <button
              onClick={() => {
                setUsername("admin")
                setPassword("Admin1234!")
              }}
              className="text-blue-500 hover:underline"
            >
              admin / Admin1234!
            </button>
            <br />
            <button
              onClick={() => {
                setUsername("syb2020")
                setPassword("Syb20201234!")
              }}
              className="text-blue-500 hover:underline"
            >
              syb2020 / Syb20201234!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}