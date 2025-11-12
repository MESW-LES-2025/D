import { NextResponse } from 'next/server';

export const ok = (data: any) => {
  return NextResponse.json(data, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const noContent = () => {
  return NextResponse.json({
    status: 204,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const badRequest = (errors: any) => {
  return NextResponse.json(errors, {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const internalError = (errorMessage: string, error: any) => {
  console.error('Api failed:', error);

  return NextResponse.json(JSON.stringify({ error: errorMessage }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
};
