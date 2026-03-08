import { redirect } from 'next/navigation'
import { requireUserForPage } from "@/lib/services/auth/requireUserForPage"

export default async function Home() {
  await requireUserForPage()
  redirect('/dashboard')

}