import { notFound } from "next/navigation"
import TestLoginClient from "./TestLoginClient"

export default function TestLoginPage() {
  if (process.env.NODE_ENV === "production") {
    notFound()
  }

  return <TestLoginClient />
}
