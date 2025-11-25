"use client"

import { Button } from "@/components/ui/button"

interface Props {
  voterId: string
  name?: string
  unitName?: string
  designation?: string
}

export default function DownloadVoterId({ voterId, name, unitName, designation }: Props) {
  const handleDownload = () => {
    const canvas = document.createElement("canvas")
    canvas.width = 900
    canvas.height = 500
    const ctx = canvas.getContext("2d")!

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = "#7f1d1d"
    ctx.fillRect(0, 0, canvas.width, 80)

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 28px Arial"
    ctx.fillText("APTSAICUF", 24, 50)

    ctx.fillStyle = "#333333"
    ctx.font = "bold 26px Arial"
    ctx.fillText("Voter ID", 24, 130)

    ctx.font = "20px Arial"
    ctx.fillText(`ID: ${voterId}`, 24, 170)
    if (name) ctx.fillText(`Name: ${name}`, 24, 210)
    if (designation) ctx.fillText(`Designation: ${designation}`, 24, 250)
    if (unitName) ctx.fillText(`Unit: ${unitName}`, 24, 290)

    const date = new Date().toLocaleString()
    ctx.fillStyle = "#555555"
    ctx.font = "16px Arial"
    ctx.fillText(`Issued: ${date}`, 24, 330)

    ctx.strokeStyle = "#dddddd"
    ctx.lineWidth = 2
    ctx.strokeRect(12, 92, canvas.width - 24, canvas.height - 120)

    const url = canvas.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = url
    a.download = `voter-id-${voterId}.png`
    a.click()
  }

  return (
    <div className="mt-4">
      <Button onClick={handleDownload} className="rounded-none bg-maroon hover:bg-maroon/90 text-white">
        Download Voter ID
      </Button>
    </div>
  )
}

