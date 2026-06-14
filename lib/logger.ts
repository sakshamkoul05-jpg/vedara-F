export function logError(error: Error, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[Error]', error.message, context);
  } else {
    console.error('[Error]', error.message, context);
  }
}

export function logEvent(event: string, data?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Event]', event, data);
  }
}
