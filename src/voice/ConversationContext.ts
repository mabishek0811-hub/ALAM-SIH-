import type { ConversationContext as Context, VoiceCommand } from './types'

export class ConversationContext {
  private value: Context = {}

  remember(command: VoiceCommand) {
    this.value.lastIntent = command.intent
    if (command.batchId) this.value.lastBatchId = command.batchId
    if (command.view) this.value.lastView = command.view
  }

  rememberBatch(batchId: string) { this.value.lastBatchId = batchId }
  get() { return { ...this.value } }
  setConfirmation(intent: Context['awaitingConfirmation']) { this.value.awaitingConfirmation = intent }
  takeConfirmation() { const pending = this.value.awaitingConfirmation; this.value.awaitingConfirmation = undefined; return pending }
  clear() { this.value = {} }
}
