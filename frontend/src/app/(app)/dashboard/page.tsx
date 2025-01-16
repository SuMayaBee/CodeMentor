// import Dashboard from "@/components/dashboard"
// import Navbar from "@/components/dashboard/navbar"
import Dashboard from "@/components/dashboard"
import Navbar from "@/components/dashboard/navbar"
import { checkUser } from "@/lib/checkUser"
// import { User } from "@/lib/types"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  //const user = await currentUser()
  let user = await checkUser()
  if (user && user.name === null) {
    user.name = ""
  }
  console.log(user)

  if (!user) {
    redirect("/")
  }

//   const userRes = await fetch(
//     `${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/api/user?id=${user.id}`,
//     {
//       headers: {
//         Authorization: `${process.env.NEXT_PUBLIC_WORKERS_KEY}`,
//       },
//     }
//   )
//   const userData = (await userRes.json()) as User

//   const sharedRes = await fetch(
//     `${process.env.NEXT_PUBLIC_DATABASE_WORKER_URL}/api/sandbox/share?id=${user.id}`,
//     {
//       headers: {
//         Authorization: `${process.env.NEXT_PUBLIC_WORKERS_KEY}`,
//       },
//     }
//   )
//   const shared = (await sharedRes.json()) as {
//     id: string
//     name: string
//     type: "react" | "node"
//     author: string
//     sharedOn: Date
//     authorAvatarUrl: string
//   }[]

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden overscroll-none">
      {/* <Navbar userData={userData} />
      <Dashboard sandboxes={userData.sandbox} shared={shared} /> */}
            {/* <Navbar userData={user} /> */}
            <Dashboard userData={user} />


    </div>
  )
}
