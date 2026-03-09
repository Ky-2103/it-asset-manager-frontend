export function getActionErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallbackMessage
}
