import { NextResponse } from "next/server";

class AppResponse extends NextResponse {
  constructor(
    statusCode: number,
    message: string,
    data?: any,
    errors?: string[]
  ) {
    super(JSON.stringify({ message, data, errors }), {
      status: statusCode,
    });
  }
}

export default AppResponse;
