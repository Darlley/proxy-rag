import { NextRequest, NextResponse } from "next/server";

export function middleware (request: NextRequest){
  const res = NextResponse.next()

  const cookie = request.cookies.get('sessionId')
  if(!cookie) {
    res.cookies.set('sessionId', crypto.randomUUID())
  }

  return res
}