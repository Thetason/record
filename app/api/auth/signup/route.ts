import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

// Validation helper functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email) && email.length <= 254
}

function isValidPassword(password: string): boolean {
  // At least 8 characters, containing at least one uppercase, one lowercase, and one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password) && password.length <= 128
}

function isValidUsername(username: string): boolean {
  // 3-20 characters, only letters, numbers, underscore, hyphen
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
  const reservedWords = ['admin', 'root', 'api', 'www', 'mail', 'ftp', 'admin', 'test', 'guest', 'user', 'null', 'undefined']
  return usernameRegex.test(username) && !reservedWords.includes(username.toLowerCase())
}

function isValidName(name: string): boolean {
  return name.trim().length >= 1 && name.trim().length <= 50
}

export async function POST(request: Request) {
  try {
    const { email, password, name, username } = await request.json()

    // 유효성 검사 - 필수 필드
    if (!email || !password || !name || !username) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요" },
        { status: 400 }
      )
    }

    // 이메일 형식 검증
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "올바른 이메일 주소를 입력해주세요" },
        { status: 400 }
      )
    }

    // 비밀번호 강도 검증
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: "비밀번호는 8자 이상이어야 하며, 대문자, 소문자, 숫자를 각각 하나 이상 포함해야 합니다" },
        { status: 400 }
      )
    }

    // 사용자명 형식 검증
    if (!isValidUsername(username)) {
      return NextResponse.json(
        { error: "사용자명은 3-20자의 영문자, 숫자, 밑줄(_), 하이픈(-)만 사용 가능합니다" },
        { status: 400 }
      )
    }

    // 이름 검증
    if (!isValidName(name)) {
      return NextResponse.json(
        { error: "이름은 1-50자 사이여야 합니다" },
        { status: 400 }
      )
    }

    // 이메일 중복 확인
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다" },
        { status: 400 }
      )
    }

    // 사용자명 중복 확인
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: "이미 사용 중인 사용자명입니다" },
        { status: 400 }
      )
    }

    // 비밀번호 해시화 - salt rounds를 12로 증가시켜 보안 강화
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)
    
    // 해시 검증 (디버깅용)
    const isHashValid = await bcrypt.compare(password, hashedPassword)
    console.log("🔐 회원가입 해시 검증:", {
      username,
      passwordLength: password.length,
      hashLength: hashedPassword.length,
      hashValid: isHashValid
    })

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        username,
        avatar: name.charAt(0).toUpperCase()
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username
      }
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}